import { z } from "zod";

// Tab A - Identitas Validation
export const identitasSchema = z.object({
    nama_pemohon: z.string().min(1, "Nama wajib diisi"),
    no_ktp_pemohon: z.string().length(16, "NIK harus 16 digit"),
    tgl_lahir_pemohon: z.string().min(1, "Tanggal lahir wajib diisi"),
    jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
    alamat_ktp: z.string().min(1, "Alamat wajib diisi"),
    no_telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    status_perkawinan: z.string().optional(),
});

// Tab B - Pekerjaan Validation (Prapurna)
export const pekerjaanPrapurnaSchema = z.object({
    segmentasi: z.enum(["taspen", "asabri"]),
    jenis_pengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "takeover"]),
    instansi: z.string().min(1, "Instansi wajib diisi"),
    golongan: z.string().min(1, "Golongan wajib diisi"),
    tgl_mulai_kerja: z.string().optional(),
    tgl_pensiun_pemohon: z.string().min(1, "Tanggal pensiun wajib diisi"),
});

// Tab B - Data Pensiun Validation (Purna)
export const pensiunSchema = z.object({
    segmentasi: z.enum(["taspen", "asabri"]),
    jenis_pengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "takeover"]),
    no_sk_pensiun: z.string().min(1, "No. SK Pensiun wajib diisi"),
    tgl_sk_pensiun: z.string().min(1, "Tanggal SK Pensiun wajib diisi"),
    tgl_pensiun_tmt: z.string().min(1, "TMT Pensiun wajib diisi"),
    instansi: z.string().optional(),
    golongan: z.string().optional(),
});

// Tab C - Penghasilan Validation (Prapurna)
export const penghasilanPrapurnaSchema = z.object({
    gaji_bulan_1_jumlah: z.string().optional(),
    gaji_bulan_2_jumlah: z.string().optional(),
    gaji_bulan_3_jumlah: z.string().optional(),
    estimasi_hak_pensiun: z.string().min(1, "Estimasi hak pensiun wajib diisi"),
});

// Tab C - Penghasilan Validation (Purna)
export const penghasilanPurnaSchema = z.object({
    pensiun_bulan_1_jumlah: z.string().optional(),
    pensiun_bulan_2_jumlah: z.string().optional(),
    pensiun_bulan_3_jumlah: z.string().optional(),
    pensiun_bulan_jumlah: z.string().min(1, "Hak pensiun bulanan wajib diisi"),
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

// Tab D - SLIK Validation
export const slikSchema = z.object({
    fasilitas_nihil: z.enum(["ya", "tidak"]),
    slik_facilities: z.array(slikFacilitySchema).optional(),
});

// Tab E - Usulan Validation
export const usulanSchemaBase = z.object({
    usulan_plafon_kredit: z.string().min(1, "Plafon wajib diisi"),
    usulan_jangka_waktu_bulan: z.string().min(1, "Jangka waktu wajib diisi"),
    usulan_bunga_persen: z.string().min(1, "Bunga wajib diisi"),
    biaya_psjt_percent: z.string().optional(),
    biaya_administrasi_is_bebas: z.boolean().optional(),
    biaya_administrasi_nominal: z.string().optional(),
});

export const usulanSchema = usulanSchemaBase.refine((data) => {
    if (!data.biaya_administrasi_is_bebas && (!data.biaya_administrasi_nominal || data.biaya_administrasi_nominal === "")) {
        return false;
    }
    return true;
}, {
    message: "Nominal biaya administrasi wajib diisi jika tidak bebas biaya",
    path: ["biaya_administrasi_nominal"],
});

// Complete Form Schema (Prapurna)
export const debiturPrapurnaSchema = z.object({
    ...identitasSchema.shape,
    ...pekerjaanPrapurnaSchema.shape,
    ...penghasilanPrapurnaSchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
});

// Complete Form Schema (Purna)
export const debiturPurnaSchema = z.object({
    ...identitasSchema.shape,
    ...pensiunSchema.shape,
    ...penghasilanPurnaSchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
});

// Tab B - Pekerjaan Validation (Aktif) - BARU
export const pekerjaanAktifSchema = z.object({
    segmentasi: z.enum(["bumd_bumn", "swasta", "pemerintahan"]),
    jenis_pengajuan: z.enum(["baru", "top_up", "takeover"]),
    instansi: z.string().min(1, "Instansi wajib diisi"),
    tgl_mulai_kerja: z.string().optional(),
});

// Complete Form Schema (Aktif) - BARU
export const debiturAktifSchema = z.object({
    ...identitasSchema.shape,
    ...pekerjaanAktifSchema.shape,
    ...penghasilanPrapurnaSchema.shape,
    ...slikSchema.shape,
    ...usulanSchemaBase.shape,
});

// Type exports
export type IdentitasFormData = z.infer<typeof identitasSchema>;
export type PekerjaanPrapurnaFormData = z.infer<typeof pekerjaanPrapurnaSchema>;
export type PensiunFormData = z.infer<typeof pensiunSchema>;
export type PenghasilanPrapurnaFormData = z.infer<typeof penghasilanPrapurnaSchema>;
export type PenghasilanPurnaFormData = z.infer<typeof penghasilanPurnaSchema>;
export type SlikFormData = z.infer<typeof slikSchema>;
export type UsulanFormData = z.infer<typeof usulanSchema>;
export type DebiturPrapurnaFormData = z.infer<typeof debiturPrapurnaSchema>;
export type DebiturPurnaFormData = z.infer<typeof debiturPurnaSchema>;
export type PekerjaanAktifFormData = z.infer<typeof pekerjaanAktifSchema>;
export type DebiturAktifFormData = z.infer<typeof debiturAktifSchema>;
