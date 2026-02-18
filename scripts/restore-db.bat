@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Database Restore - BNI Kredit Konsumer
echo ================================================
echo.

REM Set paths
set "BASE_PATH=%~dp0.."
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PATH=%PGSQL_PATH%\bin;%PATH%"

REM ============ VALIDATE TOOLS EXIST ============
if not exist "%PGSQL_PATH%\bin\pg_ctl.exe" (
    echo [ERROR] PostgreSQL binary tidak ditemukan di: %PGSQL_PATH%\bin\
    echo [INFO] Silakan copy folder 'pgsql' dari PC yang sudah memiliki tools.
    echo [INFO] Letakkan di: %BASE_PATH%\tools\pgsql\
    pause
    exit /b 1
)

REM Configuration
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "DB_NAME=bni_kredit_konsumer"
set "DB_USER=bni_user"
set "BACKUP_DIR=%BASE_PATH%\backups"

REM Check argument or list available backups
if "%~1"=="" (
    echo [INFO] Daftar file backup yang tersedia:
    echo.
    if not exist "%BACKUP_DIR%\backup_*.sql" (
        echo   [KOSONG] Tidak ada file backup ditemukan di: %BACKUP_DIR%
        echo.
        echo   Letakkan file backup .sql di folder backups\ lalu jalankan kembali.
        echo   Atau jalankan: scripts\restore-db.bat nama_file.sql
        pause
        exit /b 1
    )
    set "COUNT=0"
    for %%F in ("%BACKUP_DIR%\backup_*.sql") do (
        set /a COUNT+=1
        echo   - %%~nxF
    )
    echo.
    set /p BACKUP_FILENAME="Masukkan nama file backup (contoh: backup_20260216_1030.sql): "
) else (
    set "BACKUP_FILENAME=%~1"
)

set "BACKUP_FILE=%BACKUP_DIR%\%BACKUP_FILENAME%"

REM Verify file exists
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

REM Check if PostgreSQL is running
"%PGSQL_PATH%\bin\pg_isready.exe" -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL tidak berjalan!
    echo [INFO] Jalankan run-app.bat terlebih dahulu, lalu buka terminal baru untuk restore.
    pause
    exit /b 1
)

REM Terminate existing connections
echo [INFO] Menutup koneksi database yang aktif...
"%PGSQL_PATH%\bin\psql.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%DB_NAME%' AND pid <> pg_backend_pid();" >nul 2>&1

REM Drop and recreate database
echo [INFO] Menghapus database lama...
"%PGSQL_PATH%\bin\dropdb.exe" -h %DB_HOST% -p %DB_PORT% -U postgres --if-exists %DB_NAME% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Gagal menghapus database, mencoba lanjut...
)

echo [INFO] Membuat database baru...
"%PGSQL_PATH%\bin\createdb.exe" -h %DB_HOST% -p %DB_PORT% -U postgres -O %DB_USER% %DB_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)

REM Restore from backup
echo [INFO] Memulai restore database...
"%PGSQL_PATH%\bin\psql.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Restore selesai dengan beberapa warning (biasanya normal).
) else (
    echo [INFO] Restore berhasil.
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
