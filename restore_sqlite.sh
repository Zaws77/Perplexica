bash
CopiarEditar
#!/bin/bash

# Diretório de backup
BACKUP_DIR="/Users/zaws/perplexica/backups"
CONTAINER_NAME="perplexica-perplexica-backend-1"
DB_PATH="/home/perplexica/data/db.sqlite"

# Pegar o backup mais recente
LAST_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sqlite | head -n 1)

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ Nenhum backup encontrado! Restauração abortada."
    exit 1
fi

# Copiar o backup para dentro do contêiner
docker cp "$LAST_BACKUP" "$CONTAINER_NAME:$DB_PATH"

echo "✅ Restauração concluída a partir do backup: $(basename "$LAST_BACKUP")"


