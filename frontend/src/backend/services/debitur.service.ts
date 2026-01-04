/**
 * Debitur Service
 * Handles all debitur CRUD operations
 */

import prisma from '@/backend/lib/prisma';
import type { DebiturQueryParams, CreateDebiturRequest, UpdateDebiturRequest } from '@/types/api';

// Local type definitions - these match the Prisma schema
type Kategori = 'PRAPURNA' | 'PURNA';
type JenisPengajuan = 'BARU' | 'TOP_UP' | 'TOP_UP_SISA_GAJI' | 'TAKEOVER';
type Segmentasi = 'TASPEN' | 'ASABRI';

const VALID_KATEGORI: Kategori[] = ['PRAPURNA', 'PURNA'];
const VALID_JENIS: JenisPengajuan[] = ['BARU', 'TOP_UP', 'TOP_UP_SISA_GAJI', 'TAKEOVER'];
const VALID_SEGMENTASI: Segmentasi[] = ['TASPEN', 'ASABRI'];

// Prisma-like where input type
interface DebiturWhereInput {
    userId?: string;
    namaPemohon?: { contains: string; mode: string };
    noKtp?: { contains: string };
    jenisPengajuan?: JenisPengajuan;
    segmentasi?: Segmentasi;
    kategori?: Kategori;
    OR?: Array<{ namaPemohon?: { contains: string; mode: string }; noKtp?: { contains: string } }>;
    createdAt?: { gte: Date };
}

export class DebiturService {
    /**
     * Get paginated list of debiturs with optional filters
     */
    static async getList(params: DebiturQueryParams, userId?: string) {
        const { q, jenis, segmentasi, kategori, page = 1, limit = 10 } = params;

        const where: DebiturWhereInput = {};

        // Add userId filter if provided (non-admin users only see their own data)
        if (userId) {
            where.userId = userId;
        }

        // Search by name or NIK
        if (q) {
            where.OR = [
                { namaPemohon: { contains: q, mode: 'insensitive' } },
                { noKtp: { contains: q } },
            ];
        }

        // Filter by jenis pengajuan
        if (jenis && VALID_JENIS.includes(jenis as JenisPengajuan)) {
            where.jenisPengajuan = jenis as JenisPengajuan;
        }

        // Filter by segmentasi
        if (segmentasi && VALID_SEGMENTASI.includes(segmentasi as Segmentasi)) {
            where.segmentasi = segmentasi as Segmentasi;
        }

        // Filter by kategori
        if (kategori && VALID_KATEGORI.includes(kategori as Kategori)) {
            where.kategori = kategori as Kategori;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.debitur.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
            prisma.debitur.count({ where: where as any }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single debitur by ID
     */
    static async getById(id: string) {
        return prisma.debitur.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Create new debitur
     */
    static async create(data: CreateDebiturRequest, userId: string) {
        return prisma.debitur.create({
            data: {
                namaPemohon: data.namaPemohon,
                noKtp: data.noKtp,
                kategori: data.kategori,
                jenisPengajuan: data.jenisPengajuan,
                segmentasi: data.segmentasi,
                dataLengkap: data.dataLengkap as Record<string, any>, // Cast for Json type compatibility
                userId,
            },
        });
    }

    /**
     * Update existing debitur
     */
    static async update(id: string, data: UpdateDebiturRequest) {
        const updateData: Record<string, unknown> = {};

        if (data.namaPemohon) updateData.namaPemohon = data.namaPemohon;
        if (data.noKtp) updateData.noKtp = data.noKtp;
        if (data.kategori) updateData.kategori = data.kategori;
        if (data.jenisPengajuan) updateData.jenisPengajuan = data.jenisPengajuan;
        if (data.segmentasi) updateData.segmentasi = data.segmentasi;
        if (data.dataLengkap) updateData.dataLengkap = data.dataLengkap;

        return prisma.debitur.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Delete debitur
     */
    static async delete(id: string) {
        return prisma.debitur.delete({
            where: { id },
        });
    }

    /**
     * Check if debitur exists
     */
    static async exists(id: string): Promise<boolean> {
        const count = await prisma.debitur.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Check if user owns debitur
     */
    static async isOwner(id: string, userId: string): Promise<boolean> {
        const count = await prisma.debitur.count({
            where: { id, userId },
        });
        return count > 0;
    }

    /**
     * Get statistics for dashboard
     */
    /**
     * Get statistics for dashboard
     */
    static async getStats(userId?: string) {
        const where: DebiturWhereInput = userId ? { userId } : {};

        // Calculate date 30 days ago for recent stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [total, byKategori, bySegmentasi, recentCount, dailyStats] = await Promise.all([
            // Total count
            prisma.debitur.count({ where: where as any }),

            // Group by Kategori
            prisma.debitur.groupBy({
                by: ['kategori'],
                where: where as any,
                _count: true,
            }),

            // Group by Segmentasi
            prisma.debitur.groupBy({
                by: ['segmentasi'],
                where: where as any,
                _count: true,
            }),

            // Recent count (last 7 days - kept for compatibility if needed, or just general "new" metric)
            prisma.debitur.count({
                where: {
                    ...where,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                } as any,
            }),

            // Daily stats (limited to last 30 days for performance)
            // Note: SQLite/some adapters might not support date truncation in groupBy easily via Prisma interface without raw query.
            // For safety and compatibility across DBs without raw SQL, we fetch just the dates for the last 30 days.
            // This is much lighter than fetching ALL rows.
            prisma.debitur.findMany({
                where: {
                    ...where,
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                } as any,
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' }
            }),
        ]);

        // Process daily stats in memory (now limited to subset of data)
        const groupedByDate = dailyStats.reduce((acc: Record<string, number>, item) => {
            const date = new Date(item.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            recentCount,
            byKategori: byKategori.reduce((acc: Record<string, number>, item) => {
                acc[item.kategori] = item._count;
                return acc;
            }, {} as Record<string, number>),
            bySegmentasi: bySegmentasi.reduce((acc: Record<string, number>, item) => {
                acc[item.segmentasi] = item._count;
                return acc;
            }, {} as Record<string, number>),
            groupedByDate,
        };
    }
}
