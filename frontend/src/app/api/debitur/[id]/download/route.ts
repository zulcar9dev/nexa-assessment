import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { DebiturService } from '@/backend/services/debitur.service';
import { DocumentService } from '@/backend/services/document.service';
import { DocumentTemplateService, KategoriDoc } from '@/backend/services/document-template.service';
import { TemplateService } from '@/backend/services/template.service';
import type { ApiResponse } from '@/types/api';

// Kategori type - matches Prisma enum


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

        // Normalize category
        // Normalize category
        const kategoriStr = String(debitur.kategori).toLowerCase();
        let kategoriDoc: KategoriDoc = 'prapurna'; // default

        // Logic selection: 
        // 1. If it contains 'prapurna', it is PRAPURNA
        // 2. If it contains 'purna' but NOT 'prapurna', it is PURNA
        // The previous logic failed for Uppercase 'PURNA' because .includes is case sensitive
        if (kategoriStr.includes('purna') && !kategoriStr.includes('prapurna')) {
            kategoriDoc = 'purna';
        }

        // Check if template exists
        // TemplateService expects Prisma Enum (UPPERCASE), so we convert it
        const dbKategori = kategoriDoc.toUpperCase() as 'PRAPURNA' | 'PURNA';
        const templateExists = await TemplateService.fileExists(dbKategori);
        console.log(`[DOWNLOAD] Checking template for category ${kategoriDoc} (DB: ${dbKategori}): ${templateExists}`);

        let docBuffer: Buffer;
        const debiturData = {
            namaPemohon: debitur.namaPemohon,
            noKtp: debitur.noKtp,
            kategori: kategoriDoc,
            jenisPengajuan: debitur.jenisPengajuan,
            segmentasi: debitur.segmentasi,
            dataLengkap: debitur.dataLengkap as Record<string, unknown>,
        };

        if (templateExists) {
            // Use template-based generation with docxtemplater
            try {
                console.log('[DOWNLOAD] Attempting to generate from template...');
                docBuffer = await DocumentTemplateService.generateFromTemplate(
                    kategoriDoc,
                    debiturData
                );
                console.log('[DOWNLOAD] Template generation successful');
            } catch (templateError) {
                console.error('[DOWNLOAD] Template generation failed, falling back to simple:', templateError);
                // Fallback to simple document if template generation fails
                docBuffer = await DocumentService.generateSimpleDocx(debiturData);
            }
        } else {
            console.log('[DOWNLOAD] Template not found, using simple generation');
            // Generate simple document without template
            docBuffer = await DocumentService.generateSimpleDocx(debiturData);
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
