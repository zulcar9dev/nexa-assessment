@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Restore - Nexa Assessment
echo ================================================
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

:: Configuration
set "DB_HOST=localhost"
set "DB_PORT=5434"
set "DB_NAME=nexa_assessment"
set "BACKUP_DIR=%BASE_PATH%\backups"

:: ===== Auto-Detect DB User =====
set "DB_USER=postgres"
"%PG_CMD_PREFIX%psql.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_USER=nexa_user"
    echo [INFO] Menggunakan user: nexa_user
) else (
    echo [INFO] User 'nexa_user' tidak ditemukan, menggunakan fallback: postgres
)

:: Check argument or list available backups
if "%~1"=="" (
    echo [INFO] Daftar file backup yang tersedia:
    echo.
    if not exist "%BACKUP_DIR%\*.sql" (
        echo   [KOSONG] Tidak ada file backup ditemukan di: %BACKUP_DIR%
        echo.
        echo   Letakkan file backup .sql di folder backups\ lalu jalankan kembali.
        echo   Atau jalankan: scripts\restore-db.bat nama_file.sql
        pause
        exit /b 1
    )
    set "COUNT=0"
    for %%F in ("%BACKUP_DIR%\*.sql") do (
        set /a COUNT+=1
        echo   - %%~nxF
    )
    echo.
    set /p BACKUP_FILENAME="Masukkan nama file backup (contoh: backup_20260616_1024.sql): "
) else (
    set "BACKUP_FILENAME=%~1"
)

set "BACKUP_FILE=%BACKUP_DIR%\%BACKUP_FILENAME%"

:: Verify file exists
if not exist "%BACKUP_FILE%" (
    echo [ERROR] File tidak ditemukan: %BACKUP_FILE%
    pause
    exit /b 1
)

echo.
echo [WARNING] PERHATIAN: Proses ini akan MENGHAPUS semua data yang ada
echo [WARNING] dan menggantinya dengan data dari file backup!
echo.
echo [INFO] File: %BACKUP_FILE%
echo [INFO] Database: %DB_NAME%
echo.
set /p CONFIRM="Lanjutkan? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [INFO] Restore dibatalkan.
    pause
    exit /b 0
)

:: Check if PostgreSQL is running
"%PG_CMD_PREFIX%pg_isready.exe" -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan run-app.bat terlebih dahulu, lalu buka terminal baru untuk restore.
    pause
    exit /b 1
)

:: Terminate existing connections
echo [INFO] Menutup koneksi database yang aktif...
"%PG_CMD_PREFIX%psql.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%DB_NAME%' AND pid <> pg_backend_pid();" >nul 2>&1

:: Drop and recreate database
echo [INFO] Menghapus database lama...
"%PG_CMD_PREFIX%dropdb.exe" -h %DB_HOST% -p %DB_PORT% -U postgres --if-exists %DB_NAME% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Gagal menghapus database, mencoba lanjut...
)

echo [INFO] Membuat database baru...
"%PG_CMD_PREFIX%createdb.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -O %DB_USER% %DB_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)

:: Restore from backup
echo [INFO] Memulai restore database...
"%PG_CMD_PREFIX%psql.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%" >nul 2>&1
if errorlevel 1 echo [WARNING] Restore selesai dengan beberapa warning (biasanya normal).
if not errorlevel 1 echo [INFO] Restore berhasil.

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
echo   Restore Database Selesai!
echo ================================================
echo.
echo   Database '%DB_NAME%' telah di-restore dari:
echo   %BACKUP_FILE%
echo.
echo   Jalankan run-app.bat untuk memulai aplikasi.
echo ================================================
echo.
pause

