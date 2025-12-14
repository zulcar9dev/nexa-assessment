import math
from datetime import datetime

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
