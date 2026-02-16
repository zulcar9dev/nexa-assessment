
export type KategoriDoc = "prapurna" | "purna" | "aktif";

export interface SlikFacility {
  nama_bank: string;
  jenis_kredit?: string;
  plafon_maks: string;
  outstanding: string;
  angsuran: string;
  kolektibilitas: string;
  alasan?: string;
  is_takeover?: boolean;
  is_topup_lunas?: boolean;
  nomor_rekening_pinjaman?: string;
  nomor_pk?: string;
}

export interface DebiturData {
  namaPemohon: string;
  noKtp: string;
  kategori: string;
  jenisPengajuan: string;
  segmentasi: string;
  dataLengkap: Record<string, unknown>;
  createdAt?: Date | string;
}
