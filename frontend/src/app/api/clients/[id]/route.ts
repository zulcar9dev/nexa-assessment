import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { DebiturService } from '@/backend/services/clients.service';
import type { ApiResponse, UpdateDebiturRequest } from '@/types/api';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/clients/[id]
 * Get client detail by ID
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
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

        const client = await DebiturService.getById(id);

        if (!client) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data client tidak ditemukan',
                },
            }, { status: 404 });
        }

        // Check ownership for non-admin users
        if (session.user.role !== 'ADMIN' && client.userId !== session.user.id) {
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
            data: client,
            message: 'Data client berhasil diambil',
        });
    } catch (error) {
        console.error('Get client detail error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat mengambil data client',
            },
        }, { status: 500 });
    }
}

/**
 * PUT /api/clients/[id]
 * Update client by ID
 */
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
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

        // Check if client exists
        const existing = await DebiturService.getById(id);

        if (!existing) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data client tidak ditemukan',
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

        // Validate NIK if provided and status is not DRAFT
        const isDraft = body.status === 'DRAFT';
        if (!isDraft && body.idNumber && (body.idNumber.length !== 16 || !/^\d{16}$/.test(body.idNumber))) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'NIK harus 16 digit angka',
                    details: [{ field: 'idNumber', message: 'NIK harus 16 digit angka' }],
                },
            }, { status: 400 });
        }

        const updated = await DebiturService.update(id, body);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updated,
            message: 'Data client berhasil diperbarui',
        });
    } catch (error) {
        console.error('Update client error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat memperbarui data client',
            },
        }, { status: 500 });
    }
}

/**
 * DELETE /api/clients/[id]
 * Delete client by ID
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
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

        // Check if client exists
        const existing = await DebiturService.getById(id);

        if (!existing) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data client tidak ditemukan',
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
            message: 'Data client berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete client error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat menghapus data client',
            },
        }, { status: 500 });
    }
}
