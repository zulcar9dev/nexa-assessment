import { NextRequest } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { DebiturService } from '@/backend/services/clients.service';
import { CreateDebiturSchema, validateRequest } from '@/backend/lib/validators';
import { DebiturQueryParams } from '@/types/api';
import { AuthenticatedUser } from '@/types/auth'; // [NEW]
import { successResponse, errorResponse, handleApiError } from '@/backend/lib/api-response';

/**
 * GET /api/clients
 * Get paginated list of clients with optional filters
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

        const params: DebiturQueryParams = {
            q: searchParams.get('q') || undefined,
            jenis: searchParams.get('jenis') || undefined,
            segmentasi: searchParams.get('segmentasi') || undefined,
            kategori: searchParams.get('kategori') || undefined,
            status: searchParams.get('status') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
        };

        // Admin sees all, regular users see only their own
        // Admin sees all, regular users see only their own
        const user = session.user as unknown as AuthenticatedUser;
        const userId = user.role === 'ADMIN' ? undefined : user.id;

        const result = await DebiturService.getList(params, userId);

        return successResponse(result, 'Data client berhasil diambil');
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/clients
 * Create new client
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

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

        const client = await DebiturService.create({ ...validation.data, status: validation.data.status, dataLengkap: validation.data.dataLengkap || {} }, (session.user as unknown as AuthenticatedUser).id);

        return successResponse(client, 'Data client berhasil disimpan', 201);
    } catch (error) {
        return handleApiError(error);
    }
}

