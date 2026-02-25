#!/bin/bash

# Database backup script for catalog_studio
# Usage: ./backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backup"
DB_NAME="catalog_studio_db"
DB_USER="catprocbase"
DB_PASS="6dl@bTfNIg7T"
DB_HOST="localhost"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql"

mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
else
    echo "Backup failed!"
    exit 1
fi
