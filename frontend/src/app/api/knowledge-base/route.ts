import { NextRequest } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { KnowledgeBaseService } from '@/backend/services/knowledge-base.service';
import { CreateDocumentSchema, validateRequest } from '@/backend/lib/validators';
import { AuthenticatedUser } from '@/types/auth';
import { successResponse, errorResponse, handleApiError } from '@/backend/lib/api-response';

/**
 * GET /api/knowledge-base
 * Get paginated list of documents with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengakses data', undefined, 401);
        }

        const { searchParams } = new URL(request.url);
        const params = {
            q: searchParams.get('q') || undefined,
            kategori: searchParams.get('kategori') || undefined,
            targetMarket: searchParams.get('targetMarket') || undefined,
            status: searchParams.get('status') || undefined,
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '12'),
        };

        const result = await KnowledgeBaseService.getList(params);
        return successResponse(result, 'Data dokumen berhasil diambil');
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/knowledge-base
 * Upload new document (multipart form data)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengunggah dokumen', undefined, 401);
        }

        if (session.user.role !== 'ADMIN') {
            return errorResponse('FORBIDDEN', 'Hanya Admin yang dapat mengunggah dokumen knowledge base', undefined, 403);
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return errorResponse('VALIDATION_ERROR', 'File PDF wajib diunggah', undefined, 400);
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return errorResponse('VALIDATION_ERROR', 'Hanya file PDF yang diperbolehkan', undefined, 400);
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return errorResponse('VALIDATION_ERROR', 'Ukuran file maksimal 10MB', undefined, 400);
        }

        // Extract and validate metadata
        const metadataFields: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'file' && typeof value === 'string') {
                metadataFields[key] = value;
            }
        }

        const validation = validateRequest(CreateDocumentSchema, metadataFields);
        if (!validation.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                'Data tidak lengkap atau tidak valid',
                validation.errors?.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
                400
            );
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const userId = (session.user as unknown as AuthenticatedUser).id;

        const document = await KnowledgeBaseService.create(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validation.data as any,
            buffer,
            file.name,
            userId
        );

        return successResponse(document, 'Dokumen berhasil diunggah', 201);
    } catch (error) {
        return handleApiError(error);
    }
}
