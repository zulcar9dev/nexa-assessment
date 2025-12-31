import { promises as fs } from 'fs';
import path from 'path';

export interface AppSettings {
    slikMitigasiRiskText: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    slikMitigasiRiskText: "Mitigasi Risiko Cfm. Surat No. DNS/5.4/5645 Tanggal 09 Juli 2025 Perihal Penyampaian Program Relaksasi SLIK untuk Pemrosesan BNI Fleksi Pensiun Semester II Tahun 2025."
};

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'app-settings.json');

export class ConfigService {
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
        try {
            await this.ensureDataDir();
            
            try {
                const data = await fs.readFile(CONFIG_FILE, 'utf-8');
                const settings = JSON.parse(data);
                return { ...DEFAULT_SETTINGS, ...settings };
            } catch (error) {
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
            
            return updated;
        } catch (error) {
            console.error('[ConfigService] Error writing settings:', error);
            throw new Error('Failed to save settings');
        }
    }
}
