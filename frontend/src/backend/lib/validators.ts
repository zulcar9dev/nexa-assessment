import { z } from "zod";
import { KategoriDokumen, TargetMarket } from "@prisma/client";

// Zod Schema for Debitur Creation
export const CreateDebiturSchema = z.object({
    namaPemohon: z.string().min(1),
    noKtp: z.string().length(16),
    kategori: z.enum([
        // Prapurna
        "prapurna_baru", "prapurna_top_up", "prapurna_top_up_sisa_gaji", "prapurna_tht", "prapurna_takeover",
        // Purna
        "purna_baru", "purna_top_up", "purna_top_up_sisa_gaji", "purna_takeover",
        // Aktif
        "aktif_baru", "aktif_top_up", "aktif_takeover"
    ]),
    jenisPengajuan: z.enum(["baru", "top_up", "top_up_sisa_gaji", "tht", "takeover", "fleksi_aktif"]),
    segmentasi: z.enum(["taspen", "asabri", "bumd_bumn", "swasta", "pemerintahan"]),
    dataLengkap: z.record(z.string(), z.any()).default({}), // Default to empty object if missing
}).refine((data) => {
    // Validate status_kepegawaian_manual for Aktif category
    if (data.kategori.startsWith("aktif_")) {
        const manualStatus = String(data.dataLengkap?.status_kepegawaian_manual || "").trim();
        return manualStatus.length > 0;
    }
    return true;
}, {
    message: "Status Kepegawaian wajib diisi untuk kategori Aktif",
    path: ["dataLengkap", "status_kepegawaian_manual"], // Path corrected to match structure
});

// Helper for API request validation
type ValidationResult<T> = 
    | { success: true; data: T }
    | { success: false; errors: z.ZodIssue[] };

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
        return { success: false, errors: result.error.issues };
    }
    return { success: true, data: result.data };
}

export type CreateDebiturPayload = z.infer<typeof CreateDebiturSchema>;

// Zod Schema for Document Creation
export const CreateDocumentSchema = z.object({
    judul: z.string().min(1, "Judul dokumen wajib diisi"),
    nomorMemo: z.string().min(1, "Nomor memo wajib diisi"),
    kategori: z.nativeEnum(KategoriDokumen, { message: "Kategori tidak valid" }),
    targetMarket: z.nativeEnum(TargetMarket, { message: "Target market tidak valid" }),
    berlakuMulai: z.string().min(1, "Tanggal berlaku mulai wajib diisi"),
    berlakuAkhir: z.string().min(1, "Tanggal berlaku akhir wajib diisi"),
    keywords: z.union([
        z.array(z.string()),
        z.string().transform(val => val ? val.split(',').map(k => k.trim()).filter(Boolean) : [])
    ]).optional().default([]),
    replacesId: z.string().optional(),
});

export const UpdateDocumentSchema = CreateDocumentSchema.partial();
