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
for carpeta in mu-plugins scf-json scf-json-lapaz; do
    [ -d "/opt/wp-content/$carpeta" ] && sincronizar "/opt/wp-content/$carpeta" "/var/www/html/wp-content/$carpeta"
done

exec docker-entrypoint.sh "$@"
