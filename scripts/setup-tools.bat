@echo off
setlocal enabledelayedexpansion

set "BASE_PATH=%~dp0.."
set "TOOLS_DIR=%BASE_PATH%\tools"
set "DOWNLOADS_DIR=%TOOLS_DIR%\downloads"

:: Ensure directories exist
if not exist "%TOOLS_DIR%" (
    echo [INFO] Membuat direktori %TOOLS_DIR%...
    mkdir "%TOOLS_DIR%"
)
if not exist "%DOWNLOADS_DIR%" (
    echo [INFO] Membuat direktori %DOWNLOADS_DIR%...
    mkdir "%DOWNLOADS_DIR%"
)

:: ============ Node.js ============
set "NODE_VERSION=24.16.0"
set "NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%"
set "NODE_HASH=edaca9bd58ec8e92037dac4e877d52f6b8f430b81c18b57e264b4e2fb111cd56"
set "NODE_DEST=%TOOLS_DIR%\node-v%NODE_VERSION%-win-x64"

echo ==============================================
echo  Menyiapkan Node.js v%NODE_VERSION%
echo ==============================================

if exist "%NODE_DEST%\node.exe" (
    echo [OK] Portable Node.js sudah ter-install di %NODE_DEST%
    goto :setup_pgsql
)

:: Check if ZIP exists, if not download
if not exist "%DOWNLOADS_DIR%\%NODE_ZIP%" (
    echo [DOWNLOAD] Mengunduh Node.js dari %NODE_URL%...
    bitsadmin /transfer "NodeJS" /download /priority normal "%NODE_URL%" "%DOWNLOADS_DIR%\%NODE_ZIP%"
    if !ERRORLEVEL! neq 0 (
        echo [FALLBACK] bitsadmin gagal, mencoba certutil...
        certutil -urlcache -split -f "%NODE_URL%" "%DOWNLOADS_DIR%\%NODE_ZIP%"
    )
) else (
    echo [CACHE] Menggunakan cache ZIP: %NODE_ZIP%
)

:: Verify SHA256 hash
echo [INFO] Memverifikasi SHA256 checksum untuk %NODE_ZIP%...
set "TEMP_HASH_FILE=%TEMP%\node_hash.txt"
certutil -hashfile "%DOWNLOADS_DIR%\%NODE_ZIP%" SHA256 > "%TEMP_HASH_FILE%"
findstr /i "%NODE_HASH%" "%TEMP_HASH_FILE%" >nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Hash verification gagal untuk %NODE_ZIP%!
    del "%TEMP_HASH_FILE%" 2>nul
    del "%DOWNLOADS_DIR%\%NODE_ZIP%" 2>nul
    goto :error
)
del "%TEMP_HASH_FILE%" 2>nul
echo [OK] Verifikasi sukses! Checksum cocok.

:: Extract Node.js
echo [EXTRACT] Mengekstrak %NODE_ZIP% ke %TOOLS_DIR%...
tar -xf "%DOWNLOADS_DIR%\%NODE_ZIP%" -C "%TOOLS_DIR%"
if !ERRORLEVEL! neq 0 (
    echo [FALLBACK] tar gagal, menggunakan PowerShell untuk extract...
    powershell -Command "Expand-Archive -Path '%DOWNLOADS_DIR%\%NODE_ZIP%' -DestinationPath '%TOOLS_DIR%' -Force"
)

if not exist "%NODE_DEST%\node.exe" (
    echo [ERROR] Ekstraksi gagal - node.exe tidak ditemukan di %NODE_DEST%
    goto :error
)
echo [OK] Node.js berhasil di-install.

:setup_pgsql
:: ============ PostgreSQL ============
set "PG_VERSION=17.10-1"
set "PG_ZIP=postgresql-17.10-1-windows-x64-binaries.zip"
set "PG_URL=https://get.enterprisedb.com/postgresql/%PG_ZIP%"
set "PG_DEST=%TOOLS_DIR%\pgsql"

echo.
echo ==============================================
echo  Menyiapkan PostgreSQL v17.10
echo ==============================================

if exist "%PG_DEST%\bin\pg_ctl.exe" (
    echo [OK] Portable PostgreSQL sudah ter-install di %PG_DEST%
    goto :success
)

:: Check if ZIP exists, if not download
if not exist "%DOWNLOADS_DIR%\%PG_ZIP%" (
    echo [DOWNLOAD] Mengunduh PostgreSQL dari %PG_URL%...
    bitsadmin /transfer "PostgreSQL" /download /priority normal "%PG_URL%" "%DOWNLOADS_DIR%\%PG_ZIP%"
    if !ERRORLEVEL! neq 0 (
        echo [FALLBACK] bitsadmin gagal, mencoba certutil...
        certutil -urlcache -split -f "%PG_URL%" "%DOWNLOADS_DIR%\%PG_ZIP%"
    )
) else (
    echo [CACHE] Menggunakan cache ZIP: %PG_ZIP%
)


:: Extract PostgreSQL
echo [EXTRACT] Mengekstrak %PG_ZIP% ke %TOOLS_DIR%...
tar -xf "%DOWNLOADS_DIR%\%PG_ZIP%" -C "%TOOLS_DIR%"
if !ERRORLEVEL! neq 0 (
    echo [FALLBACK] tar gagal, menggunakan PowerShell untuk extract...
    powershell -Command "Expand-Archive -Path '%DOWNLOADS_DIR%\%PG_ZIP%' -DestinationPath '%TOOLS_DIR%' -Force"
)

if not exist "%PG_DEST%\bin\pg_ctl.exe" (
    echo [ERROR] Ekstraksi gagal - pg_ctl.exe tidak ditemukan di %PG_DEST%
    goto :error
)
echo [OK] PostgreSQL berhasil di-install.

:success
echo.
echo ==============================================
echo  Setup Tools Selesai dengan Sukses!
echo ==============================================
exit /b 0

:error
echo.
echo [ERROR] Setup tools gagal! Silakan periksa koneksi internet atau file ZIP secara manual.
exit /b 1
