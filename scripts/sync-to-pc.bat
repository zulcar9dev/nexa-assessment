@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Sinkronisasi Database - Nexa Assessment
echo ================================================
echo.
echo Script ini membantu memindahkan database dari
echo satu PC ke PC lainnya.
echo.

set "BASE_PATH=%~dp0.."
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

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

echo [ERROR] Node.js tidak ditemukan di: %BASE_PATH%\tools\ atau system PATH!
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
    set "PG_OK=2"
    set "PG_CMD_PREFIX="
    goto :pg_detected
)

echo [ERROR] PostgreSQL tidak ditemukan di: %PGSQL_PATH%\bin\ atau system PATH!
pause
exit /b 1

:pg_detected

set "BACKUP_DIR=%BASE_PATH%\backups"

echo Pilih operasi:
echo   1. EXPORT - Backup database dari PC ini (sumber)
echo   2. IMPORT - Restore database ke PC ini (tujuan)
echo.
set /p CHOICE="Pilihan (1/2): "

if "%CHOICE%"=="1" goto :export_db
if "%CHOICE%"=="2" goto :import_db
echo [ERROR] Pilihan tidak valid!
pause
exit /b 1

:: ============ EXPORT ============
:export_db
echo.
echo ================================================
echo   EXPORT Database
echo ================================================
echo.

:: Check PostgreSQL
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan run-app.bat terlebih dahulu di terminal lain.
    pause
    exit /b 1
)

:: ===== Auto-Detect DB User =====
set "DB_USER=postgres"
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5434 -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_USER=nexa_user"
    echo [INFO] Menggunakan user: nexa_user
) else (
    echo [INFO] User 'nexa_user' tidak ditemukan, menggunakan fallback: postgres
)

:: Create backup dir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate filename with timestamp (Locale-independent)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list 2^>nul') do set "DT=%%I"
if "%DT%"=="" (
    set "TIMESTAMP=sync"
) else (
    set "TIMESTAMP=%DT:~0,4%%DT:~4,2%%DT:~6,2%_%DT:~8,2%%DT:~10,2%"
)
set "SYNC_FILE=sync_%TIMESTAMP%.sql"

echo [INFO] Membackup database...
"%PG_CMD_PREFIX%pg_dump.exe" -h localhost -p 5434 -U %DB_USER% -d nexa_assessment --format=plain --no-owner --no-acl -f "%BACKUP_DIR%\%SYNC_FILE%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backup gagal!
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Export Berhasil!
echo ================================================
echo.
echo   File: %BACKUP_DIR%\%SYNC_FILE%
echo.
echo   Langkah selanjutnya:
echo   1. Copy file %SYNC_FILE% ke flashdisk / cloud
echo   2. Di PC tujuan, letakkan file di folder backups\
echo   3. Jalankan scripts\sync-to-pc.bat dan pilih IMPORT
echo ================================================
echo.
pause
exit /b 0

:: ============ IMPORT ============
:import_db
echo.
echo ================================================
echo   IMPORT Database
echo ================================================
echo.

:: Check PostgreSQL
"%PG_CMD_PREFIX%pg_isready.exe" -h localhost -p 5434 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan setup-db.bat terlebih dahulu jika ini PC baru.
    echo [INFO] Atau jalankan run-app.bat di terminal lain.
    pause
    exit /b 1
)

:: ===== Auto-Detect DB User =====
set "DB_USER=postgres"
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5434 -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_USER=nexa_user"
    echo [INFO] Menggunakan user: nexa_user
) else (
    echo [INFO] User 'nexa_user' tidak ditemukan, menggunakan fallback: postgres
)

:: List available sync files
if not exist "%BACKUP_DIR%" (
    echo [ERROR] Folder backups\ tidak ditemukan!
    echo [INFO] Buat folder backups\ dan letakkan file .sql di dalamnya.
    pause
    exit /b 1
)

echo [INFO] File backup/sync yang tersedia:
echo.
set "HAS_FILES=0"
for %%F in ("%BACKUP_DIR%\*.sql") do (
    set "HAS_FILES=1"
    echo   - %%~nxF
)

if "%HAS_FILES%"=="0" (
    echo   [KOSONG] Tidak ada file .sql di folder backups\
    echo.
    echo   Letakkan file export dari PC sumber ke folder:
    echo   %BACKUP_DIR%
    pause
    exit /b 1
)

echo.
set /p SYNC_FILENAME="Masukkan nama file (contoh: sync_20260616_1024.sql): "

set "SYNC_FILE=%BACKUP_DIR%\%SYNC_FILENAME%"
if not exist "%SYNC_FILE%" (
    echo [ERROR] File tidak ditemukan: %SYNC_FILE%
    pause
    exit /b 1
)

echo.
echo [WARNING] Data yang ada di database saat ini akan DIGANTI
echo [WARNING] dengan data dari file import!
echo.
set /p CONFIRM="Lanjutkan? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [INFO] Import dibatalkan.
    pause
    exit /b 0
)

:: Terminate connections
echo [INFO] Menutup koneksi aktif...
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5434 -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'nexa_assessment' AND pid <> pg_backend_pid();" >nul 2>&1

:: Drop and recreate
echo [INFO] Menghapus database lama...
"%PG_CMD_PREFIX%dropdb.exe" -h localhost -p 5434 -U postgres --if-exists nexa_assessment 2>nul

echo [INFO] Membuat database baru...
"%PG_CMD_PREFIX%createdb.exe" -h localhost -p 5434 -U postgres -O %DB_USER% nexa_assessment
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)

:: Restore
echo [INFO] Mengimport data...
"%PG_CMD_PREFIX%psql.exe" -h localhost -p 5434 -U %DB_USER% -d nexa_assessment -f "%SYNC_FILE%" >nul 2>&1

:: Run legacy database migration if needed
echo [INFO] Memeriksa migrasi dari database skema lama...
cd /d "%BASE_PATH%\frontend"
call npx ts-node --project tsconfig.scripts.json scripts/migrate-from-old-db.ts
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal melakukan migrasi database lama!
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Import Berhasil!
echo ================================================
echo.
echo   Database telah disinkronkan dari: %SYNC_FILENAME%
echo   Jalankan run-app.bat untuk memulai aplikasi.
echo ================================================
echo.
pause
exit /b 0


