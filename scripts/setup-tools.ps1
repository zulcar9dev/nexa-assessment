[CmdletBinding()]
param (
    [switch]$DryRun,
    [switch]$Force
)

# Set UTF-8 Output
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Resolve-Path (Join-Path $ScriptPath "..")
$ToolsDir = Join-Path $ProjectRoot "tools"
$DownloadsDir = Join-Path $ToolsDir "downloads"

# Buat direktori jika belum ada
if (-not (Test-Path $ToolsDir)) {
    New-Item -ItemType Directory -Path $ToolsDir -Force | Out-Null
}
if (-not (Test-Path $DownloadsDir)) {
    New-Item -ItemType Directory -Path $DownloadsDir -Force | Out-Null
}

$NodeZipUrl = "https://nodejs.org/dist/v24.16.0/node-v24.16.0-win-x64.zip"
$NodeExpectedHash = "50c8227b233a7e0259e894565706857106093113840733d3c8091807665790a3"
$NodeZipName = "node-v24.16.0-win-x64.zip"
$NodeDestFolder = "node-v24.16.0-win-x64"

$PgZipUrl = "https://get.enterprisedb.com/postgresql/postgresql-17.10-1-windows-x64-binaries.zip"
$PgZipName = "postgresql-17.10-1-windows-x64-binaries.zip"
$PgDestFolder = "pgsql"

function Download-WithProgress {
    param (
        [string]$Url,
        [string]$DestPath
    )
    Write-Host "[INFO] Mengunduh $Url ..." -ForegroundColor Cyan
    Write-Host "[INFO] Menyimpan ke $DestPath ..." -ForegroundColor Gray
    
    # Simpan status progres asli
    $oldProgressPreference = $ProgressPreference
    # Matikan progres bar UI bawaan PowerShell untuk mempercepat download
    $ProgressPreference = 'SilentlyContinue'
    
    try {
        # Gunakan WebClient untuk men-download secara cepat
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $DestPath)
        Write-Host "[INFO] Unduhan selesai!" -ForegroundColor Green
    }
    catch {
        Write-Error "[ERROR] Gagal mengunduh file: $_"
        throw $_
    }
    finally {
        # Kembalikan status progres asli
        $ProgressPreference = $oldProgressPreference
    }
}

function Verify-FileHash {
    param (
        [string]$Path,
        [string]$ExpectedHash
    )
    Write-Host "[INFO] Memverifikasi SHA256 checksum untuk $Path..." -ForegroundColor Cyan
    $actualHash = (Get-FileHash -Path $Path -Algorithm SHA256).Hash.ToLower()
    if ($actualHash -eq $ExpectedHash.ToLower()) {
        Write-Host "[INFO] Verifikasi sukses! Checksum cocok." -ForegroundColor Green
        return $true
    } else {
        Write-Host "[ERROR] Verifikasi gagal! Checksum tidak cocok." -ForegroundColor Red
        Write-Host "        Diharapkan: $ExpectedHash" -ForegroundColor Yellow
        Write-Host "        Ditemukan : $actualHash" -ForegroundColor Yellow
        return $false
    }
}

function Setup-Tool {
    param (
        [string]$Name,
        [string]$Url,
        [string]$ZipName,
        [string]$DestFolder,
        [string]$ExpectedHash
    )

    $FolderFullPath = Join-Path $ToolsDir $DestFolder
    $ZipFullPath = Join-Path $DownloadsDir $ZipName

    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host " Menyiapkan $Name" -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow

    # Cek apakah folder tujuan sudah ada
    if ((Test-Path $FolderFullPath) -and -not $Force) {
        Write-Host "[INFO] Folder '$DestFolder' sudah ada di '$ToolsDir'." -ForegroundColor Green
        Write-Host "[INFO] Melewati download dan ekstraksi." -ForegroundColor Gray
        return
    }

    if ($DryRun) {
        Write-Host "[DRY RUN] Akan menyiapkan $Name dari $Url" -ForegroundColor Magenta
        return
    }

    # Cek apakah file zip sudah di-cache
    $needsDownload = $true
    if (Test-Path $ZipFullPath) {
        Write-Host "[INFO] ZIP cached ditemukan di $ZipFullPath" -ForegroundColor Green
        if ($ExpectedHash) {
            $isHashOk = Verify-FileHash -Path $ZipFullPath -ExpectedHash $ExpectedHash
            if ($isHashOk) {
                $needsDownload = $false
            } else {
                Write-Host "[WARNING] File ZIP cache rusak/tidak cocok. Mengunduh ulang..." -ForegroundColor Yellow
                Remove-Item $ZipFullPath -Force
            }
        } else {
            Write-Host "[INFO] PostgreSQL tidak diverifikasi via hash (opsional). Menggunakan cache." -ForegroundColor Gray
            $needsDownload = $false
        }
    }

    if ($needsDownload) {
        Download-WithProgress -Url $Url -DestPath $ZipFullPath
        if ($ExpectedHash) {
            $isHashOk = Verify-FileHash -Path $ZipFullPath -ExpectedHash $ExpectedHash
            if (-not $isHashOk) {
                throw "Verifikasi checksum untuk $Name gagal setelah download!"
            }
        }
    }

    # Ekstraksi ke folder tools/
    Write-Host "[INFO] Mengekstrak $ZipName ke $ToolsDir..." -ForegroundColor Cyan
    # Jika folder sudah ada (dari instalasi sebelumnya yang ingin dioverwrite), hapus dulu
    if (Test-Path $FolderFullPath) {
        Write-Host "[INFO] Menghapus folder lama: $FolderFullPath" -ForegroundColor Gray
        Remove-Item $FolderFullPath -Recurse -Force
    }

    # Gunakan Expand-Archive bawaan PowerShell
    try {
        Expand-Archive -Path $ZipFullPath -DestinationPath $ToolsDir -Force
        Write-Host "[INFO] Ekstraksi $Name selesai." -ForegroundColor Green
    }
    catch {
        Write-Error "[ERROR] Gagal mengekstrak $ZipName: $_"
        throw $_
    }
}

try {
    # 1. Setup Node.js
    Setup-Tool -Name "Node.js v24.16.0 LTS" -Url $NodeZipUrl -ZipName $NodeZipName -DestFolder $NodeDestFolder -ExpectedHash $NodeExpectedHash

    # 2. Setup PostgreSQL
    Setup-Tool -Name "PostgreSQL v17.10" -Url $PgZipUrl -ZipName $PgZipName -DestFolder $PgDestFolder -ExpectedHash $null
    
    Write-Host "`n==============================================" -ForegroundColor Green
    Write-Host " Setup Tools Selesai dengan Sukses!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
}
catch {
    Write-Host "`n[ERROR] Setup tools gagal: $_" -ForegroundColor Red
    exit 1
}
