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

import { db } from '../src/backend/db';
import { user } from '../src/backend/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.select({ count: sql<number>`count(*)` }).from(user);
    const count = Number(res[0]?.count || 0);
    if (count === 0) {
      console.log('NEED_SEED');
      process.exit(1); // Exit code 1 means needs seed
    } else {
      console.log(`DB_OK: ${count} users found`);
      process.exit(0); // Exit code 0 is success (no seed needed)
    }
  } catch (error) {
    console.error('Check seed error:', error);
    process.exit(1); // Fallback to 1 on connection or relation error
  }
}

main();
