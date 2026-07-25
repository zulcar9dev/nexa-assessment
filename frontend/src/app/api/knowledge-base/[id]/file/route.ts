import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { KnowledgeBaseService } from '@/backend/services/knowledge-base.service';
import { errorResponse, handleApiError } from '@/backend/lib/api-response';
import fs from 'fs';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge-base/[id]/file
 * Stream PDF file for viewing or downloading
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
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengakses file', undefined, 401);
        }

        const fileInfo = await KnowledgeBaseService.getFilePath(id);

        if (!fileInfo) {
            return errorResponse('NOT_FOUND', 'File tidak ditemukan', undefined, 404);
        }

        const { fullpath, filename } = fileInfo;

        // Read file
        const fileBuffer = fs.readFileSync(fullpath);
        const stat = fs.statSync(fullpath);

        // Determine if inline (view) or attachment (download)
        const disposition = request.nextUrl.searchParams.get('download') === 'true'
            ? `attachment; filename="${filename}"`
            : `inline; filename="${filename}"`;

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': disposition,
                'Content-Length': String(stat.size),
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
