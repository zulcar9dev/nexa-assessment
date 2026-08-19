import { calculateMonthsDifferenceRoundedUp, toLocalDateStr } from "@/lib/utils";

export type BlokiranKategori = "type_a" | "type_b" | "type_c";

/**
 * Batas wajar maksimal blokiran (bulan) sebagai pengaman input.
 * Lebih besar dari cap tenor maksimal (240 bulan) + janda (120) + kontrak.
 */
export const BLOKIRAN_MAX_MONTHS = 600;

/**
 * Blokiran Pindah Gaji hanya berlaku untuk:
 * - TypeA (prapurna): selalu
 * - Purna: hanya jenis pengajuan Baru & Take Over (termasuk Pensiunan Janda/Duda)
 * - Aktif: tidak pernah
 */
export function isPindahGajiApplicable(
  kategori: BlokiranKategori,
  jenisPengajuan?: string,
): boolean {
  if (kategori === "type_a") return true;
  if (kategori === "type_c") return false;

  const jp = String(jenisPengajuan || "").toLowerCase();
  return (
    jp === "baru" ||
    jp === "takeover" ||
    jp.endsWith("_baru") ||
    jp.endsWith("_takeover")
  );
}

/**
 * Blokiran TypeA (prapurna) hanya relevan untuk kategori TypeA.
 * Dihitung sebagai selisih bulan dari hari ini ke tanggal pensiun,
 * dibulatkan ke atas (sisa hari dihitung 1 bulan).
 */
export function calculateBlokiranPrapurna(tglPensiun?: string): number {
  if (!tglPensiun) return 0;
  return calculateMonthsDifferenceRoundedUp(toLocalDateStr(), tglPensiun);
}

/**
 * Hitung nilai blokiran (satu-satunya sumber kebenaran).
 * Mengembalikan nilai baru untuk blokiran_prapurna_jml dan total_blokiran_jml.
 */
export function computeBlokiran(
  data: Record<string, unknown>,
  kategori: BlokiranKategori,
): { blokiran_prapurna_jml: number; total_blokiran_jml: number } {
  const prapurna =
    kategori === "type_a"
      ? calculateBlokiranPrapurna(String(data.tgl_pensiun_pemohon || ""))
      : 0;

  const pindahGaji = isPindahGajiApplicable(kategori, String(data.jenis_pengajuan || ""))
    ? toSafeCount(data.blokiran_pindah_gaji_jml)
    : 0;

  const wajib = toSafeCount(data.blokiran_wajib_jml);

  return {
    blokiran_prapurna_jml: prapurna,
    total_blokiran_jml: prapurna + pindahGaji + wajib,
  };
}

/**
 * Normalisasi dataLengkap:
 * - Migrasi nilai legacy blokiran_type_a_jml -> blokiran_prapurna_jml
 * - Hapus field legacy blokiran_type_a_jml
 * - Sinkronkan nilai tersimpan dengan hasil perhitungan terbaru
 */
export function normalizeBlokiran(
  data: Record<string, unknown>,
  kategori: BlokiranKategori,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...data };

  // 1. Migrasi field legacy
  const legacy = toSafeCount(normalized.blokiran_type_a_jml);
  const storedPrapurna = toSafeCount(normalized.blokiran_prapurna_jml);
  if (legacy > 0 && storedPrapurna === 0) {
    normalized.blokiran_prapurna_jml = legacy;
  }
  delete normalized.blokiran_type_a_jml;

  // 2. Bersihkan nilai non-numerik pada input manual
  normalized.blokiran_pindah_gaji_jml = toSafeCount(
    normalized.blokiran_pindah_gaji_jml,
  );
  normalized.blokiran_wajib_jml = toSafeCount(normalized.blokiran_wajib_jml);

  // 3. Hitung ulang nilai otomatis
  const computed = computeBlokiran(normalized, kategori);
  normalized.blokiran_prapurna_jml = computed.blokiran_prapurna_jml;
  normalized.total_blokiran_jml = computed.total_blokiran_jml;

  return normalized;
}

/**
 * Konversi nilai ke angka utuh >= 0 (0 jika tidak valid/negatif).
 */
function toSafeCount(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.floor(num));
}
