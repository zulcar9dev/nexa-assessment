import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { DebiturService } from '@/backend/services/debitur.service';
import type { ApiResponse, CreateDebiturRequest, DebiturQueryParams, PaginatedResponse } from '@/types/api';

/**
 * GET /api/debitur
 * Get paginated list of debiturs with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk mengakses data',
                },
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);

        const params: DebiturQueryParams = {
            q: searchParams.get('q') || undefined,
            jenis: searchParams.get('jenis') || undefined,
            segmentasi: searchParams.get('segmentasi') || undefined,
            kategori: searchParams.get('kategori') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
        };

        // Admin sees all, regular users see only their own
        const userId = session.user.role === 'ADMIN' ? undefined : session.user.id;

        const result = await DebiturService.getList(params, userId);

        return NextResponse.json<ApiResponse<PaginatedResponse<unknown>>>({
            success: true,
            data: result,
            message: 'Data debitur berhasil diambil',
        });
    } catch (error) {
        console.error('Get debitur list error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat mengambil data debitur',
            },
        }, { status: 500 });
    }
}

/**
 * POST /api/debitur
 * Create new debitur
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk menambah data',
                },
            }, { status: 401 });
        }

        const body: CreateDebiturRequest = await request.json();

        // Validate required fields
        const errors: Array<{ field: string; message: string }> = [];

        if (!body.namaPemohon?.trim()) {
            errors.push({ field: 'namaPemohon', message: 'Nama pemohon harus diisi' });
        }

        if (!body.noKtp?.trim()) {
            errors.push({ field: 'noKtp', message: 'NIK harus diisi' });
        } else if (body.noKtp.length !== 16) {
            errors.push({ field: 'noKtp', message: 'NIK harus 16 digit' });
        }

        if (!body.kategori) {
            errors.push({ field: 'kategori', message: 'Kategori harus dipilih' });
        }

        if (!body.jenisPengajuan) {
            errors.push({ field: 'jenisPengajuan', message: 'Jenis pengajuan harus dipilih' });
        }

        if (!body.segmentasi) {
            errors.push({ field: 'segmentasi', message: 'Segmentasi harus dipilih' });
        }

        if (errors.length > 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Data tidak lengkap atau tidak valid',
                    details: errors,
                },
            }, { status: 400 });
        }

        const debitur = await DebiturService.create(body, session.user.id);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: debitur,
            message: 'Data debitur berhasil disimpan',
        }, { status: 201 });
    } catch (error) {
        console.error('Create debitur error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat menyimpan data debitur',
            },
        }, { status: 500 });
    }
}
