import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { DebiturService } from '@/backend/services/debitur.service';
import { DocumentService } from '@/backend/services/document.service';
import { TemplateService } from '@/backend/services/template.service';
import type { ApiResponse } from '@/types/api';

// Kategori type - matches Prisma enum
type Kategori = 'PRAPURNA_REGULER' | 'PRAPURNA_TAKEOVER' | 'PURNA_REGULER' | 'PURNA_TAKEOVER';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/debitur/[id]/download
 * Generate and download DOCX document for a debitur
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
                    message: 'Anda harus login untuk mengunduh dokumen',
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
                    message: 'Anda tidak memiliki akses ke dokumen ini',
                },
            }, { status: 403 });
        }

        // Check if template exists
        const templateExists = await TemplateService.fileExists(debitur.kategori as Kategori);

        let docBuffer: Buffer;

        if (templateExists) {
            // TODO: Implement template-based generation with docx-templater
            // For now, use simple document generation
            docBuffer = await DocumentService.generateSimpleDocx({
                namaPemohon: debitur.namaPemohon,
                noKtp: debitur.noKtp,
                kategori: debitur.kategori,
                jenisPengajuan: debitur.jenisPengajuan,
                segmentasi: debitur.segmentasi,
                dataLengkap: debitur.dataLengkap as Record<string, unknown>,
            });
        } else {
            // Generate simple document without template
            docBuffer = await DocumentService.generateSimpleDocx({
                namaPemohon: debitur.namaPemohon,
                noKtp: debitur.noKtp,
                kategori: debitur.kategori,
                jenisPengajuan: debitur.jenisPengajuan,
                segmentasi: debitur.segmentasi,
                dataLengkap: debitur.dataLengkap as Record<string, unknown>,
            });
        }

        // Generate filename
        const safeName = debitur.namaPemohon.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Kredit_${safeName}_${debitur.noKtp}.docx`;

        // Return file response - convert Buffer to Uint8Array for NextResponse
        const uint8Array = new Uint8Array(docBuffer);
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': docBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Download document error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan saat membuat dokumen',
            },
        }, { status: 500 });
    }
}
