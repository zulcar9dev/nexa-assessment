import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { DebiturService } from '@/backend/services/debitur.service';
import type { ApiResponse, UpdateDebiturRequest } from '@/types/api';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/debitur/[id]
 * Get debitur detail by ID
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk mengakses data',
                },
            }, { status: 401 });
        }

        const debitur = await DebiturService.getById(id);

        if (!debitur) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data debitur tidak ditemukan',
                },
            }, { status: 404 });
        }

        // Check ownership for non-admin users
        if (session.user.role !== 'ADMIN' && debitur.userId !== session.user.id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Anda tidak memiliki akses ke data ini',
                },
            }, { status: 403 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: debitur,
            message: 'Data debitur berhasil diambil',
        });
    } catch (error) {
        console.error('Get debitur detail error:', error);
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
 * PUT /api/debitur/[id]
 * Update debitur by ID
 */
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk mengubah data',
                },
            }, { status: 401 });
        }

        // Check if debitur exists
        const existing = await DebiturService.getById(id);

        if (!existing) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data debitur tidak ditemukan',
                },
            }, { status: 404 });
        }

        // Check ownership for non-admin users
        if (session.user.role !== 'ADMIN' && existing.userId !== session.user.id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Anda tidak memiliki akses untuk mengubah data ini',
                },
            }, { status: 403 });
        }

        const body: UpdateDebiturRequest = await request.json();

        // Validate NIK if provided
        if (body.noKtp && body.noKtp.length !== 16) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'NIK harus 16 digit',
                    details: [{ field: 'noKtp', message: 'NIK harus 16 digit' }],
                },
            }, { status: 400 });
        }

        const updated = await DebiturService.update(id, body);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updated,
            message: 'Data debitur berhasil diperbarui',
        });
    } catch (error) {
        console.error('Update debitur error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat memperbarui data debitur',
            },
        }, { status: 500 });
    }
}

/**
 * DELETE /api/debitur/[id]
 * Delete debitur by ID
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk menghapus data',
                },
            }, { status: 401 });
        }

        // Check if debitur exists
        const existing = await DebiturService.getById(id);

        if (!existing) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data debitur tidak ditemukan',
                },
            }, { status: 404 });
        }

        // Check ownership for non-admin users
        if (session.user.role !== 'ADMIN' && existing.userId !== session.user.id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Anda tidak memiliki akses untuk menghapus data ini',
                },
            }, { status: 403 });
        }

        await DebiturService.delete(id);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Data debitur berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete debitur error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat menghapus data debitur',
            },
        }, { status: 500 });
    }
}
