#!/bin/sh
set -e

# Ensure storage and bootstrap/cache are writable by www-data
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Copy .env if not exists
if [ ! -f /var/www/html/.env ]; then
    echo "📋 Criando .env a partir do .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Generate app key if missing
php artisan key:generate --force --no-interaction || true

# Instalar dependências PHP se vendor estiver vazio (primeiro boot com named volume)
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    echo "📦 Instalando dependências PHP (primeiro boot)..."
    cd /var/www/html && composer install --no-interaction --prefer-dist \
        --optimize-autoloader || echo "⚠️ composer install falhou"
fi

# Wait for PostgreSQL to be fully ready before running migrations
echo "⏳ Aguardando banco de dados PostgreSQL estar pronto..."
MAX_TRIES=30
COUNT=0

until php -r '
try {
    $host = getenv("DB_HOST") ?: "postgres";
    $port = getenv("DB_PORT") ?: "5432";
    $db = getenv("DB_DATABASE") ?: "conta_na_massa";
    $user = getenv("DB_USERNAME") ?: "postgres";
    $pass = getenv("DB_PASSWORD") ?: "secret";
    $pdo = new PDO("pgsql:host={$host};port={$port};dbname={$db}", $user, $pass, [PDO::ATTR_TIMEOUT => 3]);
    exit(0);
} catch (Exception $e) {
    exit(1);
}
' 2>/dev/null; do
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        echo "⚠️ Não foi possível conectar ao banco após várias tentativas. Continuando..."
        break
    fi
    echo "Aguardando PostgreSQL inicializar ($COUNT/$MAX_TRIES)..."
    sleep 2
done

echo "✅ Conexão com banco de dados estabelecida! Executando migrations..."
php artisan migrate --force --no-interaction || true

# Build de assets frontend se necessário
if [ "${APP_BUILD_ASSETS}" = "true" ] || [ "${APP_ENV}" = "production" ]; then
    if [ ! -f /var/www/html/public/build/manifest.json ]; then
        echo "🏗️ Buildando assets frontend..."
        cd /var/www/html && npm run build || echo "⚠️ Build de assets falhou"
    else
        echo "✅ Assets já buildados, pulando npm run build"
    fi
fi

echo "🚀 Iniciando servidor backend do Conta na Massa..."
exec "$@"
