#!/bin/bash

# Set UTF-8
export LANG=C.UTF-8

echo "================================================"
echo "  Nexa Assessment - Setup Environment (Linux/macOS)"
echo "================================================"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOOLS_DIR="$SCRIPT_DIR/tools"
DOWNLOADS_DIR="$TOOLS_DIR/downloads"

mkdir -p "$TOOLS_DIR"
mkdir -p "$DOWNLOADS_DIR"

NODE_OK=0
PG_OK=0

# 1. Cek Node.js
# Cek portable
NODE_PORTABLE_DIR=$(find "$TOOLS_DIR" -maxdepth 1 -type d -name "node-*" | head -n 1)
if [ -n "$NODE_PORTABLE_DIR" ] && [ -f "$NODE_PORTABLE_DIR/bin/node" ]; then
    NODE_OK=1
    export PATH="$NODE_PORTABLE_DIR/bin:$PATH"
    echo "[INFO] Node.js portable ditemukan di: $NODE_PORTABLE_DIR"
else
    # Cek system
    if command -v node >/dev/null 2>&1; then
        NODE_OK=2
        echo "[INFO] Node.js terdeteksi di system PATH ($(node -v))."
    fi
fi

# 2. Cek PostgreSQL
# Cek portable/system binaries (pg_ctl)
if command -v pg_ctl >/dev/null 2>&1; then
    PG_OK=2
    echo "[INFO] PostgreSQL (pg_ctl) terdeteksi di system PATH."
else
    # Cek jika ada pg_ctl di tools/pgsql/bin
    if [ -f "$TOOLS_DIR/pgsql/bin/pg_ctl" ]; then
        PG_OK=1
        export PATH="$TOOLS_DIR/pgsql/bin:$PATH"
        echo "[INFO] PostgreSQL portable ditemukan di tools/pgsql"
    fi
fi

# 3. Download Node.js jika tidak ada
if [ "$NODE_OK" -eq 0 ]; then
    echo "[INFO] Node.js tidak ditemukan. Mengunduh Node.js v24.16.0 LTS..."
    NODE_TAR="node-v24.16.0-linux-x64.tar.xz"
    NODE_URL="https://nodejs.org/dist/v24.16.0/$NODE_TAR"
    
    if [ ! -f "$DOWNLOADS_DIR/$NODE_TAR" ]; then
        echo "[INFO] Mengunduh $NODE_URL..."
        if command -v curl >/dev/null 2>&1; then
            curl -L -o "$DOWNLOADS_DIR/$NODE_TAR" "$NODE_URL"
        elif command -v wget >/dev/null 2>&1; then
            wget -O "$DOWNLOADS_DIR/$NODE_TAR" "$NODE_URL"
        else
            echo "[ERROR] curl atau wget tidak ditemukan. Silakan install salah satunya terlebih dahulu."
            exit 1
        fi
    else
        echo "[INFO] File cache $NODE_TAR ditemukan."
    fi
    
    # Verify SHA256
    NODE_EXPECTED_HASH="d804845d34eddc21dc1092b519d643ef40b1f58ec5dec5c22b1f4bd8fabde6c9"
    if command -v sha256sum >/dev/null 2>&1; then
        echo "$NODE_EXPECTED_HASH  $DOWNLOADS_DIR/$NODE_TAR" | sha256sum --check --status
        if [ $? -ne 0 ]; then
            echo "[ERROR] Checksum Node.js tidak cocok!"
            rm -f "$DOWNLOADS_DIR/$NODE_TAR"
            exit 1
        fi
        echo "[INFO] Verifikasi checksum Node.js sukses."
    elif command -v shasum >/dev/null 2>&1; then
        echo "$NODE_EXPECTED_HASH  $DOWNLOADS_DIR/$NODE_TAR" | shasum -a 256 -c --status
        if [ $? -ne 0 ]; then
            echo "[ERROR] Checksum Node.js tidak cocok!"
            rm -f "$DOWNLOADS_DIR/$NODE_TAR"
            exit 1
        fi
        echo "[INFO] Verifikasi checksum Node.js sukses."
    fi
    
    echo "[INFO] Mengekstrak Node.js ke $TOOLS_DIR..."
    tar -xf "$DOWNLOADS_DIR/$NODE_TAR" -C "$TOOLS_DIR"
    
    NODE_PORTABLE_DIR=$(find "$TOOLS_DIR" -maxdepth 1 -type d -name "node-*" | head -n 1)
    if [ -n "$NODE_PORTABLE_DIR" ] && [ -f "$NODE_PORTABLE_DIR/bin/node" ]; then
        export PATH="$NODE_PORTABLE_DIR/bin:$PATH"
        echo "[INFO] Node.js berhasil dipasang."
    else
        echo "[ERROR] Ekstraksi Node.js gagal."
        exit 1
    fi
fi

# 4. Memastikan PostgreSQL ada
if [ "$PG_OK" -eq 0 ]; then
    echo "[ERROR] PostgreSQL tidak ditemukan di sistem."
    echo "[INFO] Di Linux/macOS, disarankan menginstal PostgreSQL via package manager:"
    echo "       Ubuntu/Debian : sudo apt-get install postgresql"
    echo "       CentOS/RHEL   : sudo yum install postgresql-server"
    echo "       macOS (Homebrew): brew install postgresql"
    echo ""
    echo "[INFO] Setelah diinstal, pastikan perintah 'pg_ctl' atau 'initdb' tersedia di PATH."
    exit 1
fi

# 5. Inisialisasi Database
DATA_DIR="$TOOLS_DIR/pgsql/data"
if [ ! -d "$DATA_DIR" ]; then
    echo "[INFO] Menginisialisasi database PostgreSQL di $DATA_DIR..."
    initdb -D "$DATA_DIR" -U postgres -E UTF8 --locale=C
    if [ $? -ne 0 ]; then
        echo "[ERROR] Gagal menginisialisasi database!"
        exit 1
    fi
    
    # Konfigurasi port 5434 di postgresql.conf
    echo "port = 5434" >> "$DATA_DIR/postgresql.conf"
    
    # Konfigurasi pg_hba.conf
    echo "local    all             all                                     trust" > "$DATA_DIR/pg_hba.conf"
    echo "host     all             all             127.0.0.1/32            trust" >> "$DATA_DIR/pg_hba.conf"
    echo "host     all             all             ::1/128                 trust" >> "$DATA_DIR/pg_hba.conf"
else
    echo "[INFO] Direktori data PostgreSQL sudah ada."
fi

# 6. Jalankan PostgreSQL
echo "[INFO] Memeriksa status PostgreSQL..."
pg_isready -h localhost -p 5434 >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "[INFO] PostgreSQL sudah berjalan di port 5434."
else
    echo "[INFO] Memulai PostgreSQL di port 5434..."
    pg_ctl start -D "$DATA_DIR" -l "$TOOLS_DIR/pgsql/log.txt" -w -o "-p 5434"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Gagal memulai PostgreSQL!"
        echo "        Lihat log di: $TOOLS_DIR/pgsql/log.txt"
        exit 1
    fi
    echo "[INFO] PostgreSQL berhasil dimulai."
fi

# 7. Buat User & Database
echo "[INFO] Memeriksa user database..."
USER_EXISTS=$(psql -h localhost -p 5434 -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>/dev/null)
if [ "$USER_EXISTS" = "1" ]; then
    echo "[INFO] User 'nexa_user' sudah ada."
else
    echo "[INFO] Membuat user 'nexa_user'..."
    psql -h localhost -p 5434 -U postgres -c "CREATE USER nexa_user WITH PASSWORD 'nexa_password' CREATEDB;"
fi

DB_EXISTS=$(psql -h localhost -p 5434 -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='nexa_assessment'" 2>/dev/null)
if [ "$DB_EXISTS" = "1" ]; then
    echo "[INFO] Database 'nexa_assessment' sudah ada."
else
    echo "[INFO] Membuat database 'nexa_assessment'..."
    psql -h localhost -p 5434 -U postgres -c "CREATE DATABASE nexa_assessment OWNER nexa_user;"
fi

# 8. Setup .env
node "$SCRIPT_DIR/frontend/scripts/setup-env.js"

# 9. Install Dependencies & Migrate
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "[INFO] Menginstal dependencies (npm install)..."
    npm install
fi

echo "[INFO] Menjalankan database migration (Drizzle)..."
npx drizzle-kit migrate || npx drizzle-kit push

echo "[INFO] Menjalankan seed data..."
npm run db:seed

echo ""
echo "================================================"
echo "  Setup Lingkungan Aplikasi Selesai!"
echo "================================================"
echo ""
echo "  Untuk menjalankan aplikasi:"
echo "  1. Jalankan database: pg_ctl start -D $DATA_DIR -l $TOOLS_DIR/pgsql/log.txt -o \"-p 5434\""
echo "  2. Jalankan frontend: cd frontend && npm run dev"
echo ""
