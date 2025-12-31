import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { ConfigService } from '@/backend/services/config.service';
import type { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
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
        return NextResponse.json<ApiResponse>({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' }
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) { // TODO: Add role check if needed
            return NextResponse.json<ApiResponse>({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
            }, { status: 401 });
        }

        const body = await request.json();
        const updated = await ConfigService.updateSettings(body);

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' }
        }, { status: 500 });
    }
}
