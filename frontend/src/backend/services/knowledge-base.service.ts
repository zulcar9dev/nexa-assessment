/**
 * Knowledge Base Service
 * Handles all document CRUD operations, file management, and auto-status logic
 */

import prisma from '@/backend/lib/prisma';
import { Prisma, KategoriDokumen, TargetMarket, StatusDokumen } from '@prisma/client';
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

// Upload directory (resolved relative to project root)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

// ============ SERVICE ============
export class KnowledgeBaseService {

    /**
     * Update expired/expiring statuses automatically
     */
    static async updateExpiredStatuses() {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Mark EXPIRED: berlakuAkhir < today (except ARCHIVED)
        await prisma.document.updateMany({
            where: {
                berlakuAkhir: { lt: now },
                status: { notIn: [StatusDokumen.ARCHIVED, StatusDokumen.EXPIRED] },
            },
            data: { status: StatusDokumen.EXPIRED },
        });

        // Mark SEGERA_BERAKHIR: berlakuAkhir within 7 days (only for AKTIF)
        await prisma.document.updateMany({
            where: {
                berlakuAkhir: { gte: now, lte: sevenDaysFromNow },
                status: StatusDokumen.AKTIF,
            },
            data: { status: StatusDokumen.SEGERA_BERAKHIR },
        });
    }

    /**
     * Get paginated list of documents with search and filters
     */
    static async getList(params: DocumentQueryParams) {
        const page = params.page || 1;
        const limit = params.limit || 12;
        const skip = (page - 1) * limit;

        // Auto-update statuses before listing
        await this.updateExpiredStatuses();

        // Build where clause
        const where: Prisma.DocumentWhereInput = {};

        // Full-text search across judul, nomorMemo, keywords
        if (params.q) {
            const searchTerm = params.q.trim();
            where.OR = [
                { judul: { contains: searchTerm, mode: 'insensitive' } },
                { nomorMemo: { contains: searchTerm, mode: 'insensitive' } },
                { keywords: { has: searchTerm.toLowerCase() } },
            ];
        }

        // Category filter
        if (params.kategori && Object.values(KategoriDokumen).includes(params.kategori as KategoriDokumen)) {
            where.kategori = params.kategori as KategoriDokumen;
        }

        // Target market filter
        if (params.targetMarket && Object.values(TargetMarket).includes(params.targetMarket as TargetMarket)) {
            where.targetMarket = params.targetMarket as TargetMarket;
        }

        // Status filter
        if (params.status && Object.values(StatusDokumen).includes(params.status as StatusDokumen)) {
            where.status = params.status as StatusDokumen;
        }

        // Date range filter
        if (params.startDate || params.endDate) {
            where.berlakuAkhir = {};
            if (params.startDate) {
                where.berlakuAkhir.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                where.berlakuAkhir.lte = new Date(params.endDate);
            }
        }

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: { select: { id: true, name: true } },
                },
            }),
            prisma.document.count({ where }),
        ]);

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
        // Auto-update statuses
        await this.updateExpiredStatuses();

        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                uploadedBy: { select: { id: true, name: true } },
                replacedBy: { select: { id: true, judul: true, version: true, status: true, createdAt: true } },
                replaces: { select: { id: true, judul: true, version: true, status: true, createdAt: true } },
            },
        });

        if (!document) return null;

        // Build version history
        const versions = await this.getVersionHistory(id);

        return { document, versions };
    }

    /**
     * Get all versions of a document chain
     */
    static async getVersionHistory(id: string) {
        // Get current document
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) return [];

        // Find the root document (oldest in chain)
        let rootId = id;
        let current = doc;
        while (current.replacedById) {
            // This document replaces nothing and is replaced by replacedById
            // Actually, replacedById means "this doc was replaced BY that id"
            // So we need to traverse replaces[] to find older versions
            break;
        }

        // Get all documents that were replaced leading to current
        // Find all related versions by traversing the chain
        const allVersions = await prisma.document.findMany({
            where: {
                OR: [
                    { id },
                    { replacedById: id }, // older versions that point to this
                    { id: doc.replacedById || 'none' }, // newer version this points to
                ],
            },
            orderBy: { version: 'desc' },
            select: { id: true, judul: true, version: true, status: true, createdAt: true },
        });

        return allVersions;
    }

    /**
     * Create new document (upload file + save metadata)
     */
    static async create(data: CreateDocumentData, fileBuffer: Buffer, originalFilename: string, userId: string) {
        ensureUploadDir();

        // Generate unique filename
        const ext = path.extname(originalFilename);
        const safeFilename = `${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filepath = path.join(UPLOAD_DIR, safeFilename);

        // Write file to disk
        fs.writeFileSync(filepath, fileBuffer);

        const filesize = fileBuffer.length;

        // If replacing another document, get its version and archive it
        let version = 1;
        if (data.replacesId) {
            const oldDoc = await prisma.document.findUnique({ where: { id: data.replacesId } });
            if (oldDoc) {
                version = oldDoc.version + 1;
                // Archive the old document
                await prisma.document.update({
                    where: { id: data.replacesId },
                    data: { status: StatusDokumen.ARCHIVED },
                });
            }
        }

        const document = await prisma.document.create({
            data: {
                judul: data.judul,
                nomorMemo: data.nomorMemo,
                kategori: data.kategori as KategoriDokumen,
                targetMarket: data.targetMarket as TargetMarket,
                berlakuMulai: new Date(data.berlakuMulai),
                berlakuAkhir: new Date(data.berlakuAkhir),
                keywords: data.keywords || [],
                filename: originalFilename,
                filepath: safeFilename, // relative path only
                filesize,
                version,
                replacedById: data.replacesId || null,
                uploadedById: userId,
            },
            include: {
                uploadedBy: { select: { id: true, name: true } },
            },
        });

        return document;
    }

    /**
     * Update document metadata (not the file)
     */
    static async update(id: string, data: Partial<CreateDocumentData>) {
        const updateData: Prisma.DocumentUpdateInput = {};

        if (data.judul !== undefined) updateData.judul = data.judul;
        if (data.nomorMemo !== undefined) updateData.nomorMemo = data.nomorMemo;
        if (data.kategori !== undefined) updateData.kategori = data.kategori as KategoriDokumen;
        if (data.targetMarket !== undefined) updateData.targetMarket = data.targetMarket as TargetMarket;
        if (data.berlakuMulai !== undefined) updateData.berlakuMulai = new Date(data.berlakuMulai);
        if (data.berlakuAkhir !== undefined) updateData.berlakuAkhir = new Date(data.berlakuAkhir);
        if (data.keywords !== undefined) updateData.keywords = data.keywords;

        return prisma.document.update({
            where: { id },
            data: updateData,
            include: {
                uploadedBy: { select: { id: true, name: true } },
            },
        });
    }

    /**
     * Delete document and its file
     */
    static async delete(id: string) {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) throw new Error('Dokumen tidak ditemukan');

        // Delete file from disk
        const fullpath = path.join(UPLOAD_DIR, doc.filepath);
        if (fs.existsSync(fullpath)) {
            fs.unlinkSync(fullpath);
        }

        // Delete database record
        return prisma.document.delete({ where: { id } });
    }

    /**
     * Get file path for streaming
     */
    static async getFilePath(id: string): Promise<{ fullpath: string; filename: string } | null> {
        const doc = await prisma.document.findUnique({
            where: { id },
            select: { filepath: true, filename: true },
        });

        if (!doc) return null;

        const fullpath = path.join(UPLOAD_DIR, doc.filepath);
        if (!fs.existsSync(fullpath)) return null;

        return { fullpath, filename: doc.filename };
    }
}
