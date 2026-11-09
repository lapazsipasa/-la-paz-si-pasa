# Etapa 1.5: calidad determinista

Estado: **hecha** · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que ningún cambio en el tema, sea de una persona o de una IA, llegue a una etapa cerrada sin pasar reglas deterministas, rápidas y baratas. Los linters y los tipos frenan las malas prácticas antes de que el código base las normalice, y las pruebas de comportamiento y visuales detectan regresiones que un revisor pasaría por alto.

## Cómo se usa

```bash
apps/wp-fse/bin/check                             # análisis estático: todo en Docker con versiones fijas
cd apps/wp-fse && node tests/e2e/navbar.mjs        # comportamiento del navbar (requiere el stack en :8090)
cd apps/wp-fse && node tests/e2e/navbar.mjs --visual   # además compara píxeles con las bases de Astro
```

La CI (`.github/workflows/wp-fse.yml`) corre `bin/check` y las pruebas de comportamiento en cada PR que toque `apps/wp-fse/**` o `apps/wordpress/themes/**`.

## Capas

| Capa | Herramienta | Qué frena | Configuración |
|---|---|---|---|
| PHP | PHPCS + WPCS 3 | salidas sin escapar, globals sin prefijo, i18n | `phpcs.xml.dist` |
| PHP | PHPStan nivel **max** + `phpstan-wordpress` | `mixed`, nulls, arrays sin tipo, retornos sin declarar | `phpstan.neon.dist` |
| CSS | Stylelint + `@wordpress/stylelint-config` | `!important`, IDs, especificidad > 0,4,1, clases que no son kebab/BEM, colores con nombre, propiedades duplicadas | `.stylelintrc.json` |
| JS | ESLint + `@wordpress/eslint-plugin` recommended (con `wp-prettier`) | estilo y errores comunes | `eslint.config.mjs` |
| JS | `tsc --checkJs --strict` (+ `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | nulls y tipos del DOM sin verificar | `jsconfig.json` |
| Esquemas | ajv con los esquemas oficiales copiados en `schemas/` | `theme.json` y `block.json` inválidos (por ejemplo, encontró `spacingScale.steps: 0`) | `schemas/` |
| Plantillas | `bin/validate-templates.php` con el parser de WordPress | contenido fuera de bloques, bloques fuera de `core/*` y `lapaz/*`, JSON inválido, aperturas y cierres desbalanceados | — |
| Tamaño | `bin/check` | `render.php` > 200 líneas, PHP > 300, CSS > 400, JS > 200 | — |
| Infraestructura | ShellCheck, Hadolint, actionlint, `compose config` | errores de shell, Dockerfile sin `pipefail`, workflow inválido, compose de producción roto | — |
| Seguridad | Semgrep `p/php` | patrones inseguros en PHP | — |
| Comportamiento | `tests/e2e/navbar.mjs` (CDP) | overlay, foco, Esc, bloqueo de scroll, cierre con ancla, ítems iguales en móvil y escritorio | — |
| Visual | `navbar.mjs --visual` contra `tests/e2e/baseline/` (capturas de Astro) | más de 1 % de píxeles distintos en el header, el overlay o el menú de escritorio | solo local |

## Capas agregadas después

| Capa | Desde | Qué frena |
|---|---|---|
| Prefijo de bloque en CSS | etapa 2 | selectores de `blocks/*/style.css` fuera de `.wp-block-lapaz-<bloque>` (con excepción para `::view-transition-*`) |
| Configuración de Apache | etapa 7 | `.conf` del tema inválidos |
| **Integridad de `assets/vendor`** | etapa 7.5 | cualquier cambio en código de terceros: cada carpeta lleva `SHA256SUMS` y se verifica con `sha256sum -c` |

**Por qué existe la última:** en la etapa 7.5 se pasaron los autofixers (ESLint y Stylelint con `--fix`) sobre todo el tema **antes** de excluir `assets/vendor/`. Reformatearon `plyr.min.js` y `plyr.css`, y el JS quedó con un error de sintaxis (`Unexpected token 'else'`): Plyr dejó de montarse. Ningún linter lo detectó, porque después se excluyó vendor. Lo descubrió la prueba `paisana-productores.mjs`. Se restauró desde `npm pack plyr@3.7.8`.

**Regla:** el código de terceros se copia tal cual, se excluye de los linters y lleva su `SHA256SUMS`. Para actualizarlo se reemplazan los archivos y se regenera la suma. Los autofixers nunca se corren sobre `assets/vendor/`.

## Verificación

- `bin/check` pasa en verde las 13 capas sobre el tema actual.
- Romper reglas a propósito hace fallar el chequeo:

  | Cambio introducido | Capas que fallaron |
  |---|---|
  | `echo $_GET['x']` | PHPCS, PHPStan y Semgrep |
  | `!important` y `#id` | Stylelint |
  | bloque sin cerrar | Plantillas |

  Después se restauraron los archivos.
- Pasan las 9 pruebas de comportamiento y las 3 comparaciones visuales contra Astro (menos de 1 % de diferencia).

## Lo que encontró al activarse

Estos problemas ya existían en el código de la etapa 1 y quedaron corregidos:
- 14 errores de PHPStan: `functions.php` pasó a tipos nativos, `strict_types` y lectura segura de atributos de bloque (`lapaz_block_class`).
- `theme.json` usaba `spacingScale.steps: 0`, que el esquema oficial rechaza. Ahora usa `defaultSpacingSizes: false`.
- En `navigation.js` faltaban las comprobaciones de tipo del DOM (`instanceof`).
- Al Dockerfile le faltaba `pipefail` en el `RUN` con tubería.

## Pendiente (se activa con su etapa)

- **Mutation testing (Infection)** sobre `inc/helpers.php`, en la etapa 4. Hoy no hay lógica que mutar, y los casos de prueba saldrán de `apps/frontend/test/`.
- **Prefijo obligatorio de bloque en el CSS** de `blocks/*/style.css`, en la etapa 2, cuando exista el primer bloque.
- **Bases visuales del resto de secciones:** se capturan desde Astro antes de retirarlo, con `--baseline`.

## Notas

- `defaultSpacingSizes: false` oculta en el editor los tamaños por defecto, pero WordPress sigue generando sus variables CSS (`--wp--preset--spacing--20…80`) por compatibilidad, igual que con la paleta.
- `WP_DEVELOPMENT_MODE=theme` está activo solo en local (override): así WordPress no cachea `theme.json` ni las plantillas mientras se editan.
