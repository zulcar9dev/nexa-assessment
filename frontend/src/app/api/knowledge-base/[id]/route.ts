import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { KnowledgeBaseService } from '@/backend/services/knowledge-base.service';
import { UpdateDocumentSchema, validateRequest } from '@/backend/lib/validators';
import { successResponse, errorResponse, handleApiError } from '@/backend/lib/api-response';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge-base/[id]
 * Get document detail with version history
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengakses data', undefined, 401);
        }

        const result = await KnowledgeBaseService.getById(id);

        if (!result) {
            return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan', undefined, 404);
        }

        return successResponse(result, 'Detail dokumen berhasil diambil');
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/knowledge-base/[id]
 * Update document metadata
 */
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengubah data', undefined, 401);
        }

        // Check if document exists
        const existing = await KnowledgeBaseService.getById(id);
        if (!existing) {
            return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan', undefined, 404);
        }

        const body = await request.json();
        const validation = validateRequest(UpdateDocumentSchema, body);

        if (!validation.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                'Data tidak valid',
                validation.errors?.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
                400
            );
        }

        const updated = await KnowledgeBaseService.update(id, validation.data as any);
        return successResponse(updated, 'Dokumen berhasil diperbarui');
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/knowledge-base/[id]
 * Delete document and its file
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk menghapus data', undefined, 401);
        }

        const existing = await KnowledgeBaseService.getById(id);
        if (!existing) {
            return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan', undefined, 404);
        }

        await KnowledgeBaseService.delete(id);
        return successResponse(null, 'Dokumen berhasil dihapus');
    } catch (error) {
        return handleApiError(error);
    }
}
