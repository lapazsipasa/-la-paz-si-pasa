# Enlaces

Recursos externos del proyecto: repos, despliegues, Figma, gestión.

- **Repo público (origen, remoto `origin`):** https://github.com/kashipu/la-paz-si-pasa (rama por defecto `frontend`)
- **Repo de trabajo (remoto `lapazsipasa`):** https://github.com/lapazsipasa/-la-paz-si-pasa (rama `main`, tag `v2.0.0`, para producción). Es el origen del servicio de Dokploy nuevo.
- **Sitio:** https://lapazsipasa.com/
- **CMS (REST):** https://cms.lapazsipasa.com/index.php?rest_route=/ (DNS que hay que borrar, ver [despliegue-fse.md](despliegue-fse.md#producción-desde-2026-11-09))
- **Dokploy nuevo (producción FSE desde 2026-11-09, y staging):** `<PANEL_DOKPLOY>`. Dirección y claves en el registro privado de operación, no en el repo. Guía: [despliegue-fse.md](despliegue-fse.md).
- **Dokploy actual (respaldo, sin tráfico):** `<PANEL_DOKPLOY_RESPALDO>` (servidor `<IP_RESPALDO>`, datos en el registro privado). Corre el headless + Astro desde `kashipu/la-paz-si-pasa` `main`. Se retira en la limpieza final.
- **Figma:** TODO: confirmar si existe.
- **Gestión / tareas:** TODO: confirmar dónde se llevan.
