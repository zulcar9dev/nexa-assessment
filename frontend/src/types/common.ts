export enum Kategori {
  PRAPURNA = "PRAPURNA",
  PURNA = "PURNA",
  AKTIF = "AKTIF"
}

export enum JenisPengajuan {
  BARU = "BARU",
  TOP_UP = "TOP_UP",
  TOP_UP_SISA_GAJI = "TOP_UP_SISA_GAJI",
  TAKEOVER = "TAKEOVER",
  THT = "THT",
  FLEKSI_AKTIF = "FLEKSI_AKTIF"
}

export enum Segmentasi {
  TASPEN = "TASPEN",
  ASABRI = "ASABRI",
  BUMD_BUMN = "BUMD_BUMN",
  PEMERINTAHAN = "PEMERINTAHAN",
  SWASTA = "SWASTA"
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

export const VALID_KATEGORI = Object.values(Kategori);
export const VALID_JENIS_PENGAJUAN = Object.values(JenisPengajuan);
export const VALID_SEGMENTASI = Object.values(Segmentasi);
