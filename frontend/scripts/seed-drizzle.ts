import * as fs from 'fs';
import * as path from 'path';

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const matched = trimmedLine.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (matched) {
      const key = matched[1];
      let value = (matched[2] || '').trim();
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  }
}

// Set BETTER_AUTH_URL if not set
if (!process.env.BETTER_AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.BETTER_AUTH_URL = process.env.NEXTAUTH_URL;
}

import { auth } from "../src/backend/lib/auth";
import { db } from "../src/backend/db";
import { user, template, client } from "../src/backend/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log('🌱 Starting Drizzle database seed...');
    console.log('DATABASE_URL:', JSON.stringify(process.env.DATABASE_URL));

    // 1. Check and Create Admin User
    const existingAdmin = await db.query.user.findFirst({
        where: eq(user.email, 'admin@nexa.app')
    });

    if (!existingAdmin) {
        const rawAdminPass = process.env.SEED_ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'admin123');
        if (!rawAdminPass) {
            throw new Error('SEED_ADMIN_PASSWORD harus diatur di environment variabel saat di production.');
        }
        
        console.log('Inserting admin user...');
        await auth.api.signUpEmail({
            body: {
                email: 'admin@nexa.app',
                password: rawAdminPass,
                name: 'Administrator',
                username: 'ADM001',
            }
        });
        
        // Set role to ADMIN
        await db.update(user)
            .set({ role: 'ADMIN' })
            .where(eq(user.email, 'admin@nexa.app'));
        console.log('✅ Created admin user: admin@nexa.app');
    } else {
        console.log('ℹ️ Admin user admin@nexa.app already exists. Skipping.');
    }

    // 2. Check and Create Regular User
    let demoUserId = '';
    const existingDemoUser = await db.query.user.findFirst({
        where: eq(user.email, 'user@nexa.app')
    });

    if (!existingDemoUser) {
        const rawUserPass = process.env.SEED_USER_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'user123');
        if (!rawUserPass) {
            throw new Error('SEED_USER_PASSWORD harus diatur di environment variabel saat di production.');
        }
        
        console.log('Inserting regular user...');
        await auth.api.signUpEmail({
            body: {
                email: 'user@nexa.app',
                password: rawUserPass,
                name: 'User Demo',
                username: 'USR001',
            }
        });
        
        // Get the created normal user id
        const createdUser = await db.query.user.findFirst({
            where: eq(user.email, 'user@nexa.app')
        });
        if (!createdUser) throw new Error('User demo not found after creation');
        demoUserId = createdUser.id;
        console.log('✅ Created regular user: user@nexa.app');
    } else {
        demoUserId = existingDemoUser.id;
        console.log('ℹ️ Regular user user@nexa.app already exists. Skipping.');
    }

    // 3. Check and Create Templates
    const templates = [
        {
            id: 'template-type_c-id',
            kategori: 'AKTIF' as 'AKTIF',
            name: 'Template Aktif',
            filename: 'template_type_c.docx',
            path: 'templates/template_type_c.docx',
        },
        {
            id: 'template-type_a-id',
            kategori: 'PRAPURNA' as 'PRAPURNA',
            name: 'Template Pratype_b',
            filename: 'template_type_a.docx',
            path: 'templates/template_type_a.docx',
        },
        {
            id: 'template-type_b-id',
            kategori: 'PURNA' as 'PURNA',
            name: 'Template Purna',
            filename: 'template_type_b.docx',
            path: 'templates/template_type_b.docx',
        },
    ];

    for (const t of templates) {
        const existingTemplate = await db.query.template.findFirst({
            where: eq(template.kategori, t.kategori)
        });
        if (!existingTemplate) {
            await db.insert(template).values(t);
            console.log('✅ Created template:', t.name);
        } else {
            console.log(`ℹ️ Template for category ${t.kategori} already exists. Skipping.`);
        }
    }

    // 4. Check and Create Sample Client
    const existingDebitur = await db.query.client.findFirst({
        where: eq(client.id, 'sample-debitur-1')
    });

    if (!existingDebitur && demoUserId) {
        await db.insert(client).values({
            id: 'sample-debitur-1',
            applicantName: 'Budi Santoso',
            idNumber: '3275012345678901',
            kategori: 'PRAPURNA',
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
            userId: demoUserId,
        });
        console.log('✅ Created sample client: Budi Santoso');
    } else {
        console.log('ℹ️ Sample client sample-debitur-1 already exists or no demo user available. Skipping.');
    }

    console.log('\n🎉 Database seed process completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@nexa.app / (SEED_ADMIN_PASSWORD or admin123)');
    console.log('   User:  user@nexa.app / (SEED_USER_PASSWORD or user123)');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    });
