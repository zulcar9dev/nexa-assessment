@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Backup - Nexa Assessment
echo ================================================
echo.

set "BASE_PATH=%~dp0.."
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PG_CMD_PREFIX="

:: ===== Detect PostgreSQL =====
if exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    set "PATH=%PGSQL_PATH%\bin;%PATH%"
    set "PG_CMD_PREFIX=%PGSQL_PATH%\bin\"
) else (
    where pg_ctl >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] PostgreSQL portable tidak ditemukan, menggunakan system PostgreSQL.
        set "PG_CMD_PREFIX="
    ) else (
        echo [ERROR] PostgreSQL tidak ditemukan di: %PGSQL_PATH%\bin\ atau system PATH!
        pause
        exit /b 1
    )
)

:: Configuration
set "DB_HOST=localhost"
set "DB_PORT=5434"
set "DB_NAME=nexa_assessment"

:: ===== Auto-Detect DB User =====
set "DB_USER=postgres"
"%PG_CMD_PREFIX%psql.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" 2>nul | findstr "1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "DB_USER=nexa_user"
    echo [INFO] Menggunakan user: nexa_user
) else (
    echo [INFO] User 'nexa_user' tidak ditemukan, menggunakan fallback: postgres
)

:: Create backup directory
set "BACKUP_DIR=%BASE_PATH%\backups"
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo [INFO] Folder backup dibuat: %BACKUP_DIR%
)

:: Generate filename with timestamp (Locale-independent)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list 2^>nul') do set "DT=%%I"
if "%DT%"=="" (
    :: Fallback if wmic fails
    set "TIMESTAMP=backup"
) else (
    set "TIMESTAMP=%DT:~0,4%%DT:~4,2%%DT:~6,2%_%DT:~8,2%%DT:~10,2%"
)
set "BACKUP_FILE=backup_%TIMESTAMP%.sql"

echo [INFO] Database: %DB_NAME%
echo [INFO] File backup: %BACKUP_DIR%\%BACKUP_FILE%
echo.

:: Check if PostgreSQL is running
"%PG_CMD_PREFIX%pg_isready.exe" -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan! Jalankan run-app.bat terlebih dahulu.
    pause
    exit /b 1
)

:: Perform backup
echo [INFO] Memulai backup database...
"%PG_CMD_PREFIX%pg_dump.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --format=plain --no-owner --no-acl -f "%BACKUP_DIR%\%BACKUP_FILE%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backup gagal!
    pause
    exit /b 1
)

:: Show file size
for %%A in ("%BACKUP_DIR%\%BACKUP_FILE%") do set "FILE_SIZE=%%~zA"
echo.
echo ================================================
echo   Backup Berhasil!
echo ================================================
echo   File: %BACKUP_DIR%\%BACKUP_FILE%
echo   Size: %FILE_SIZE% bytes
echo.
echo   Untuk memindahkan ke PC lain:
echo   1. Copy file %BACKUP_FILE% ke PC tujuan
echo   2. Letakkan di folder backups\
echo   3. Jalankan scripts\restore-db.bat
echo ================================================
echo.
pause

