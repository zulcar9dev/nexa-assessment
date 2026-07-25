import { Client } from 'pg';

async function main() {
  console.log('Resetting database schema...');
  // Explicitly use the dev connection string with port 5433
  const connectionString = 'postgresql://bni_user:bni_password@localhost:5434/bni_kredit_konsumer';
  const client = new Client({ connectionString });
  
  await client.connect();
  
  try {
    await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE;');
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Database schema reset successful!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

main();
