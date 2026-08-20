import { db } from '@/backend/db';
import { appSettings } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export interface AppSettings {
    slikMitigasiRiskText: string;
    catatanProgramPricing: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    slikMitigasiRiskText: "Mitigasi Risiko Cfm. Surat No. NSD/2/0216 Penyampaian Program Relaksasi Sistem Layanan Informasi Keuangan (SLIK) Nexa Fleksi Pensiun (BFP) Semester I Tahun 2026 tanggal 13 Januari 2026.",
    catatanProgramPricing: "(Cfm Surat No NSD/2/4293 Penyampaian Program KTA Nexa Fleksi (Aktif & Pensiun) dan KPR Nexa Griya khusus HUT Nexa ke - 80)"
};

const SETTINGS_ID = 'default';

export class ConfigService {
    /**
     * Get current application settings from database.
     * If the settings row does not exist yet, insert the defaults and return them.
     */
    static async getSettings(): Promise<AppSettings> {
        const [row] = await db
            .select({
                slikMitigasiRiskText: appSettings.slikMitigasiRiskText,
                catatanProgramPricing: appSettings.catatanProgramPricing,
            })
            .from(appSettings)
            .where(eq(appSettings.id, SETTINGS_ID))
            .limit(1);

        if (row) {
            return {
                slikMitigasiRiskText: row.slikMitigasiRiskText,
                catatanProgramPricing: row.catatanProgramPricing,
            };
        }

        try {
            await this.upsertDefaults();
        } catch (error) {
            console.error('[ConfigService] Error seeding default settings:', error);
        }

        return { ...DEFAULT_SETTINGS };
    }

    /**
     * Update application settings in the database (upsert by fixed id).
     */
    static async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
        const current = await this.getSettings();
        const updated = { ...current, ...newSettings };

        await db
            .insert(appSettings)
            .values({
                id: SETTINGS_ID,
                slikMitigasiRiskText: updated.slikMitigasiRiskText,
                catatanProgramPricing: updated.catatanProgramPricing,
            })
            .onConflictDoUpdate({
                target: appSettings.id,
                set: {
                    slikMitigasiRiskText: updated.slikMitigasiRiskText,
                    catatanProgramPricing: updated.catatanProgramPricing,
                },
            });

        return updated;
    }

    private static async upsertDefaults(): Promise<void> {
        await db
            .insert(appSettings)
            .values({
                id: SETTINGS_ID,
                slikMitigasiRiskText: DEFAULT_SETTINGS.slikMitigasiRiskText,
                catatanProgramPricing: DEFAULT_SETTINGS.catatanProgramPricing,
            })
            .onConflictDoNothing();
    }
}