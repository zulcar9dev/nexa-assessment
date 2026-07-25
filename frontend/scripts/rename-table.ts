import { db } from '../src/backend/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE "debiturs" RENAME TO "clients"`);
    console.log('Renamed successfully');
  } catch (err) {
    console.error('Error renaming:', err);
  }
}
main();
