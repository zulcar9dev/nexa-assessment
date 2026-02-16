@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Backup - BNI Kredit Konsumer
echo ================================================
echo.

REM Set paths
set "BASE_PATH=%~dp0.."
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PATH=%PGSQL_PATH%\bin;%PATH%"

REM Configuration
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "DB_NAME=bni_kredit_konsumer"
set "DB_USER=bni_user"

REM Create backup directory
set "BACKUP_DIR=%BASE_PATH%\backups"
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo [INFO] Folder backup dibuat: %BACKUP_DIR%
)

REM Generate filename with timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "DDATE=%%c%%b%%a"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "TTIME=%%a%%b"
set "BACKUP_FILE=backup_%DDATE%_%TTIME%.sql"

echo [INFO] Database: %DB_NAME%
echo [INFO] File backup: %BACKUP_DIR%\%BACKUP_FILE%
echo.

REM Check if PostgreSQL is running
"%PGSQL_PATH%\bin\pg_isready.exe" -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan! Jalankan run-app.bat terlebih dahulu.
    pause
    exit /b 1
)

REM Perform backup
echo [INFO] Memulai backup database...
"%PGSQL_PATH%\bin\pg_dump.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --format=plain --no-owner --no-acl -f "%BACKUP_DIR%\%BACKUP_FILE%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backup gagal!
    pause
    exit /b 1
)

REM Show file size
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
