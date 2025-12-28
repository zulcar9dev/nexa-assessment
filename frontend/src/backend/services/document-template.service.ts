/**
 * Document Template Service
 * Handles DOCX document generation using docxtemplater
 * Configured for Jinja2-style delimiters ({{ variable }})
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { promises as fs } from 'fs';
import path from 'path';

// Indonesian month names
const BULAN_INDONESIA = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Kategori type - matches Prisma enum
type Kategori = 'PRAPURNA_REGULER' | 'PRAPURNA_TAKEOVER' | 'PURNA_REGULER' | 'PURNA_TAKEOVER';

interface SlikFacility {
    nama_bank: string;
    plafon_maks: string;
    outstanding: string;
    angsuran: string;
    kolektibilitas: string;
    is_takeover?: boolean;
    is_topup_lunas?: boolean;
}

interface DebiturData {
    namaPemohon: string;
    noKtp: string;
    kategori: string;
    jenisPengajuan: string;
    segmentasi: string;
    dataLengkap: Record<string, unknown>;
}

export class DocumentTemplateService {
    private static TEMPLATE_DIR = path.join(process.cwd(), 'templates');

    /**
     * Format date to Indonesian format: "28 Desember 2025"
     */
    static formatDateIndonesian(dateStr: string | undefined): string {
        if (!dateStr) return '';

        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;

            const day = date.getDate();
            const month = BULAN_INDONESIA[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    }

    /**
     * Format number to Indonesian currency: 1000000 -> "1.000.000"
     */
    static formatCurrency(value: string | number | undefined): string {
        if (value === null || value === undefined) return '0';

        const num = typeof value === 'string'
            ? parseInt(value.replace(/[^0-9]/g, ''), 10)
            : value;

        if (isNaN(num)) return '0';
        return Math.round(num).toLocaleString('id-ID');
    }

    /**
     * Format number with Rp prefix: 1000000 -> "Rp. 1.000.000"
     */
    static formatRupiah(value: string | number | undefined): string {
        const formatted = this.formatCurrency(value);
        return formatted === '0' ? '0' : formatted;
    }

    /**
     * Get template file path based on kategori
     */
    static getTemplatePath(kategori: Kategori): string {
        const templateMap: Record<Kategori, string> = {
            'PRAPURNA_REGULER': 'template_prapurna_reguler.docx',
            'PRAPURNA_TAKEOVER': 'template_prapurna_takeover.docx',
            'PURNA_REGULER': 'template_purna_reguler.docx',
            'PURNA_TAKEOVER': 'template_purna_takeover.docx',
        };

        const filename = templateMap[kategori] || 'template_prapurna_reguler.docx';
        return path.join(this.TEMPLATE_DIR, filename);
    }

    /**
     * Check if template file exists
     */
    static async templateExists(kategori: Kategori): Promise<boolean> {
        try {
            const templatePath = this.getTemplatePath(kategori);
            await fs.access(templatePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Map SLIK facilities to indexed fields (slik_bank_1, slik_bank_2, etc.)
     * Template uses indexed fields for each bank, up to 15 banks
     */
    static mapSlikToIndexedFields(slikFacilities: SlikFacility[]): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        // Map up to 15 SLIK facilities
        for (let i = 1; i <= 15; i++) {
            const facility = slikFacilities[i - 1];
            if (facility) {
                result[`slik_bank_${i}_nama`] = facility.nama_bank || '';
                result[`slik_bank_${i}_jenis`] = 'Konsumtif'; // Default type
                result[`slik_bank_${i}_maks`] = this.formatRupiah(facility.plafon_maks);
                result[`slik_bank_${i}_outs`] = this.formatRupiah(facility.outstanding);
                result[`slik_bank_${i}_coll`] = facility.kolektibilitas || '1';
                result[`slik_bank_${i}_angsuran`] = this.formatRupiah(facility.angsuran);
                result[`slik_bank_${i}_takeover`] = facility.is_takeover ? 'ya' : 'tidak';
                result[`slik_bank_${i}_alasan`] = facility.is_takeover ? 'Takeover' : '';
            } else {
                // Empty placeholders for unused slots
                result[`slik_bank_${i}_nama`] = '';
                result[`slik_bank_${i}_jenis`] = '';
                result[`slik_bank_${i}_maks`] = '';
                result[`slik_bank_${i}_outs`] = '';
                result[`slik_bank_${i}_coll`] = '';
                result[`slik_bank_${i}_angsuran`] = '';
                result[`slik_bank_${i}_takeover`] = '';
                result[`slik_bank_${i}_alasan`] = '';
            }
        }

        return result;
    }

    /**
     * Prepare template context from debitur data
     * Maps DebiturFormData fields to template placeholders
     */
    static prepareTemplateContext(debitur: DebiturData): Record<string, unknown> {
        const data = debitur.dataLengkap;
        const today = new Date();
        const slikFacilities = (data.slik_facilities as SlikFacility[]) || [];

        // Get penghasilan based on category (gaji for prapurna, pensiun for purna)
        let penghasilan = 0;
        const isPurna = debitur.kategori.includes('PURNA');

        if (isPurna) {
            // For Purna: use pensiun amount
            const pensiun1 = parseInt(String(data.pensiun_bulan_1_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            const pensiun2 = parseInt(String(data.pensiun_bulan_2_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            const pensiun3 = parseInt(String(data.pensiun_bulan_3_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            penghasilan = pensiun3 || pensiun2 || pensiun1;
        } else {
            // For Prapurna: use estimasi hak pensiun or gaji
            const gaji1 = parseInt(String(data.gaji_bulan_1_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            const gaji2 = parseInt(String(data.gaji_bulan_2_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            const gaji3 = parseInt(String(data.gaji_bulan_3_jumlah || 0).replace(/[^0-9]/g, ''), 10) || 0;
            penghasilan = gaji3 || gaji2 || gaji1;
        }

        const dsc90 = Math.round(penghasilan * 0.9);

        // Calculate total SLIK angsuran (excluding takeover/topup lunas)
        const totalAngsuranSlik = slikFacilities
            .filter(f => !f.is_takeover && !f.is_topup_lunas)
            .reduce((sum, f) => sum + (parseInt(String(f.angsuran).replace(/[^0-9]/g, ''), 10) || 0), 0);

        // Calculate maksimal angsuran
        const maksimalAngsuran = dsc90 - totalAngsuranSlik;

        // Parse usulan values
        const plafon = parseInt(String(data.usulan_plafon_kredit || 0).replace(/[^0-9]/g, ''), 10);
        const tenor = parseInt(String(data.usulan_jangka_waktu_bulan || 0), 10);
        const bunga = parseFloat(String(data.usulan_bunga_persen || 0));

        // Calculate angsuran using annuity formula
        const monthlyRate = bunga / 12 / 100;
        let angsuranKredit = 0;
        if (tenor > 0 && monthlyRate > 0) {
            angsuranKredit = Math.round(plafon * (monthlyRate * Math.pow(1 + monthlyRate, tenor)) / (Math.pow(1 + monthlyRate, tenor) - 1));
        } else if (tenor > 0) {
            angsuranKredit = Math.round(plafon / tenor);
        }

        // Calculate DSR
        const totalAngsuranBaru = totalAngsuranSlik + angsuranKredit;
        const dsr = penghasilan > 0 ? Math.round((totalAngsuranBaru / penghasilan) * 10000) / 100 : 0;

        // Calculate biaya
        const biayaProvisi = Math.round(plafon * 0.01);
        const biayaTatalaksana = Math.round(plafon * 0.02);

        // Base context
        const context: Record<string, unknown> = {
            // Date fields
            tgl_call_memo: this.formatDateIndonesian(today.toISOString()),
            tgl_slik: this.formatDateIndonesian(today.toISOString()),

            // Identitas
            nama_pemohon: debitur.namaPemohon || data.nama_pemohon || '',
            no_ktp: debitur.noKtp || data.no_ktp_pemohon || '',
            no_telepon: data.no_telepon || '',
            tgl_lahir: this.formatDateIndonesian(data.tgl_lahir_pemohon as string),
            alamat: data.alamat_ktp || data.alamat_domisili || '',
            alamat_ktp: data.alamat_ktp || '',
            alamat_domisili: data.alamat_domisili || '',
            status_rumah: data.status_rumah || '',
            lama_tinggal: data.lama_tinggal || '',
            status_perkawinan: data.status_perkawinan || '',

            // Pekerjaan/Pensiun
            segmentasi: (debitur.segmentasi || data.segmentasi || '').toString().toUpperCase(),
            jenis_pengajuan: (debitur.jenisPengajuan || data.jenis_pengajuan || '').toString().replace(/_/g, ' '),
            kategori: debitur.kategori.replace(/_/g, ' '),
            instansi: data.instansi || '',
            jabatan: data.jabatan || '',
            golongan: data.golongan || '',
            nip: data.nip || '',
            nopen: data.nopen || '',
            tgl_pensiun: this.formatDateIndonesian(data.tgl_pensiun_tmt as string || data.tgl_pensiun_pemohon as string),
            tgl_pensiun_tmt: this.formatDateIndonesian(data.tgl_pensiun_tmt as string),
            no_sk_pensiun: data.no_sk_pensiun || '',
            tgl_sk_pensiun: this.formatDateIndonesian(data.tgl_sk_pensiun as string),

            // Bank Pembayaran / Payroll
            nama_bank_pembayaran: data.nama_bank_pembayaran || '',
            payroll_bank: data.nama_bank_pembayaran || '',
            payroll_no_rek: data.payroll_no_rek || '',

            // Penghasilan - Gaji (Prapurna)
            gaji_bulan_1_nama: data.gaji_bulan_1_nama || '',
            gaji_bulan_1: this.formatRupiah(data.gaji_bulan_1_jumlah as string),
            gaji_bulan_2_nama: data.gaji_bulan_2_nama || '',
            gaji_bulan_2: this.formatRupiah(data.gaji_bulan_2_jumlah as string),
            gaji_bulan_3_nama: data.gaji_bulan_3_nama || '',
            gaji_bulan_3: this.formatRupiah(data.gaji_bulan_3_jumlah as string),
            estimasi_hak_pensiun: this.formatRupiah(data.estimasi_hak_pensiun as string),

            // Penghasilan - Pensiun (Purna)
            pensiun_bulan_1_nama: data.pensiun_bulan_1_nama || 'Januari',
            pensiun_bulan_1: this.formatRupiah(data.pensiun_bulan_1_jumlah as string),
            pensiun_bulan_2_nama: data.pensiun_bulan_2_nama || 'Februari',
            pensiun_bulan_2: this.formatRupiah(data.pensiun_bulan_2_jumlah as string),
            pensiun_bulan_3_nama: data.pensiun_bulan_3_nama || 'Maret',
            pensiun_bulan_3: this.formatRupiah(data.pensiun_bulan_3_jumlah as string),

            // SLIK
            fasilitas_nihil: data.fasilitas_nihil === 'ya' ? 'ya' : 'tidak',

            // RPC (Repayment Capacity) Calculations
            rpc_penghasilan: this.formatRupiah(penghasilan),
            rpc_dsc_90: this.formatRupiah(dsc90),
            rpc_total_angsuran_eksisting: this.formatRupiah(totalAngsuranSlik),
            rpc_maksimal_angsuran: this.formatRupiah(maksimalAngsuran),
            rpc_angsuran_diusulkan: this.formatRupiah(angsuranKredit),
            rpc_total_angsuran_baru: this.formatRupiah(totalAngsuranBaru),
            rpc_dsr: `${dsr}`,

            // Usulan Kredit
            plafon: this.formatRupiah(plafon),
            usulan_plafon: this.formatRupiah(plafon),
            tenor: tenor,
            tenor_bulan: `${tenor} Bulan`,
            usulan_jangka_waktu: `${tenor} Bulan`,
            bunga: `${bunga}`,
            bunga_persen: `${bunga}% p.a Efektif Anuitas`,

            // Biaya
            biaya_provisi: this.formatRupiah(biayaProvisi),
            biaya_tatalaksana: this.formatRupiah(biayaTatalaksana),

            // Tujuan
            tujuan_kredit: data.tujuan_kredit || 'Modal Usaha',
        };

        // Add indexed SLIK fields
        const slikFields = this.mapSlikToIndexedFields(slikFacilities);
        Object.assign(context, slikFields);

        return context;
    }

    /**
     * Generate document from template using docxtemplater
     * Configured with Jinja2-style delimiters {{ }}
     */
    static async generateFromTemplate(
        kategori: Kategori,
        debitur: DebiturData
    ): Promise<Buffer> {
        const templatePath = this.getTemplatePath(kategori);

        // Read template file
        const templateBuffer = await fs.readFile(templatePath);

        // Load template with PizZip
        const zip = new PizZip(templateBuffer);

        // Create docxtemplater instance with Jinja2-style delimiters
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            // Use Jinja2-style delimiters
            delimiters: {
                start: '{{',
                end: '}}',
            },
            // Handle undefined values - return empty string
            nullGetter: () => '',
        });

        // Prepare data context
        const context = this.prepareTemplateContext(debitur);

        // Render template with data
        doc.render(context);

        // Generate output buffer
        const outputBuffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        return outputBuffer as Buffer;
    }
}
