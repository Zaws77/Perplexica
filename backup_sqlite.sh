#!/bin/bash

# Diretório de backup
BACKUP_DIR="/Users/zaws/perplexica/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="perplexica-perplexica-backend-1"
DB_PATH="/home/perplexica/data/db.sqlite"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Copiar o banco de dados do contêiner para o backup local
docker cp "$CONTAINER_NAME:$DB_PATH" "$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"

# Remover backups antigos (manter os últimos 5 backups)
#ls -t "$BACKUP_DIR"/db_backup_*.sqlite | tail -n +6 | xargs rm -f

echo "✅ Backup do SQLite concluído: db_backup_$TIMESTAMP.sqlite"

