/**
 * Knowledge Base Service (Drizzle ORM implementation)
 * Handles all document CRUD operations, file management, and auto-status logic
 */

import { db } from '@/backend/db';
import { document, user } from '@/backend/db/schema';
import { and, eq, or, ilike, sql, desc, count, gte, lte, lt, not, inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// ============ TYPES ============
export interface DocumentQueryParams {
    q?: string;
    kategori?: string;
    targetMarket?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

interface CreateDocumentData {
    judul: string;
    nomorMemo: string;
    kategori: string;
    targetMarket: string;
    berlakuMulai: string;
    berlakuAkhir: string;
    keywords: string[];
    replacesId?: string;
}

type KategoriDokumen = 'KREDIT_FLEKSI' | 'KREDIT_GRIYA' | 'KREDIT_PENSIUN';
type TargetMarket = 'ASN' | 'SWASTA' | 'TASPEN' | 'ASABRI' | 'WIRASWASTA';
type StatusDokumen = 'AKTIF' | 'SEGERA_BERAKHIR' | 'EXPIRED' | 'ARCHIVED';

// Upload directory (resolved relative to project root)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
async function ensureUploadDir() {
    try {
        await fs.promises.access(UPLOAD_DIR);
    } catch {
        await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    }
}

// ============ SERVICE ============
export class KnowledgeBaseService {
    private static lastStatusUpdate: number = 0;
    private static UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

    /**
     * Update expired/expiring statuses automatically
     */
    static async updateExpiredStatuses() {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Mark EXPIRED: berlakuAkhir < today (except ARCHIVED, EXPIRED)
        await db.update(document)
            .set({ status: 'EXPIRED' })
            .where(and(
                lt(document.berlakuAkhir, now),
                not(inArray(document.status, ['ARCHIVED', 'EXPIRED']))
            ));

        // Mark SEGERA_BERAKHIR: berlakuAkhir within 7 days (only for AKTIF)
        await db.update(document)
            .set({ status: 'SEGERA_BERAKHIR' })
            .where(and(
                gte(document.berlakuAkhir, now),
                lte(document.berlakuAkhir, sevenDaysFromNow),
                eq(document.status, 'AKTIF')
            ));
    }

    /**
     * Get paginated list of documents with search and filters
     */
    static async getList(params: DocumentQueryParams) {
        const page = params.page || 1;
        const limit = params.limit || 12;
        const skip = (page - 1) * limit;

        // Auto-update statuses if interval elapsed (1 hour)
        const now = Date.now();
        if (now - this.lastStatusUpdate > this.UPDATE_INTERVAL) {
            await this.updateExpiredStatuses();
            this.lastStatusUpdate = now;
        }

        const conditions = [];

        // Full-text search across judul, nomorMemo, keywords
        if (params.q) {
            const searchTerm = params.q.trim();
            const searchPattern = `%${searchTerm}%`;
            conditions.push(or(
                ilike(document.judul, searchPattern),
                ilike(document.nomorMemo, searchPattern),
                sql`${document.keywords} @> ARRAY[${searchTerm.toLowerCase()}]::text[]`
            ));
        }

        // Category filter
        const validKategori = ['KREDIT_FLEKSI', 'KREDIT_GRIYA', 'KREDIT_PENSIUN'];
        if (params.kategori && validKategori.includes(params.kategori)) {
            conditions.push(eq(document.kategori, params.kategori as KategoriDokumen));
        }

        // Target market filter
        const validTargetMarket = ['ASN', 'SWASTA', 'TASPEN', 'ASABRI', 'WIRASWASTA'];
        if (params.targetMarket && validTargetMarket.includes(params.targetMarket)) {
            conditions.push(eq(document.targetMarket, params.targetMarket as TargetMarket));
        }

        // Status filter
        const validStatus = ['AKTIF', 'SEGERA_BERAKHIR', 'EXPIRED', 'ARCHIVED'];
        if (params.status && validStatus.includes(params.status)) {
            conditions.push(eq(document.status, params.status as StatusDokumen));
        }

        // Date range filter
        if (params.startDate) {
            conditions.push(gte(document.berlakuAkhir, new Date(params.startDate)));
        }
        if (params.endDate) {
            conditions.push(lte(document.berlakuAkhir, new Date(params.endDate)));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [documents, totalResult] = await Promise.all([
            db.select({
                id: document.id,
                judul: document.judul,
                nomorMemo: document.nomorMemo,
                kategori: document.kategori,
                targetMarket: document.targetMarket,
                status: document.status,
                berlakuMulai: document.berlakuMulai,
                berlakuAkhir: document.berlakuAkhir,
                keywords: document.keywords,
                filename: document.filename,
                filepath: document.filepath,
                filesize: document.filesize,
                version: document.version,
                replacedById: document.replacedById,
                uploadedById: document.uploadedById,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                uploadedBy: {
                    id: user.id,
                    name: user.name,
                }
            })
            .from(document)
            .leftJoin(user, eq(document.uploadedById, user.id))
            .where(whereClause)
            .orderBy(desc(document.createdAt))
            .limit(limit)
            .offset(skip),
            db.select({ count: count() })
                .from(document)
                .where(whereClause)
        ]);

        const total = totalResult[0]?.count || 0;

        return {
            documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single document by ID with version info
     */
    static async getById(id: string) {
        const docs = await db.select({
            id: document.id,
            judul: document.judul,
            nomorMemo: document.nomorMemo,
            kategori: document.kategori,
            targetMarket: document.targetMarket,
            status: document.status,
            berlakuMulai: document.berlakuMulai,
            berlakuAkhir: document.berlakuAkhir,
            keywords: document.keywords,
            filename: document.filename,
            filepath: document.filepath,
            filesize: document.filesize,
            version: document.version,
            replacedById: document.replacedById,
            uploadedById: document.uploadedById,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            uploadedBy: {
                id: user.id,
                name: user.name,
            }
        })
        .from(document)
        .leftJoin(user, eq(document.uploadedById, user.id))
        .where(eq(document.id, id))
        .limit(1);

        const doc = docs[0];
        if (!doc) return null;

        // Fetch replacedBy relation
        let replacedBy = null;
        if (doc.replacedById) {
            const replacedByDocs = await db.select({
                id: document.id,
                judul: document.judul,
                version: document.version,
                status: document.status,
                createdAt: document.createdAt,
            })
            .from(document)
            .where(eq(document.id, doc.replacedById))
            .limit(1);
            replacedBy = replacedByDocs[0] || null;
        }

        // Fetch replaces relation (older versions that point to this doc)
        const replaces = await db.select({
            id: document.id,
            judul: document.judul,
            version: document.version,
            status: document.status,
            createdAt: document.createdAt,
        })
        .from(document)
        .where(eq(document.replacedById, doc.id));

        const documentWithRelations = {
            ...doc,
            replacedBy,
            replaces,
        };

        const versions = await this.getVersionHistory(id);

        return { document: documentWithRelations, versions };
    }

    /**
     * Get all versions of a document chain
     */
    static async getVersionHistory(id: string) {
        const docs = await db.select({ replacedById: document.replacedById })
            .from(document)
            .where(eq(document.id, id))
            .limit(1);
        const doc = docs[0];
        if (!doc) return [];

        const orConditions = [
            eq(document.id, id),
            eq(document.replacedById, id)
        ];
        if (doc.replacedById) {
            orConditions.push(eq(document.id, doc.replacedById));
        }

        const allVersions = await db.select({
            id: document.id,
            judul: document.judul,
            version: document.version,
            status: document.status,
            createdAt: document.createdAt,
        })
        .from(document)
        .where(or(...orConditions))
        .orderBy(desc(document.version));

        return allVersions;
    }

    /**
     * Create new document (upload file + save metadata)
     */
    static async create(data: CreateDocumentData, fileBuffer: Buffer, originalFilename: string, userId: string) {
        await ensureUploadDir();

        const safeFilename = `${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filepath = path.join(UPLOAD_DIR, safeFilename);

        await fs.promises.writeFile(filepath, fileBuffer);

        const filesize = fileBuffer.length;

        let version = 1;
        if (data.replacesId) {
            const oldDocs = await db.select({ version: document.version })
                .from(document)
                .where(eq(document.id, data.replacesId))
                .limit(1);
            const oldDoc = oldDocs[0];
            if (oldDoc) {
                version = oldDoc.version + 1;
                // Archive the old document
                await db.update(document)
                    .set({ status: 'ARCHIVED' })
                    .where(eq(document.id, data.replacesId));
            }
        }

        const id = crypto.randomUUID();
        const [inserted] = await db.insert(document).values({
            id,
            judul: data.judul,
            nomorMemo: data.nomorMemo,
            kategori: data.kategori as KategoriDokumen,
            targetMarket: data.targetMarket as TargetMarket,
            berlakuMulai: new Date(data.berlakuMulai),
            berlakuAkhir: new Date(data.berlakuAkhir),
            keywords: data.keywords || [],
            filename: originalFilename,
            filepath: safeFilename,
            filesize,
            version,
            replacedById: data.replacesId || null,
            uploadedById: userId,
        }).returning();

        // Fetch complete record with relation
        const fullDoc = await db.select({
            id: document.id,
            judul: document.judul,
            nomorMemo: document.nomorMemo,
            kategori: document.kategori,
            targetMarket: document.targetMarket,
            status: document.status,
            berlakuMulai: document.berlakuMulai,
            berlakuAkhir: document.berlakuAkhir,
            keywords: document.keywords,
            filename: document.filename,
            filepath: document.filepath,
            filesize: document.filesize,
            version: document.version,
            replacedById: document.replacedById,
            uploadedById: document.uploadedById,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            uploadedBy: {
                id: user.id,
                name: user.name,
            }
        })
        .from(document)
        .leftJoin(user, eq(document.uploadedById, user.id))
        .where(eq(document.id, id))
        .limit(1);

        return fullDoc[0] || inserted;
    }

    /**
     * Update document metadata (not the file)
     */
    static async update(id: string, data: Partial<CreateDocumentData>) {
        const updateData: Partial<typeof document.$inferInsert> = {};

        if (data.judul !== undefined) updateData.judul = data.judul;
        if (data.nomorMemo !== undefined) updateData.nomorMemo = data.nomorMemo;
        if (data.kategori !== undefined) updateData.kategori = data.kategori as KategoriDokumen;
        if (data.targetMarket !== undefined) updateData.targetMarket = data.targetMarket as TargetMarket;
        if (data.berlakuMulai !== undefined) updateData.berlakuMulai = new Date(data.berlakuMulai);
        if (data.berlakuAkhir !== undefined) updateData.berlakuAkhir = new Date(data.berlakuAkhir);
        if (data.keywords !== undefined) updateData.keywords = data.keywords;

        await db.update(document)
            .set(updateData)
            .where(eq(document.id, id));

        const fullDoc = await db.select({
            id: document.id,
            judul: document.judul,
            nomorMemo: document.nomorMemo,
            kategori: document.kategori,
            targetMarket: document.targetMarket,
            status: document.status,
            berlakuMulai: document.berlakuMulai,
            berlakuAkhir: document.berlakuAkhir,
            keywords: document.keywords,
            filename: document.filename,
            filepath: document.filepath,
            filesize: document.filesize,
            version: document.version,
            replacedById: document.replacedById,
            uploadedById: document.uploadedById,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            uploadedBy: {
                id: user.id,
                name: user.name,
            }
        })
        .from(document)
        .leftJoin(user, eq(document.uploadedById, user.id))
        .where(eq(document.id, id))
        .limit(1);

        return fullDoc[0] || null;
    }

    /**
     * Delete document and its file
     */
    static async delete(id: string) {
        const docs = await db.select({ filepath: document.filepath })
            .from(document)
            .where(eq(document.id, id))
            .limit(1);
        const doc = docs[0];
        if (!doc) throw new Error('Dokumen tidak ditemukan');

        // Delete file from disk (async & check path traversal)
        const fullpath = path.resolve(UPLOAD_DIR, doc.filepath);
        if (!fullpath.startsWith(UPLOAD_DIR)) {
            throw new Error('Aktivitas mencurigakan terdeteksi: Path traversal diblokir!');
        }

        try {
            await fs.promises.access(fullpath);
            await fs.promises.unlink(fullpath);
        } catch (err) {
            console.warn(`File tidak ditemukan untuk dihapus: ${fullpath}`, err);
        }

        // Delete database record
        const [deleted] = await db.delete(document)
            .where(eq(document.id, id))
            .returning();
        return deleted;
    }

    /**
     * Get file path for streaming
     */
    static async getFilePath(id: string): Promise<{ fullpath: string; filename: string } | null> {
        const docs = await db.select({ filepath: document.filepath, filename: document.filename })
            .from(document)
            .where(eq(document.id, id))
            .limit(1);
        const doc = docs[0];

        if (!doc) return null;

        const fullpath = path.resolve(UPLOAD_DIR, doc.filepath);
        if (!fullpath.startsWith(UPLOAD_DIR)) {
            throw new Error('Aktivitas mencurigakan terdeteksi: Path traversal diblokir!');
        }

        try {
            await fs.promises.access(fullpath);
        } catch {
            return null;
        }

        return { fullpath, filename: doc.filename };
    }
}
