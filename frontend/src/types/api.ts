// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: ApiError;
}

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}

export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'DSR_EXCEEDED'
    | 'INTERNAL_ERROR';

// Pagination
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// Calculate PMT
export interface PMTRequest {
    principal: number;      // Plafon kredit
    annualRate: number;     // Bunga per tahun (%)
    months: number;         // Tenor (bulan)
}

export interface PMTResponse {
    angsuran: number;
    totalBayar: number;
    totalBunga: number;
}

// Calculate DSR
export interface DSRRequest {
    penghasilan: number;
    angsuranBaru: number;
    angsuranEksisting: number[];
}

export interface DSRResponse {
    dsr: number;            // Persentase DSR
    dsc90: number;          // 90% dari penghasilan
    totalAngsuran: number;
    maksimalAngsuran: number;
    isValid: boolean;       // false jika DSR > 90%
    message?: string;
}

// Debitur Query Params
export interface DebiturQueryParams {
    q?: string;             // Search nama/NIK
    jenis?: JenisPengajuan | string;
    segmentasi?: Segmentasi | string;
    kategori?: Kategori | string;
    page?: number;
    limit?: number;
}

// Debitur Create/Update Request
import { Kategori, JenisPengajuan, Segmentasi } from './debitur';

// Debitur Create/Update Request
export interface CreateDebiturRequest {
    namaPemohon: string;
    noKtp: string;
    kategori: Kategori;
    jenisPengajuan: JenisPengajuan;
    segmentasi: Segmentasi;
    dataLengkap: Record<string, any>;
}

export type UpdateDebiturRequest = Partial<CreateDebiturRequest>;

// Template
export interface Template {
    id: string;
    kategori: string;
    name: string;
    filename: string;
    path: string;
    updatedAt: Date;
}
