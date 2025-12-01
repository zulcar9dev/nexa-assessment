import os
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, send_file, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from docxtpl import DocxTemplate
from io import BytesIO
import locale
from werkzeug.utils import secure_filename
import webbrowser
from threading import Timer
import math 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rahasia-dapur-bni-1946'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///debitur.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

TEMPLATE_FILENAME_DEFAULT = "template_kredit.docx"
ALLOWED_EXTENSIONS = {'docx'}

# Daftar kategori produk
PRODUCT_CATEGORIES = {
    # 1. PRAPURNA (Tampilkan Hanya Reguler)
    'prapurna_reguler': {
        'nama': 'BNI Fleksi Pensiun Prapurna', 
        'template_form': 'form_prapurna.html',
        'template_docx': 'template_prapurna_reguler.docx',
        'show_on_dashboard': True 
    },
    'prapurna_takeover': {
        'nama': 'BNI Fleksi Pensiun Prapurna Take Over',
        'template_form': 'form_prapurna.html', 
        'template_docx': 'template_prapurna_takeover.docx',
        'show_on_dashboard': False 
    },

    # 2. PURNA (Tampilkan Hanya Reguler/Utama)
    'purna_reguler': {
        'nama': 'BNI Fleksi Pensiun Purna', 
        'template_form': 'form_purna.html',
        'template_docx': 'template_purna_reguler.docx',
        'show_on_dashboard': True 
    },
    'purna_takeover': {
        'nama': 'BNI Fleksi Pensiun Purna Take Over',
        'template_form': 'form_purna.html',
        'template_docx': 'template_purna_reguler.docx', # Menggunakan template reguler karena form sudah menyatu
        'show_on_dashboard': False 
    }
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

INDONESIAN_MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

def format_date_indonesian(date_str):
    """Mengubah format YYYY-MM-DD menjadi DD NamaBulan YYYY"""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        day = date_obj.strftime('%d')
        month = INDONESIAN_MONTHS[date_obj.month - 1]
        year = date_obj.strftime('%Y')
        return f"{day} {month} {year}"
    except (ValueError, TypeError):
        return date_str 

DATE_KEYS = [
    'tgl_lahir_pemohon', 'tgl_terbit_ktp', 'tgl_mulai_kerja',
    'tgl_sk_cpns', 'tgl_sk_golongan', 'tgl_pensiun_pemohon',
    'tgl_slik', 'mitigasi_slik_tgl_surat', 'tgl_call_memo',
    'tgl_pensiun_tmt', 'tgl_sk_pensiun' 
]

NOMINAL_KEYS = [
    'plafon_kredit_dimohon', 'usulan_plafon_kredit', 'usulan_angsuran', 
    'biaya_provisi_nominal', 'biaya_tata_laksana_nominal', 'biaya_administrasi',
    
    # Field Prapurna
    'gaji_bulan_1_jumlah', 'gaji_bulan_2_jumlah', 'gaji_bulan_3_jumlah',
    'estimasi_hak_pensiun', 'taspen_tht', 'taspen_hak_pensiun',
    'info_gaji_bendahara',
    
    # Field Purna
    'pensiun_bulan_1_jumlah', 
    'pensiun_bulan_2_jumlah',
    'pensiun_bulan_3_jumlah',
    'pensiun_bulan_jumlah', 
    
    # Field Blokir Angsuran
    'blokir_angsuran_total',
    'blokir_angsuran_pindah_gaji',
    'blokir_angsuran_prapurna',
    'blokir_angsuran_lunas',

    # Field SLIK (Umum)
    'slik_bank_1_maks', 'slik_bank_1_outs', 'slik_bank_1_angsuran', 
    'slik_bank_2_maks', 'slik_bank_2_outs', 'slik_bank_2_angsuran', 
    'slik_bank_3_maks', 'slik_bank_3_outs', 'slik_bank_3_angsuran', 
    'slik_bank_4_maks', 'slik_bank_4_outs', 'slik_bank_4_angsuran', 
    'slik_bank_5_maks', 'slik_bank_5_outs', 'slik_bank_5_angsuran', 
    'slik_bank_6_maks', 'slik_bank_6_outs', 'slik_bank_6_angsuran', 
    'slik_bank_7_maks', 'slik_bank_7_outs', 'slik_bank_7_angsuran', 
    'slik_bank_8_maks', 'slik_bank_8_outs', 'slik_bank_8_angsuran', 
    'slik_bank_9_maks', 'slik_bank_9_outs', 'slik_bank_9_angsuran', 
    'slik_bank_10_maks', 'slik_bank_10_outs', 'slik_bank_10_angsuran', 
    'slik_bank_11_maks', 'slik_bank_11_outs', 'slik_bank_11_angsuran', 
    'slik_bank_12_maks', 'slik_bank_12_outs', 'slik_bank_12_angsuran', 
    'slik_bank_13_maks', 'slik_bank_13_outs', 'slik_bank_13_angsuran', 
    'slik_bank_14_maks', 'slik_bank_14_outs', 'slik_bank_14_angsuran', 
    'slik_bank_15_maks', 'slik_bank_15_outs', 'slik_bank_15_angsuran', 
]

def calculate_pmt(principal, annual_rate_percent, months):
    try:
        principal = float(principal)
        annual_rate_percent = float(annual_rate_percent)
        months = int(months)
        if annual_rate_percent == 0:
            return principal / months if months > 0 else 0
        monthly_rate = (annual_rate_percent / 100) / 12
        if months == 0:
            return 0
        pmt = principal * (monthly_rate * (1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)
        return math.ceil(pmt)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0

# --- MODEL DATABASE ---
class Debitur(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama_pemohon = db.Column(db.String(100), nullable=False)
    no_ktp = db.Column(db.String(20), nullable=False)
    tanggal_input = db.Column(db.DateTime, default=datetime.utcnow)
    data_lengkap = db.Column(db.Text, nullable=False)
    kategori = db.Column(db.String(50), nullable=False, default='prapurna_reguler')

    # [BARU] Tambahkan properti ini agar HTML bisa membaca JSON dengan mudah
    @property
    def data(self):
        try:
            return json.loads(self.data_lengkap)
        except:
            return {}
# --- ROUTES ---

@app.route('/')
def index():
    """Menampilkan halaman pemilihan produk (menu utama)."""
    return render_template('index.html', categories=PRODUCT_CATEGORIES)

@app.route('/form/<string:kategori>')
def new_form(kategori):
    """Menampilkan form input baru berdasarkan kategori yang dipilih."""
    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk tidak valid.', 'danger')
        return redirect(url_for('index'))
        
    product = PRODUCT_CATEGORIES[kategori]
    
    template_path = os.path.join(app.template_folder, product['template_form'])
    if not os.path.exists(template_path):
        flash(f"Formulir untuk '{product['nama']}' sedang dalam pengembangan.", 'info')
        return redirect(url_for('index'))
        
    return render_template(product['template_form'], data={}, kategori=kategori)

@app.route('/riwayat')
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

@app.route('/edit/<int:id>')
def edit(id):
    debitur = Debitur.query.get_or_404(id)
    data = json.loads(debitur.data_lengkap)
    kategori = debitur.kategori
    
    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk debitur ini tidak valid.', 'danger')
        return redirect(url_for('riwayat'))
    
    product = PRODUCT_CATEGORIES[kategori]
    template_name = product['template_form']
    
    template_path = os.path.join(app.template_folder, template_name)
    if not os.path.exists(template_path):
        flash(f"Formulir edit untuk '{product['nama']}' sedang dalam pengembangan.", 'info')
        return redirect(url_for('riwayat'))

    return render_template(template_name, data=data, debitur_id=debitur.id, kategori=kategori)

@app.route('/simpan', methods=['POST'])
def simpan():
    form_data = request.form.to_dict()
    debitur_id = form_data.pop('debitur_id', None)
    kategori = form_data.pop('kategori', 'prapurna_reguler') 

    if kategori not in PRODUCT_CATEGORIES:
        flash('Kategori produk tidak valid saat menyimpan.', 'danger')
        return redirect(url_for('index'))
        
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
    return redirect(url_for('riwayat'))

@app.route('/generate/<int:id>')
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
        
        # (PERBAIKAN LOGIKA)
        if kategori.startswith('prapurna'):
            # Kategori Prapurna menggunakan 'estimasi_hak_pensiun'
            penghasilan_str = context.get('estimasi_hak_pensiun', '0').replace('.', '')
        else: 
            # Kategori Purna (Reguler maupun Take Over)
            # Selalu gunakan 'pensiun_bulan_jumlah' (Gaji Bulan Terakhir/Utama)
            penghasilan_str = context.get('pensiun_bulan_jumlah', '0').replace('.', '')

            # Fallback untuk Purna (jika gaji 0, gunakan 'taspen_hak_pensiun' jika ada)
            if not penghasilan_str or float(penghasilan_str) == 0:
                penghasilan_str = context.get('taspen_hak_pensiun', '0').replace('.', '')
            
        penghasilan = int(penghasilan_str) if penghasilan_str.isdigit() else 0
        
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
    
    template_path = os.path.join(app.root_path, template_docx_name)
    
    if not os.path.exists(template_path):
        template_path = os.path.join(app.root_path, TEMPLATE_FILENAME_DEFAULT)
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

@app.route('/hapus/<int:id>')
def hapus(id):
    debitur = Debitur.query.get_or_404(id)
    db.session.delete(debitur)
    db.session.commit()
    flash('Data debitur berhasil dihapus.', 'success')
    return redirect(url_for('riwayat'))

# --- RUTE UNTUK KELOLA TEMPLATE ---

@app.route('/admin')
def admin():
    return render_template('admin.html', categories=PRODUCT_CATEGORIES)

@app.route('/upload_template', methods=['POST'])
def upload_template():
    if 'file' not in request.files:
        flash('Tidak ada file yang dipilih.', 'danger')
        return redirect(url_for('admin'))
    
    file = request.files['file']
    kategori = request.form.get('kategori')

    if not kategori or kategori not in PRODUCT_CATEGORIES:
        flash('Kategori template tidak valid.', 'danger')
        return redirect(url_for('admin'))
        
    if file.filename == '':
        flash('Tidak ada file yang dipilih.', 'danger')
        return redirect(url_for('admin'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(PRODUCT_CATEGORIES[kategori]['template_docx'])
        save_path = os.path.join(app.root_path, filename)
        
        try:
            file.save(save_path)
            flash(f'Template "{filename}" berhasil diperbarui.', 'success')
        except Exception as e:
            flash(f'Terjadi error saat menyimpan file: {e}', 'danger')
            
    else:
        flash('Format file tidak diizinkan. Harap upload file .docx', 'danger')
        
    return redirect(url_for('admin'))

with app.app_context():
    db.create_all()

# --- FUNGSI UNTUK BUKA BROWSER ---
def open_browser():
      webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == '__main__':
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        Timer(1, open_browser).start()
    
    app.run(debug=True)