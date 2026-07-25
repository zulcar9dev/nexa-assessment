import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse, ErrorCode, ApiError } from '@/types/api';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json<ApiResponse<T>>({
        success: true,
        data,
        message,
    }, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
    code: ErrorCode,
    message: string,
    details?: ApiError['details'],
    status: number = 500
) {
    return NextResponse.json<ApiResponse>({
        success: false,
        error: {
            code,
            message,
            details,
        },
    }, { status });
}

/**
 * Centralized error handler for try-catch blocks
 */
export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    // Handle Zod Errors
    if (error instanceof ZodError) {
        return errorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            })),
            400
        );
    }

    // Handle PostgreSQL unique constraint violation (code 23505)
    if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === '23505'
    ) {
        const detail = 'detail' in error ? String((error as { detail: string }).detail) : '';
        const constraint = 'constraint' in error ? String((error as { constraint: string }).constraint) : '';
        
        // Specific message for client KTP + jenis pengajuan unique constraint
        if (constraint === 'debitur_ktp_jenis_unique') {
            return errorResponse(
                'DUPLICATE_ENTRY',
                'Data client dengan No. KTP dan Jenis Pengajuan yang sama sudah ada. Silakan gunakan fitur Edit untuk memperbarui data.',
                undefined,
                409
            );
        }

        return errorResponse(
            'DUPLICATE_ENTRY',
            `Data duplikat: ${detail || 'Record dengan data yang sama sudah ada.'}`,
            undefined,
            409
        );
    }

    // Handle string errors (throw "message")
    if (typeof error === 'string') {
        return errorResponse('INTERNAL_ERROR', error);
    }

    // Handle Error objects
    if (error instanceof Error) {
        // Check if the error message contains PostgreSQL unique violation info
        if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
            return errorResponse(
                'DUPLICATE_ENTRY',
                'Data client dengan No. KTP dan Jenis Pengajuan yang sama sudah ada. Silakan gunakan fitur Edit untuk memperbarui data.',
                undefined,
                409
            );
        }
        return errorResponse('INTERNAL_ERROR', error.message);
    }

    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred');
}
