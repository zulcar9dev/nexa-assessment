#!/bin/bash
# =================================================
# Database Backup Script - BNI Kredit Konsumer
# =================================================
# 
# Usage:
#   Manual: ./scripts/backup-db.sh
#   Cron:   0 2 * * * /var/www/bni-kredit-konsumer/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
#
# Prerequisites:
#   - PostgreSQL client (pg_dump)
#   - Write access to BACKUP_DIR
#   - Database credentials in environment or .pgpass file

set -euo pipefail

# ===================
# Configuration
# ===================
BACKUP_DIR="${BACKUP_DIR:-/var/backups/bni-kredit-konsumer}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-bni_kredit_konsumer}"
DB_USER="${DB_USER:-bni_user}"
KEEP_DAYS="${KEEP_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql.gz"

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

log "Starting database backup..."

# Create backup directory if not exists
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
fi

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    error_exit "pg_dump command not found. Please install PostgreSQL client."
fi

# Perform backup
log "Backing up database: $DB_NAME"
log "Backup file: $BACKUP_DIR/$BACKUP_FILE"

PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose 2>/dev/null | gzip > "$BACKUP_DIR/$BACKUP_FILE" \
    || error_exit "Backup failed"

# Verify backup file
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    error_exit "Backup file was not created"
fi

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
log "Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

# Remove old backups
log "Removing backups older than $KEEP_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +"$KEEP_DAYS" -delete -print | wc -l)
log "Deleted $DELETED_COUNT old backup(s)"

# List current backups
log "Current backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || log "No backups found"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "Total backup storage: $TOTAL_SIZE"

log "Backup process completed successfully!"
