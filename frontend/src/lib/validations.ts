import { z } from "zod";
import { calculateAge } from "./utils";

// ==========================================
// Field Label Map — untuk pesan error yang informatif
// ==========================================
export const FIELD_LABELS: Record<string, string> = {
    nama_pemohon: "Nama Pemohon",
    no_ktp_pemohon: "NIK",
    tgl_lahir_pemohon: "Tanggal Lahir",
    alamat_ktp: "Alamat KTP",
    alamat_tempat_tinggal: "Alamat Tempat Tinggal",
    no_telepon: "No. Telepon",
    status_perkawinan: "Status Perkawinan",
    segmentasi: "Segmentasi",
    jenis_pengajuan: "Jenis Pengajuan",
    instansi: "Instansi/Perusahaan",
    golongan: "Golongan/Pangkat",
    tgl_mulai_kerja: "Tanggal Mulai Kerja",
    tgl_pensiun_pemohon: "Tanggal Pensiun",
    status_kepegawaian_manual: "Status Kepegawaian",
    no_sk_pensiun: "No. SK Pensiun",
    tgl_sk_pensiun: "Tanggal SK Pensiun",
    tgl_pensiun_tmt: "TMT Pensiun",
    estimasi_hak_pensiun: "Estimasi Hak Pensiun",
    pensiun_bulan_jumlah: "Hak Pensiun Bulanan",
    fasilitas_nihil: "Fasilitas Eksternal Nihil",
    usulan_plafon_kredit: "Budget Allocation",
    usulan_jangka_waktu_bulan: "Jangka Waktu",
    usulan_bunga_persen: "Bunga",
    biaya_administrasi_nominal: "Nominal Biaya Administrasi",
    nama_almarhum_pasangan: "Nama Almarhum/Almarhumah Pasangan",
    nama_kerabat: "Nama Kerabat",
    hubungan_kerabat: "Hubungan Kerabat",
    no_telepon_kerabat: "No. Telepon Kerabat",
};

/**
 * Formats Zod validation errors into a user-friendly alert message.
 * Shows the field label + error message for each error.
 */
export function formatValidationErrors(errors: z.ZodIssue[]): string {
    const lines = errors.map((err) => {
        const fieldPath = err.path.join(".");
        const label = FIELD_LABELS[fieldPath] || fieldPath || "Field";
        // Untuk pesan "Required", ganti menjadi pesan yang lebih jelas
        const message = err.message === "Required"
            ? `${label} wajib diisi`
            : err.message;
        return `• ${label}: ${message}`;
    });
    return lines.join("\n");
}

// ==========================================
// Tab A - Identitas Validation
// ==========================================
export const identitasSchema = z.object({
    nama_pemohon: z.string({ required_error: "Nama wajib diisi" }).min(1, "Nama wajib diisi"),
    no_ktp_pemohon: z.string({ required_error: "NIK wajib diisi" }).length(16, "NIK harus 16 digit").regex(/^\d{16}$/, "NIK harus 16 digit angka"),
    tgl_lahir_pemohon: z.string({ required_error: "Tanggal lahir wajib diisi" }).min(1, "Tanggal lahir wajib diisi"),
    alamat_ktp: z.string({ required_error: "Alamat wajib diisi" }).min(1, "Alamat wajib diisi"),
    tempat_tinggal_berbeda: z.boolean().optional(),
    alamat_tempat_tinggal: z.string().optional(),
    no_telepon: z.string({ required_error: "Nomor telepon wajib diisi" }).min(10, "Nomor telepon minimal 10 digit"),
    status_perkawinan: z.string().optional(),
});

// Reusable refinement helper for different residence address
const alamatRefinement = (data: { tempat_tinggal_berbeda?: boolean; alamat_tempat_tinggal?: string }) => {
    if (data.tempat_tinggal_berbeda && (!data.alamat_tempat_tinggal || data.alamat_tempat_tinggal.trim() === "")) {
        return false;
    }
    return true;
};

const alamatRefinementParams = {
    message: "Alamat tempat tinggal wajib diisi jika berbeda dengan KTP",
    path: ["alamat_tempat_tinggal"],
};

const adminCostRefinement = (data: { biaya_administrasi_is_bebas?: boolean; biaya_administrasi_nominal?: string }) => {
    if (!data.biaya_administrasi_is_bebas && (!data.biaya_administrasi_nominal || data.biaya_administrasi_nominal === "")) {
        return false;
    }
    return true;
};

const adminCostRefinementParams = {
    message: "Nominal biaya administrasi wajib diisi jika tidak bebas biaya",
    path: ["biaya_administrasi_nominal"],
};

// ==========================================
// Tab B - Pekerjaan Validation (TypeA)
// ==========================================
export const pekerjaanTypeASchema = z.object({
    segmentasi: z.enum(["taspen", "asabri"], { required_error: "Segmentasi wajib dipilih", invalid_type_error: "Segmentasi wajib dipilih" }),
    jenis_pengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "tht", "takeover"], { required_error: "Jenis pengajuan wajib dipilih", invalid_type_error: "Jenis pengajuan wajib dipilih" }),
    instansi: z.string({ required_error: "Instansi wajib diisi" }).min(1, "Instansi wajib diisi"),
    golongan: z.string({ required_error: "Golongan wajib diisi" }).min(1, "Golongan wajib diisi"),
    tgl_mulai_kerja: z.string().optional(),
    tgl_pensiun_pemohon: z.string({ required_error: "Tanggal pensiun wajib diisi" }).min(1, "Tanggal pensiun wajib diisi"),
});

// ==========================================
// Tab B - Data Pensiun Validation (Purna)
// ==========================================
export const pensiunSchema = z.object({
    segmentasi: z.enum(["taspen", "asabri"], { required_error: "Segmentasi wajib dipilih", invalid_type_error: "Segmentasi wajib dipilih" }),
    jenis_pengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "takeover", "pensiunan_janda_baru", "pensiunan_janda_top_up", "pensiunan_janda_takeover", "pensiunan_duda_baru", "pensiunan_duda_top_up", "pensiunan_duda_takeover"], { required_error: "Jenis pengajuan wajib dipilih", invalid_type_error: "Jenis pengajuan wajib dipilih" }),
    no_sk_pensiun: z.string({ required_error: "No. SK Pensiun wajib diisi" }).min(1, "No. SK Pensiun wajib diisi"),
    tgl_sk_pensiun: z.string({ required_error: "Tanggal SK Pensiun wajib diisi" }).min(1, "Tanggal SK Pensiun wajib diisi"),
    tgl_pensiun_tmt: z.string({ required_error: "TMT Pensiun wajib diisi" }).min(1, "TMT Pensiun wajib diisi"),
    instansi: z.string().optional(),
    golongan: z.string().optional(),
    nama_almarhum_pasangan: z.string().optional(),
    nama_kerabat: z.string().optional(),
    hubungan_kerabat: z.string().optional(),
    no_telepon_kerabat: z.string().optional(),
});

// ==========================================
// Tab C - Penghasilan Validation (TypeA)
// ==========================================
export const penghasilanTypeASchema = z.object({
    gaji_bulan_1_jumlah: z.string().optional(),
    gaji_bulan_2_jumlah: z.string().optional(),
    gaji_bulan_3_jumlah: z.string().optional(),
    estimasi_hak_pensiun: z.string({ required_error: "Estimasi hak pensiun wajib diisi" }).min(1, "Estimasi hak pensiun wajib diisi"),
});

// ==========================================
// Tab C - Penghasilan Validation (Aktif)
// ==========================================
export const penghasilanAktifSchema = z.object({
    gaji_bulan_1_jumlah: z.string().optional(),
    gaji_bulan_2_jumlah: z.string().optional(),
    gaji_bulan_3_jumlah: z.string().optional(),
    estimasi_hak_pensiun: z.string().optional(),
});

// ==========================================
// Tab C - Penghasilan Validation (Purna)
// ==========================================
export const penghasilanPurnaSchema = z.object({
    pensiun_bulan_1_jumlah: z.string().optional(),
    pensiun_bulan_2_jumlah: z.string().optional(),
    pensiun_bulan_3_jumlah: z.string().optional(),
    pensiun_bulan_jumlah: z.string({ required_error: "Hak pensiun bulanan wajib diisi" }).min(1, "Hak pensiun bulanan wajib diisi"),
});

// Slik Facility Schema
const slikFacilitySchema = z.object({
    nama_bank: z.string().min(1, "Nama bank wajib diisi"),
    jenis_kredit: z.string().optional(),
    plafon_maks: z.string().optional(),
    outstanding: z.string().optional(),
    angsuran: z.string().optional(),
    kolektibilitas: z.string().optional(),
    alasan: z.string().optional(),
    is_takeover: z.boolean().optional(),
    is_topup_lunas: z.boolean().optional(),
    nomor_rekening_pinjaman: z.string().optional(),
    nomor_pk: z.string().optional(),
});

// ==========================================
// Tab D - Data Eksternal Validation
// ==========================================
export const slikSchema = z.object({
    fasilitas_nihil: z.enum(["ya", "tidak"], { required_error: "Fasilitas Eksternal wajib dipilih", invalid_type_error: "Fasilitas Eksternal wajib dipilih" }),
    slik_facilities: z.array(slikFacilitySchema).optional(),
});

// ==========================================
// Tab E - Usulan Validation
// ==========================================
export const usulanSchemaBase = z.object({
    usulan_plafon_kredit: z.string({ required_error: "Budget wajib diisi" }).min(1, "Budget wajib diisi"),
    usulan_jangka_waktu_bulan: z.string({ required_error: "Jangka waktu wajib diisi" }).min(1, "Jangka waktu wajib diisi"),
    usulan_bunga_persen: z.string({ required_error: "Bunga wajib diisi" }).min(1, "Bunga wajib diisi"),
    biaya_psjt_percent: z.string().optional(),
    biaya_administrasi_is_bebas: z.boolean().optional(),
    biaya_administrasi_nominal: z.string().optional(),
});

export const usulanSchema = usulanSchemaBase.refine(adminCostRefinement, adminCostRefinementParams);

// ==========================================
// Complete Form Schemas
// ==========================================

// Complete Form Schema (TypeA)
export const clientTypeASchema = z.object({
    ...identitasSchema.shape,
    ...pekerjaanTypeASchema.shape,
    ...penghasilanTypeASchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
}).refine(alamatRefinement, alamatRefinementParams).refine(adminCostRefinement, adminCostRefinementParams);

// Complete Form Schema (Purna)
export const clientPurnaSchema = z.object({
    ...identitasSchema.shape,
    ...pensiunSchema.shape,
    ...penghasilanPurnaSchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
})
.refine(alamatRefinement, alamatRefinementParams)
.refine(adminCostRefinement, adminCostRefinementParams)
.superRefine((data, ctx) => {
    const jp = String(data.jenis_pengajuan || "").toLowerCase();
    const isJanda = jp.startsWith("pensiunan_janda_");
    const isDuda = jp.startsWith("pensiunan_duda_");

    if (isJanda || isDuda) {
        // 1. Mandatory checks
        if (!data.nama_almarhum_pasangan || data.nama_almarhum_pasangan.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nama almarhum/almarhumah pasangan wajib diisi",
                path: ["nama_almarhum_pasangan"],
            });
        }
        if (!data.nama_kerabat || data.nama_kerabat.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nama kerabat wajib diisi",
                path: ["nama_kerabat"],
            });
        }
        if (!data.hubungan_kerabat || data.hubungan_kerabat.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Hubungan kerabat wajib diisi",
                path: ["hubungan_kerabat"],
            });
        }
        if (!data.no_telepon_kerabat || data.no_telepon_kerabat.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "No. telepon kerabat wajib diisi",
                path: ["no_telepon_kerabat"],
            });
        }

        // 2. Age and Tenor business rules
        const tglLahir = data.tgl_lahir_pemohon;
        const tenorStr = data.usulan_jangka_waktu_bulan;
        const tenorBulan = tenorStr ? parseInt(tenorStr, 10) : 0;
        const tenorTahun = tenorBulan / 12;
        const usiaPengajuan = tglLahir ? calculateAge(tglLahir) : 0;
        const usiaLunas = usiaPengajuan + tenorTahun;

        if (isJanda) {
            if (usiaPengajuan < 50) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Usia pemohon saat pengajuan minimal 50 tahun untuk Pensiunan Janda (saat ini ${usiaPengajuan} tahun)`,
                    path: ["tgl_lahir_pemohon"],
                });
            }
            if (tenorBulan > 120) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Tenor assessment maksimal 10 tahun (120 bulan) untuk Pensiunan Janda",
                    path: ["usulan_jangka_waktu_bulan"],
                });
            }
            if (usiaLunas > 75) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Usia pemohon saat assessment lunas maksimal 75 tahun untuk Pensiunan Janda (lunas di usia ${usiaLunas.toFixed(1)} tahun)`,
                    path: ["usulan_jangka_waktu_bulan"],
                });
            }
        } else if (isDuda) {
            if (usiaPengajuan < 40) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Usia pemohon saat pengajuan minimal 40 tahun untuk Pensiunan Duda (saat ini ${usiaPengajuan} tahun)`,
                    path: ["tgl_lahir_pemohon"],
                });
            }
            if (tenorBulan > 60) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Tenor assessment maksimal 5 tahun (60 bulan) untuk Pensiunan Duda",
                    path: ["usulan_jangka_waktu_bulan"],
                });
            }
            if (usiaLunas > 75) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Usia pemohon saat assessment lunas maksimal 75 tahun untuk Pensiunan Duda (lunas di usia ${usiaLunas.toFixed(1)} tahun)`,
                    path: ["usulan_jangka_waktu_bulan"],
                });
            }
        }
    }
});

// Tab B - Pekerjaan Validation (Aktif)
export const pekerjaanAktifSchema = z.object({
    segmentasi: z.enum(["bumd_bumn", "swasta", "pemerintahan"], { required_error: "Segmentasi wajib dipilih", invalid_type_error: "Segmentasi wajib dipilih" }),
    jenis_pengajuan: z.enum(["baru", "top_up", "takeover"], { required_error: "Jenis pengajuan wajib dipilih", invalid_type_error: "Jenis pengajuan wajib dipilih" }),
    instansi: z.string({ required_error: "Instansi wajib diisi" }).min(1, "Instansi wajib diisi"),
    status_kepegawaian_manual: z.string({ required_error: "Status kepegawaian wajib diisi" }).min(1, "Status kepegawaian wajib diisi"),
    tgl_mulai_kerja: z.string().optional(),
    prev_instansi: z.string().optional(),
    prev_status_kepegawaian: z.string().optional(),
    prev_masa_kerja: z.string().optional(),
    prev_tgl_mulai_kerja: z.string().optional(),
});

// Complete Form Schema (Aktif)
export const clientAktifSchema = z.object({
    ...identitasSchema.shape,
    ...pekerjaanAktifSchema.shape,
    ...penghasilanAktifSchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
}).refine(alamatRefinement, alamatRefinementParams).refine(adminCostRefinement, adminCostRefinementParams);

// Type exports
export type IdentitasFormData = z.infer<typeof identitasSchema>;
export type PekerjaanTypeAFormData = z.infer<typeof pekerjaanTypeASchema>;
export type PensiunFormData = z.infer<typeof pensiunSchema>;
export type PenghasilanTypeAFormData = z.infer<typeof penghasilanTypeASchema>;
export type PenghasilanPurnaFormData = z.infer<typeof penghasilanPurnaSchema>;
export type SlikFormData = z.infer<typeof slikSchema>;
export type UsulanFormData = z.infer<typeof usulanSchema>;
export type DebiturTypeAFormData = z.infer<typeof clientTypeASchema>;
export type DebiturPurnaFormData = z.infer<typeof clientPurnaSchema>;
export type PekerjaanAktifFormData = z.infer<typeof pekerjaanAktifSchema>;
export type DebiturAktifFormData = z.infer<typeof clientAktifSchema>;

/**
 * Maps a validation error field name to its corresponding form tab
 */
export function getTabForField(field: string): string {
    const tabAFields = [
        "nama_pemohon", "no_ktp_pemohon", "tgl_lahir_pemohon",
        "alamat_ktp", "tempat_tinggal_berbeda", "alamat_tempat_tinggal", "no_telepon", "status_perkawinan"
    ];
    const tabBFields = [
        "segmentasi", "jenis_pengajuan", "instansi", "golongan", "tgl_mulai_kerja",
        "tgl_pensiun_pemohon", "no_sk_pensiun", "tgl_sk_pensiun", "tgl_pensiun_tmt", "nip",
        "status_kepegawaian_manual"
    ];
    const tabCFields = [
        "nama_bank_pembayaran", "gaji_pokok", "tunjangan_istri", "tunjangan_anak",
        "total_penghasilan", "estimasi_hak_pensiun", "pensiun_bulan_1_jumlah",
        "pensiun_bulan_2_jumlah", "pensiun_bulan_3_jumlah", "pensiun_bulan_jumlah", "type_b_penghasilan_mode"
    ];
    const tabDFields = [
        "fasilitas_nihil", "slik_facilities"
    ];
    const tabEFields = [
        "usulan_plafon_kredit", "usulan_jangka_waktu_bulan", "usulan_bunga_persen",
        "biaya_administrasi_nominal", "biaya_administrasi_is_bebas"
    ];

    if (tabAFields.some(f => field.startsWith(f))) return "tab-a";
    if (tabBFields.some(f => field.startsWith(f))) return "tab-b";
    if (tabCFields.some(f => field.startsWith(f))) return "tab-c";
    if (tabDFields.some(f => field.startsWith(f))) return "tab-d";
    if (tabEFields.some(f => field.startsWith(f))) return "tab-e";
    return "tab-a";
}
