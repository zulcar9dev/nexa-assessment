import { NextRequest, NextResponse } from 'next/server';
import { CalculationService } from '@/backend/services/calculation.service';
import type { PMTRequest, PMTResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/calculate/pmt
 * Calculate monthly payment (PMT/Angsuran)
 */
export async function POST(request: NextRequest) {
    try {
        const body: PMTRequest = await request.json();

        // Validate request
        if (!body.principal || body.principal <= 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Plafon kredit harus lebih dari 0',
                    details: [{ field: 'principal', message: 'Plafon kredit harus diisi dan lebih dari 0' }],
                },
            }, { status: 400 });
        }

        if (!body.annualRate || body.annualRate <= 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Bunga per tahun harus lebih dari 0',
                    details: [{ field: 'annualRate', message: 'Bunga per tahun harus diisi dan lebih dari 0' }],
                },
            }, { status: 400 });
        }

        if (!body.months || body.months <= 0 || body.months > 360) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Tenor harus antara 1-360 bulan',
                    details: [{ field: 'months', message: 'Tenor harus diisi dan antara 1-360 bulan' }],
                },
            }, { status: 400 });
        }

        // Calculate PMT
        const angsuran = CalculationService.calculatePMT(
            body.principal,
            body.annualRate,
            body.months
        );

        const totalBayar = angsuran * body.months;
        const totalBunga = totalBayar - body.principal;

        const result: PMTResponse = {
            angsuran,
            totalBayar: Math.round(totalBayar),
            totalBunga: Math.round(totalBunga),
        };

        return NextResponse.json<ApiResponse<PMTResponse>>({
            success: true,
            data: result,
            message: 'Kalkulasi angsuran berhasil',
        });
    } catch (error) {
        console.error('PMT calculation error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat menghitung angsuran',
            },
        }, { status: 500 });
    }
}
