import { Client } from 'pg';

const connectionString = "postgresql://bni_user:bni_password@localhost:5434/bni_kredit_konsumer?schema=public";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. List all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("=== TABLES IN DB ===");
    console.log(tablesRes.rows.map(r => r.table_name).join(', '));

    // 2. Query users
    const usersRes = await client.query(`
      SELECT id, name, email, role FROM "user";
    `);
    console.log("\n=== USERS IN DATABASE ===");
    console.log(JSON.stringify(usersRes.rows, null, 2));

    // 3. Query distinct user_ids in debiturs
    const debiturUserIdsRes = await client.query(`
      SELECT DISTINCT user_id FROM debiturs;
    `);
    console.log("\n=== DISTINCT USER_IDS IN DEBITURS ===");
    console.log(JSON.stringify(debiturUserIdsRes.rows, null, 2));

    // 4. Query orphan user_ids (debiturs that point to non-existent users)
    const orphansRes = await client.query(`
      SELECT id, nama_pemohon, user_id 
      FROM debiturs 
      WHERE user_id NOT IN (SELECT id FROM "user");
    `);
    console.log("\n=== ORPHAN DEBITURS (NO MATCHING USER) ===");
    console.log(JSON.stringify(orphansRes.rows, null, 2));

  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    await client.end();
  }
}

main();
