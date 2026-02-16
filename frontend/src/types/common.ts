import { Kategori, JenisPengajuan, Segmentasi, Role } from '@prisma/client';

export { Kategori, JenisPengajuan, Segmentasi, Role };

export const VALID_KATEGORI = Object.values(Kategori);
export const VALID_JENIS_PENGAJUAN = Object.values(JenisPengajuan);
export const VALID_SEGMENTASI = Object.values(Segmentasi);
