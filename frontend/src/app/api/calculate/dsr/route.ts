import { NextRequest, NextResponse } from 'next/server';
import { CalculationService } from '@/backend/services/calculation.service';
import type { DSRRequest, DSRResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/calculate/dsr
 * Calculate Debt Service Ratio (DSR)
 */
export async function POST(request: NextRequest) {
    try {
        const body: DSRRequest = await request.json();

        // Validate request
        if (!body.penghasilan || body.penghasilan <= 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Penghasilan harus lebih dari 0',
                    details: [{ field: 'penghasilan', message: 'Penghasilan harus diisi dan lebih dari 0' }],
                },
            }, { status: 400 });
        }

        if (body.angsuranBaru === undefined || body.angsuranBaru < 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Angsuran baru tidak valid',
                    details: [{ field: 'angsuranBaru', message: 'Angsuran baru harus diisi dan >= 0' }],
                },
            }, { status: 400 });
        }

        // Ensure angsuranEksisting is an array
        const angsuranEksisting = Array.isArray(body.angsuranEksisting)
            ? body.angsuranEksisting
            : [];

        // Calculate complete DSR
        const result = CalculationService.calculateCompleteDSR(
            body.penghasilan,
            body.angsuranBaru,
            angsuranEksisting
        );

        const response: DSRResponse = {
            dsr: result.dsr,
            dsc90: result.dsc90,
            totalAngsuran: result.totalAngsuran,
            maksimalAngsuran: result.maksimalAngsuran,
            isValid: result.isValid,
            message: result.message,
        };

        // Return 422 if DSR exceeds limit
        if (!result.isValid) {
            return NextResponse.json<ApiResponse<DSRResponse>>({
                success: false,
                data: response,
                error: {
                    code: 'DSR_EXCEEDED',
                    message: result.message || 'DSR melebihi 90%',
                },
            }, { status: 422 });
        }

        return NextResponse.json<ApiResponse<DSRResponse>>({
            success: true,
            data: response,
            message: 'Kalkulasi DSR berhasil',
        });
    } catch (error) {
        console.error('DSR calculation error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat menghitung DSR',
            },
        }, { status: 500 });
    }
}
