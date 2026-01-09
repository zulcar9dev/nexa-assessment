import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { DebiturService } from '@/backend/services/debitur.service';
import { CreateDebiturSchema, validateRequest } from '@/backend/lib/validators';
import { DebiturQueryParams } from '@/types/api';
import { successResponse, errorResponse, handleApiError } from '@/backend/lib/api-response';

/**
 * GET /api/debitur
 * Get paginated list of debiturs with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk mengakses data', undefined, 401);
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
        const user = session.user as any;
        const userId = user.role === 'ADMIN' ? undefined : user.id;

        const result = await DebiturService.getList(params, userId);

        return successResponse(result, 'Data debitur berhasil diambil');
    } catch (error) {
        return handleApiError(error);
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
            return errorResponse('UNAUTHORIZED', 'Anda harus login untuk menambah data', undefined, 401);
        }

        const body = await request.json();

        const validation = validateRequest(CreateDebiturSchema, body);

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

        const debitur = await DebiturService.create(validation.data, (session.user as any).id);

        return successResponse(debitur, 'Data debitur berhasil disimpan', 201);
    } catch (error) {
        return handleApiError(error);
    }
}

