import { z } from "zod";

// Zod Schema for Debitur Creation
export const CreateDebiturSchema = z.object({
    namaPemohon: z.string().min(1),
    noKtp: z.string().length(16),
    kategori: z.enum(["prapurna_reguler", "prapurna_takeover", "purna_reguler", "purna_takeover"]), // Mapped to Kategori
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
