const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const path = require('path');

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
  
  const db = drizzle(pool);
  
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, 'src/backend/db/migrations'),
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
