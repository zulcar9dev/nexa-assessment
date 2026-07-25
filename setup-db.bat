@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Setup - Nexa Assessment
echo ================================================
echo.
echo Script ini akan menginisialisasi PostgreSQL dan database
echo untuk pertama kali di PC baru.
echo.

set "BASE_PATH=%~dp0"
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "DATA_DIR=%PGSQL_PATH%\data"
set "FRONTEND_PATH=%BASE_PATH%\frontend"

set "NODE_OK=0"
set "NODE_PATH="
set "PG_OK=0"
set "PG_CMD_PREFIX="

:: ===== Detect Node.js =====
for /d %%D in ("%BASE_PATH%\tools\node-*") do (
    if exist "%%D\node.exe" (
        set "NODE_PATH=%%D"
        set "NODE_OK=1"
        goto :node_detected
    )
)

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "NODE_OK=2"
    goto :node_detected
)

echo [ERROR] Folder Node.js tidak ditemukan di tools\node-* dan tidak terpasang di sistem!
echo [INFO] Jalankan setup.bat terlebih dahulu untuk mengunduh tools yang diperlukan.
pause
exit /b 1

:node_detected
if "%NODE_OK%"=="1" (
    set "PATH=%NODE_PATH%;%PATH%"
)

:: ===== Detect PostgreSQL =====
if exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    set "PG_OK=1"
    set "PATH=%PGSQL_PATH%\bin;%PATH%"
    set "PG_CMD_PREFIX=%PGSQL_PATH%\bin\"
    goto :pg_detected
)

where pg_ctl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL portable tidak ditemukan, menggunakan system PostgreSQL.
    set "PG_OK=2"
    set "PG_CMD_PREFIX="
    goto :pg_detected
)

echo [ERROR] PostgreSQL tidak ditemukan di: %PGSQL_PATH%\bin\ atau system PATH!
echo [INFO] Jalankan setup.bat terlebih dahulu untuk mengunduh tools yang diperlukan.
pause
exit /b 1

:pg_detected

:: ===== STEP 1: INIT DATA DIRECTORY =====
:: Skip data directory init if using system PostgreSQL (PG_OK=2)
if "%PG_OK%"=="2" goto :skip_initdb

if exist "%DATA_DIR%" (
    echo [INFO] Data directory sudah ada: %DATA_DIR%
    echo [INFO] Melewati inisialisasi...
    goto :start_pg
)

echo [INFO] Menginisialisasi PostgreSQL data directory...
echo [INFO] Path: %DATA_DIR%
echo.

"%PG_CMD_PREFIX%initdb.exe" -D "%DATA_DIR%" -U postgres -E UTF8 --locale=C
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal inisialisasi data directory!
    pause
    exit /b 1
)
echo [INFO] Data directory berhasil diinisialisasi.
echo.

echo [INFO] Mengkonfigurasi autentikasi PostgreSQL...
echo # TYPE  DATABASE        USER            ADDRESS                 METHOD> "%DATA_DIR%\pg_hba.conf"
echo host    all             all             127.0.0.1/32            trust>> "%DATA_DIR%\pg_hba.conf"
echo host    all             all             ::1/128                 trust>> "%DATA_DIR%\pg_hba.conf"
echo [INFO] pg_hba.conf berhasil dikonfigurasi.

echo [INFO] Mengkonfigurasi PostgreSQL port 5434...
echo port = 5434>> "%DATA_DIR%\postgresql.conf"
echo.

:start_pg
:: ===== STEP 2: START POSTGRESQL =====
echo [INFO] Memeriksa status PostgreSQL...
set "DB_PORT="

if "%PG_OK%"=="1" goto :setup_portable_pg
if "%PG_OK%"=="2" goto :setup_system_pg
goto :create_db

:setup_portable_pg
:: Cek apakah portable PG sudah berjalan di port 5434
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL portable sudah berjalan di port 5434.
    set "DB_PORT=5434"
    goto :create_db
)

echo [INFO] Memulai PostgreSQL portable di port 5434...
"%PG_CMD_PREFIX%pg_ctl.exe" start -D "%DATA_DIR%" -l "%PGSQL_PATH%\log.txt" -w -o "-p 5434"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal memulai PostgreSQL portable!
    echo [INFO] Cek log di: %PGSQL_PATH%\log.txt
    pause
    exit /b 1
)
echo [INFO] PostgreSQL portable berhasil dimulai di port 5434.
set "DB_PORT=5434"
goto :create_db

:setup_system_pg
:: Coba deteksi system PG di port 5432, 5433, lalu 5434
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5432 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5432"
    echo [OK] PostgreSQL system aktif di port 5432.
    goto :create_db
)
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5433"
    echo [OK] PostgreSQL system aktif di port 5433.
    goto :create_db
)
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5434"
    echo [OK] PostgreSQL system aktif di port 5434.
    goto :create_db
)

echo [WARNING] PostgreSQL system tidak aktif di port 5432, 5433, atau 5434!
echo [WARNING] Pastikan service PostgreSQL Anda sudah berjalan.
echo [INFO] Menggunakan port default 5432 sebagai fallback...
set "DB_PORT=5432"

:skip_initdb
echo [INFO] Menggunakan PostgreSQL system. Melewati inisialisasi data directory.
goto :start_pg

:create_db
:: ===== STEP 3: CREATE USER & DATABASE =====
echo [INFO] Memeriksa user database...

:: Check if user exists
"%PG_CMD_PREFIX%psql.exe" -h localhost -p %DB_PORT% -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] User 'nexa_user' sudah ada.
    goto :check_db
)

echo [INFO] Membuat user 'nexa_user'...
"%PG_CMD_PREFIX%psql.exe" -h localhost -p %DB_PORT% -U postgres -c "CREATE USER nexa_user WITH PASSWORD 'nexa_password' CREATEDB;"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Gagal membuat user, mencoba lanjutkan...
) else (
    echo [INFO] User 'nexa_user' berhasil dibuat.
)

:check_db
:: Check if database exists
"%PG_CMD_PREFIX%psql.exe" -h localhost -p %DB_PORT% -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='nexa_assessment'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Database 'nexa_assessment' sudah ada.
    goto :db_setup_done
)

echo [INFO] Membuat database 'nexa_assessment'...
"%PG_CMD_PREFIX%psql.exe" -h localhost -p %DB_PORT% -U postgres -c "CREATE DATABASE nexa_assessment OWNER nexa_user;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)
echo [INFO] Database 'nexa_assessment' berhasil dibuat.

:db_setup_done
echo.

:: ===== STEP 4: SETUP .ENV =====
set "DB_PORT=%DB_PORT%"
node "%FRONTEND_PATH%\scripts\setup-env.js"
if %ERRORLEVEL% EQU 0 goto :env_ok
echo [ERROR] Gagal mengkonfigurasi file .env!
pause
exit /b 1
:env_ok

:: ===== STEP 5: INSTALL DEPENDENCIES =====
cd /d "%FRONTEND_PATH%"

set "NEED_INSTALL=0"
if not exist "node_modules" (
    set "NEED_INSTALL=1"
    echo [INFO] Folder node_modules tidak ditemukan.
) else (
    if not exist "node_modules\pg" (
        set "NEED_INSTALL=1"
        echo [INFO] Package 'pg' tidak ditemukan di node_modules.
    )
    if not exist "node_modules\drizzle-orm" (
        set "NEED_INSTALL=1"
        echo [INFO] Package 'drizzle-orm' tidak ditemukan di node_modules.
    )
    if not exist "node_modules\next" (
        set "NEED_INSTALL=1"
        echo [INFO] Package 'next' tidak ditemukan di node_modules.
    )
)

if "%NEED_INSTALL%"=="0" goto :skip_npm_install

echo [INFO] Menginstal dependencies (npm install)...
echo [INFO] Proses ini mungkin memakan waktu beberapa menit...
call npm install
if %ERRORLEVEL% EQU 0 goto :skip_npm_install
echo [ERROR] npm install gagal!
pause
exit /b 1
:skip_npm_install

:: ===== STEP 5.5: MIGRATE LEGACY DB SCHEMA =====
echo [INFO] Memeriksa migrasi dari database skema lama...
call npx ts-node --project tsconfig.scripts.json scripts/migrate-from-old-db.ts
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal melakukan migrasi database lama!
    pause
    exit /b 1
)

:: ===== STEP 6: RUN DRIZZLE MIGRATIONS =====
echo [INFO] Menjalankan database migration (Drizzle)...
call npx drizzle-kit migrate
if %ERRORLEVEL% EQU 0 goto :migrations_ok

echo [WARNING] Migration deploy gagal, mencoba push database sebagai fallback...
call npx drizzle-kit push
if %ERRORLEVEL% EQU 0 goto :migrations_ok

echo [ERROR] Database push gagal!
pause
exit /b 1

:migrations_ok
echo.

:: ===== STEP 7: SEED DATA =====
echo [INFO] Menjalankan seed data awal...
call npm run db:seed
if %ERRORLEVEL% EQU 0 goto :seed_ok
echo [WARNING] Seed gagal (mungkin data sudah ada).
goto :seed_done
:seed_ok
echo [INFO] Seed berhasil!
:seed_done
echo.

echo ================================================
echo   Setup Database Selesai!
echo ================================================
echo.
echo   Database: nexa_assessment
echo   User:     nexa_user
echo   Port:     %DB_PORT%
echo.
echo   Login Credentials:
echo   Admin: admin@bni.co.id / admin123
echo   User:  user@bni.co.id  / user123
echo.
echo   Jalankan run-app.bat untuk memulai aplikasi.
echo ================================================
echo.
pause

