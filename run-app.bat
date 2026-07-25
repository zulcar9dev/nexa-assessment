@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   App Nexa Assessment - Launcher
echo ================================================
echo.

set "BASE_PATH=%~dp0"
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

:detect_tools
set "NODE_OK=0"
set "NODE_PATH="
set "PG_OK=0"
set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
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

goto :tools_missing

:node_detected
if "%NODE_OK%"=="1" (
    echo [OK] Portable Node.js: %NODE_PATH%
    set "PATH=%NODE_PATH%;%PATH%"
) else (
    echo [OK] System Node.js ditemukan.
)

:: ===== Detect PostgreSQL =====
if exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    set "PG_OK=1"
    set "PG_CMD_PREFIX=%PGSQL_PATH%\bin\"
    goto :pg_detected
)

where pg_ctl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PG_OK=2"
    set "PG_CMD_PREFIX="
    goto :pg_detected
)

goto :tools_missing

:pg_detected
if "%PG_OK%"=="1" (
    echo [OK] Portable PostgreSQL: %PGSQL_PATH%
    set "PATH=%PGSQL_PATH%\bin;%PATH%"
) else (
    echo [OK] System PostgreSQL ditemukan.
)
goto :tools_ok

:tools_missing
echo.
echo [WARNING] Tools pendukung (Node.js atau PostgreSQL) tidak ditemukan!
set /p RUN_SETUP="Apakah Anda ingin menjalankan setup.bat untuk mengunduh/konfigurasi tools? (Y/N): "
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
echo.

:: ===== Check if Database Setup is needed =====
if "%PG_OK%"=="2" goto :skip_data_check

if not exist "%PGSQL_PATH%\data" (
    echo [INFO] Data directory PostgreSQL tidak ditemukan.
    echo [INFO] Menjalankan setup-db.bat untuk inisialisasi database...
    call "%BASE_PATH%\setup-db.bat"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Setup database gagal!
        pause
        exit /b 1
    )
)
:skip_data_check

:: ===== Start PostgreSQL if using Portable PG =====
echo [INFO] Memeriksa status PostgreSQL...
set "DB_PORT="

if "%PG_OK%"=="1" goto :start_portable_pg
if "%PG_OK%"=="2" goto :start_system_pg
goto :pg_done

:start_portable_pg
:: Cek apakah portable PG sudah berjalan di port 5434
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL portable sudah berjalan di port 5434.
    set "DB_PORT=5434"
    goto :pg_done
)

echo [INFO] PostgreSQL portable tidak berjalan. Memulai PostgreSQL di port 5434...
:: Hapus stale PID file jika ada (sisa dari crash/force-close sebelumnya)
if exist "%PGSQL_PATH%\data\postmaster.pid" (
    echo [INFO] Membersihkan stale postmaster.pid...
    del /f "%PGSQL_PATH%\data\postmaster.pid" >nul 2>&1
)
"%PG_CMD_PREFIX%pg_ctl.exe" start -D "%PGSQL_PATH%\data" -l "%PGSQL_PATH%\log.txt" -w -o "-p 5434"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal memulai PostgreSQL portable!
    echo [INFO] Periksa file log di: %PGSQL_PATH%\log.txt
    pause
    exit /b 1
)
echo [INFO] PostgreSQL portable berhasil dimulai di port 5434.
set "DB_PORT=5434"
goto :pg_done

:start_system_pg
:: Coba deteksi system PG di port 5432, 5433, lalu 5434
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5432 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5432"
    echo [OK] PostgreSQL system aktif di port 5432.
    goto :pg_done
)
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5433"
    echo [OK] PostgreSQL system aktif di port 5433.
    goto :pg_done
)
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_PORT=5434"
    echo [OK] PostgreSQL system aktif di port 5434.
    goto :pg_done
)

echo [WARNING] PostgreSQL system tidak aktif di port 5432, 5433, atau 5434!
echo [WARNING] Pastikan service PostgreSQL Anda sudah berjalan.
echo [INFO] Menggunakan port default 5432 sebagai fallback...
set "DB_PORT=5432"

:pg_done
echo.

:: ===== Verify Node.js =====
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

:: ===== Setup .env and BETTER_AUTH_SECRET =====
set "DB_PORT=%DB_PORT%"
node "%BASE_PATH%\frontend\scripts\setup-env.js"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal mengkonfigurasi file .env!
    pause
    exit /b 1
)

:: ===== Navigate to frontend =====
cd /d "%BASE_PATH%\frontend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Folder frontend tidak ditemukan!
    pause
    exit /b 1
)

echo [INFO] Berada di folder: %CD%
echo.

:: ===== Check if node_modules is complete =====
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

if "%NEED_INSTALL%"=="1" (
    echo [INFO] Menjalankan npm install untuk memperbaiki dependencies...
    echo [INFO] Proses ini mungkin memakan waktu beberapa menit...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install gagal!
        pause
        exit /b 1
    )
    echo.
)

:: ===== Migrate Legacy DB Schema =====
echo [INFO] Memeriksa migrasi dari database skema lama...
call npx ts-node --project tsconfig.scripts.json scripts/migrate-from-old-db.ts
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal melakukan migrasi database lama!
    pause
    exit /b 1
)

:: ===== Run migrations (Drizzle) =====
echo [INFO] Menjalankan database migration (Drizzle)...
call npx drizzle-kit migrate
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Migration gagal. Mencoba push database sebagai fallback...
    call npx drizzle-kit push
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Database push gagal!
        pause
        exit /b 1
    )
)
echo.

:: ===== Check if database needs seeding =====
echo [INFO] Memeriksa apakah database perlu di-seed...
call npx ts-node --project tsconfig.scripts.json scripts/check-seed.ts
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Database kosong atau belum di-seed. Menjalankan seed data awal...
    call npm run db:seed
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Seed gagal, tetapi aplikasi tetap bisa dijalankan.
    ) else (
        echo [INFO] Seed berhasil!
        echo.
        echo ================================================
        echo   Login Credentials:
        echo   Admin: admin@nexa.app / admin123
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

:: Ask to stop PostgreSQL if using portable PG
if not "%PG_OK%"=="1" goto :end_app
echo ================================================
set "STOP_PG=N"
set /p STOP_PG="Apakah ingin menghentikan PostgreSQL juga? (Y/N): "
if /i "%STOP_PG%"=="Y" (
    echo [INFO] Menghentikan PostgreSQL...
    "%PG_CMD_PREFIX%pg_ctl.exe" stop -D "%PGSQL_PATH%\data" -m fast
    echo [INFO] PostgreSQL dihentikan.
)
:end_app

echo.
echo [INFO] Aplikasi selesai.
pause


