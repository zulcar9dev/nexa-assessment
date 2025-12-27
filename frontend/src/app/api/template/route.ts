import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { TemplateService } from '@/backend/services/template.service';
import type { ApiResponse } from '@/types/api';

// Kategori type - matches Prisma enum
type Kategori = 'PRAPURNA_REGULER' | 'PRAPURNA_TAKEOVER' | 'PURNA_REGULER' | 'PURNA_TAKEOVER';
const VALID_KATEGORI: Kategori[] = ['PRAPURNA_REGULER', 'PRAPURNA_TAKEOVER', 'PURNA_REGULER', 'PURNA_TAKEOVER'];

// Template type for mapping
interface Template {
    id: string;
    kategori: Kategori;
    name: string;
    filename: string;
    path: string;
    updatedAt: Date;
}

/**
 * GET /api/template
 * Get all templates
 */
export async function GET() {
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

        const templates = await TemplateService.getAll() as Template[];

        // Add file existence status
        const templatesWithStatus = await Promise.all(
            templates.map(async (template: Template) => ({
                ...template,
                fileExists: await TemplateService.fileExists(template.kategori as Kategori),
            }))
        );

        return NextResponse.json<ApiResponse>({
            success: true,
            data: templatesWithStatus,
            message: 'Data template berhasil diambil',
        });
    } catch (error) {
        console.error('Get templates error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat mengambil data template',
            },
        }, { status: 500 });
    }
}

/**
 * POST /api/template
 * Upload new template file
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk mengunggah template',
                },
            }, { status: 401 });
        }

        // Only admin can upload templates
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Hanya admin yang dapat mengunggah template',
                },
            }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const kategori = formData.get('kategori') as string | null;

        if (!file) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'File harus diunggah',
                    details: [{ field: 'file', message: 'File template harus dipilih' }],
                },
            }, { status: 400 });
        }

        if (!kategori || !VALID_KATEGORI.includes(kategori as Kategori)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Kategori tidak valid',
                    details: [{ field: 'kategori', message: 'Kategori template harus dipilih' }],
                },
            }, { status: 400 });
        }

        // Validate file type
        if (!file.name.endsWith('.docx')) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'File harus berformat .docx',
                    details: [{ field: 'file', message: 'Hanya file .docx yang diperbolehkan' }],
                },
            }, { status: 400 });
        }

        // Read file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file
        await TemplateService.saveFile(
            kategori as Kategori,
            buffer,
            file.name
        );

        // Get updated template
        const template = await TemplateService.getByKategori(kategori as Kategori);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: template,
            message: `Template ${kategori.replace('_', ' ')} berhasil diunggah`,
        }, { status: 201 });
    } catch (error) {
        console.error('Upload template error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat mengunggah template',
            },
        }, { status: 500 });
    }
}
