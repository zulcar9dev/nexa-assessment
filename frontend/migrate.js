const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { readMigrationFiles } = require('drizzle-orm/migrator');
const path = require('path');

const MIGRATIONS_FOLDER = path.join(__dirname, 'src/backend/db/migrations');
const MIGRATIONS_SCHEMA = 'drizzle';
const MIGRATIONS_TABLE = '__drizzle_migrations';

async function tableExists(client, schema, table) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
    [schema, table]
  );
  return res.rowCount > 0;
}

// Seeding baseline: jika DB sudah memiliki skema (mis. dibuat via db:push / manual)
// tetapi tabel pelacakan migrasi kosong, tandai migrasi yang sudah ter-refleksi di DB
// sebagai "sudah diterapkan" agar migrator hanya menjalankan migrasi baru (delta).
async function seedBaselineIfNeeded(client, migrations) {
  const applied = await client.query(
    `SELECT COALESCE(MAX(created_at), 0)::bigint AS max_created FROM ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`
  );
  const baseline = Number(applied.rows[0].max_created);

  if (baseline > 0) {
    return; // sudah ada riwayat migrasi, biarkan migrator bekerja normal
  }

  const hasClients = await tableExists(client, 'public', 'clients');
  const hasDebiturs = await tableExists(client, 'public', 'debiturs');
  const hasAppSettings = await tableExists(client, 'public', 'app_settings');

  let appliedCount = 0;
  if (hasAppSettings) {
    appliedCount = migrations.length; // seluruh migrasi sudah ter-refleksi
  } else if (hasClients) {
    appliedCount = 3; // 0000, 0001, 0002 (rename debiturs -> clients)
  } else if (hasDebiturs) {
    appliedCount = 1; // hanya 0000
  }

  if (appliedCount > 0) {
    const lastApplied = migrations[appliedCount - 1];
    await client.query(
      `INSERT INTO ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} ("hash", "created_at") VALUES ($1, $2)`,
      [lastApplied.hash, lastApplied.folderMillis]
    );
    console.log(
      `✅ Baseline migrasi disesuaikan: ${appliedCount} migrasi sudah ter-refleksi di DB (dilanjutkan dari ${path.basename(MIGRATIONS_FOLDER)}).`
    );
  }
}

async function main() {
  console.log('⏳ Running database migrations...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set!');
    process.exit(1);
  }

  // Connection configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for secure connections (e.g. Railway, RDS)
    }
  });

  try {
    const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });

    // Pastikan schema & tabel pelacakan migrasi ada (dibuat migrator juga, tapi kita butuh sebelum seeding)
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${MIGRATIONS_SCHEMA}`);
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )`
    );

    await seedBaselineIfNeeded(pool, migrations);

    await migrate(drizzle(pool), {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
    console.log('✅ Database migrations applied successfully!');
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();