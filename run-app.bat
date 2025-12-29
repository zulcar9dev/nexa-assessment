@echo off
echo ================================================
echo   App Kredit Konsumer BNI - Launcher
echo ================================================
echo.

REM Set Node.js portable path
set "NODE_PATH=C:\Users\zulka\Documents\01. PROJECT\app_kredit_konsumer_bni\tools\node-v25.2.1-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

echo [INFO] Menggunakan Node.js dari: %NODE_PATH%
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
cd /d "C:\Users\zulka\Documents\01. PROJECT\app_kredit_konsumer_bni\frontend"
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

echo [INFO] Menjalankan aplikasi...
echo [INFO] Aplikasi akan berjalan di http://localhost:3000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
echo ================================================

call npm run dev

echo.
echo [INFO] Server berhenti.
pause
