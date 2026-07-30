import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/lib/auth';
import { headers } from 'next/headers';
import { DebiturService } from '@/backend/services/clients.service';
import { DocumentService } from '@/backend/services/document.service';
import { DocumentTemplateService, KategoriDoc } from '@/backend/services/document-template.service';
import { TemplateService } from '@/backend/services/template.service';
import type { ApiResponse } from '@/types/api';
import { AuthenticatedUser } from '@/types/auth';

// Kategori type - matches Prisma enum


interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/clients/[id]/download
 * Generate and download DOCX document for a client
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
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Anda harus login untuk mengunduh dokumen',
                },
            }, { status: 401 });
        }

        const client = await DebiturService.getById(id);

        if (!client) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Data client tidak ditemukan',
                },
            }, { status: 404 });
        }

        // Check ownership for non-admin users
        const user = session.user as unknown as AuthenticatedUser;
        if (user.role !== 'ADMIN' && client.userId !== user.id) {
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
        const kategoriStr = String(client.kategori).toLowerCase();
        let kategoriDoc: KategoriDoc = 'prapurna'; // default

        // Logic selection: 
        // 1. If it contains 'type_a', it is PRAPURNA
        // 2. If it contains 'type_b' but NOT 'type_a', it is PURNA
        // 3. If it contains 'type_c', it is AKTIF
        if (kategoriStr.includes('type_c') || kategoriStr.includes('aktif')) {
            kategoriDoc = 'aktif';
        } else if ((kategoriStr.includes('type_b') || kategoriStr.includes('purna')) && !kategoriStr.includes('type_a') && !kategoriStr.includes('prapurna')) {
            kategoriDoc = 'purna';
        }

        // Check if template exists
        // TemplateService expects Prisma Enum (UPPERCASE), so we convert it
        const dbKategori = kategoriDoc.toUpperCase() as 'PRAPURNA' | 'PURNA' | 'AKTIF';
        let templateExists = await TemplateService.fileExists(dbKategori);
        
        // Self-healing: If template not found in DB, try to initialize defaults from disk
        if (!templateExists) {
            console.log(`[DOWNLOAD] Template record missing for ${dbKategori}, attempting to initialize defaults...`);
            await TemplateService.initializeDefaults();
            // Re-check
            templateExists = await TemplateService.fileExists(dbKategori);
        }
        
        console.log(`[DOWNLOAD] Checking template for category ${kategoriDoc} (DB: ${dbKategori}): ${templateExists}`);

        let docBuffer: Buffer;
        const debiturData = {
            applicantName: client.applicantName,
            idNumber: client.idNumber,
            kategori: client.kategori, // Use original category for generator logic
            jenisPengajuan: client.jenisPengajuan,
            segmentasi: client.segmentasi,
            dataLengkap: client.dataLengkap as Record<string, unknown>,
            createdAt: client.createdAt,
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
                console.error('[DOWNLOAD] Template generation failed:', templateError);
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: `Gagal memproses template: ${templateError instanceof Error ? templateError.message : 'Unknown error'}. Silakan perbaiki sintaks template Anda.`,
                    },
                }, { status: 500 });
            }
        } else {
            console.log('[DOWNLOAD] Template not found, using simple generation (default fallback)');
            // Generate simple document without template only if template doesn't exist
            docBuffer = await DocumentService.generateSimpleDocx(debiturData);
        }

        // Generate filename
        const safeName = client.applicantName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Kredit_${safeName}_${client.idNumber}.docx`;

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
