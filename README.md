# La Paz Sí Pasa

Sitio público de [lapazsipasa.com](https://lapazsipasa.com), hecho en WordPress
con un tema de bloques (FSE) propio, `lapaz`. Desde el 9 de noviembre de 2026
WordPress sirve el sitio completo: el contenido y las secciones se editan desde
el editor de WordPress.

Antes el sitio era Astro con WordPress headless. Ese código sigue en el
repositorio (`apps/frontend/`, `compose.prod.yaml`) como respaldo, hasta que se
retire.

## Estructura

```text
apps/wordpress/themes/lapaz/  tema de bloques: theme.json, plantillas, bloques
apps/wordpress/scf-json/      tipos de contenido y campos (SCF)
apps/wp-fse/                  WordPress del sitio: Dockerfile, compose, mu-plugins,
                              scripts (lapaz-setup, lapaz-importar) y pruebas
apps/frontend/                Astro del sitio anterior (headless)
compose.prod.yaml             despliegue del sitio anterior
wiki/                         estado, decisiones y guías del proyecto
```

## Desarrollo local

```sh
cd apps/wp-fse
cp .env.example .env        # completar contraseñas y WP_ADMIN_EMAIL
docker compose up -d --build
docker compose exec -u www-data cms lapaz-setup --seed
```

WordPress queda en http://localhost:8090. `lapaz-setup --seed` activa el tema y
SCF, crea la portada y el menú y carga el contenido de ejemplo.

## Verificación

```sh
apps/wp-fse/bin/check
```

`bin/check` corre PHPCS, PHPStan, Stylelint, ESLint, la validación de esquemas
y plantillas, ShellCheck, Hadolint y Semgrep. Las pruebas e2e están en
`apps/wp-fse/tests/e2e/`. CI corre lo mismo en `.github/workflows/wp-fse.yml`.

## Despliegue

Dokploy, con el compose `apps/wp-fse/compose.yaml` y la rama `main`. El tema, los
plugins y los mu-plugins van dentro de la imagen, así que para actualizar el
sitio basta con hacer push y desplegar. Las credenciales se configuran en el
panel de Dokploy, nunca en Git.

La guía completa (variables, primer arranque, importación de contenido y
operación) está en [`wiki/despliegue-fse.md`](wiki/despliegue-fse.md).
