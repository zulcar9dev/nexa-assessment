/**
 * Debitur Service
 * Handles all debitur CRUD operations
 */

import prisma from '@/backend/lib/prisma';
import { Prisma } from '@prisma/client';
import type { DebiturQueryParams, CreateDebiturRequest, UpdateDebiturRequest } from '@/types/api';

// Local type definitions - these match the Prisma schema
import { 
    Kategori as PrismaKategori, 
    JenisPengajuan as PrismaJenisPengajuan, 
    Segmentasi as PrismaSegmentasi 
} from '@/types/common';
import { Kategori, JenisPengajuan, Segmentasi } from '@/types/debitur';

// Mapping Helpers
function mapToPrismaKategori(k: Kategori | string): PrismaKategori {
    const lower = k.toLowerCase();
    if (lower.includes('aktif')) return PrismaKategori.AKTIF;
    if (lower.includes('prapurna')) return PrismaKategori.PRAPURNA;
    if (lower.includes('purna')) return PrismaKategori.PURNA;
    return PrismaKategori.PRAPURNA; // Fallback
}

function mapToPrismaJenis(j: JenisPengajuan | string): PrismaJenisPengajuan {
    const upper = j.toUpperCase().replace(/ /g, '_');
    // Handle special cases
    if (upper === 'THT') return PrismaJenisPengajuan.TOP_UP;
    // Direct enum matching
    const validValues = Object.values(PrismaJenisPengajuan) as string[];
    if (validValues.includes(upper)) {
        return upper as PrismaJenisPengajuan;
    }
    return PrismaJenisPengajuan.BARU; // Fallback
}

function mapToPrismaSegmentasi(s: Segmentasi | string): PrismaSegmentasi {
    const upper = s.toUpperCase();
    const validValues = Object.values(PrismaSegmentasi) as string[];
    if (validValues.includes(upper)) {
        return upper as PrismaSegmentasi;
    }
    return PrismaSegmentasi.TASPEN; // Fallback
}

// Prisma-like where input type
interface DebiturWhereInput {
    userId?: string;
    namaPemohon?: { contains: string; mode: string };
    noKtp?: { contains: string };
    jenisPengajuan?: PrismaJenisPengajuan;
    segmentasi?: PrismaSegmentasi;
    kategori?: PrismaKategori;
    OR?: Array<{ namaPemohon?: { contains: string; mode: string }; noKtp?: { contains: string } }>;
    createdAt?: { gte: Date };
}

interface StatsResult {
    total: number;
    recentCount: number;
    byKategori: Record<string, number>;
    bySegmentasi: Record<string, number>;
    groupedByDate: Record<string, number>;
}

export class DebiturService {
    private static statsCache = new Map<string, { data: StatsResult; expiry: number }>();

    /**
     * Get paginated list of debiturs with optional filters
     */
    static async getList(params: DebiturQueryParams, userId?: string) {
        const { q, jenis, segmentasi, kategori, page = 1, limit = 10 } = params;

        const where: Prisma.DebiturWhereInput = {};

        // Add userId filter if provided (non-admin users only see their own data)
        if (userId) {
            where.userId = userId;
        }

        // Search by all text/enum fields
        if (q) {
            const lowerQ = q.toLowerCase();

            // 1. Find matched ENUM values for Kategori
            const matchedKategori = Object.values(PrismaKategori).filter(k => 
                k.toLowerCase().includes(lowerQ) ||
                (k === PrismaKategori.PRAPURNA && "pensiun prapurna".includes(lowerQ)) ||
                (k === PrismaKategori.PURNA && "pensiun purna".includes(lowerQ)) ||
                (k === PrismaKategori.AKTIF && "aktif".includes(lowerQ))
            );

            // 2. Find matched ENUM values for Jenis Pengajuan
            const matchedJenis = Object.values(PrismaJenisPengajuan).filter(j => 
                j.toLowerCase().replace(/_/g, ' ').includes(lowerQ)
            );

            // 3. Find matched ENUM values for Segmentasi
            const matchedSegmentasi = Object.values(PrismaSegmentasi).filter(s => 
                s.toLowerCase().replace(/_/g, ' ').includes(lowerQ) ||
                (s === PrismaSegmentasi.TASPEN && "pns".includes(lowerQ)) ||
                (s === PrismaSegmentasi.ASABRI && "tni polri".includes(lowerQ)) ||
                (s === PrismaSegmentasi.PEMERINTAHAN && "pemerintahan".includes(lowerQ)) ||
                (s === PrismaSegmentasi.SWASTA && "swasta".includes(lowerQ)) ||
                (s === PrismaSegmentasi.BUMD_BUMN && "bumd bumn".includes(lowerQ))
            );

            const searchConditions: any[] = [
                { namaPemohon: { contains: q, mode: 'insensitive' } },
                { noKtp: { contains: q } },
                {
                    dataLengkap: {
                        path: ['instansi'],
                        string_contains: q,
                    }
                }
            ];

            if (matchedKategori.length > 0) {
                searchConditions.push({ kategori: { in: matchedKategori } });
            }
            if (matchedJenis.length > 0) {
                searchConditions.push({ jenisPengajuan: { in: matchedJenis } });
            }
            if (matchedSegmentasi.length > 0) {
                searchConditions.push({ segmentasi: { in: matchedSegmentasi } });
            }

            where.OR = searchConditions;
        }

        // Filter by jenis pengajuan
        if (jenis) {
            where.jenisPengajuan = mapToPrismaJenis(jenis);
        }

        // Filter by segmentasi
        if (segmentasi) {
            where.segmentasi = mapToPrismaSegmentasi(segmentasi);
        }

        // Filter by kategori
        if (kategori) {
            where.kategori = mapToPrismaKategori(kategori);
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.debitur.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    namaPemohon: true,
                    noKtp: true,
                    kategori: true,
                    jenisPengajuan: true,
                    segmentasi: true,
                    createdAt: true,
                    updatedAt: true,
                    dataLengkap: true, // Included to extract pekerjaan (instansi)
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.debitur.count({ where: where as any }),
        ]);

        // Extract pekerjaan (instansi) from dataLengkap and omit dataLengkap
        const mappedData = data.map(item => {
            const dataLengkapObj = item.dataLengkap as Record<string, any>;
            const pekerjaan = dataLengkapObj?.instansi || '-';
            
            // Create a new object without dataLengkap
            const { dataLengkap, ...rest } = item;
            
            return {
                ...rest,
                pekerjaan
            };
        });

        return {
            data: mappedData,
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
                kategori: mapToPrismaKategori(data.kategori),
                jenisPengajuan: mapToPrismaJenis(data.jenisPengajuan),
                segmentasi: mapToPrismaSegmentasi(data.segmentasi),
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
        if (data.kategori) updateData.kategori = mapToPrismaKategori(data.kategori);
        if (data.jenisPengajuan) updateData.jenisPengajuan = mapToPrismaJenis(data.jenisPengajuan);
        if (data.segmentasi) updateData.segmentasi = mapToPrismaSegmentasi(data.segmentasi);
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
        const cacheKey = userId || 'all';
        const cached = this.statsCache.get(cacheKey);
        
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }

        const where: Prisma.DebiturWhereInput = userId ? { userId } : {};

        // Calculate date 30 days ago for recent stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [total, byKategori, bySegmentasi, recentCount, dailyStats] = await Promise.all([
            // Total count
            prisma.debitur.count({ where }),

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

        const result = {
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

        this.statsCache.set(cacheKey, { data: result, expiry: Date.now() + 30000 }); // 30s cache

        return result;
    }
}
