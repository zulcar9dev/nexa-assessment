const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const frontendDir = path.resolve(__dirname, '..');
const envPath = path.join(frontendDir, '.env');
const envExamplePath = path.join(frontendDir, '.env.example');
const envLocalPath = path.join(frontendDir, '.env.local');

console.log('[INFO] Menyiapkan file .env...');

// 1. Copy .env.example if .env does not exist
if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('[INFO] Menyalin .env.example ke .env...');
        fs.copyFileSync(envExamplePath, envPath);
    } else {
        console.error('[ERROR] .env.example tidak ditemukan!');
        process.exit(1);
    }
}

// 2. Read .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// 3. Auto-correct DATABASE_URL port based on DB_PORT env variable
const targetPort = process.env.DB_PORT || '5434';
console.log(`[INFO] Menggunakan port database: ${targetPort}`);

if (envContent.includes('DATABASE_URL')) {
    // Regex matches e.g. DATABASE_URL="postgresql://user:pass@localhost:5433/dbname" or similar
    const dbUrlRegex = /(DATABASE_URL\s*=\s*["']postgresql:\/\/[^@]+@localhost:)(\d+)([^"']*["'])/;
    if (dbUrlRegex.test(envContent)) {
        envContent = envContent.replace(dbUrlRegex, `$1${targetPort}$3`);
        console.log(`[INFO] Port DATABASE_URL diupdate ke ${targetPort}`);
    } else {
        // Fallback replacement if localhost port pattern is slightly different
        envContent = envContent.replace(
            /(DATABASE_URL\s*=\s*["']postgresql:\/\/[^:]+:[^@]+@localhost:)(\d+)([^"']*["'])/,
            `$1${targetPort}$3`
        );
    }
}

// 3b. Remove legacy Prisma ?schema=public parameter
if (envContent.includes('?schema=public')) {
    console.log('[INFO] Menghapus parameter legacy ?schema=public...');
    envContent = envContent.replace(/\?schema=public/g, '');
}

// 4. Clean up legacy NEXTAUTH_* variables
if (envContent.includes('NEXTAUTH_')) {
    console.log('[INFO] Membersihkan variabel NEXTAUTH legacy...');
    envContent = envContent.replace(/^NEXTAUTH_.*$/gm, '');
}

// 5. Ensure Better Auth configs exist in .env
if (!envContent.includes('BETTER_AUTH_SECRET')) {
    console.log('[INFO] Menambahkan konfigurasi Better Auth ke .env...');
    envContent += '\n# Better Auth Configuration\n';
    envContent += 'BETTER_AUTH_SECRET="change_this_secret_in_production"\n';
    envContent += 'BETTER_AUTH_URL="http://localhost:3000"\n';
    envContent += 'NEXT_PUBLIC_APP_URL="http://localhost:3000"\n';
}

// 6. Generate fresh secret if it is the placeholder
if (envContent.includes('change_this_secret_in_production')) {
    console.log('[INFO] Men-generate BETTER_AUTH_SECRET baru...');
    const secret = crypto.randomBytes(32).toString('hex');
    envContent = envContent.replace(/change_this_secret_in_production/g, secret);
}

// 7. Write back to .env
fs.writeFileSync(envPath, envContent, 'utf8');

// 8. Handle .env.local conflict (delete if it has mismatching database port or is legacy)
if (fs.existsSync(envLocalPath)) {
    const localContent = fs.readFileSync(envLocalPath, 'utf8');
    const localDbPortMatch = localContent.match(/localhost:(\d+)/);
    if (localDbPortMatch && localDbPortMatch[1] !== targetPort) {
        fs.unlinkSync(envLocalPath);
        console.log('[INFO] Menghapus .env.local yang tidak sinkron (port mismatch)');
    }
}

console.log('[OK] Konfigurasi .env selesai dengan sukses.');
process.exit(0);
