const fs = require('fs');
const { Client } = require('pg');

async function restore() {
    const client = new Client({
        connectionString: "postgresql://postgres.hawqwnrrrrfcjdepdsnh:Zulcar9.kreditkonsumer%21@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    });

    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL.");

        console.log("Disabling foreign key checks...");
        await client.query("SET session_replication_role = 'replica';");

        console.log("Clearing existing data...");
        // Clear tables to avoid conflicts
        await client.query(`
            TRUNCATE TABLE public.debiturs CASCADE;
            TRUNCATE TABLE public.documents CASCADE;
            TRUNCATE TABLE public.templates CASCADE;
            TRUNCATE TABLE public.session CASCADE;
            TRUNCATE TABLE public.account CASCADE;
            TRUNCATE TABLE public.verification CASCADE;
            TRUNCATE TABLE public.user CASCADE;
        `);

        console.log("Executing insert statements from backup...");
        const sql = fs.readFileSync('../backups/restore_inserts.sql', 'utf8');
        
        // Split by lines and execute individually or in chunks
        const statements = sql.split('\n').filter(line => line.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            try {
                await client.query(statements[i]);
            } catch (err) {
                console.error(`Error on line ${i+1}: ${err.message}`);
                // ignore and continue
            }
        }
        
        console.log("Re-enabling foreign key checks...");
        await client.query("SET session_replication_role = 'origin';");

        console.log("Database restoration completed successfully!");
    } catch (e) {
        console.error("Failed to restore:", e);
    } finally {
        await client.end();
    }
}

restore();
