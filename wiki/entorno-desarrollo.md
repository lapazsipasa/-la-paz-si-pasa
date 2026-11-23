# Entorno de desarrollo

Cómo se trabaja en La Paz Sí Pasa: máquina, servicios locales, agentes, herramientas y calidad. Sitio FSE en producción desde el 2026-11-09; entregas actuales en `feat/boletin-catalogo-fcp`.

## Máquina y herramientas base

| Herramienta | Versión | Uso |
|---|---|---|
| macOS | 26.6 | — |
| Docker Desktop | Docker 29.7, Compose 5.5 | todos los servicios y las herramientas de calidad corren en contenedores |
| Node | 24 en la máquina; 22.23.4 en contenedores y CI | Astro, Stylelint, ESLint, TypeScript y las pruebas E2E |
| Google Chrome | estable | pruebas E2E y visuales vía CDP (headless) |
| Orca | 1.4 | terminales, worktrees y paneles de agentes |
| Claude Code | 2.1 | agente principal (orquesta, integra y hace commit) y subagentes Sonnet/Opus (desarrollo y pruebas) |
| AGY (Antigravity CLI) | 1.5 | revisiones independientes de solo lectura y redacción |

PHP, Composer, wp-cli y los linters no se instalan en la máquina: van en imágenes Docker con versión fija.

## Servicios locales

| Servicio | URL | Cómo se levanta | Para qué |
|---|---|---|---|
| WordPress FSE (tema `lapaz`) | http://localhost:8090 | `cd apps/wp-fse && docker compose up -d --build` | desarrollo del sitio en producción |
| WordPress headless (respaldo) | http://localhost:8080 | `docker compose up -d cms db` (raíz) | respaldo sin tráfico; referencia histórica |
| Astro (respaldo) | http://localhost:4321 | `cd apps/frontend && npm ci && npx astro dev --port 4321` | referencia visual; sin WordPress usa los mocks |

Los dos WordPress son proyectos de compose separados (`lapaz-fse` y el de la raíz), con volúmenes, bases y puertos propios. Pueden correr a la vez.

### WordPress FSE, primera vez

```bash
cd apps/wp-fse
cp .env.example .env          # poner contraseñas de la base y WP_ADMIN_EMAIL
docker compose up -d --build  # compose.yaml + compose.override.yaml (local)
docker compose exec -u www-data cms lapaz-setup
docker compose exec -u www-data cms lapaz-setup --seed     # o configura y carga todo el seed de una vez
docker compose exec -u www-data cms lapaz-importar /tmp/dump.sql /tmp/uploads.tar.gz   # contenido real de otro WordPress (ver despliegue-fse.md)
```

- `lapaz-setup` es idempotente. Instala WordPress en español, activa el tema y crea la página "Proyectos destacados" y el menú "Principal". Solo en local agrega además Query Monitor y Create Block Theme.
- La contraseña de admin se genera una vez y se guarda en `apps/wp-fse/credenciales-local.txt`, que git ignora. Para cambiarla:

  ```bash
  docker compose exec -u www-data cms wp user update admin --user_pass='…'
  ```
- **Lo que solo existe en local** (`compose.override.yaml`):
  - puerto 8090;
  - bind mount del tema y de `mu-plugins/`, así lo editado se ve sin reconstruir;
  - `scf-json/` montado **solo lectura**: es compartido con el headless, y los cambios al modelo de contenido se hacen a propósito en el repo, no desde el admin;
  - `WP_DEBUG`;
  - `WP_DEVELOPMENT_MODE=theme`, para que WordPress no cachee `theme.json` ni las plantillas.
- **Producción (Dokploy)** usa solo `compose.yaml`: el tema va horneado en la imagen, sin puertos publicados. Ver [buenas prácticas, sección Dokploy](buenas-practicas-wordpress.md#7-despliegue-en-dokploy).

### Comandos útiles

```bash
cd apps/wp-fse
docker compose exec -u www-data cms wp …         # wp-cli (va dentro de la imagen)
docker compose logs -f cms                       # logs de Apache/PHP
docker compose -f compose.yaml up -d --build     # probar la imagen tal como la correría Dokploy
docker compose down                              # detener (los datos quedan en los volúmenes)
docker compose down -v                           # borrar también la base y uploads (WordPress en cero)
```

## Calidad: el criterio de "hecho"

```bash
apps/wp-fse/bin/check                              # 17 pasos de análisis estático, todo en Docker
cd apps/wp-fse && node tests/e2e/navbar.mjs        # comportamiento (con el stack en :8090)
cd apps/wp-fse && node tests/e2e/navbar.mjs --visual   # y comparación de píxeles con Astro
```

Suites e2e del sitio FSE (en `apps/wp-fse/tests/e2e/`): `navbar`, `retratos`, `layout`, `lo-que-hacemos`, `actualidad`, las cinco de `paisana-*`, `boletin`, `catalogo`, `historia`, `navegacion`, `seo`, `seguridad`, `rest` (sin Chrome) y `admin` (sin Chrome: abre las pantallas de edición con sesión de Editor y falla ante cualquier error fatal de PHP).

- **No ejecutar dos suites e2e a la vez** contra `:8090`: varias (`boletin`, `catalogo`, `historia`, `lo-que-hacemos`) crean, editan y borran entradas de prueba en la misma base local y chocan si corren en paralelo.
- Sin `bin/check` en verde no se cierra una etapa ni se abre un PR.
- **Manual del editor (Word y PDF):** se regenera con `apps/wp-fse/tools/manual/` desde `wiki/manual-editor.md` y el sitio local; salidas en `raw/manual-editor/` (fuera de git). Comandos en su `README.md`.
- La CI (`.github/workflows/wp-fse.yml`) corre `bin/check` y todas las suites e2e en secuencia.
- Las reglas se endurecen; nunca se relajan para que pase un cambio.
- Detalle de cada capa: [etapa 1.5](specs/wordpress-fse/etapa-1-5-calidad.md).

**Antes de retirar Astro**, se capturan sus bases visuales:

```bash
node tests/e2e/navbar.mjs --baseline http://127.0.0.1:4321
```

## Agentes

**Reparto vigente (desde el 2026-11-19):** el Claude principal orquesta (plan, contrato, briefs, integración y commits). El desarrollo y las pruebas van a subagentes Sonnet y Opus de Claude Code; las revisiones independientes de solo lectura y tareas acotadas de redacción van a AGY. Codex y Grok ya no se usan.

Cómo se delega, siempre en la misma ventana de Orca:

1. Se escribe el brief en un archivo del scratchpad: objetivo, archivos asignados sin solaparse, contrato con las otras piezas, y la regla de no hacer commit, push ni levantar/bajar Docker.
2. Para AGY (solo lectura del repo), se abre o reutiliza un panel dividido en Orca y se coordina con `orca orchestration` (TODO: verificar el comando).
3. Solo el Claude principal integra y hace commit cuando `bin/check` y las suites están en verde.
4. **Un solo proceso corre `bin/check` o suites e2e a la vez:** dos `bin/check` en paralelo chocan en `node_modules`, y dos suites e2e chocan en la base local.

No se usan otras pestañas ni worktrees para delegar, salvo que se pida.

### Skills

| Skill | Dónde | Para qué |
|---|---|---|
| `wp-block-development`, `wp-block-themes`, `wp-performance`, `wp-wpcli-and-ops`, `wp-project-triage` | `.claude/skills/` (oficiales de WordPress, no versionadas) | reglas actuales de bloques, temas, rendimiento y wp-cli |
| `project`, `documentador` | globales | flujo de rama → PR → merge y wiki del proyecto |
| `orca-cli` | global | terminales y paneles de agentes |
| `wordpress-scf-headless`, `astro-wordpress-headless` | `skills/` del repo | stack headless actual; la segunda se retira en la etapa 8 |

Para reinstalar las skills de WordPress:

```bash
npx skills add WordPress/agent-skills --skill wp-block-development wp-block-themes wp-performance wp-wpcli-and-ops wp-project-triage -a claude-code -y
```

### MCP y conectores

- **Dokploy MCP:** dominios, deploys, logs, volúmenes y backups. Se usa en la etapa de staging y cambio de dominio.
- **Claude in Chrome:** la extensión no estaba conectada el 2026-11-08. Las pruebas visuales usan Chrome headless por CDP (`tests/e2e/navbar.mjs`), que no depende de la extensión.
- **Se descartaron:** los MCP de WordPress (mcp-adapter, Playground). wp-cli por `docker compose exec` cubre lo mismo con menos riesgo.

## Despliegue

[despliegue-fse.md](despliegue-fse.md): servidores, servicio en Dokploy, primer arranque, migración del contenido real y cambio a producción. MCP propio del proyecto (key en el llavero del equipo).

## Documentación

- Todo vive en `wiki/` dentro de la rama: specs por etapa, decisiones, buenas prácticas y este archivo.
- Las decisiones se basan en la documentación oficial de WordPress, enlazada en [buenas-practicas-wordpress.md](buenas-practicas-wordpress.md).
- Se avanza etapa por etapa: documento de la etapa, aprobación, construcción, `bin/check` en verde, resultado documentado.

## Secretos

- `.env`, `.env.*` (menos `.env.example`), `credenciales*.txt` y `docs/` están en `.gitignore`. El repo es público.
- En Dokploy, los secretos van solo en las variables de entorno del servicio.
