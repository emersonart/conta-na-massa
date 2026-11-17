FROM php:8.3-apache

# Install system dependencies, PostgreSQL PHP extension, and Node.js
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd zip opcache \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiar configuração do Opcache (fix para lentidão em runtime — PHP compilará bytecode em memória)
COPY docker/backend/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Change DocumentRoot to /var/www/html/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application source code
COPY backend/ .

# Instalar dependências PHP no build-time (vendor fica na imagem, não no bind mount)
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Pré-instalar node_modules na imagem (I/O nativo Linux, sem bind mount overhead)
# node_modules no named volume do compose mascara o bind mount do host
RUN npm ci --prefer-offline 2>/dev/null || npm install

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Copy entrypoint script
COPY docker/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["apache2-foreground"]
