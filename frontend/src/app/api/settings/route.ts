import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { ConfigService } from '@/backend/services/config.service';
import type { ApiResponse } from '@/types/api';

export async function GET(_request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
            }, { status: 401 });
        }

        const settings = await ConfigService.getSettings();
        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('[Settings API] Failed to load settings:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Gagal memuat pengaturan.' }
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Hanya Admin yang dapat mengubah pengaturan ini' }
            }, { status: 403 });
        }

        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: { code: 'INVALID_BODY', message: 'Body request tidak valid.' }
            }, { status: 400 });
        }

        const updated = await ConfigService.updateSettings(body);

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('[Settings API] Failed to save settings:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Gagal menyimpan pengaturan.'
            }
        }, { status: 500 });
    }
}