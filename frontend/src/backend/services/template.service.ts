/**
 * Template Service
 * Handles template file management
 */

import prisma from '@/backend/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { SimpleCache } from '@/backend/lib/cache';

// Local type definition - matches Prisma enum
type Kategori = 'PRAPURNA' | 'PURNA';

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
        return prisma.template.findMany({
            orderBy: { kategori: 'asc' },
        });
    }

    /**
     * Get template by category
     */
    static async getByKategori(kategori: Kategori) {
        return prisma.template.findUnique({
            where: { kategori },
        });
    }

    /**
     * Create or update template record
     */
    static async upsert(
        kategori: Kategori,
        filename: string,
        name?: string
    ) {
        const templatePath = path.join(this.TEMPLATE_DIR, filename);

        return prisma.template.upsert({
            where: { kategori },
            create: {
                kategori,
                name: name || this.getDefaultName(kategori),
                filename,
                path: templatePath,
            },
            update: {
                filename,
                path: templatePath,
                name: name || this.getDefaultName(kategori),
            },
        });
    }

    /**
     * Get default template name based on category
     */
    private static getDefaultName(kategori: Kategori): string {
        const names: Record<Kategori, string> = {
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

        // Write file
        await fs.writeFile(filepath, file);

        // Update database record
        await this.upsert(kategori, filename);

        // Update cache
        this.cache.set(kategori, file);

        return filename;
    }

    /**
     * Get template file path
     */
    static async getFilePath(kategori: Kategori): Promise<string | null> {
        const template = await this.getByKategori(kategori);
        if (!template) return null;

        try {
            await fs.access(template.path);
            return template.path;
        } catch {
            return null;
        }
    }

    /**
     * Read template file
     */
    static async readFile(kategori: Kategori): Promise<Buffer | null> {
        // Try get from cache first
        const cached = this.cache.get(kategori);
        if (cached) return cached;

        const filepath = await this.getFilePath(kategori);
        if (!filepath) return null;

        try {
            const data = await fs.readFile(filepath);
            // Store in cache
            this.cache.set(kategori, data);
            return data;
        } catch {
            return null;
        }
    }

    /**
     * Check if template file exists
     */
    static async fileExists(kategori: Kategori): Promise<boolean> {
        const filepath = await this.getFilePath(kategori);
        return filepath !== null;
    }

    /**
     * Initialize default templates from existing files
     */
    static async initializeDefaults(): Promise<void> {
        await this.ensureTemplateDir();

        const defaultTemplates: Array<{ kategori: Kategori; filename: string }> = [
            { kategori: 'PRAPURNA', filename: 'template_prapurna.docx' },
            { kategori: 'PURNA', filename: 'template_purna.docx' },
        ];

        for (const template of defaultTemplates) {
            const filepath = path.join(this.TEMPLATE_DIR, template.filename);
            try {
                await fs.access(filepath);
                // File exists, create/update database record
                await this.upsert(template.kategori, template.filename);
            } catch {
                // File doesn't exist, skip
                console.log(`Template file not found: ${template.filename}`);
            }
        }
    }
}
