const fs = require('fs');
const readline = require('readline');

async function convert() {
    const fileStream = fs.createReadStream('../backups/backup_20260720_1724.sql');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const outStream = fs.createWriteStream('../backups/restore_inserts.sql');
    
    let currentTable = null;
    let columns = [];

    for await (const line of rl) {
        if (line.startsWith('COPY ')) {
            // e.g. COPY public.debiturs (id, nama_pemohon, no_ktp) FROM stdin;
            const match = line.match(/^COPY (.*?) \((.*?)\) FROM stdin;/);
            if (match) {
                currentTable = match[1];
                columns = match[2].split(', ').map(c => c.trim());
                continue;
            }
        }

        if (currentTable) {
            if (line === '\\.') {
                currentTable = null;
                columns = [];
                continue;
            }

            // It's a data line, split by tab
            const values = line.split('\t').map(val => {
                if (val === '\\N') return 'NULL';
                // Escape single quotes
                return "'" + val.replace(/'/g, "''") + "'";
            });

            const insertStr = `INSERT INTO ${currentTable} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
            outStream.write(insertStr);
        }
    }
    
    outStream.end();
    console.log('Conversion complete. Saved to backups/restore_inserts.sql');
}

convert();
