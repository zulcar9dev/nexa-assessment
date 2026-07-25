import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { execSync } from 'child_process';

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in the environment.');
  process.exit(1);
}

async function main() {
  console.log('🔄 Checking database for legacy schema to migrate...');
  
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Check if legacy "users" table exists
    const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const legacyExists = checkRes.rows[0].exists;
    if (!legacyExists) {
      console.log('✅ No legacy schema detected. Skipping migration.');
      return;
    }

    console.log('⚠️ Legacy schema detected! Preparing data migration...');

    // 1. Drop constraints and rename old tables to *_old
    console.log('📦 Renaming legacy tables...');
    
    // Check and drop any old primary keys and indexes to avoid name clashes
    await client.query('ALTER TABLE IF EXISTS "debiturs" DROP CONSTRAINT IF EXISTS "debiturs_user_id_fkey" CASCADE;');
    await client.query('ALTER TABLE IF EXISTS "documents" DROP CONSTRAINT IF EXISTS "documents_replaced_by_id_fkey" CASCADE;');
    await client.query('ALTER TABLE IF EXISTS "documents" DROP CONSTRAINT IF EXISTS "documents_uploaded_by_id_fkey" CASCADE;');
    
    await client.query('DROP TABLE IF EXISTS "users_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "debiturs_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "documents_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "templates_old" CASCADE;');

    await client.query('ALTER TABLE "users" RENAME TO "users_old";');
    if (await tableExists(client, 'debiturs')) {
      await client.query('ALTER TABLE "debiturs" RENAME TO "debiturs_old";');
    }
    if (await tableExists(client, 'documents')) {
      await client.query('ALTER TABLE "documents" RENAME TO "documents_old";');
    }
    if (await tableExists(client, 'templates')) {
      await client.query('ALTER TABLE "templates" RENAME TO "templates_old";');
    }

    // Drop old indexes
    await client.query('DROP INDEX IF EXISTS "users_email_key";');
    await client.query('DROP INDEX IF EXISTS "users_employee_id_key";');
    await client.query('DROP INDEX IF EXISTS "templates_kategori_key";');
    await client.query('DROP INDEX IF EXISTS "documents_judul_idx";');
    await client.query('DROP INDEX IF EXISTS "documents_kategori_idx";');
    await client.query('DROP INDEX IF EXISTS "documents_nomor_memo_idx";');
    await client.query('DROP INDEX IF EXISTS "documents_status_idx";');
    await client.query('DROP INDEX IF EXISTS "documents_target_market_idx";');

    // 2. Drop Drizzle history to force fresh table creations
    console.log('🧹 Clearing migration history...');
    await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE;');
    await client.query('DROP TABLE IF EXISTS public."__drizzle_migrations" CASCADE;');

    // 3. Run Drizzle Migrations
    console.log('🚀 Running Drizzle migrations to create new tables...');
    execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
    console.log('✅ New tables created successfully.');

    // 4. Migrate User and Account credentials (crucial for Better Auth login)
    console.log('👤 Migrating users & credentials...');
    
    // Copy users
    await client.query(`
      INSERT INTO "user" ("id", "name", "email", "email_verified", "role", "employee_id", "password", "created_at", "updated_at")
      SELECT "id", "name", "email", false, "role"::text, "employee_id", "password", "created_at", "updated_at"
      FROM "users_old"
      ON CONFLICT ("email") DO NOTHING;
    `);

    // Create credentials account inside the "account" table
    await client.query(`
      INSERT INTO "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
      SELECT "id" || '_credential', "email", 'credential', "id", "password", "created_at", "updated_at"
      FROM "users_old"
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 5. Migrate templates (if old exists)
    if (await tableExists(client, 'templates_old')) {
      console.log('📄 Migrating templates...');
      await client.query(`
        INSERT INTO "templates" ("id", "kategori", "name", "filename", "path", "updated_at")
        SELECT "id", "kategori"::text, "name", "filename", "path", "updated_at"
        FROM "templates_old"
        ON CONFLICT ("kategori") DO NOTHING;
      `);
    }

    // 6. Migrate documents (if old exists)
    if (await tableExists(client, 'documents_old')) {
      console.log('📂 Migrating documents...');
      await client.query(`
        INSERT INTO "documents" ("id", "judul", "nomor_memo", "kategori", "target_market", "status", "berlaku_mulai", "berlaku_akhir", "keywords", "filename", "filepath", "filesize", "version", "replaced_by_id", "uploaded_by_id", "created_at", "updated_at")
        SELECT "id", "judul", "nomor_memo", "kategori"::text, "target_market"::text, "status"::text, "berlaku_mulai", "berlaku_akhir", "keywords", "filename", "filepath", "filesize", "version", "replaced_by_id", "uploaded_by_id", "created_at", "updated_at"
        FROM "documents_old"
        ON CONFLICT ("id") DO NOTHING;
      `);
    }

    // 7. Migrate debiturs (if old exists)
    if (await tableExists(client, 'debiturs_old')) {
      console.log('💳 Migrating debiturs...');
      await client.query(`
        INSERT INTO "debiturs" ("id", "nama_pemohon", "no_ktp", "kategori", "jenis_pengajuan", "segmentasi", "data_lengkap", "created_at", "updated_at", "user_id")
        SELECT "id", "nama_pemohon", "no_ktp", "kategori"::text, "jenis_pengajuan"::text, "segmentasi"::text, "data_lengkap", "created_at", "updated_at", "user_id"
        FROM "debiturs_old"
        ON CONFLICT ("no_ktp", "jenis_pengajuan") WHERE status = 'SUBMITTED' DO NOTHING;
      `);
    }

    // 8. Clean up temp tables and legacy custom enum types
    console.log('🧹 Cleaning up temporary tables and custom enums...');
    await client.query('DROP TABLE IF EXISTS "users_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "debiturs_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "documents_old" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "templates_old" CASCADE;');

    // Drop legacy Prisma enums
    await client.query('DROP TYPE IF EXISTS public."Kategori" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."Role" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."JenisPengajuan" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."Segmentasi" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."KategoriDokumen" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."TargetMarket" CASCADE;');
    await client.query('DROP TYPE IF EXISTS public."StatusDokumen" CASCADE;');

    console.log('🎉 Database migration from legacy Prisma/NextAuth successfully finished!');

  } catch (error) {
    console.error('❌ Data migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function tableExists(client: Client, tableName: string): Promise<boolean> {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  return res.rows[0].exists;
}

main();
