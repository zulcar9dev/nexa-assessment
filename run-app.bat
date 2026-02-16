@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   App Kredit Konsumer BNI - Launcher
echo ================================================
echo.

REM Set paths (adjust to current directory)
set "BASE_PATH=%~dp0"
REM Remove trailing backslash
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

REM ============ DETECT NODE.JS DYNAMICALLY ============
set "NODE_PATH="
for /d %%D in ("%BASE_PATH%\tools\node-*") do (
    set "NODE_PATH=%%D"
)
if "%NODE_PATH%"=="" (
    echo [ERROR] Folder Node.js tidak ditemukan di tools\node-*
    echo [ERROR] Pastikan folder Node.js portable ada di dalam folder tools\
    pause
    exit /b 1
)

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PATH=%NODE_PATH%;%PGSQL_PATH%\bin;%PATH%"

echo [INFO] Menggunakan Node.js dari: %NODE_PATH%
echo [INFO] Menggunakan PostgreSQL dari: %PGSQL_PATH%
echo.

REM ============ CHECK IF FIRST RUN (NO DATA DIR) ============
if not exist "%PGSQL_PATH%\data" (
    echo [INFO] Data directory PostgreSQL tidak ditemukan.
    echo [INFO] Jalankan setup-db.bat terlebih dahulu untuk inisialisasi database.
    echo.
    echo [INFO] Menjalankan setup-db.bat...
    call "%BASE_PATH%\setup-db.bat"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Setup database gagal!
        pause
        exit /b 1
    )
)

REM ============ START POSTGRESQL ============
echo [INFO] Memeriksa status PostgreSQL...
"%PGSQL_PATH%\bin\pg_isready.exe" -h localhost -p 5432 >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :pg_running

echo [INFO] PostgreSQL tidak berjalan. Memulai PostgreSQL...
"%PGSQL_PATH%\bin\pg_ctl.exe" start -D "%PGSQL_PATH%\data" -l "%PGSQL_PATH%\log.txt" -w
if %ERRORLEVEL% NEQ 0 goto :pg_error
echo [INFO] PostgreSQL berhasil dimulai.
goto :pg_done

:pg_running
echo [INFO] PostgreSQL sudah berjalan.
goto :pg_done

:pg_error
echo [ERROR] Gagal memulai PostgreSQL!
pause
exit /b 1

:pg_done
echo.

REM Verify Node.js
echo [INFO] Memeriksa versi Node.js...
call node --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak ditemukan! Pastikan path sudah benar.
    pause
    exit /b 1
)

echo [INFO] Memeriksa versi npm...
call npm --version
echo.

REM ============ SETUP .ENV IF NOT EXISTS ============
if not exist "%BASE_PATH%\frontend\.env" (
    if exist "%BASE_PATH%\frontend\.env.example" (
        echo [INFO] File .env belum ada. Menyalin dari .env.example...
        copy "%BASE_PATH%\frontend\.env.example" "%BASE_PATH%\frontend\.env" >nul
        echo [INFO] File .env berhasil dibuat. Silakan sesuaikan jika diperlukan.
        echo.
    ) else (
        echo [WARNING] File .env dan .env.example tidak ditemukan!
        echo [WARNING] Buat file .env di folder frontend/ dengan konfigurasi database.
        pause
        exit /b 1
    )
)

REM Navigate to frontend directory
cd /d "%BASE_PATH%\frontend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Folder frontend tidak ditemukan!
    pause
    exit /b 1
)

echo [INFO] Berada di folder: %CD%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] node_modules tidak ditemukan. Menjalankan npm install...
    echo [INFO] Proses ini mungkin memakan waktu beberapa menit...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install gagal!
        pause
        exit /b 1
    )
    echo.
)

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma generate gagal!
    pause
    exit /b 1
)
echo.

REM ============ RUN DATABASE MIGRATION ============
echo [INFO] Menjalankan database migration...
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Migration gagal. Mencoba db push sebagai fallback...
    call npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Database push juga gagal!
        pause
        exit /b 1
    )
)
echo.

REM ============ CHECK IF DATABASE NEEDS SEEDING ============
echo [INFO] Memeriksa apakah database perlu di-seed...
call node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(c=>{if(c===0){console.log('NEED_SEED');process.exit(1)}else{console.log('DB_OK: '+c+' users found');process.exit(0)}}).catch(()=>{console.log('NEED_SEED');process.exit(1)})" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Database kosong. Menjalankan seed data awal...
    call npx prisma db seed
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Seed gagal, tetapi aplikasi tetap bisa dijalankan.
    ) else (
        echo [INFO] Seed berhasil!
        echo.
        echo ================================================
        echo   Login Credentials:
        echo   Admin: admin@bni.co.id / admin123
        echo   User:  user@bni.co.id  / user123
        echo ================================================
    )
    echo.
)

echo [INFO] Menjalankan aplikasi...
echo [INFO] Aplikasi akan berjalan di http://localhost:3000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
echo ================================================

call npm run dev

echo.
echo [INFO] Server berhenti.
echo.

REM Ask to stop PostgreSQL
echo ================================================
set /p STOP_PG="Apakah ingin menghentikan PostgreSQL juga? (Y/N): "
if /i "%STOP_PG%"=="Y" (
    echo [INFO] Menghentikan PostgreSQL...
    "%PGSQL_PATH%\bin\pg_ctl.exe" stop -D "%PGSQL_PATH%\data" -m fast
    echo [INFO] PostgreSQL dihentikan.
)

echo.
echo [INFO] Aplikasi selesai.
pause
