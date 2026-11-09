# La Paz Sí Pasa

Sitio público en Astro 7 (SSR) que lee contenido de WordPress headless con SCF.
El repo es público: no subas datos internos ni credenciales.

**Wiki:** [`wiki/index.md`](wiki/index.md) (estado, changelog, features, decisiones). Léela antes de una feature nueva. Entorno, agentes y calidad: [`wiki/entorno-desarrollo.md`](wiki/entorno-desarrollo.md).

## Stack

- Frontend: Astro 7 + `@astrojs/node`, en `apps/frontend/`.
- CMS: WordPress + SCF, en `apps/wordpress/` (CPT y grupos en `scf-json/`).
- Infra: Docker. `docker-compose.yml` local, `compose.prod.yaml` para Dokploy.

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
docker compose exec -u www-data cms lapaz-setup --seed   # primer arranque: configura y carga el seed
docker compose exec -u www-data cms lapaz-importar /tmp/headless.sql /tmp/uploads.tar.gz   # contenido de producción, ver despliegue
docker run --rm -v "$PWD/../..":/app -w /app/apps/wp-fse composer:2 sh -c "composer install && vendor/bin/phpcs"
```

## Reglas

- Ponytail: el diff más pequeño que funcione.
- Los componentes solo reciben props de `adapters/contracts/`. Nada de `wp`, `acf` ni `mocks` en `components/`.
- Cada CPT nuevo: `post_type_<slug>.json` y `group_<slug>.json` en `apps/wordpress/scf-json/`, en el mismo cambio que el mapper y el adapter.
- `PUBLIC_SITE_URL` se hornea en el build: debe ser el dominio real.
- Tras cada deploy, comprobar el CMS (ver README, "Después de cada deploy").
- Secretos por entorno, nunca en el repo.
- Tema FSE: sigue [`wiki/buenas-practicas-wordpress.md`](wiki/buenas-practicas-wordpress.md). Un componente equivale a un bloque. `apps/wp-fse/bin/check` en verde antes de cerrar una etapa o abrir un PR. Nunca se relaja una regla para que pase.
- Despliegue del sitio FSE (Dokploy, servidores, `lapaz-importar`): [`wiki/despliegue-fse.md`](wiki/despliegue-fse.md).
