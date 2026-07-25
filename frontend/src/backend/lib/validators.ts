import { z } from "zod";

// Zod Schema for Client Creation
export const CreateDebiturSchema = z.object({
    applicantName: z.string().min(1, "Nama pemohon wajib diisi"),
    idNumber: z.string().min(1, "NIK wajib diisi"),
    kategori: z.enum([
        // Prapurna
        "type_a_baru", "type_a_top_up", "type_a_top_up_sisa_gaji", "type_a_tht", "type_a_takeover",
        // Purna
        "type_b_baru", "type_b_top_up", "type_b_top_up_sisa_gaji", "type_b_takeover",
        // Aktif
        "type_c_baru", "type_c_top_up", "type_c_takeover"
    ]),
    jenisPengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "tht", "takeover", "fleksi_type_c", "pensiunan_janda_baru", "pensiunan_janda_top_up", "pensiunan_janda_takeover", "pensiunan_duda_baru", "pensiunan_duda_top_up", "pensiunan_duda_takeover"]),
    segmentasi: z.enum(["taspen", "asabri", "bumd_bumn", "swasta", "pemerintahan"]),
    dataLengkap: z.record(z.string(), z.any()).default({}), // Default to empty object if missing
    status: z.enum(["DRAFT", "SUBMITTED"]).default("SUBMITTED")
}).superRefine((data, ctx) => {
    // Only perform strict validation if the status is SUBMITTED
    if (data.status === "SUBMITTED") {
        // Validate NIK length
        if (data.idNumber.length !== 16 || !/^\d{16}$/.test(data.idNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "NIK harus 16 digit angka",
                path: ["idNumber"]
            });
        }

        // Validate status_kepegawaian_manual for Aktif category
        if (data.kategori.startsWith("aktif_")) {
            const manualStatus = String(data.dataLengkap?.status_kepegawaian_manual || "").trim();
            if (manualStatus.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Status Kepegawaian wajib diisi untuk kategori Aktif",
                    path: ["dataLengkap", "status_kepegawaian_manual"]
                });
            }
        }

        // Validate alamat_tempat_tinggal if tempat_tinggal_berbeda is true
        if (data.dataLengkap?.tempat_tinggal_berbeda === true || data.dataLengkap?.tempat_tinggal_berbeda === "true") {
            const alamatTinggal = String(data.dataLengkap?.alamat_tempat_tinggal || "").trim();
            if (alamatTinggal.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Alamat tempat tinggal wajib diisi jika berbeda dengan KTP",
                    path: ["dataLengkap", "alamat_tempat_tinggal"]
                });
            }
        }
    }
});

// Helper for API request validation
type ValidationResult<T> = 
    | { success: true; data: T }
    | { success: false; errors: z.ZodIssue[] };

export function validateRequest<T>(schema: z.ZodType<T, any, any>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
        return { success: false, errors: result.error.issues };
    }
    return { success: true, data: result.data };
}

export type CreateDebiturPayload = z.infer<typeof CreateDebiturSchema>;

// ============ DOCUMENT SCHEMAS ============
export const CreateDocumentSchema = z.object({
    judul: z.string().min(5, "Judul minimal 5 karakter"),
    nomorMemo: z.string().min(1, "Nomor memo wajib diisi"),
    kategori: z.enum(["KREDIT_FLEKSI", "KREDIT_GRIYA", "KREDIT_PENSIUN"]),
    targetMarket: z.enum(["ASN", "SWASTA", "TASPEN", "ASABRI", "WIRASWASTA"]),
    berlakuMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    berlakuAkhir: z.string().min(1, "Tanggal berakhir wajib diisi"),
    keywords: z.string().transform((val) => {
        try { return JSON.parse(val); } catch { return []; }
    }).pipe(z.array(z.string()).default([])),
    replacesId: z.string().optional(),
});

export const UpdateDocumentSchema = z.object({
    judul: z.string().min(5, "Judul minimal 5 karakter").optional(),
    nomorMemo: z.string().min(1, "Nomor memo wajib diisi").optional(),
    kategori: z.enum(["KREDIT_FLEKSI", "KREDIT_GRIYA", "KREDIT_PENSIUN"]).optional(),
    targetMarket: z.enum(["ASN", "SWASTA", "TASPEN", "ASABRI", "WIRASWASTA"]).optional(),
    berlakuMulai: z.string().optional(),
    berlakuAkhir: z.string().optional(),
    keywords: z.array(z.string()).optional(),
});

export type CreateDocumentPayload = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentPayload = z.infer<typeof UpdateDocumentSchema>;
