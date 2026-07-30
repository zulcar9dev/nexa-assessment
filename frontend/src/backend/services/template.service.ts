/**
 * Template Service (Drizzle ORM implementation)
 * Handles template file management
 */

import { db } from '@/backend/db';
import { template } from '@/backend/db/schema';
import { eq, asc } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import { SimpleCache } from '@/backend/lib/cache';

// Local type definition - matches Drizzle schema type
type Kategori = 'PRAPURNA' | 'PURNA' | 'AKTIF';

export class TemplateService {
    private static TEMPLATE_DIR = path.join(process.cwd(), 'templates');
    private static cache = new SimpleCache<Buffer>();

    /**
     * Ensure template directory exists
     */
    static async ensureTemplateDir(): Promise<void> {
        try {
            await fs.access(this.TEMPLATE_DIR);
        } catch {
            await fs.mkdir(this.TEMPLATE_DIR, { recursive: true });
        }
    }

    /**
     * Get all templates from database
     */
    static async getAll() {
        return db.select()
            .from(template)
            .orderBy(asc(template.kategori));
    }

    /**
     * Get template by category
     */
    static async getByKategori(kategori: Kategori) {
        const results = await db.select()
            .from(template)
            .where(eq(template.kategori, kategori))
            .limit(1);
        return results[0] || null;
    }

    /**
     * Create or update template record
     */
    static async upsert(
        kategori: Kategori,
        filename: string,
        fileData?: string | null,
        name?: string
    ) {
        const templatePath = path.join(this.TEMPLATE_DIR, filename);
        const displayName = name || this.getDefaultName(kategori);
        const id = crypto.randomUUID();

        const [upserted] = await db.insert(template)
            .values({
                id,
                kategori,
                name: displayName,
                filename,
                path: templatePath,
                fileData: fileData || null,
            })
            .onConflictDoUpdate({
                target: template.kategori,
                set: {
                    filename,
                    path: templatePath,
                    name: displayName,
                    fileData: fileData || null,
                    updatedAt: new Date()
                }
            })
            .returning();

        return upserted;
    }

    /**
     * Get default template name based on category
     */
    private static getDefaultName(kategori: Kategori): string {
        const names: Record<Kategori, string> = {
            AKTIF: 'Template Aktif',
            PRAPURNA: 'Template Prapurna',
            PURNA: 'Template Purna',
        };
        return names[kategori] || 'Template';
    }

    /**
     * Save uploaded file to template directory
     */
    static async saveFile(
        kategori: Kategori,
        file: Buffer,
        originalFilename: string
    ): Promise<string> {
        await this.ensureTemplateDir();

        // Generate consistent filename
        const ext = path.extname(originalFilename);
        const safeKategori = kategori.toLowerCase();
        const filename = `template_${safeKategori}${ext}`;
        const filepath = path.join(this.TEMPLATE_DIR, filename);

        // Write file (still keeping local copy for redundancy/debug)
        await fs.writeFile(filepath, file);

        // Convert Buffer to Base64
        const fileDataBase64 = file.toString('base64');

        // Update database record
        await this.upsert(kategori, filename, fileDataBase64);

        // Update cache
        this.cache.set(kategori, file);

        return filename;
    }

    /**
     * Get template file path
     */
    static async getFilePath(kategori: Kategori): Promise<string | null> {
        const templateRecord = await this.getByKategori(kategori);
        if (!templateRecord) return null;

        // Note: we now prioritize DB content over local path
        return templateRecord.path;
    }

    /**
     * Read template file
     */
    static async readFile(kategori: Kategori): Promise<Buffer | null> {
        // Try get from cache first
        const cached = this.cache.get(kategori);
        if (cached) return cached;

        const templateRecord = await this.getByKategori(kategori);
        if (!templateRecord) return null;

        let data: Buffer | null = null;

        if (templateRecord.fileData) {
            // Read from DB Base64
            data = Buffer.from(templateRecord.fileData, 'base64');
        } else {
            // Fallback to local file if DB has no data
            try {
                data = await fs.readFile(templateRecord.path);
            } catch {
                return null;
            }
        }

        if (data) {
            this.cache.set(kategori, data);
            return data;
        }
        return null;
    }

    /**
     * Check if template file exists
     */
    static async fileExists(kategori: Kategori): Promise<boolean> {
        const templateRecord = await this.getByKategori(kategori);
        if (!templateRecord) return false;
        if (templateRecord.fileData) return true;
        
        try {
            await fs.access(templateRecord.path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Initialize default templates from existing files
     */
    static async initializeDefaults(): Promise<void> {
        await this.ensureTemplateDir();

        const defaultTemplates: Array<{ kategori: Kategori; filename: string }> = [
            { kategori: 'AKTIF', filename: 'template_aktif.docx' },
            { kategori: 'PRAPURNA', filename: 'template_prapurna.docx' },
            { kategori: 'PURNA', filename: 'template_purna.docx' },
        ];

        for (const defaultTemplate of defaultTemplates) {
            const filepath = path.join(this.TEMPLATE_DIR, defaultTemplate.filename);
            try {
                const fileData = await fs.readFile(filepath);
                // File exists, create/update database record with base64 data
                await this.upsert(defaultTemplate.kategori, defaultTemplate.filename, fileData.toString('base64'));
            } catch {
                // File doesn't exist, skip
                console.log(`Template file not found: ${defaultTemplate.filename}`);
            }
        }
    }
}
