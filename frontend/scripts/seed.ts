/**
 * Database Seed Script
 * Creates initial users and templates
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Local type definitions matching schema
type Role = 'ADMIN' | 'USER';
type Kategori = 'PRAPURNA_REGULER' | 'PRAPURNA_TAKEOVER' | 'PURNA_REGULER' | 'PURNA_TAKEOVER';

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@bni.co.id' },
        update: {},
        create: {
            email: 'admin@bni.co.id',
            employeeId: 'ADM001',
            password: adminPassword,
            name: 'Administrator',
            role: 'ADMIN' as Role,
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create regular user
    const userPassword = await hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@bni.co.id' },
        update: {},
        create: {
            email: 'user@bni.co.id',
            employeeId: 'USR001',
            password: userPassword,
            name: 'User Demo',
            role: 'USER' as Role,
        },
    });
    console.log('✅ Created regular user:', user.email);

    // Create default template records
    const templates: Array<{
        kategori: Kategori;
        name: string;
        filename: string;
        path: string;
    }> = [
            {
                kategori: 'PRAPURNA_REGULER',
                name: 'Template Prapurna Reguler',
                filename: 'template_prapurna_reguler.docx',
                path: 'templates/template_prapurna_reguler.docx',
            },
            {
                kategori: 'PRAPURNA_TAKEOVER',
                name: 'Template Prapurna Takeover',
                filename: 'template_prapurna_takeover.docx',
                path: 'templates/template_prapurna_takeover.docx',
            },
            {
                kategori: 'PURNA_REGULER',
                name: 'Template Purna Reguler',
                filename: 'template_purna_reguler.docx',
                path: 'templates/template_purna_reguler.docx',
            },
            {
                kategori: 'PURNA_TAKEOVER',
                name: 'Template Purna Takeover',
                filename: 'template_purna_takeover.docx',
                path: 'templates/template_purna_takeover.docx',
            },
        ];

    for (const template of templates) {
        await prisma.template.upsert({
            where: { kategori: template.kategori },
            update: {},
            create: template,
        });
        console.log('✅ Created template:', template.name);
    }

    // Create sample debitur data
    const sampleDebitur = await prisma.debitur.upsert({
        where: { id: 'sample-debitur-1' },
        update: {},
        create: {
            id: 'sample-debitur-1',
            namaPemohon: 'Budi Santoso',
            noKtp: '3275012345678901',
            kategori: 'PRAPURNA_REGULER',
            jenisPengajuan: 'BARU',
            segmentasi: 'TASPEN',
            dataLengkap: {
                nama_pemohon: 'Budi Santoso',
                no_ktp_pemohon: '3275012345678901',
                tgl_lahir_pemohon: '1970-05-15',
                jenis_kelamin: 'Laki-laki',
                alamat_ktp: 'Jl. Sudirman No. 123, Jakarta Selatan',
                no_telepon: '081234567890',
                segmentasi: 'taspen',
                jenis_pengajuan: 'baru',
                instansi: 'Kementerian Keuangan',
                golongan: 'IV/a',
                gaji_pokok: 8500000,
                tunjangan_istri: 850000,
                tunjangan_anak: 340000,
                total_penghasilan: 10000000,
                usulan_plafon_kredit: 200000000,
                usulan_jangka_waktu_bulan: 120,
                usulan_bunga_persen: 6.5,
            },
            userId: user.id,
        },
    });
    console.log('✅ Created sample debitur:', sampleDebitur.namaPemohon);

    console.log('\n🎉 Database seed completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@bni.co.id / admin123');
    console.log('   User:  user@bni.co.id / user123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
