import { promises as fs } from 'fs';
import path from 'path';
import { SimpleCache } from '@/backend/lib/cache';

export interface AppSettings {
    slikMitigasiRiskText: string;
    catatanProgramPricing: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    slikMitigasiRiskText: "Mitigasi Risiko Cfm. Surat No. DNS/5.4/5645 Tanggal 09 Juli 2025 Perihal Penyampaian Program Relaksasi SLIK untuk Pemrosesan Assessment Semester II Tahun 2025.",
    catatanProgramPricing: "Cfm Surat No DNS/5.4/8023 Perihal Program Pricing Nexa Assessment Semester II 2025 tanggal 01-09-2025."
};

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'app-settings.json');

export class ConfigService {
    private static cache = new SimpleCache<AppSettings>();

    /**
     * Ensure data directory exists
     */
    private static async ensureDataDir() {
        try {
            await fs.access(DATA_DIR);
        } catch {
            await fs.mkdir(DATA_DIR, { recursive: true });
        }
    }

    /**
     * Get current application settings
     */
    static async getSettings(): Promise<AppSettings> {
        // Try get from cache first
        const cached = this.cache.get('settings');
        if (cached) return cached;

        try {
            await this.ensureDataDir();

            try {
                const data = await fs.readFile(CONFIG_FILE, 'utf-8');
                const settings = JSON.parse(data);
                const result = { ...DEFAULT_SETTINGS, ...settings };
                
                // Store in cache (longer TTL for config, e.g. 1 hour)
                this.cache.set('settings', result, 60 * 60 * 1000);
                
                return result;
            } catch {
                // Return default settings if file doesn't exist or is invalid
                return DEFAULT_SETTINGS;
            }
        } catch (error) {
            console.error('[ConfigService] Error reading settings:', error);
            return DEFAULT_SETTINGS;
        }
    }

    /**
     * Update application settings
     */
    static async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
        try {
            const current = await this.getSettings();
            const updated = { ...current, ...newSettings };

            await this.ensureDataDir();
            await fs.writeFile(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');

            // Update cache
            this.cache.set('settings', updated, 60 * 60 * 1000);

            return updated;
        } catch (error) {
            console.error('[ConfigService] Error writing settings:', error);
            throw new Error('Failed to save settings');
        }
    }
}
