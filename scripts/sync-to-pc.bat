@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Sinkronisasi Database - BNI Kredit Konsumer
echo ================================================
echo.
echo Script ini membantu memindahkan database dari
echo satu PC ke PC lainnya.
echo.

REM Set paths
set "BASE_PATH=%~dp0.."
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PATH=%PGSQL_PATH%\bin;%PATH%"
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

REM ============ EXPORT ============
:export_db
echo.
echo ================================================
echo   EXPORT Database
echo ================================================
echo.

REM Check PostgreSQL
"%PGSQL_PATH%\bin\pg_isready.exe" -h localhost -p 5432 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan run-app.bat terlebih dahulu di terminal lain.
    pause
    exit /b 1
)

REM Create backup dir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Generate filename
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "DDATE=%%c%%b%%a"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "TTIME=%%a%%b"
set "SYNC_FILE=sync_%DDATE%_%TTIME%.sql"

echo [INFO] Membackup database...
"%PGSQL_PATH%\bin\pg_dump.exe" -h localhost -p 5432 -U bni_user -d bni_kredit_konsumer --format=plain --no-owner --no-acl -f "%BACKUP_DIR%\%SYNC_FILE%"
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

REM ============ IMPORT ============
:import_db
echo.
echo ================================================
echo   IMPORT Database
echo ================================================
echo.

REM Check PostgreSQL
"%PGSQL_PATH%\bin\pg_isready.exe" -h localhost -p 5432 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan setup-db.bat terlebih dahulu jika ini PC baru.
    echo [INFO] Atau jalankan run-app.bat di terminal lain.
    pause
    exit /b 1
)

REM List available sync files
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
set /p SYNC_FILENAME="Masukkan nama file (contoh: sync_20260216_1030.sql): "

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

REM Terminate connections
echo [INFO] Menutup koneksi aktif...
"%PGSQL_PATH%\bin\psql.exe" -h localhost -p 5432 -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'bni_kredit_konsumer' AND pid <> pg_backend_pid();" >nul 2>&1

REM Drop and recreate
echo [INFO] Menghapus database lama...
"%PGSQL_PATH%\bin\dropdb.exe" -h localhost -p 5432 -U postgres --if-exists bni_kredit_konsumer 2>nul

echo [INFO] Membuat database baru...
"%PGSQL_PATH%\bin\createdb.exe" -h localhost -p 5432 -U postgres -O bni_user bni_kredit_konsumer
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)

REM Restore
echo [INFO] Mengimport data...
"%PGSQL_PATH%\bin\psql.exe" -h localhost -p 5432 -U bni_user -d bni_kredit_konsumer -f "%SYNC_FILE%" >nul 2>&1

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
