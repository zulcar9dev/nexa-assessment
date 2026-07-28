/**
 * Document Service
 * Handles DOCX document generation from templates
 */

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
} from 'docx';
import { promises as fs } from 'fs';
import path from 'path';
import { formatJenisPengajuan } from './document/formatters';
import { restoreBankingTermsInContext, restoreBankingTerms } from './document/terminology';


// Indonesian month names
const BULAN_INDONESIA = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export class DocumentService {
    /**
     * Format date to Indonesian format
     * YYYY-MM-DD -> DD NamaBulan YYYY
     * 
     * @param dateStr - ISO date string or any parseable date format
     * @returns Formatted Indonesian date string
     */
    static formatDateIndonesian(dateStr: string): string {
        if (!dateStr) return '-';

        try {
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = BULAN_INDONESIA[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    }

    /**
     * Format number to Indonesian currency format
     * 1000000 -> 1.000.000
     * 
     * @param value - Number to format
     * @returns Formatted currency string
     */
    static formatCurrency(value: number): string {
        if (value === null || value === undefined || isNaN(value)) return '0';
        return Math.round(value).toLocaleString('id-ID');
    }

    /**
     * Format number to Indonesian currency with "Rp" prefix
     * 1000000 -> Rp 1.000.000
     * 
     * @param value - Number to format
     * @returns Formatted currency string with Rp prefix
     */
    static formatRupiah(value: number): string {
        return `Rp ${this.formatCurrency(value)}`;
    }

    /**
     * Convert number to words in Indonesian (Terbilang)
     * 
     * @param num - Number to convert
     * @returns Number in words
     */
    static terbilang(num: number): string {
        const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

        if (num < 12) return satuan[num];
        if (num < 20) return this.terbilang(num - 10) + ' belas';
        if (num < 100) return this.terbilang(Math.floor(num / 10)) + ' puluh' + (num % 10 > 0 ? ' ' + this.terbilang(num % 10) : '');
        if (num < 200) return 'seratus' + (num - 100 > 0 ? ' ' + this.terbilang(num - 100) : '');
        if (num < 1000) return this.terbilang(Math.floor(num / 100)) + ' ratus' + (num % 100 > 0 ? ' ' + this.terbilang(num % 100) : '');
        if (num < 2000) return 'seribu' + (num - 1000 > 0 ? ' ' + this.terbilang(num - 1000) : '');
        if (num < 1000000) return this.terbilang(Math.floor(num / 1000)) + ' ribu' + (num % 1000 > 0 ? ' ' + this.terbilang(num % 1000) : '');
        if (num < 1000000000) return this.terbilang(Math.floor(num / 1000000)) + ' juta' + (num % 1000000 > 0 ? ' ' + this.terbilang(num % 1000000) : '');
        if (num < 1000000000000) return this.terbilang(Math.floor(num / 1000000000)) + ' miliar' + (num % 1000000000 > 0 ? ' ' + this.terbilang(num % 1000000000) : '');

        return this.terbilang(Math.floor(num / 1000000000000)) + ' triliun' + (num % 1000000000000 > 0 ? ' ' + this.terbilang(num % 1000000000000) : '');
    }

    /**
     * Prepare template context from client data
     * - Formats dates
     * - Formats nominal values
     * - Calculates derived fields
     * 
     * @param client - Client data with dataLengkap JSON
     * @returns Prepared context for template rendering
     */
    static prepareTemplateContext(client: {
        applicantName: string;
        idNumber: string;
        kategori: string;
        jenisPengajuan: string;
        segmentasi: string;
        dataLengkap: Record<string, unknown>;
    }): Record<string, unknown> {
        const data = client.dataLengkap as Record<string, unknown>;

        // Format all date fields
        const dateFields = [
            'tgl_lahir_pemohon',
            'tgl_lahir_pasangan',
            'tanggal_pensiun',
            'tmt_pensiun',
            'tanggal_slik',
        ];

        const formattedData: Record<string, unknown> = { ...data };

        dateFields.forEach(field => {
            if (data[field]) {
                formattedData[`${field}_formatted`] = this.formatDateIndonesian(data[field] as string);
            }
        });

        // Format all currency fields
        const currencyFields = [
            'gaji_pokok',
            'tunjangan_istri',
            'tunjangan_anak',
            'tunjangan_lainnya',
            'penghasilan_bersih',
            'penghasilan_pasangan',
            'penghasilan_lainnya',
            'total_penghasilan',
            'usulan_plafon_kredit',
            'angsuran_per_bulan',
        ];

        currencyFields.forEach(field => {
            if (data[field]) {
                const value = Number(data[field]);
                formattedData[`${field}_formatted`] = this.formatRupiah(value);
                formattedData[`${field}_terbilang`] = this.terbilang(value);
            }
        });

        return {
            ...formattedData,
            nama_pemohon: client.applicantName,
            no_ktp: client.idNumber,
            kategori: client.kategori,
            jenis_pengajuan: client.jenisPengajuan,
            segmentasi: client.segmentasi,
            tanggal_cetak: this.formatDateIndonesian(new Date().toISOString()),
        };
    }

    /**
     * Generate simple DOCX document from client data
     * This is a fallback when template processing is not available
     * 
     * @param data - Client data
     * @returns Buffer containing the DOCX file
     */
    static async generateSimpleDocx(data: {
        applicantName: string;
        idNumber: string;
        kategori: string;
        jenisPengajuan: string;
        segmentasi: string;
        dataLengkap: Record<string, unknown>;
    }): Promise<Buffer> {
        const rawContext = this.prepareTemplateContext(data);
        const context = restoreBankingTermsInContext(rawContext);
        const dataLengkap = data.dataLengkap as Record<string, unknown>;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: 'FORMULIR PENGAJUAN BNI FLEKSI',
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Kategori: ${data.kategori.replace('_', ' ')}`,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: '' }),

                    // Section A: Identitas
                    new Paragraph({
                        text: 'A. DATA IDENTITAS',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    this.createDataRow('Nama Pemohon', data.applicantName),
                    this.createDataRow('NIK', data.idNumber),
                    this.createDataRow('Tanggal Lahir', context.tgl_lahir_pemohon_formatted as string || '-'),
                    this.createDataRow('Alamat', dataLengkap.alamat_ktp as string || '-'),
                    this.createDataRow('No. Telepon', dataLengkap.no_telepon as string || '-'),
                    new Paragraph({ text: '' }),

                    // Section B: Pekerjaan
                    new Paragraph({
                        text: 'B. DATA PEKERJAAN / PENSIUN',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    this.createDataRow('Segmentasi', data.segmentasi),
                    this.createDataRow('Jenis Pengajuan', formatJenisPengajuan(data.jenisPengajuan)),
                    this.createDataRow('Instansi', dataLengkap.instansi as string || '-'),
                    this.createDataRow('Golongan', dataLengkap.golongan as string || '-'),
                    new Paragraph({ text: '' }),

                    // Section E: Proposal Assessment
                    new Paragraph({
                        text: 'E. USULAN KREDIT',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    this.createDataRow('Budget Allocation', context.usulan_plafon_kredit_formatted as string || '-'),
                    this.createDataRow('Jangka Waktu', `${dataLengkap.usulan_jangka_waktu_bulan || '-'} bulan`),
                    this.createDataRow('Bunga', `${dataLengkap.usulan_bunga_persen || '-'}%`),
                    this.createDataRow('Angsuran/Bulan', context.angsuran_per_bulan_formatted as string || '-'),
                    new Paragraph({ text: '' }),

                    // Footer
                    new Paragraph({
                        text: `Dicetak pada: ${context.tanggal_cetak}`,
                        alignment: AlignmentType.RIGHT,
                    }),
                ],
            }],
        });

        return await Packer.toBuffer(doc) as Buffer;
    }

    /**
     * Create a simple row paragraph for document
     */
    private static createDataRow(label: string, value: string): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({ text: `${label}: `, bold: true }),
                new TextRun({ text: value || '-' }),
            ],
        });
    }

    /**
     * Get template path based on category
     * 
     * @param kategori - Client category
     * @returns Path to the template file
     */
    static getTemplatePath(kategori: string): string {
        const templateMap: Record<string, string> = {
            'PRAPURNA': 'template_prapurna.docx',
            'PURNA': 'template_purna.docx',
        };

        const filename = templateMap[kategori] || 'template_prapurna.docx';
        return path.join(process.cwd(), 'templates', filename);
    }

    /**
     * Check if template exists
     * 
     * @param kategori - Client category
     * @returns true if template file exists
     */
    static async templateExists(kategori: string): Promise<boolean> {
        try {
            const templatePath = this.getTemplatePath(kategori);
            await fs.access(templatePath);
            return true;
        } catch {
            return false;
        }
    }
}
