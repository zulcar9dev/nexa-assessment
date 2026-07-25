#!/bin/bash
# =================================================
# Database Restore Script - Nexa Assessment
# =================================================
# 
# Usage:
#   ./scripts/restore-db.sh /path/to/backup_20260129.sql
#
# CAUTION: This will DROP and recreate the database!

set -euo pipefail

# ===================
# Configuration
# ===================
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5434}"
DB_NAME="${DB_NAME:-nexa_assessment}"
DB_USER="${DB_USER:-nexa_user}"

# ===================
# Functions
# ===================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# ===================
# Main Script
# ===================

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql>"
    echo "Example: $0 /var/backups/nexa-assessment/backup_20260129_020000.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

log "==================================================="
log "Database Restore - Nexa Assessment"
log "==================================================="
log "Backup file: $BACKUP_FILE"
log "Target database: $DB_NAME"
log ""

# Confirmation
read -p "⚠️  WARNING: This will DROP and recreate the database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled."
    exit 0
fi

log "Starting restore process..."

# Drop connections to the database
log "Terminating existing connections..."
PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U postgres \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || true

# Drop and recreate database
log "Dropping database: $DB_NAME"
PGPASSWORD="${DB_PASSWORD:-}" dropdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U postgres \
    --if-exists \
    "$DB_NAME" || error_exit "Failed to drop database"

log "Creating database: $DB_NAME"
PGPASSWORD="${DB_PASSWORD:-}" createdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U postgres \
    -O "$DB_USER" \
    "$DB_NAME" || error_exit "Failed to create database"

# Restore from backup
log "Restoring from backup..."
cat "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --quiet || error_exit "Restore failed"

# Run legacy database migration if needed
log "Checking and running legacy database migration..."
cd "$(dirname "$0")/../frontend"
npx ts-node --project tsconfig.scripts.json scripts/migrate-from-old-db.ts || error_exit "Data migration failed"

log "==================================================="
log "✅ Database restore completed successfully!"
log "==================================================="
