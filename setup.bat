@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   BNI Kredit Konsumer - Setup Environment
echo ================================================
echo.

set "BASE_PATH=%~dp0"
if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

set "NODE_OK=0"
set "PG_OK=0"

REM 1. Cek Node.js portable
for /d %%D in ("%BASE_PATH%\tools\node-*") do (
    if exist "%%D\node.exe" set "NODE_OK=1"
)

REM Cek Node.js system jika portable tidak ada
if "%NODE_OK%"=="0" (
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Node.js terdeteksi di system PATH.
        set "NODE_OK=2"
    )
)

REM 2. Cek PostgreSQL portable
if exist "%BASE_PATH%\tools\pgsql\bin\pg_ctl.exe" (
    set "PG_OK=1"
)

REM Cek PostgreSQL system jika portable tidak ada
if "%PG_OK%"=="0" (
    where pg_ctl >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] PostgreSQL terdeteksi di system PATH.
        set "PG_OK=2"
    )
)

REM 3. Jalankan setup-tools.ps1 jika ada tool yang kurang
if "%NODE_OK%"=="0" (
    echo [INFO] Node.js portable tidak ditemukan. Memulai proses download...
    goto :run_download
)
if "%PG_OK%"=="0" (
    echo [INFO] PostgreSQL portable tidak ditemukan. Memulai proses download...
    goto :run_download
)

echo [INFO] Semua tools (Node.js dan PostgreSQL) sudah tersedia.
goto :run_db_setup

:run_download
echo [INFO] Memanggil script PowerShell untuk mengunduh tools...
powershell -ExecutionPolicy Bypass -File "%BASE_PATH%\scripts\setup-tools.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal mengunduh dan menyiapkan tools!
    pause
    exit /b 1
)

:run_db_setup
echo.
echo [INFO] Menjalankan setup database...
call "%BASE_PATH%\setup-db.bat"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal menjalankan setup database!
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Setup Lingkungan Aplikasi Selesai!
echo ================================================
echo.
echo   Untuk menjalankan aplikasi, jalankan:
echo   run-app.bat
echo ================================================
echo.
pause
