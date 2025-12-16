import json
from datetime import datetime
from extensions import db

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
