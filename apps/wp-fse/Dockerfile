FROM wordpress:7.1.3-php8.3-apache

# pipefail: si curl falla, la verificación de sha256 no debe pasar en silencio.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Cliente de MariaDB: lo usan wp db export/import (respaldos y lapaz-importar).
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# wp-cli guarda su caché en /tmp: el home de www-data (/var/www) no es escribible.
ENV WP_CLI_CACHE_DIR=/tmp/wp-cli-cache
# Config global de WP-CLI (mod_rewrite): sin ella, wp rewrite --hard deja .htaccess sin reglas.
ENV WP_CLI_CONFIG_PATH=/etc/wp-cli/config.yml
RUN curl -fsSL https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar -o /usr/local/bin/wp \
    && echo 'ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c  /usr/local/bin/wp' | sha256sum -c - \
    && chmod +x /usr/local/bin/wp

# Secure Custom Fields con versión fija: sin él no existe ningún CPT.
ARG SCF_VERSION=6.9.8
ARG SCF_SHA256=6decfa4414b2325f838b37f4910bc9c5dc5afb2e59651fb76317eb2a9bcdad6d
# El $ de php -r va entre comillas simples a propósito: es PHP, no shell.
# hadolint ignore=SC2016
RUN curl -fsSL "https://downloads.wordpress.org/plugin/secure-custom-fields.${SCF_VERSION}.zip" -o /tmp/scf.zip \
    && echo "${SCF_SHA256}  /tmp/scf.zip" | sha256sum -c - \
    && mkdir -p /opt/wp-content/plugins \
    && php -r '$z = new ZipArchive(); $z->open("/tmp/scf.zip") === true || exit(1); $z->extractTo("/opt/wp-content/plugins"); $z->close();' \
    && rm /tmp/scf.zip

# WP Super Cache con versión fija: caché de página (TTFB de 220–280 ms sin caché en el servidor).
# Solo se activa con WP_CACHE=true (ver compose.yaml y lapaz-setup).
ARG WPSC_VERSION=3.1.5
ARG WPSC_SHA256=5a1af59e8a8289083de64d28ded9fb1dfb56ee996d4a84d3ed1f76c5f2224eb6
# hadolint ignore=SC2016
RUN curl -fsSL "https://downloads.wordpress.org/plugin/wp-super-cache.${WPSC_VERSION}.zip" -o /tmp/wpsc.zip \
    && echo "${WPSC_SHA256}  /tmp/wpsc.zip" | sha256sum -c - \
    && php -r '$z = new ZipArchive(); $z->open("/tmp/wpsc.zip") === true || exit(1); $z->extractTo("/opt/wp-content/plugins"); $z->close();' \
    && rm /tmp/wpsc.zip

# The SEO Framework con versión fija: SEO editable por entrada (título, descripción, imagen para compartir).
ARG TSF_VERSION=5.2.1
ARG TSF_SHA256=9e18a34a4437ddf7ec5a6e1dea6d1e59408db6e59944b8fc672250b80fdbd3fa
# hadolint ignore=SC2016
RUN curl -fsSL "https://downloads.wordpress.org/plugin/autodescription.${TSF_VERSION}.zip" -o /tmp/tsf.zip \
    && echo "${TSF_SHA256}  /tmp/tsf.zip" | sha256sum -c - \
    && php -r '$z = new ZipArchive(); $z->open("/tmp/tsf.zip") === true || exit(1); $z->extractTo("/opt/wp-content/plugins"); $z->close();' \
    && rm /tmp/tsf.zip

# Traducción es_CO de The SEO Framework, guardada en el repo (ver LEEME.md): con DISALLOW_FILE_MODS WordPress
# no la baja solo y la construcción no debe depender de wordpress.org. El entrypoint la copia a wp-content/languages/plugins.
COPY apps/wp-fse/docker/languages/plugins/autodescription-es_CO.l10n.php apps/wp-fse/docker/languages/plugins/autodescription-es_CO.mo /opt/wp-content/languages/plugins/

COPY apps/wordpress/php/zz-opcache-overrides.ini /usr/local/etc/php/conf.d/
COPY apps/wp-fse/docker/apache/zz-lapaz-seguridad.conf /etc/apache2/conf-enabled/
# Sin cabecera X-Powered-By con la versión de PHP. Límites para uso editorial: fotos y MP4 livianos
# (el formulario de historias admite hasta 20 MB) dentro de los 512 MB del contenedor.
# WordPress no usa sesiones de PHP; las dos últimas líneas son defensa en profundidad.
RUN a2enmod headers \
    && printf '%s\n' \
        'expose_php = Off' \
        'display_errors = Off' \
        'log_errors = On' \
        'upload_max_filesize = 32M' \
        'post_max_size = 40M' \
        'memory_limit = 128M' \
        'max_execution_time = 60' \
        'session.cookie_httponly = 1' \
        'session.use_strict_mode = 1' \
        > /usr/local/etc/php/conf.d/zz-lapaz-seguridad.ini
# /var/www/html es un volumen: el entrypoint lleva el tema a su destino en cada arranque.
COPY apps/wordpress/themes/lapaz /opt/wp-content/themes/lapaz
COPY apps/wp-fse/mu-plugins /opt/wp-content/mu-plugins
# CPT y campos: los mismos JSON del headless, sin cambios.
COPY apps/wordpress/scf-json /opt/wp-content/scf-json
# Grupos de campos propios del sitio FSE (no compartidos con el headless).
COPY apps/wp-fse/scf-json /opt/wp-content/scf-json-lapaz
# Contenido inicial (fotos, audios, contenido.json) para seed.php.
COPY apps/wordpress/seed /opt/seed
COPY apps/wp-fse/docker/wp-cli.yml /etc/wp-cli/config.yml
COPY apps/wp-fse/docker/entrypoint.sh apps/wp-fse/docker/lapaz-setup apps/wp-fse/docker/lapaz-importar /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/lapaz-setup /usr/local/bin/lapaz-importar

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
