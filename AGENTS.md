# La Paz Sí Pasa
Sitio público en WordPress FSE (tema de bloques `lapaz`, con SCF), en producción desde 2026-11-09. El headless (WordPress + Astro 7) queda como respaldo, sin tráfico. El repo es público: no subas datos internos ni credenciales.

**Wiki:** [`wiki/index.md`](wiki/index.md) (estado, changelog, features, decisiones). Léela antes de una feature nueva. Entorno, agentes y calidad: [`wiki/entorno-desarrollo.md`](wiki/entorno-desarrollo.md).

## Stack

- Producción (FSE): WordPress con tema `lapaz`, en `apps/wp-fse/` y `apps/wordpress/themes/lapaz/`. Definiciones SCF en `apps/wp-fse/scf-json/` y, compartidas con el headless, en `apps/wordpress/scf-json/`.
- Respaldo (headless): Astro 7 + `@astrojs/node`, en `apps/frontend/`; WordPress + SCF en `apps/wordpress/`.
- Infra: Docker. `apps/wp-fse/compose.yaml` para Dokploy (producción); `docker-compose.yml` local y `compose.prod.yaml` del headless.

## Comandos

```bash
cd apps/frontend
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check
npm run build
npm test           # node --test test/*.test.mjs
# desde la raíz: WordPress en http://localhost:8080
docker compose up -d cms db
# migración FSE (rama feat/wordpress-fse): WordPress con tema lapaz en http://localhost:8090
cd apps/wp-fse && cp .env.example .env   # completar contraseñas y WP_ADMIN_EMAIL
docker compose up -d --build
docker compose exec -u www-data cms lapaz-setup --seed   # primer arranque (en producción ya instalada se bloquea salvo --forzar-seed)
docker compose exec -u www-data cms lapaz-importar /tmp/headless.sql /tmp/uploads.tar.gz   # contenido de producción, ver despliegue
docker run --rm -v "$PWD/../..":/app -w /app/apps/wp-fse composer:2 sh -c "composer install && vendor/bin/phpcs"
```

## Reglas

- Ponytail: el diff más pequeño que funcione.
- Los componentes solo reciben props de `adapters/contracts/`. Nada de `wp`, `acf` ni `mocks` en `components/`.
- Cada CPT nuevo: `post_type_<slug>.json` y `group_<slug>.json`. Si lo usan el headless y el FSE, en `apps/wordpress/scf-json/` (la imagen FSE lo copia), en el mismo cambio que el mapper y el adapter. Si es solo del FSE, en `apps/wp-fse/scf-json/`, en el mismo cambio que su bloque.
- `PUBLIC_SITE_URL` se hornea en el build: debe ser el dominio real.
- Tras cada deploy, comprobar el CMS (ver README, "Después de cada deploy").
- Secretos por entorno, nunca en el repo.
- Tema FSE: sigue [`wiki/buenas-practicas-wordpress.md`](wiki/buenas-practicas-wordpress.md). Un componente equivale a un bloque. `apps/wp-fse/bin/check` en verde antes de cerrar una etapa o abrir un PR. Nunca se relaja una regla para que pase.
- Despliegue del sitio FSE (Dokploy, servidores, `lapaz-importar`): [`wiki/despliegue-fse.md`](wiki/despliegue-fse.md).
