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

set "NODE_OK=0"
if not "%NODE_PATH%"=="" (
    if exist "%NODE_PATH%\node.exe" set "NODE_OK=1"
)

if "%NODE_OK%"=="0" (
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Node.js portable tidak ditemukan, menggunakan system Node.js.
        set "NODE_OK=2"
    )
)

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PG_OK=0"
set "PG_CMD_PREFIX="
if exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    set "PG_OK=1"
    set "PG_CMD_PREFIX=%PGSQL_PATH%\bin\"
) else (
    where pg_ctl >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] PostgreSQL portable tidak ditemukan, menggunakan system PostgreSQL.
        set "PG_OK=2"
    )
)

if "%NODE_OK%"=="0" goto :run_setup
if "%PG_OK%"=="0" goto :run_setup
goto :tools_ok

:run_setup
echo.
echo [WARNING] Tools pendukung (Node.js atau PostgreSQL) tidak ditemukan!
set /p RUN_SETUP="Apakah Anda ingin menjalankan setup.bat untuk mengunduh tools? (Y/N): "
if /i "%RUN_SETUP%"=="Y" (
    call "%BASE_PATH%\setup.bat"
    echo.
    echo [INFO] Setup selesai. Silakan jalankan kembali run-app.bat.
    pause
    exit /b 0
) else (
    echo [ERROR] Tidak dapat menjalankan aplikasi tanpa Node.js dan PostgreSQL.
    pause
    exit /b 1
)

:tools_ok
if "%NODE_OK%"=="1" set "PATH=%NODE_PATH%;%PATH%"
if "%PG_OK%"=="1" set "PATH=%PGSQL_PATH%\bin;%PATH%"

if "%NODE_OK%"=="1" (echo [INFO] Menggunakan Node.js portable: %NODE_PATH%) else (echo [INFO] Menggunakan system Node.js)
if "%PG_OK%"=="1" (echo [INFO] Menggunakan PostgreSQL portable: %PGSQL_PATH%) else (echo [INFO] Menggunakan system PostgreSQL)
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
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :pg_running

echo [INFO] PostgreSQL tidak berjalan. Memulai PostgreSQL...
"%PG_CMD_PREFIX%pg_ctl.exe" start -D "%PGSQL_PATH%\data" -l "%PGSQL_PATH%\log.txt" -w -o "-p 5433"
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

REM ============ ENSURE NEXTAUTH_SECRET EXISTS ============
findstr /C:"NEXTAUTH_SECRET" "%BASE_PATH%\frontend\.env" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] NEXTAUTH_SECRET belum diset. Generating secret...
    for /f %%a in ('node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"') do set "SECRET=%%a"
    echo.>> "%BASE_PATH%\frontend\.env"
    echo # NextAuth.js Configuration>> "%BASE_PATH%\frontend\.env"
    echo NEXTAUTH_URL="http://localhost:3000">> "%BASE_PATH%\frontend\.env"
    echo NEXTAUTH_SECRET="%SECRET%">> "%BASE_PATH%\frontend\.env"
    echo [INFO] NEXTAUTH_SECRET berhasil di-generate dan ditambahkan ke .env
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
if %ERRORLEVEL% EQU 0 goto :migrate_done

echo [WARNING] Migration gagal. Mencoba db push sebagai fallback...
call npx prisma db push
if %ERRORLEVEL% EQU 0 goto :migrate_done

echo [ERROR] Database push juga gagal!
pause
exit /b 1

:migrate_done
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
    "%PG_CMD_PREFIX%pg_ctl.exe" stop -D "%PGSQL_PATH%\data" -m fast
    echo [INFO] PostgreSQL dihentikan.
)

echo.
echo [INFO] Aplikasi selesai.
pause
