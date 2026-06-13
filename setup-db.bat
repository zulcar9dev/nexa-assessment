@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Setup - BNI Kredit Konsumer
echo ================================================
echo.
echo Script ini akan menginisialisasi PostgreSQL dan database
echo untuk pertama kali di PC baru.
echo.

REM Set paths
set "BASE_PATH=%~dp0"
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "DATA_DIR=%PGSQL_PATH%\data"

REM ============ DETECT NODE.JS DYNAMICALLY ============
set "NODE_PATH="
for /d %%D in ("%BASE_PATH%\tools\node-*") do (
    set "NODE_PATH=%%D"
)
if "%NODE_PATH%"=="" (
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Node.js portable tidak ditemukan, menggunakan system Node.js.
    ) else (
        echo [ERROR] Folder Node.js tidak ditemukan di tools\node-* dan tidak terpasang di sistem!
        echo [INFO] Jalankan setup.bat terlebih dahulu untuk mengunduh tools yang diperlukan.
        pause
        exit /b 1
    )
) else (
    set "PATH=%NODE_PATH%;%PATH%"
)

REM ============ VALIDATE TOOLS EXIST ============
set "PG_CMD_PREFIX="
if exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    set "PATH=%PGSQL_PATH%\bin;%PATH%"
    set "PG_CMD_PREFIX=%PGSQL_PATH%\bin\"
) else (
    where pg_ctl >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] PostgreSQL portable tidak ditemukan, menggunakan system PostgreSQL.
    ) else (
        echo.
        echo [ERROR] PostgreSQL tidak ditemukan di: %PGSQL_PATH%\bin\ atau system PATH!
        echo [INFO] Jalankan setup.bat terlebih dahulu untuk mengunduh tools yang diperlukan.
        echo.
        pause
        exit /b 1
    )
)

REM ============ STEP 1: INIT DATA DIRECTORY ============
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

REM Configure pg_hba.conf for local trust authentication (Windows)
echo [INFO] Mengkonfigurasi autentikasi PostgreSQL...
echo # TYPE  DATABASE        USER            ADDRESS                 METHOD> "%DATA_DIR%\pg_hba.conf"
echo host    all             all             127.0.0.1/32            trust>> "%DATA_DIR%\pg_hba.conf"
echo host    all             all             ::1/128                 trust>> "%DATA_DIR%\pg_hba.conf"
echo [INFO] pg_hba.conf berhasil dikonfigurasi.

REM Configure postgresql.conf for port 5433
echo [INFO] Mengkonfigurasi PostgreSQL port 5433...
echo port = 5433>> "%DATA_DIR%\postgresql.conf"
echo.

REM ============ STEP 2: START POSTGRESQL ============
:start_pg
echo [INFO] Memeriksa status PostgreSQL...
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL sudah berjalan.
    goto :create_db
)

echo [INFO] Memulai PostgreSQL...
"%PG_CMD_PREFIX%pg_ctl.exe" start -D "%DATA_DIR%" -l "%PGSQL_PATH%\log.txt" -w -o "-p 5433"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal memulai PostgreSQL!
    echo [INFO] Cek log di: %PGSQL_PATH%\log.txt
    pause
    exit /b 1
)
echo [INFO] PostgreSQL berhasil dimulai.
echo.

REM ============ STEP 3: CREATE USER & DATABASE ============
:create_db
echo [INFO] Memeriksa user database...

REM Check if user exists
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5433 -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='bni_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] User 'bni_user' sudah ada.
) else (
    echo [INFO] Membuat user 'bni_user'...
    "%PG_CMD_PREFIX%psql.exe" -h localhost -p 5433 -U postgres -c "CREATE USER bni_user WITH PASSWORD 'bni_password' CREATEDB;"
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Gagal membuat user, mencoba lanjutkan...
    ) else (
        echo [INFO] User 'bni_user' berhasil dibuat.
    )
)

REM Check if database exists
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5433 -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='bni_kredit_konsumer'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Database 'bni_kredit_konsumer' sudah ada.
) else (
    echo [INFO] Membuat database 'bni_kredit_konsumer'...
    "%PG_CMD_PREFIX%psql.exe" -h localhost -p 5433 -U postgres -c "CREATE DATABASE bni_kredit_konsumer OWNER bni_user;"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Gagal membuat database!
        pause
        exit /b 1
    )
    echo [INFO] Database 'bni_kredit_konsumer' berhasil dibuat.
)
echo.

REM ============ STEP 4: SETUP .ENV ============
if not exist "%BASE_PATH%\frontend\.env" (
    if exist "%BASE_PATH%\frontend\.env.example" (
        echo [INFO] Menyalin .env.example ke .env...
        copy "%BASE_PATH%\frontend\.env.example" "%BASE_PATH%\frontend\.env" >nul
        echo [INFO] File .env berhasil dibuat.
    )
)
echo.

REM ============ STEP 5: INSTALL DEPENDENCIES ============
cd /d "%BASE_PATH%\frontend"

if not exist "node_modules" (
    echo [INFO] Menginstal dependencies (npm install)...
    echo [INFO] Proses ini mungkin memakan waktu beberapa menit...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install gagal!
        pause
        exit /b 1
    )
    echo.
)

REM ============ STEP 6: GENERATE PRISMA + MIGRATE ============
echo [INFO] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma generate gagal!
    pause
    exit /b 1
)

echo [INFO] Menjalankan database migration...
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Migration deploy gagal, mencoba db push...
    call npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Database push gagal!
        pause
        exit /b 1
    )
)
echo.

REM ============ STEP 7: SEED DATA ============
echo [INFO] Menjalankan seed data awal...
call npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Seed gagal (mungkin data sudah ada).
) else (
    echo [INFO] Seed berhasil!
)
echo.

echo ================================================
echo   Setup Database Selesai!
echo ================================================
echo.
echo   Database: bni_kredit_konsumer
echo   User:     bni_user
echo   Port:     5433
echo.
echo   Login Credentials:
echo   Admin: admin@bni.co.id / admin123
echo   User:  user@bni.co.id  / user123
echo.
echo   Jalankan run-app.bat untuk memulai aplikasi.
echo ================================================
echo.
pause
