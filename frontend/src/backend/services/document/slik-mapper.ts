import { SlikFacility } from './types';
import { formatRupiah } from '@/lib/utils';

export class SlikMapper {
  /**
   * Map SLIK facilities to List for Loop (optimized)
   */
  static mapSlikToList(
    slikFacilities: SlikFacility[]
  ): Record<string, unknown>[] {
    return slikFacilities.map((facility) => {
      const alasanRaw = facility.alasan || "";
      const localContext = {
        nomor_rekening_pinjaman: facility.nomor_rekening_pinjaman || "",
        nomor_pk: facility.nomor_pk || "",
        nama_bank: facility.nama_bank || "",
        plafon_maks: formatRupiah(facility.plafon_maks),
        outstanding: formatRupiah(facility.outstanding),
        jenis_kredit: facility.jenis_kredit || "Konsumtif",
        kolektibilitas: facility.kolektibilitas || "1",
      };

      const alasanParsed = alasanRaw.replace(/{{([\w_]+)}}/g, (match, key: string) => {
        return (localContext as Record<string, string>)[key] || match;
      });

      return {
        nama_bank: facility.nama_bank || "",
        jenis_kredit: facility.jenis_kredit || "Konsumtif",
        plafon_maks: formatRupiah(facility.plafon_maks),
        outstanding: formatRupiah(facility.outstanding),
        angsuran: formatRupiah(facility.angsuran),
        kolektibilitas: facility.kolektibilitas || "1",
        alasan: alasanParsed,
        norek_existing: facility.nomor_rekening_pinjaman || "",
        nopk_existing: facility.nomor_pk || "",
        is_takeover: facility.is_takeover, // Optional, might be useful
        is_topup: facility.is_topup_lunas // Optional
      };
    });
  }

  /**
   * Map SLIK facilities to indexed fields (slik_bank_1, slik_bank_2, etc.)
   * Template uses indexed fields for each bank, up to 15 banks
   */
  static mapSlikToIndexedFields(
    slikFacilities: SlikFacility[]
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Map up to 15 SLIK facilities
    for (let i = 1; i <= 15; i++) {
      const facility = slikFacilities[i - 1];
      if (facility && facility.nama_bank) {
        // Boolean flag for conditional rendering
        result[`slik_bank_${i}_ada`] = true;
        result[`slik_bank_${i}_nama`] = facility.nama_bank || "";
        result[`slik_bank_${i}_jenis`] = facility.jenis_kredit || "Konsumtif";
        result[`slik_bank_${i}_maks`] = formatRupiah(facility.plafon_maks);
        result[`slik_bank_${i}_outs`] = formatRupiah(facility.outstanding);
        result[`slik_bank_${i}_coll`] = facility.kolektibilitas || "1";
        result[`slik_bank_${i}_angsuran`] = formatRupiah(
          facility.angsuran
        );
        result[`slik_bank_${i}_takeover`] = facility.is_takeover
          ? "ya"
          : "tidak";
        result[`slik_bank_${i}_topup`] = facility.is_topup_lunas
          ? "ya"
          : "tidak";
        // Use manual alasan input with local placeholder parsing
        const alasanRaw = facility.alasan || "";
        const localContext = {
          nomor_rekening_pinjaman: facility.nomor_rekening_pinjaman || "",
          nomor_pk: facility.nomor_pk || "",
          nama_bank: facility.nama_bank || "",
          plafon_maks: formatRupiah(facility.plafon_maks),
          outstanding: formatRupiah(facility.outstanding),
          jenis_kredit: facility.jenis_kredit || "Konsumtif",
          kolektibilitas: facility.kolektibilitas || "1",
        };
        // Simple replace for local context
        const alasanParsed = alasanRaw.replace(/{{([\w_]+)}}/g, (match, key: string) => {
          return (localContext as Record<string, string>)[key] || match;
        });

        result[`slik_bank_${i}_alasan`] = alasanParsed;
        result[`slik_bank_${i}_norek_existing`] = facility.nomor_rekening_pinjaman || "";
        result[`slik_bank_${i}_nopk_existing`] = facility.nomor_pk || "";
      } else {
        // Empty placeholders for unused slots - boolean is false
        result[`slik_bank_${i}_ada`] = false;
        result[`slik_bank_${i}_nama`] = "";
        result[`slik_bank_${i}_jenis`] = "";
        result[`slik_bank_${i}_maks`] = "";
        result[`slik_bank_${i}_outs`] = "";
        result[`slik_bank_${i}_coll`] = "";
        result[`slik_bank_${i}_angsuran`] = "";
        result[`slik_bank_${i}_takeover`] = "";
        result[`slik_bank_${i}_topup`] = "";
        result[`slik_bank_${i}_alasan`] = "";
        result[`slik_bank_${i}_norek_existing`] = "";
        result[`slik_bank_${i}_nopk_existing`] = "";
      }
    }

    return result;
  }
}
