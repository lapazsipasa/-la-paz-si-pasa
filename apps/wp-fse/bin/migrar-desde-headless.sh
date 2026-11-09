#!/bin/bash
# Copia el contenido del headless al sitio FSE cuando los dos corren en el MISMO servidor
# Dokploy: base de datos + uploads, de contenedor a contenedor, sin pasar por otra máquina.
#
# Se corre en el servidor (SSH), no dentro de un contenedor:
#   bash migrar-desde-headless.sh <appName del headless> <appName del FSE>
# Ejemplo (servidor 2.25.237.45, 2026-11-08):
#   bash migrar-desde-headless.sh compose-transmit-virtual-protocol-6qurgn compose-compress-back-end-array-fuf9qm
#
# El headless solo se LEE (mariadb-dump y tar), no se modifica. En el FSE corre lapaz-importar,
# que guarda antes un respaldo de su base en /tmp del contenedor.
set -euo pipefail

headless="${1:?Uso: migrar-desde-headless.sh <appName del headless> <appName del FSE>}"
fse="${2:?Uso: migrar-desde-headless.sh <appName del headless> <appName del FSE>}"
db="${headless}-db-1"
origen="${headless}-cms-1"
destino="${fse}-cms-1"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for c in "$db" "$origen" "$destino"; do
    docker inspect "$c" >/dev/null 2>&1 || { echo "No existe el contenedor $c" >&2; exit 1; }
done

echo "1/4 Exportando la base del headless ($db)…"
# shellcheck disable=SC2016 # Las variables se expanden dentro del contenedor, no aquí.
docker exec "$db" sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction "$MARIADB_DATABASE"' >"$tmp/headless.sql"

echo "2/4 Empaquetando los uploads del headless ($origen)…"
docker exec "$origen" sh -c 'cd /var/www/html/wp-content/uploads && tar -czf - .' >"$tmp/uploads.tar.gz"
ls -lh "$tmp"

echo "3/4 Copiando al FSE ($destino)…"
docker cp "$tmp/headless.sql" "$destino:/tmp/headless.sql"
docker cp "$tmp/uploads.tar.gz" "$destino:/tmp/uploads.tar.gz"
docker exec "$destino" chown www-data:www-data /tmp/headless.sql /tmp/uploads.tar.gz

echo "4/4 Importando (lapaz-importar)…"
docker exec -u www-data "$destino" lapaz-importar /tmp/headless.sql /tmp/uploads.tar.gz
docker exec "$destino" rm -f /tmp/headless.sql /tmp/uploads.tar.gz

echo
echo "Listo. Conteos en el FSE:"
# shellcheck disable=SC2016 # Código PHP: $t lo expande PHP, no el shell.
docker exec -u www-data "$destino" wp eval 'foreach(["retrato","video","feria","audio_relato","subcuenta","noticia"] as $t) echo $t,"=",wp_count_posts($t)->publish," "; echo "\n";'
