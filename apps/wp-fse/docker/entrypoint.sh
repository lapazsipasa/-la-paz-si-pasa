#!/bin/bash
# Lleva el código horneado en /opt/wp-content al volumen /var/www/html en cada arranque.
# /var/www/html es un volumen con nombre y taparía cualquier COPY a su ruta final (ver f261ba3).
set -euo pipefail

sincronizar() {
    local origen="$1" destino="$2"
    # Un bind mount (local) es el checkout: borrarlo borraría el código del repo.
    if awk -v destino="$destino" '$5 == destino { montado = 1 } END { exit !montado }' /proc/self/mountinfo; then
        return
    fi
    mkdir -p "$(dirname "$destino")"
    rm -rf "$destino"
    cp -r "$origen" "$destino"
    chown -R www-data:www-data "$destino"
}

for origen in /opt/wp-content/themes/* /opt/wp-content/plugins/*; do
    [ -d "$origen" ] || continue
    sincronizar "$origen" "/var/www/html/wp-content/${origen#/opt/wp-content/}"
done
# Idiomas de plugins horneados: se copian archivo a archivo (la carpeta del volumen guarda además las
# traducciones que WordPress descargó). Nunca debe impedir el arranque: sin archivos, no se hace nada.
if [ -d /opt/wp-content/languages/plugins ]; then
    mkdir -p /var/www/html/wp-content/languages/plugins
    chown www-data:www-data /var/www/html/wp-content/languages /var/www/html/wp-content/languages/plugins
    for archivo in /opt/wp-content/languages/plugins/*; do
        [ -f "$archivo" ] || continue
        install -o www-data -g www-data -m 0644 "$archivo" "/var/www/html/wp-content/languages/plugins/${archivo##*/}" || true
    done
fi
for carpeta in mu-plugins scf-json scf-json-lapaz; do
    [ -d "/opt/wp-content/$carpeta" ] && sincronizar "/opt/wp-content/$carpeta" "/var/www/html/wp-content/$carpeta"
done

exec docker-entrypoint.sh "$@"
