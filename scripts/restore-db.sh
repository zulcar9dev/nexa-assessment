#!/bin/bash
# =================================================
# Database Restore Script - BNI Kredit Konsumer
# =================================================
# 
# Usage:
#   ./scripts/restore-db.sh /path/to/backup_20260129.sql.gz
#
# CAUTION: This will DROP and recreate the database!

set -euo pipefail

# ===================
# Configuration
# ===================
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-bni_kredit_konsumer}"
DB_USER="${DB_USER:-bni_user}"

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
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 /var/backups/bni-kredit-konsumer/backup_20260129_020000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

log "==================================================="
log "Database Restore - BNI Kredit Konsumer"
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
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || true

# Drop and recreate database
log "Dropping database: $DB_NAME"
PGPASSWORD="${DB_PASSWORD:-}" dropdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --if-exists \
    "$DB_NAME" || error_exit "Failed to drop database"

log "Creating database: $DB_NAME"
PGPASSWORD="${DB_PASSWORD:-}" createdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    "$DB_NAME" || error_exit "Failed to create database"

# Restore from backup
log "Restoring from backup..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --quiet || error_exit "Restore failed"

log "==================================================="
log "✅ Database restore completed successfully!"
log "==================================================="
