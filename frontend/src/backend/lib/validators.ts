import { z } from "zod";

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
    segmentasi: z.enum(["taspen", "asabri"]),
    dataLengkap: z.record(z.string(), z.any()).default({}), // Default to empty object if missing
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
