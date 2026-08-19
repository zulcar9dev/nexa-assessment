/**
 * Client Service (Drizzle ORM implementation)
 * Handles all client CRUD operations
 */

import { db } from '@/backend/db';
import { client, user } from '@/backend/db/schema';
import { and, eq, isNull, or, ilike, sql, desc, count, gte, inArray } from 'drizzle-orm';
import type { DebiturQueryParams, CreateDebiturRequest, UpdateDebiturRequest } from '@/types/api';
import { normalizeBlokiran, type BlokiranKategori } from '@/lib/blokiran';


// Mapping Helpers to conform input to Drizzle Schema Enums
function mapToDrizzleKategori(k: string): 'PRAPURNA' | 'PURNA' | 'AKTIF' {
    const upper = k.toUpperCase();
    if (['PRAPURNA', 'PURNA', 'AKTIF'].includes(upper)) {
        return upper as 'PRAPURNA' | 'PURNA' | 'AKTIF';
    }
    const lower = k.toLowerCase();
    if (lower.includes('type_c') || lower.includes('aktif') || lower.includes('active')) return 'AKTIF';
    if (lower.includes('type_b') || lower.includes('purna') || lower.includes('full')) return 'PURNA';
    if (lower.includes('type_a') || lower.includes('prapurna') || lower.includes('pre')) return 'PRAPURNA';
    return 'PRAPURNA'; // Fallback
}

function mapToDrizzleJenis(j: string): 'BARU' | 'TOP_UP' | 'TOP_UP_SISA_GAJI' | 'TAKEOVER' | 'THT' | 'FLEKSI_AKTIF' | 'PENSIUNAN_JANDA_BARU' | 'PENSIUNAN_JANDA_TOP_UP' | 'PENSIUNAN_JANDA_TAKEOVER' | 'PENSIUNAN_DUDA_BARU' | 'PENSIUNAN_DUDA_TOP_UP' | 'PENSIUNAN_DUDA_TAKEOVER' {
    const upper = j.toUpperCase().replace(/ /g, '_');
    const valid = ['BARU', 'TOP_UP', 'TOP_UP_SISA_GAJI', 'TAKEOVER', 'THT', 'FLEKSI_AKTIF', 'PENSIUNAN_JANDA_BARU', 'PENSIUNAN_JANDA_TOP_UP', 'PENSIUNAN_JANDA_TAKEOVER', 'PENSIUNAN_DUDA_BARU', 'PENSIUNAN_DUDA_TOP_UP', 'PENSIUNAN_DUDA_TAKEOVER'];
    if (valid.includes(upper)) {
        return upper as 'BARU' | 'TOP_UP' | 'TOP_UP_SISA_GAJI' | 'TAKEOVER' | 'THT' | 'FLEKSI_AKTIF' | 'PENSIUNAN_JANDA_BARU' | 'PENSIUNAN_JANDA_TOP_UP' | 'PENSIUNAN_JANDA_TAKEOVER' | 'PENSIUNAN_DUDA_BARU' | 'PENSIUNAN_DUDA_TOP_UP' | 'PENSIUNAN_DUDA_TAKEOVER';
    }
    return 'BARU'; // Fallback
}

function mapToDrizzleSegmentasi(s: string): 'TASPEN' | 'ASABRI' | 'BUMD_BUMN' | 'SWASTA' | 'PEMERINTAHAN' {
    const upper = s.toUpperCase().replace(/ /g, '_');
    const valid = ['TASPEN', 'ASABRI', 'BUMD_BUMN', 'SWASTA', 'PEMERINTAHAN'];
    if (valid.includes(upper)) {
        return upper as 'TASPEN' | 'ASABRI' | 'BUMD_BUMN' | 'SWASTA' | 'PEMERINTAHAN';
    }
    return 'TASPEN'; // Fallback
}

// Helper untuk normalisasi blokiran berdasarkan kategori yang disimpan di DB
function toBlokiranKategori(k: string): BlokiranKategori {
    const lower = k.toLowerCase();
    if (lower.includes('type_c') || lower.includes('aktif')) return 'type_c';
    if (lower.includes('type_b') || lower.includes('purna')) return 'type_b';
    return 'type_a';
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
     * Get paginated list of clients with optional filters
     */
    static async getList(params: DebiturQueryParams, userId?: string) {
        const { q, jenis, segmentasi, kategori, status, page = 1, limit = 10 } = params;

        const conditions = [isNull(client.deletedAt)];

        // Add userId filter if provided (non-admin users only see their own data)
        if (userId) {
            conditions.push(eq(client.userId, userId));
        }

        // Filter by status
        if (status) {
            conditions.push(eq(client.status, status as 'DRAFT' | 'SUBMITTED'));
        }

        // Search by text/enum fields (supporting multi-token search across all fields)
        if (q && q.trim().length > 0) {
            const tokens = q.trim().split(/\s+/).filter(Boolean);
            const tokenConditions = [];

            for (const token of tokens) {
                const tokenLower = token.toLowerCase();
                const escapedToken = token.replace(/[%_\\]/g, '\\$&');
                const searchPattern = `%${escapedToken}%`;

                const orConditions = [
                    ilike(client.applicantName, searchPattern),
                    ilike(client.idNumber, searchPattern),
                    ilike(user.name, searchPattern),
                    sql`${client.dataLengkap}::text ILIKE ${searchPattern}`
                ];

                // 1. matchedKategori
                const matchedKategori: Array<'PRAPURNA' | 'PURNA' | 'AKTIF'> = [];
                if ('prapurna'.includes(tokenLower) || 'type_a'.includes(tokenLower) || 'type a'.includes(tokenLower) || tokenLower.includes('prapurna') || tokenLower.includes('pre')) {
                    matchedKategori.push('PRAPURNA');
                }
                if ('purna'.includes(tokenLower) || 'type_b'.includes(tokenLower) || 'type b'.includes(tokenLower) || tokenLower.includes('purna') || tokenLower.includes('full')) {
                    matchedKategori.push('PURNA');
                }
                if ('aktif'.includes(tokenLower) || 'type_c'.includes(tokenLower) || 'type c'.includes(tokenLower) || tokenLower.includes('aktif') || tokenLower.includes('active')) {
                    matchedKategori.push('AKTIF');
                }
                if (matchedKategori.length > 0) {
                    orConditions.push(inArray(client.kategori, matchedKategori));
                }

                // 2. matchedJenis
                const allJenisKeys: Array<'BARU' | 'TOP_UP' | 'TOP_UP_SISA_GAJI' | 'TAKEOVER' | 'THT' | 'FLEKSI_AKTIF' | 'PENSIUNAN_JANDA_BARU' | 'PENSIUNAN_JANDA_TOP_UP' | 'PENSIUNAN_JANDA_TAKEOVER' | 'PENSIUNAN_DUDA_BARU' | 'PENSIUNAN_DUDA_TOP_UP' | 'PENSIUNAN_DUDA_TAKEOVER'> = [
                    'BARU', 'TOP_UP', 'TOP_UP_SISA_GAJI', 'TAKEOVER', 'THT', 'FLEKSI_AKTIF',
                    'PENSIUNAN_JANDA_BARU', 'PENSIUNAN_JANDA_TOP_UP', 'PENSIUNAN_JANDA_TAKEOVER',
                    'PENSIUNAN_DUDA_BARU', 'PENSIUNAN_DUDA_TOP_UP', 'PENSIUNAN_DUDA_TAKEOVER'
                ];
                const matchedJenis = allJenisKeys.filter(j => {
                    const readable = j.toLowerCase().replace(/_/g, ' ');
                    return readable.includes(tokenLower) || tokenLower.includes(readable);
                });
                if (matchedJenis.length > 0) {
                    orConditions.push(inArray(client.jenisPengajuan, matchedJenis));
                }

                // 3. matchedSegmentasi
                const matchedSegmentasi: Array<'TASPEN' | 'ASABRI' | 'BUMD_BUMN' | 'SWASTA' | 'PEMERINTAHAN'> = [];
                if (tokenLower.includes('taspen') || 'taspen'.includes(tokenLower) || tokenLower.includes('pns') || tokenLower.includes('asn')) {
                    matchedSegmentasi.push('TASPEN');
                }
                if (tokenLower.includes('asabri') || 'asabri'.includes(tokenLower) || tokenLower.includes('tni') || tokenLower.includes('polri')) {
                    matchedSegmentasi.push('ASABRI');
                }
                if (tokenLower.includes('bumd') || tokenLower.includes('bumn')) {
                    matchedSegmentasi.push('BUMD_BUMN');
                }
                if (tokenLower.includes('swasta') || 'swasta'.includes(tokenLower)) {
                    matchedSegmentasi.push('SWASTA');
                }
                if (tokenLower.includes('pemerintah') || 'pemerintahan'.includes(tokenLower) || tokenLower.includes('pemda') || tokenLower.includes('pemkab')) {
                    matchedSegmentasi.push('PEMERINTAHAN');
                }
                if (matchedSegmentasi.length > 0) {
                    orConditions.push(inArray(client.segmentasi, matchedSegmentasi));
                }

                tokenConditions.push(or(...orConditions)!);
            }

            conditions.push(and(...tokenConditions)!);
        }

        // Filter by jenis pengajuan
        if (jenis) {
            conditions.push(eq(client.jenisPengajuan, mapToDrizzleJenis(jenis)));
        }

        // Filter by segmentasi
        if (segmentasi) {
            conditions.push(eq(client.segmentasi, mapToDrizzleSegmentasi(segmentasi)));
        }

        // Filter by kategori
        if (kategori) {
            conditions.push(eq(client.kategori, mapToDrizzleKategori(kategori)));
        }

        const skip = (page - 1) * limit;

        const [data, totalCountResult] = await Promise.all([
            db.select({
                id: client.id,
                applicantName: client.applicantName,
                idNumber: client.idNumber,
                kategori: client.kategori,
                jenisPengajuan: client.jenisPengajuan,
                segmentasi: client.segmentasi,
                status: client.status,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
                dataLengkap: client.dataLengkap,
                createdBy: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            })
            .from(client)
            .leftJoin(user, eq(client.userId, user.id))
            .where(and(...conditions))
            .orderBy(desc(client.createdAt))
            .limit(limit)
            .offset(skip),
            db.select({ count: count() })
                .from(client)
                .leftJoin(user, eq(client.userId, user.id))
                .where(and(...conditions))
        ]);

        const total = totalCountResult[0]?.count || 0;

        // Extract pekerjaan (instansi) from dataLengkap and omit dataLengkap
        const mappedData = data.map(item => {
            const dataLengkapObj = item.dataLengkap as Record<string, unknown>;
            const pekerjaan = dataLengkapObj?.instansi || '-';
            
            // Create a new object without dataLengkap
            const { dataLengkap: _dataLengkap, ...rest } = item;
            
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
     * Get single client by ID
     */
    static async getById(id: string) {
        const results = await db.select({
            id: client.id,
            applicantName: client.applicantName,
            idNumber: client.idNumber,
            kategori: client.kategori,
            jenisPengajuan: client.jenisPengajuan,
            segmentasi: client.segmentasi,
            status: client.status,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            dataLengkap: client.dataLengkap,
            userId: client.userId,
            createdBy: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
        .from(client)
        .leftJoin(user, eq(client.userId, user.id))
        .where(and(eq(client.id, id), isNull(client.deletedAt)))
        .limit(1);

        return results[0] || null;
    }

    /**
     * Create new client
     */
    static async create(data: CreateDebiturRequest, userId: string) {
        const jenis = mapToDrizzleJenis(data.jenisPengajuan);
        const status = data.status || 'SUBMITTED';

        // Pre-check only if the data is being submitted
        if (status === 'SUBMITTED') {
            const existing = await db.select({ id: client.id })
                .from(client)
                .where(
                    and(
                        eq(client.idNumber, data.idNumber),
                        eq(client.jenisPengajuan, jenis),
                        eq(client.status, 'SUBMITTED'),
                        isNull(client.deletedAt)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                throw Object.assign(new Error('Duplicate entry'), {
                    code: '23505',
                    constraint: 'debitur_ktp_jenis_submitted_unique',
                    detail: `Key (no_ktp, jenis_pengajuan)=(${data.idNumber}, ${jenis}) already exists and is submitted.`,
                });
            }
        }

        const id = crypto.randomUUID();
        const [inserted] = await db.insert(client).values({
            id,
            applicantName: data.applicantName,
            idNumber: data.idNumber,
            kategori: mapToDrizzleKategori(data.kategori),
            jenisPengajuan: jenis,
            segmentasi: mapToDrizzleSegmentasi(data.segmentasi),
            dataLengkap: normalizeBlokiran(
                data.dataLengkap || {},
                toBlokiranKategori(data.kategori),
            ),
            userId,
            status,
        }).returning();
        return inserted;
    }

    /**
     * Update existing client
     */
    static async update(id: string, data: UpdateDebiturRequest) {
        const updateData: Partial<typeof client.$inferInsert> = {};

        if (data.applicantName !== undefined) updateData.applicantName = data.applicantName;
        if (data.idNumber !== undefined) updateData.idNumber = data.idNumber;
        if (data.kategori !== undefined) updateData.kategori = mapToDrizzleKategori(data.kategori);
        if (data.jenisPengajuan !== undefined) updateData.jenisPengajuan = mapToDrizzleJenis(data.jenisPengajuan);
        if (data.segmentasi !== undefined) updateData.segmentasi = mapToDrizzleSegmentasi(data.segmentasi);
        if (data.dataLengkap !== undefined) {
            // Edit page tidak mengirim kategori; ambil dari record yang sudah ada
            const existing = await this.getById(id);
            const kategori = existing?.kategori || data.kategori || 'PRAPURNA';
            updateData.dataLengkap = normalizeBlokiran(
                data.dataLengkap,
                toBlokiranKategori(kategori),
            );
        }
        if (data.status !== undefined) updateData.status = data.status;

        const [updated] = await db.update(client)
            .set(updateData)
            .where(eq(client.id, id))
            .returning();
        return updated;
    }

    /**
     * Delete client (soft-delete)
     */
    static async delete(id: string) {
        const [updated] = await db.update(client)
            .set({ deletedAt: new Date() })
            .where(eq(client.id, id))
            .returning();
        return updated;
    }

    /**
     * Check if client exists
     */
    static async exists(id: string): Promise<boolean> {
        const result = await db.select({ count: count() })
            .from(client)
            .where(and(eq(client.id, id), isNull(client.deletedAt)));
        return (result[0]?.count || 0) > 0;
    }

    /**
     * Check if user owns client
     */
    static async isOwner(id: string, userId: string): Promise<boolean> {
        const result = await db.select({ count: count() })
            .from(client)
            .where(and(eq(client.id, id), eq(client.userId, userId), isNull(client.deletedAt)));
        return (result[0]?.count || 0) > 0;
    }

    /**
     * Get statistics for dashboard
     */
    static async getStats(userId?: string) {
        const cacheKey = userId || 'all';
        const cached = this.statsCache.get(cacheKey);
        
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }

        const baseConditions = [isNull(client.deletedAt)];
        if (userId) {
            baseConditions.push(eq(client.userId, userId));
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalResult,
            byKategoriResult,
            bySegmentasiResult,
            recentResult,
            dailyStats
        ] = await Promise.all([
            // Total count
            db.select({ count: count() })
                .from(client)
                .where(and(...baseConditions)),

            // Group by Kategori
            db.select({
                kategori: client.kategori,
                count: count()
            })
            .from(client)
            .where(and(...baseConditions))
            .groupBy(client.kategori),

            // Group by Segmentasi
            db.select({
                segmentasi: client.segmentasi,
                count: count()
            })
            .from(client)
            .where(and(...baseConditions))
            .groupBy(client.segmentasi),

            // Recent count (last 7 days)
            db.select({ count: count() })
                .from(client)
                .where(and(...baseConditions, gte(client.createdAt, sevenDaysAgo))),

            // Daily stats (last 30 days)
            db.select({ createdAt: client.createdAt })
                .from(client)
                .where(and(...baseConditions, gte(client.createdAt, thirtyDaysAgo)))
                .orderBy(client.createdAt)
        ]);

        const total = totalResult[0]?.count || 0;
        const recentCount = recentResult[0]?.count || 0;

        const byKategori = byKategoriResult.reduce((acc: Record<string, number>, item) => {
            if (item.kategori) {
                acc[item.kategori] = item.count;
            }
            return acc;
        }, {} as Record<string, number>);

        const bySegmentasi = bySegmentasiResult.reduce((acc: Record<string, number>, item) => {
            if (item.segmentasi) {
                acc[item.segmentasi] = item.count;
            }
            return acc;
        }, {} as Record<string, number>);

        // Process daily stats in memory
        const groupedByDate = dailyStats.reduce((acc: Record<string, number>, item) => {
            const date = new Date(item.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const result = {
            total,
            recentCount,
            byKategori,
            bySegmentasi,
            groupedByDate,
        };

        this.statsCache.set(cacheKey, { data: result, expiry: Date.now() + 30000 }); // 30s cache

        return result;
    }
}
