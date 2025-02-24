import redis
import psycopg2
import os

# Configuração do Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6380)),
    db=0
)

# Configuração do PostgreSQL
def get_postgres_connection():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "projeto_db"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "admin_pass"),
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", 5433))
    )

