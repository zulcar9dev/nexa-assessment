import os
import json
from io import BytesIO
from flask import Blueprint, render_template, request, redirect, url_for, send_file, flash, current_app
from sqlalchemy import or_
from docxtpl import DocxTemplate
from werkzeug.utils import secure_filename

from extensions import db
from models import Debitur
from utils import (
    PRODUCT_CATEGORIES, ALLOWED_EXTENSIONS, allowed_file, format_date_indonesian,
    DATE_KEYS, NOMINAL_KEYS, calculate_pmt, TEMPLATE_FILENAME_DEFAULT
)

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """Menampilkan halaman pemilihan produk (menu utama)."""
    return render_template('index.html', categories=PRODUCT_CATEGORIES)

@main.route('/form/<string:kategori>')
def new_form(kategori):
    """Menampilkan form input baru berdasarkan kategori yang dipilih."""
    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk tidak valid.', 'danger')
        return redirect(url_for('main.index'))
        
    product = PRODUCT_CATEGORIES[kategori]
    
    # Use current_app to access template folder path
    template_path = os.path.join(current_app.template_folder, product['template_form'])
    if not os.path.exists(template_path):
        flash(f"Formulir untuk '{product['nama']}' sedang dalam pengembangan.", 'info')
        return redirect(url_for('main.index'))
        
    return render_template(product['template_form'], data={}, kategori=kategori)

@main.route('/riwayat')
def riwayat():
    # 1. Ambil Parameter dari URL
    search_query = request.args.get('q', '')
    jenis_filter = request.args.get('jenis', '')
    seg_filter = request.args.get('seg', '')

    # 2. Query Dasar (Filter Nama/NIK via SQL)
    query = Debitur.query
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            or_(
                Debitur.nama_pemohon.ilike(search_term),
                Debitur.no_ktp.ilike(search_term)
            )
        )
    
    # Ambil semua hasil dari DB dulu
    all_results = query.order_by(Debitur.tanggal_input.desc()).all()
    
    # 3. Filter Lanjutan (Filter JSON via Python)
    filtered_results = []
    
    for debitur in all_results:
        data_json = debitur.data # Menggunakan properti .data yang sudah kita buat
        
        # Cek Filter Jenis Pengajuan
        # Default jenis pengajuan adalah 'baru' jika tidak ada di data
        jenis_db = data_json.get('jenis_pengajuan', 'baru')
        if jenis_filter and jenis_db != jenis_filter:
            continue # Lewati jika tidak cocok
            
        # Cek Filter Segmentasi
        # Default segmentasi adalah 'taspen' jika tidak ada di data
        seg_db = data_json.get('segmentasi', 'taspen')
        if seg_filter and seg_db != seg_filter:
            continue # Lewati jika tidak cocok
            
        # Jika lolos semua filter, masukkan ke list
        filtered_results.append(debitur)

    return render_template('riwayat.html', 
                           debitur_list=filtered_results, 
                           search_query=search_query,
                           jenis_filter=jenis_filter, # Kirim balik status filter ke HTML
                           seg_filter=seg_filter,     # Kirim balik status filter ke HTML
                           categories=PRODUCT_CATEGORIES)

@main.route('/edit/<int:id>')
def edit(id):
    debitur = Debitur.query.get_or_404(id)
    data = json.loads(debitur.data_lengkap)
    kategori = debitur.kategori
    
    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk debitur ini tidak valid.', 'danger')
        return redirect(url_for('main.riwayat'))
    
    product = PRODUCT_CATEGORIES[kategori]
    template_name = product['template_form']
    
    template_path = os.path.join(current_app.template_folder, template_name)
    if not os.path.exists(template_path):
        flash(f"Formulir edit untuk '{product['nama']}' sedang dalam pengembangan.", 'info')
        return redirect(url_for('main.riwayat'))

    return render_template(template_name, data=data, debitur_id=debitur.id, kategori=kategori)

@main.route('/simpan', methods=['POST'])
def simpan():
    form_data = request.form.to_dict()
    debitur_id = form_data.pop('debitur_id', None)
    kategori = form_data.pop('kategori', 'prapurna_reguler') 

    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk tidak valid saat menyimpan.', 'danger')
        return redirect(url_for('main.index'))
        
    try:
        for key in NOMINAL_KEYS:
            if key in form_data:
                form_data[key] = form_data[key].replace('.', '')

        if debitur_id and debitur_id.isdigit():
            debitur = Debitur.query.get_or_404(int(debitur_id))
            debitur.nama_pemohon = form_data.get('nama_pemohon', 'Tanpa Nama')
            debitur.no_ktp = form_data.get('no_ktp_pemohon', '000')
            debitur.data_lengkap = json.dumps(form_data)
            debitur.kategori = kategori 
        else:
            new_debitur = Debitur(
                nama_pemohon=form_data.get('nama_pemohon', 'Tanpa Nama'),
                no_ktp=form_data.get('no_ktp_pemohon', '000'),
                data_lengkap=json.dumps(form_data),
                kategori=kategori 
            )
            db.session.add(new_debitur)
        
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return f"Terjadi error saat menyimpan data: {e}", 500
    return redirect(url_for('main.riwayat'))

@main.route('/generate/<int:id>')
def generate_docx(id):
    debitur = Debitur.query.get_or_404(id)
    context = json.loads(debitur.data_lengkap)
    kategori = debitur.kategori

    if kategori not in PRODUCT_CATEGORIES:
        return f"Error: Kategori produk '{kategori}' tidak dikenal.", 404
        
    product = PRODUCT_CATEGORIES[kategori]
    template_docx_name = product.get('template_docx', TEMPLATE_FILENAME_DEFAULT)
            
    # --- BLOK KALKULASI RPC & DSR ---
    try:
        plafon = context.get('usulan_plafon_kredit', '0').replace('.', '')
        tenor = context.get('usulan_jangka_waktu_bulan', '0')
        bunga = context.get('usulan_bunga_persen', '0')
        
        usulan_angsuran = calculate_pmt(plafon, bunga, tenor)
        context['usulan_angsuran'] = usulan_angsuran 

        total_angsuran_eksisting = 0
        if context.get('fasilitas_nihil') != 'ya':
            for i in range(1, 16):
                key = f'slik_bank_{i}_angsuran'
                angsuran_str = context.get(key, '0').replace('.', '')
                total_angsuran_eksisting += int(angsuran_str) if angsuran_str.isdigit() else 0
        
        # LOGIKA PENGHASILAN (UPDATE: Konservatif 3 Bulan)
        if kategori.startswith('prapurna'):
            # Prapurna menggunakan 'estimasi_hak_pensiun'
            penghasilan_str = context.get('estimasi_hak_pensiun', '0').replace('.', '')
            penghasilan = int(penghasilan_str) if penghasilan_str.isdigit() else 0
        else: 
            # Purna (Reguler & Take Over) -> Cari Minimum dari 3 Bulan
            gaji_1_str = context.get('pensiun_bulan_1_jumlah', '0').replace('.', '')
            gaji_2_str = context.get('pensiun_bulan_2_jumlah', '0').replace('.', '')
            gaji_3_str = context.get('pensiun_bulan_jumlah', '0').replace('.', '') # Bulan Terakhir/Utama
            
            gaji_1 = int(gaji_1_str) if gaji_1_str.isdigit() else 0
            gaji_2 = int(gaji_2_str) if gaji_2_str.isdigit() else 0
            gaji_3 = int(gaji_3_str) if gaji_3_str.isdigit() else 0
            
            # Kumpulkan gaji yang nilainya > 0
            list_gaji = [g for g in [gaji_1, gaji_2, gaji_3] if g > 0]
            
            if list_gaji:
                penghasilan = min(list_gaji) # AMBIL NILAI TERKECIL
            else:
                # Fallback jika semua kosong, pakai Taspen
                taspen_str = context.get('taspen_hak_pensiun', '0').replace('.', '')
                penghasilan = int(taspen_str) if taspen_str.isdigit() else 0
        
        dsc_90_nominal = penghasilan * 0.9
        
        # PERBAIKAN: Gunakan rumus Net Capacity agar tidak membingungkan
        # Maksimal Angsuran = DSC 90% - Total Hutang Existing
        maksimal_angsuran = dsc_90_nominal - total_angsuran_eksisting
        
        total_angsuran_baru = total_angsuran_eksisting + usulan_angsuran
        
        dsr = 0
        if penghasilan > 0:
            dsr = (total_angsuran_baru / penghasilan) * 100
        
        context['rpc_penghasilan'] = penghasilan
        context['rpc_dsc_90'] = dsc_90_nominal
        context['rpc_total_angsuran_eksisting'] = total_angsuran_eksisting
        context['rpc_maksimal_angsuran'] = maksimal_angsuran
        context['rpc_total_angsuran_baru'] = total_angsuran_baru
        context['rpc_dsr'] = f"{dsr:.2f}".replace('.', ',') 
    except Exception as e:
        context['rpc_dsr'] = "Error"
        print(f"Error saat kalkulasi RPC: {e}")
    # --- AKHIR BLOK KALKULASI ---
    
    # --- MEMBUAT DAFTAR BANK & SYARAT KUSTOM ---
    try:
        # 1. Daftar Bank Take Over
        takeover_banks = []
        if context.get('fasilitas_nihil') != 'ya':
            for i in range(1, 16):
                # Deteksi Bank yang di-Takeover (Via checkbox TakeOver atau Pelunasan TopUp)
                takeover_key = f'slik_bank_{i}_takeover'
                topup_lunas_key = f'slik_bank_{i}_topup_lunas'
                bank_name_key = f'slik_bank_{i}_nama'
                
                is_takeover = context.get(takeover_key) == 'ya'
                is_topup_lunas = context.get(topup_lunas_key) == 'ya'
                
                if (is_takeover or is_topup_lunas) and context.get(bank_name_key):
                    takeover_banks.append(context.get(bank_name_key))
                    
        context['takeover_bank_list'] = ", ".join(takeover_banks)
        
        # 2. Daftar Syarat Kustom
        syarat_penandatangan_list = []
        syarat_pencairan_list = []
        for i in range(1, 11): # Sesuai 10 field di HTML
            teks_key = f'syarat_kustom_{i}_teks'
            lokasi_key = f'syarat_kustom_{i}_lokasi'
            
            teks = context.get(teks_key)
            lokasi = context.get(lokasi_key)
            
            if teks: # Hanya jika ada teks syarat
                if lokasi == 'penandatanganan':
                    syarat_penandatangan_list.append(teks)
                elif lokasi == 'pencairan':
                    syarat_pencairan_list.append(teks)
        
        context['syarat_penandatangan_list'] = syarat_penandatangan_list
        context['syarat_pencairan_list'] = syarat_pencairan_list
        
    except Exception as e:
        context['takeover_bank_list'] = "[Error Daftar Bank]"
        context['syarat_penandatangan_list'] = []
        context['syarat_pencairan_list'] = []
        print(f"Error saat memproses daftar kustom: {e}")
    # --- AKHIR BLOK ---

    # Format Tanggal
    for key in DATE_KEYS:
        if key in context and context[key]:
            context[key] = format_date_indonesian(context[key])
    
    # Format Nominal (Rupiah)
    rpc_keys_to_format = [
        'rpc_penghasilan', 'rpc_dsc_90', 'rpc_total_angsuran_eksisting',
        'rpc_maksimal_angsuran', 'rpc_total_angsuran_baru'
    ]
    
    for key in NOMINAL_KEYS + rpc_keys_to_format:
        if key in context and context[key]:
            try:
                if key == 'rpc_dsr':
                    continue 
                    
                val_str = str(context[key])
                if '.' in val_str:
                    nilai_angka = int(float(val_str)) 
                else:
                    nilai_angka = int(val_str)
                
                context[key] = f"{nilai_angka:,}".replace(',', '.')
            except (ValueError, TypeError):
                pass
    
    template_path = os.path.join(current_app.root_path, template_docx_name)
    
    if not os.path.exists(template_path):
        template_path = os.path.join(current_app.root_path, TEMPLATE_FILENAME_DEFAULT)
        if not os.path.exists(template_path):
             return f"Error: File template {template_docx_name} dan template default tidak ditemukan!", 404

    doc = DocxTemplate(template_path)
    
    try:
        doc.render(context)
    except Exception as e:
        print(f"Error saat render template: {e}") 
        return f"Error saat render template: {e}.", 500 

    file_stream = BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    
    filename = f"Kredit_{context.get('nama_pemohon', 'Debitur')}_{context.get('no_ktp_pemohon', 'NIK')}.docx"
    return send_file(file_stream, as_attachment=True, download_name=filename)

@main.route('/hapus/<int:id>')
def hapus(id):
    debitur = Debitur.query.get_or_404(id)
    db.session.delete(debitur)
    db.session.commit()
    flash('Data debitur berhasil dihapus.', 'success')
    return redirect(url_for('main.riwayat'))

# --- RUTE UNTUK KELOLA TEMPLATE ---

@main.route('/admin')
def admin():
    return render_template('admin.html', categories=PRODUCT_CATEGORIES)

@main.route('/upload_template', methods=['POST'])
def upload_template():
    if 'file' not in request.files:
        flash('Tidak ada file yang dipilih.', 'danger')
        return redirect(url_for('main.admin'))
    
    file = request.files['file']
    kategori = request.form.get('kategori')

    if not kategori or kategori not in PRODUCT_CATEGORIES:
        flash('Kategori template tidak valid.', 'danger')
        return redirect(url_for('main.admin'))
        
    if file.filename == '':
        flash('Tidak ada file yang dipilih.', 'danger')
        return redirect(url_for('main.admin'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(PRODUCT_CATEGORIES[kategori]['template_docx'])
        save_path = os.path.join(current_app.root_path, filename)
        
        try:
            file.save(save_path)
            flash(f'Template "{filename}" berhasil diperbarui.', 'success')
        except Exception as e:
            flash(f'Terjadi error saat menyimpan file: {e}', 'danger')
            
    else:
        flash('Format file tidak diizinkan. Harap upload file .docx', 'danger')
        
    return redirect(url_for('main.admin'))
