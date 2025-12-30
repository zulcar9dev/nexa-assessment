@echo off
echo ================================================
echo   App Kredit Konsumer BNI - Launcher
echo ================================================
echo.

REM Set paths
set "BASE_PATH=D:\01.PROJECT\aplikasi\BNI\app_kredit_konsumer_bni"
set "NODE_PATH=%BASE_PATH%\tools\node-v25.2.1-win-x64"
set "PGSQL_PATH=%BASE_PATH%\tools\pgsql"
set "PATH=%NODE_PATH%;%PGSQL_PATH%\bin;%PATH%"

echo [INFO] Menggunakan Node.js dari: %NODE_PATH%
echo [INFO] Menggunakan PostgreSQL dari: %PGSQL_PATH%
echo.

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

REM Navigate to frontend directory
cd /d "D:\01.PROJECT\aplikasi\BNI\app_kredit_konsumer_bni\frontend"
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

