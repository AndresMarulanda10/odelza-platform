# Odelza platform branding

## Objetivo

Reemplazar la marca Twenty por la marca Odelza en todo lo que ve el usuario: colores, logos, íconos, nombre, metadatos del navegador, textos de la interfaz, correos, enlaces externos y configuración de dominio.

La plataforma debe cargar la paleta Odelza como su paleta propia, no traducir la de Twenty. Las variables del tema llevan nombres Odelza y dicen lo que son: si una variable se llama `blue`, es azul. La UI deja de ser "UI Twenty" y pasa a ser "UI Odelza".

La tarea empezó como un cambio de paleta (Gruvbox → Odelza). El 2026-11-05 se amplió el alcance al branding completo y se cambió el enfoque del tema (ver "Decisiones"). La paleta oficial es `docs/brand/odelza-paleta-web.png`, transcrita en la sección "Paleta Odelza" de este archivo.

## Alcance

- Paleta y tema Odelza claro y oscuro como única fuente de color, con variables `--odz-*` en toda la UI.
- Adaptación de la UI a la paleta: gráficas, colores fijos, carga inicial y correos.
- Logos, favicon, íconos PWA, ilustraciones y logo por defecto de workspace, y la organización de esos assets.
- Metadatos: `index.html` y `manifest.json`.
- Textos visibles con "Twenty" en front, backend (asuntos y remitente de correos, 2FA, OpenAPI, MCP, prompts de IA) y `twenty-emails`.
- Enlaces externos a twenty.com, docs.twenty.com, GitHub y Discord.
- Documentación de las variables de dominio y correo para producción.

## Fuera de alcance

- Identificadores que viven en datos o en contratos externos: headers `X-Twenty-Webhook-*`, User-Agent, schemas de base de datos, universal identifiers y nombres guardados de "Twenty standard application", variables de entorno ya configuradas, claves de `localStorage` y cookies. Cambiarlos rompe integraciones o datos. Desde el 2026-11-09 los nombres de paquetes, carpetas, archivos y símbolos sí entran (fase 3).
- Las claves de color guardadas como datos (`red`, `blue`, `green`... en opciones de select, etiquetas y vistas). Se conservan como identificadores porque están en la base de datos; lo que cambia es el color que muestran.
- Branding por workspace (ya existe en Twenty).
- Rebrandear `twenty-website`, `twenty-docs`, `twenty-companion` y `twenty-codex-plugin`. `twenty-zapier` se borró el 2026-11-09 (paso 31).
- Cambios de layout o de componentes que no vengan de la paleta, y tipografía. La barra lateral Coffee Bean, el ítem activo y el botón secundario Butter sí entran, porque la paleta los define.
- Colores finos de etiquetas y opciones de select: en la fase 1 se derivan de la paleta para que se vean Odelza; el ajuste uno a uno queda para después.
- Comprar dominios.
- Rebrandear el contenido legal de Twenty (DPA, términos, privacidad): se oculta o se reemplaza por documentos propios de Odelza, nunca se renombra.

## Decisiones

### 2026-11-05: tema propio con renombre total

- **Qué se decidió:** la paleta Odelza es la fuente del tema. Se eliminan el traductor (`createOdelzaThemeOverrides`) y los overrides en `<html>`. Las variables `--t-*` pasan a `--odz-*` y el acceso `themeCssVariables` pasa a un acceso con nombre Odelza, en toda la UI.
- **Por qué:** con el traductor, `--t-color-blue` contenía Blood Red porque Twenty usa la familia `blue` como color de acción. El usuario quiere que las variables tengan los nombres de los colores Odelza y no mientan sobre el color que contienen.
- **Alcance del cambio:** toca ~950 archivos de `twenty-front`, ~120 de `twenty-ui` y 105 `.scss`. Se hace con un codemod de una sola vez.

### 2026-11-05: Odelza deja de sincronizarse con Twenty

- **Qué se decidió:** Odelza sigue su desarrollo desde la versión de Twenty que hoy está en `main` y no vuelve a hacer merge de `upstream`. Se puede modificar cualquier parte del código sin pensar en conflictos con Twenty.
- **Consecuencias:** las correcciones de seguridad y bugs de Twenty ya no llegan solas; si alguna interesa, se copia a mano (cherry-pick o reescritura). La licencia AGPL sigue aplicando al código heredado. El remoto `upstream` puede quedarse solo como referencia de lectura.
- **Documentado:** `ODELZA.md` (sección "Relationship with Twenty") y `docs/ODELZA_HANDOFF.md`.
- **Stack local de Docker:** desde el 2026-11-05 corre `twentycrm/twenty:odelza-local`, construida desde este repo (ver registro de ese día).

### 2026-11-09: fase de metadatos, paquetes y nombres de archivos

- **Qué se decidió:** se agrega una fase 3 para corregir los metadatos de la página y renombrar a Odelza los paquetes, carpetas, archivos y símbolos que llevan el nombre de Twenty, con los imports ajustados de forma minuciosa. Textos y términos quedan para las fases 4 y 5.
- **Por qué:** desde el fork el código es nuestro. El usuario quiere trabajar más cómodo y aplicar la filosofía Odelza en todo, no sobre código que se presenta como ajeno.
- **Cambio de alcance:** los nombres de paquetes, archivos y símbolos, que antes estaban fuera de alcance como "identificadores técnicos", entran en la fase 3. Siguen fuera los identificadores guardados en datos o usados por contratos externos (pasos 32 a 34).
- **Paquetes sin usar:** se borra `twenty-zapier`. Los demás paquetes de Twenty se quedan por ahora.
- **Infraestructura:** los nombres de workflows y acciones de `.github`, `.vscode`, la imagen local y los comandos de `ODELZA.md` entran en la fase (paso 35).
- **Correos:** pasan a una revisión completa en su propia fase (fase 6). En la fase 3 no se tocan.
- **Remoto `upstream`:** se deja como está.

### 2026-11-09: prioridad a lo que ve el usuario

- **Qué se decidió:** la fase 3 queda solo con los metadatos (3.1) y el borrado de `twenty-zapier` (3.2, ya hecho). El renombre de paquetes, carpetas, archivos y símbolos (pasos 32 a 38) se pospone a una fase posterior, después de las fases que cambian lo que ve el usuario. Las decisiones del paso 33 siguen vigentes para cuando se retome.
- **Por qué:** los nombres de archivos y paquetes solo los ve el equipo de desarrollo. La prioridad es que quien usa la plataforma vea Odelza en todas partes.
- **Tagline:** "Tu espacio de trabajo para clientes, proyectos y operaciones", elegida por el usuario. Es un texto fijo en español; no cambia con el idioma de la interfaz.

### 2026-11-09: textos con Odelza escrito en el código

- **Qué se decidió:** los textos se cambian en el código fuente, no con un reemplazo al cargar las traducciones (`applyBrandToCatalog` se descarta). La marca se escribe "Odelza" directamente: no hay constante `APP_NAME` ni variable `{APP_NAME}` en los mensajes. Se quita la constante `APP_NAME` que agregó el paso 27.
- **Por qué:** la plataforma es de Odelza. El usuario no quiere una capa que convierta "Twenty" en otro nombre, sino código que diga Odelza.
- **Traducciones:** un script pasa las traducciones existentes de cada mensaje viejo a su mensaje nuevo en los 34 idiomas, cambiando "Twenty" por "Odelza". Todas las traducciones actuales escriben "Twenty" en letras latinas, también en japonés, chino y árabe, así que el cambio es directo.
- **Crowdin:** las traducciones pasan a ser nuestras. Los workflows `i18n-pull.yaml` e `i18n-push.yaml` apuntan al Crowdin de Twenty y se desactivan.

### 2026-11-09: alcance de la fase 5

- **Qué se decidió:** lo que es exclusivo de Twenty se quita. Lo que Odelza va a tener pero aún no tiene (redes, soporte, términos, privacidad, DPA) se quita ahora y queda registrado en "Precedentes" para implementarlo después. La documentación de Twenty se queda, inventariada como de Twenty. La licencia enterprise se queda.
- **Por qué:** la app ya está brandeada; el usuario quiere que quede lo más cercana a Odelza posible y que no muestre contenido, contratos ni servicios de otra empresa.
- **Billing:** ya está apagado (`IS_BILLING_ENABLED=false`). "Se va" significa que no aparece en ningún lado; el código no se borra, porque está mezclado con los permisos y el bloqueo enterprise.
- **ChatGPT:** se quita la app oficial de Twenty. Se queda ChatGPT como conector propio con la URL del server de Odelza, que no requiere publicar nada.

### 2026-11-10: un solo PR para las fases 1 a 5

- **Qué se decidió:** el usuario prepara un PR de `feat/odelza-platform-theme` a `main` con todo lo hecho hasta la fase 5. Para estas fases reemplaza el punto 8 de la estrategia ("cada fase va en su propio PR"). Las fases 6 a 8 y el renombre pospuesto van en PRs nuevos.
- **Por qué:** las fases 1 a 5 están aprobadas en la app real y dependen unas de otras (la fase 4 usa los textos y la paleta de las anteriores).
- **Qué revisar en el PR:** sección "Revisión del PR y pendientes a futuro".

## Estado

- **Fase 1 (tema Odelza):** replanteada el 2026-11-05. El commit `025bfb65d6` (traductor sobre la paleta de Twenty) queda como antecedente: se reemplaza su mecanismo y sus valores por la paleta oficial (ver "Paleta Odelza"). La paleta oficial se agregó al repo en `docs/brand/odelza-paleta-web.png` y se transcribió en este archivo.
- **Fase 1, revisión:** el 2026-11-05 el usuario aprobó los colores en la app real ("por ahora"). Si hacen falta ajustes de color, se agregan como tarea previa a la fase que los necesite. Commit `a4188ebe82`.
- **Fase 2 (logos y assets):** hecha y aprobada el 2026-11-05, commit `7e8c7ca8e8`.
- **Fase 3 (metadatos):** implementada, commit `69cf4d9070`, imagen reconstruida y stack sano el 2026-11-09. Aprobada por el usuario el 2026-11-09. El renombre de paquetes y archivos (pasos 32 a 38) quedó pospuesto (ver "Decisiones").
- **Fase 4 (textos):** replanteada el 2026-11-09 con el cambio en el código (ver "Decisiones"). Pasos 42 a 45 hechos e imagen reconstruida. Aprobada por el usuario el 2026-11-09 (paso 46).
- **Fase 5 (enlaces, términos y dominio):** plan aprobado el 2026-11-09 (sitio `odelza.com`). Pasos 47 a 49 implementados el 2026-11-10 y aprobados por el usuario en la app real el mismo día ("todo está bien").
- **Fases 6 y 7 (correos, cierre):** planeadas, sin empezar. Van después de fusionar el PR de las fases 1 a 5.
- **Renombre de código (pasos 32 a 38):** pospuesto el 2026-11-09, sin fase asignada. Ver "Lo que falta para terminar el plan".
- **Fase 8 (ilustraciones):** tarea final, después de todo el branding. Decidida el 2026-11-05: no es prioritaria y el usuario aún no tiene todas las ilustraciones.
- **Bloqueos:** la fase 6 necesita el nombre y la dirección del remitente, y el dominio de la app con HTTPS para ver el logo en un cliente de correo real (ver "Insumos pendientes").

### Registro 2026-11-05 (implementación fase 1)

- **Hecho:** paleta y roles Odelza en `twenty-ui/src/theme/constants/Odelza*`, generador `scripts/odelza-theme/generateOdelzaTheme.ts` (CSS `odelza-theme-{light,dark}.css` y acceso `odelzaThemeCssVariables`), codemod `scripts/odelza-theme/renameToOdelzaTheme.py` (~1150 archivos: `--t-` → `--odz-`, `themeCssVariables` → `odelzaThemeCssVariables`, `blue` de acción → `primary`, acento `'blue'` → `'primary'`). Se eliminaron el traductor, las constantes Radix y la dependencia `@radix-ui/colors`.
- **Roles aplicados:** barra lateral Coffee Bean (ThemeProvider con ámbito oscuro y overrides de navegación), ítem activo, botón por defecto en Butter, texto sobre primario, foco y enlaces, fila seleccionada, snackbars con fondos de estado, gráficas con familias reales, carga inicial (`index.html`, `manifest.json`), correos, halftone de bienvenida.
- **Ajustes durante la revisión:** `border.color.strong` usa `#C9BDB4`/`#5B4333` (el borde fuerte oficial queda en `border.color.control`), snackbars con relleno translúcido, atajos del botón primario (`buttons.onPrimaryMuted`), medios pasos de spacing y `lastLayerZIndex`.
- **Verificación:** jest twenty-ui 219/219 (contraste WCAG, generado al día, guarda sin `--t-`/Radix), front 1246/1246 en módulos tocados, typecheck twenty-ui y emails limpios, front solo con los 15 errores previos de `front-components`, oxlint/oxfmt sin errores nuevos. Capturas claro/oscuro en Storybook en `.playwright-mcp/odelza-review/`.
- **No verificado:** la app real con backend (en esta máquina no hay Docker ni Postgres) y la tabla de registros a página completa (su story está desactivada en el repo).
- **Puntos para la revisión del usuario:** presionado del primario en oscuro 3.99:1; barras de gráficas algo apagadas en oscuro (tono 8); botón por defecto en Butter en toda la app; nombres provisionales con `*`.
- **Para el commit:** agregar `git add -f packages/twenty-ui/dist/odelza-theme-*.css` (dist está en .gitignore y el test compara esas copias).
- **Estado:** fase 1 implementada, pendiente de la revisión visual del usuario (paso 19).

### Registro 2026-11-05 (verificación con Docker)

- **Hecho:** build local `docker buildx build --platform linux/amd64 --target twenty --tag twentycrm/twenty:odelza-local -f packages/twenty-docker/twenty/Dockerfile --load .` desde el working tree (incluye los cambios sin commitear). Un primer intento murió por falta de RAM en el build del frontend (VM de Docker con unos 8 GB y heap de Node de 8 GB). El segundo terminó usando la caché de ese paso. Stack levantado con el compose de `ODELZA.md` sobre una base nueva y vacía.
- **Verificación:** `odelza-app` healthy, `odelza-jobs` corriendo, 0 reinicios, `/healthz` 200, schema `core` con 69 tablas. Revisión visual del usuario en la app real: colores aprobados por ahora.
- **Notas:** los contenedores se llaman `odelza-app` y `odelza-jobs`, no `odelza-server-1` como dicen algunos comandos de `ODELZA.md`.

### Registro 2026-11-04

- Pasos 1 a 6 del plan de paleta hechos. `git mv` de los tres archivos Gruvbox. Al traductor se le agregaron `primary` y `createPrimaryRamp`, y `--t-color-blue*`, `--t-accent-*`, `--t-border-color-blue`, `--t-background-transparent-blue` y `--t-buttons-secondary-text-color` usan ahora el primario. Etiquetas `blue`/`sky`, snackbar de info, código e ilustraciones mantienen el azul informativo. `git grep -i gruvbox` sin resultados fuera de `odd/`.
- Test: `npx jest src/modules/ui/theme/utils/__tests__/resolveOdelzaTheme.test.ts --config=jest.config.mjs` → 12/12. Incluye casos nuevos para la familia `blue` como acción (hover en el tono 10, presionado en el 12) y para el azul informativo en etiquetas y snackbar.
- Lint: `nx lint:diff-with-main` no corre en Windows (usa sintaxis POSIX en `cmd`). Se corrieron sus mismos comandos desde bash sobre los 5 archivos: `oxlint --type-aware` 0 warnings / 0 errores y `oxfmt --check` correcto.
- Typecheck: `nx typecheck` falla en Windows antes de llegar al chequeo, porque el build de `twenty-ui` vía nx falla en Windows (con `npx vite build` directo compila). `npx tsgo -p tsconfig.json` en `twenty-front` da 15 errores, todos en `modules/front-components` por paquetes sin compilar (`twenty-front-component-renderer`, `twenty-sdk`, cuyo build tampoco corre en Windows). Hay 0 errores en `ui/theme`. Queda pendiente un typecheck limpio en Linux/macOS o en CI.
- Entorno: `corepack yarn install` (sin cambios en `yarn.lock`) y `nx build twenty-shared`, necesario para jest.
- Commit `025bfb65d6 feat(theme): replace Gruvbox palette with Odelza platform theme`.

### Registro 2026-11-05

- Se amplió el alcance a branding completo. Revisión del repo, sin cambios de código. El inventario sale de esa revisión.
- En el repo no hay assets de Odelza (logo, isotipo) ni el PDF de la paleta.
- El despliegue de producción construye la imagen desde `packages/twenty-docker/twenty/Dockerfile` (`cd-odelza-production.yaml`), así que los cambios del fork llegan a producción. El `docker-compose.yml` local usa `twentycrm/twenty:${TAG}`, la imagen de upstream: para ver el branding en local hay que construir la imagen propia o usar el entorno de desarrollo.
- Se replanteó la fase 1 según "Decisiones". Medición del tema actual:
  - `twenty-ui/src/theme/constants/*.ts` arma `THEME_LIGHT`/`THEME_DARK` desde Radix Colors. `theme-constants/theme-{light,dark}.css` (~1000 variables `--t-*` cada uno) y `themeCssVariables.ts` son copias escritas a mano, sincronizadas por un test de paridad. No hay generador.
  - Consumidores de `themeCssVariables`: 932 archivos en `twenty-front`, 18 en `twenty-ui`, 26 en `twenty-apps`. Consumidores de `--t-*` en CSS/SCSS: 116 archivos en `twenty-ui`, 5 en `twenty-front`, 2 en `twenty-apps`.
  - La familia `blue` y `accent.*` se usan como color de acción en 138 archivos (botón principal, foco, casillas, celda enfocada, enlaces, widgets, workflows, IA).
  - Los front components de `twenty-apps` también leen `themeCssVariables`: hay que confirmar si el host les pasa las variables `--t-*` (contrato del SDK) antes de renombrarlas.

## Inventario de "Twenty" visible

| Capa | Dónde | Cantidad aprox. |
| --- | --- | --- |
| Tema | `twenty-ui/src/theme/constants` (Radix Colors), `theme-constants/theme-{light,dark}.css`, `themeCssVariables.ts`, variables `--t-*` | ~1000 variables, ~1100 archivos consumidores |
| Metadatos | `twenty-front/index.html` (title, og/twitter, description "A modern open-source CRM", imagen social de twentyhq), `public/manifest.json` (name, short_name, theme_color, background_color) | 2 archivos |
| Íconos y logos | `public/images/icons/{android,ios,windows11}`: favicon, logo por defecto del login (`auth/components/Logo.tsx` usa `android-launchericon-192-192.png`) y logo de carga. `DEFAULT_WORKSPACE_LOGO` apunta a `twentyhq.github.io` en front y en emails | ~100 PNG y 2 constantes |
| Ilustraciones | `public/images/{ai,onboarding,placeholders}` con el estilo gráfico de Twenty | Por inventariar en la fase 2 |
| Textos traducidos del front | "Welcome to Twenty", "By using Twenty, you agree to the", "Page Not Found \| Twenty", "Twenty fields", errores de billing ("contact Twenty team"), descripciones de MCP, descripción de la aplicación estándar | 56 msgids en `en.po` |
| Literales del front | `utils/title-utils.ts` (título por defecto), `DEFAULT_WORKSPACE_NAME`, `getTimelineActivityAuthorFullName.ts`, `settings/mcp-and-apis/constants/McpSetup.ts`, `mcpSetup.ts`, ejemplos de `SettingsCompositeFieldTypeConfigs.ts`, nombre del PDF de DPA | ~8 |
| Backend | Asuntos de correo (`email-verification.service.ts`, `workspace-invitation.service.ts`, `billing-reminder.service.ts`), `from: "... (via Twenty)"` (`workspace-invitation.service.ts`, `approved-access-domain.service.ts`), `EMAIL_FROM_NAME = 'Felix from Twenty'` (`config-variables.ts`), issuer de 2FA (`two-factor-authentication.service.ts`), título de OpenAPI (`base-schema.utils.ts`), MCP (`mcp-server-info.const.ts`, `build-mcp-server-card.util.ts`, `build-mcp-server-instructions.util.ts`), prompts de IA (`chat-system-prompts.const.ts`, `agent-system-prompts.const.ts`, agente y skills estándar), prodId de iCal | 14 msgids y ~20 literales |
| Correos | `components/Logo.tsx` (imagen de `app.twenty.com`), `Footer.tsx` (enlaces a twenty.com, GitHub, docs y "Twenty.com, Public Benefit Corporation"), `WhatIsTwenty.tsx`, `BaseHead.tsx` (`<title>Twenty email</title>`), paleta en `common-style.ts` | 20 msgids y 5 archivos |
| Enlaces externos | `auth/sign-in-up/components/FooterNote.tsx` (términos, privacidad y DPA de Twenty), `twenty-shared/src/constants/DocumentationBaseUrl.ts`, `pages/settings/community/SettingsCommunity.tsx` (Discord, partners, releases), guías de apps (`get{Standard,Custom}ApplicationDescription.ts`), `WorkflowEditActionFormBuilder.tsx` (docs), billing "yourco.twenty.com" | ~15 |
| Dominio | Configuración por env: `SERVER_URL`, subdominios multiworkspace, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS` | Solo configuración |
| Contenido de Twenty Cloud | Módulo DPA (plantilla legal a nombre de "Twenty.com SAS/PBC"), billing, enterprise, página Community | Ocultar, no rebrandear |

## Estrategia

1. **Tema con tres capas, todas con nombre Odelza.**
   - **Paleta:** los colores de "Paleta Odelza" con su nombre (`--odz-coffee-bean`, `--odz-blood-red`, `--odz-butter`, `--odz-pine`...), cada uno con su escala de 12 tonos cuando la UI necesita matices.
   - **Roles:** lo que consumen los componentes, con los nombres de la paleta oficial (`--odz-background-page`, `--odz-surface`, `--odz-text-primary`, `--odz-border-subtle`, `--odz-nav-background`, `--odz-primary`, `--odz-on-primary`, `--odz-focus`, `--odz-status-success`...). La tabla "Roles" fija cada nombre y su valor en claro y oscuro.
   - **Familias de datos:** las ~30 claves que se guardan en la base (`red`, `blue`, `green`...) se mantienen como `--odz-color-<clave>-*`, con valores derivados de la paleta Odelza y fieles a su nombre.
2. **Una sola fuente y CSS generado.** Los valores viven en archivos TS de Odelza; `theme-odelza-{light,dark}.css` y el acceso tipado se generan con un script, en lugar de mantener tres copias a mano.
3. **Codemod de una sola vez** que hace el renombre en TS, TSX, SCSS y CSS. Después se borra el tema de Twenty. Un test de guarda falla si aparece una variable `--t-*` o un import de Radix Colors en la UI.
4. **Textos traducidos: cambio en el código y migración de traducciones** (decisión del 2026-11-09). Lingui genera el ID de cada mensaje a partir de su texto, así que al editar un mensaje se pierden sus traducciones. Un script con una tabla de mensaje viejo → mensaje nuevo copia cada traducción al mensaje nuevo con "Twenty" cambiado por "Odelza", en los 34 idiomas. Reemplaza la idea anterior de `applyBrandToCatalog`.
5. **Literales sin traducir:** se editan a mano con "Odelza" escrito directamente, sin constante.
6. **URLs servidas por nuestro propio server:** logo de correos y logo por defecto de workspace se sirven desde `${SERVER_URL}/images/...`, no desde `app.twenty.com` ni `twentyhq.github.io`.
7. **Licencia:** el rebrand no quita la obligación AGPL de ofrecer el código fuente si la app se sirve públicamente. Se conservan los avisos de copyright y se agrega un enlace a "código fuente" en Settings o en el footer.
8. **Cada fase cierra con revisión visual del usuario** y va en su propio PR. Una fase no empieza hasta que el usuario aprueba la anterior.
9. **Nombres provisionales:** los colores y roles que la paleta oficial no nombra llevan un nombre propuesto (marcado con `*`). El usuario los revisa y los cambia si no le gustan; con el CSS generado, renombrar es un cambio en un solo archivo.

## Plan

### Fase 1: tema Odelza en toda la plataforma

Alcance: ver el tema Odelza implementado en toda la plataforma, con variables Odelza, sin restos del tema de Twenty. Termina con la revisión visual del usuario.

**1.1 Paleta Odelza**

1. Hecho: paleta oficial transcrita en "Paleta Odelza", con nombres provisionales para lo que no tiene nombre.
2. Crear la paleta en `twenty-ui/src/theme/odelza/palette` con los valores de la tabla y escalas de 12 tonos donde la UI necesite matices (familias de datos, gráficas): los tonos 1 a 7 son el color mezclado con el fondo en pasos, no grises.
3. Tests de contraste WCAG con los mínimos de la paleta: 4.5:1 en texto y 3:1 en bordes y controles. Cubren texto sobre fondos, texto sobre el primario (Butter en claro, Coffee Bean en oscuro), texto de navegación sobre la barra lateral y estados sobre su fondo.

**1.2 Tema Odelza**

4. Definir `ODELZA_THEME_LIGHT` y `ODELZA_THEME_DARK` con los roles de la estrategia, a partir de la paleta. Reemplazan a `THEME_LIGHT`/`THEME_DARK` y a las constantes basadas en Radix (`MainColors*`, `SecondaryColors*`, `Accent*`, `GrayScale*`, etc.).
5. Agregar el rol `primary` (acción) y separar `danger`, `success`, `warning` e `info`, para que ninguna familia de datos cumpla funciones de interfaz.
6. Script generador de `theme-odelza-{light,dark}.css` y del acceso tipado, y test que verifica que lo generado está al día.
7. Quitar el traductor: `createOdelzaThemeOverrides.ts`, `odelza{Light,Dark}ThemeOverrides.ts`, `applyOdelzaThemeToRoot` y los `overrides` de `BaseThemeProvider`. El `ThemeProvider` de `twenty-ui` aplica directamente las clases del tema Odelza.

**1.3 Variables Odelza en toda la UI**

8. Confirmar el contrato con `twenty-apps` y `twenty-front-component-renderer`: si los front components reciben las variables del host, definir cómo se renombran sin romperlos (o dejar un alias `--t-*` solo para ese contrato, documentado como excepción).
9. Codemod `--t-*` → `--odz-*` y `themeCssVariables` → acceso Odelza en `twenty-ui`, `twenty-front` y `twenty-apps`, incluidos SCSS, CSS, Storybook (`.storybook/preview.tsx`) y `src/index.tsx`.
10. Migrar a `primary` los 138 archivos que usan `blue`/`accent` como color de acción. Después de esto, `blue` es azul en toda la plataforma.
11. Revisar a mano los usos de color que no son de acción ni de datos: snackbars, código, ilustraciones de íconos, colores fijos en SCSS y cualquier hex suelto. El texto blanco fijo de `Button.module.scss` y `NotificationCounter.module.scss` pasa a `--odz-on-primary`.
12. Roles que Twenty no tiene y la paleta sí define: barra lateral Coffee Bean con su texto de navegación e ítem activo, botón secundario Butter, fila seleccionada y estados con su fondo. Se aplican en los componentes de navegación, botones y tabla.
13. Test de guarda: cero `--t-` y cero `@radix-ui/colors` en la UI, fuera de las excepciones documentadas.

**1.4 Adaptaciones de la UI a la paleta**

14. Gráficas: `createGraphColorRegistry.ts` y `getColorSchemeByIndex` sobre las familias Odelza, con un orden que no ponga el rojo de acción junto al rojo de error. Tooltips, ejes y grilla de Nivo leyendo roles Odelza.
15. Carga inicial: colores previos a la carga de `index.html` (`#1b1b1b`, `#fcfcfc`, `theme-color`) y `theme_color`/`background_color` de `manifest.json` con los fondos Odelza.
16. Paleta Odelza clara en `twenty-emails/src/common-style.ts`.

**1.5 Verificación**

17. Tests unitarios del tema y de la guarda; lint, typecheck y build de Storybook en Linux o CI.
18. Verificación visual propia en claro y oscuro, en Storybook y en la app real: botón principal (normal, hover, presionado), botón de peligro, foco, fila seleccionada, etiquetas y opciones de select de todas las familias, snackbars, dropdowns, modales, tabla, kanban, dashboards con gráficas, workflows, IA, login, onboarding y pantalla de carga. Capturas para el usuario.
19. **Revisión visual del usuario.** Los ajustes que pida se hacen dentro de la fase. La fase cierra con su aprobación.

### Fase 2: logos y assets

Alcance: con el tema aprobado, revisar cómo están organizados los assets y reemplazarlos por los de Odelza. Termina con la revisión visual del usuario y cierra la capa visual del branding.

20. Inventario de assets: `twenty-front/public/images/{icons,ai,onboarding,placeholders,integrations}`, assets de `twenty-ui`, `twenty-emails` y los que se cargan desde dominios de Twenty. Separar lo que es marca Twenty, lo que es ilustración con su estilo y lo que es de terceros (logos de integraciones, que se quedan).
21. Proponer la organización de los assets Odelza (carpeta propia, nombres, formatos, fuente SVG maestra) y acordarla con el usuario.
22. Generar el set de íconos desde el SVG maestro (favicon, Android, iOS, Windows 11) y reemplazar logo del login, logo de carga y `DEFAULT_WORKSPACE_LOGO` (front y emails).
23. ~~Logo de correos~~: movido el 2026-11-05 a la tarea `odd/tasks/email-logo-server-url.md`, que se hace después de fusionar este branding a `main`.
24. ~~Ilustraciones~~: movido a la fase 8 el 2026-11-05 (no prioritario, faltan las ilustraciones propias). Los sellos de confianza (`onboarding/trust-badges`) se ocultan en la fase 5 (paso 48) junto con el resto del contenido de Twenty Cloud.
25. Imagen social de los metadatos (og/twitter).
26. Verificación visual propia y **revisión visual del usuario**, que cierra la fase.

### Fase 3: metadatos, paquetes y nombres de archivos Odelza

Agregada el 2026-11-09. Alcance:

- La página se presenta como Odelza en el navegador, al compartir enlaces y al instalarla como PWA.
- El código que mantenemos deja de llevar el nombre de Twenty en paquetes, carpetas, archivos y símbolos.
- Se quitan los paquetes de Twenty que no usamos.

Desde el fork el código es nuestro (decisión del 2026-11-05) y lo trabajamos como código propio, con la filosofía Odelza. La fase termina con la revisión del usuario.

**Medición del 2026-11-09:**

- Paquetes del monorepo: 20 con nombre `twenty-*`, además de `@odelza/cross-workspace-bridge`. El paquete raíz se llama `twenty`.
- Archivos que nombran cada paquete: `twenty-shared` 6221, `twenty-ui` 2275, `twenty-sdk` 1272, `twenty-client-sdk` 419, `twenty-server` 267, `twenty-front` 198, `create-twenty-app` 195, `twenty-emails` 90, `twenty-docker` 49, `twenty-oxlint-rules` 26, `twenty-front-component-renderer` 23, `twenty-utils` 16, `twenty-e2e-testing` 13 y `twenty-cli` 9.
- Archivos con "twenty" en su ruta dentro de `twenty-front`, `twenty-ui`, `twenty-server`, `twenty-shared` y `twenty-emails`: 451. Casi todos están en tres carpetas del server: `twenty-standard-application` (232), `twenty-orm` (119) y `twenty-config` (75). Los otros ~25 son archivos sueltos, como `isTwentyStandardApplication.ts`, `TwentyIconsBaseUrl.ts`, `isValidTwentySubdomain.ts` y las constantes `twenty-*-version`.
- Contrato con las apps: `twenty-sdk`, `twenty-client-sdk`, `twenty-ui`, `create-twenty-app` y `twenty-cli` se publican en npm. Las apps (`twenty-apps/*` y las que se instalen en un workspace) los instalan desde npm por nombre. Además, la plataforma resuelve esos nombres al ejecutar una app: `twenty-front-component-renderer` reescribe los imports `twenty-client-sdk/core` y `/metadata` (`SdkClientImportSpecifiers.ts`), y el runner de logic functions del server enlaza `twenty-client-sdk` en `node_modules` (`local-child-process-runner.service.ts`).

**3.1 Metadatos**

27. Constante `APP_NAME` y una descripción corta (tagline) en `twenty-shared`. Se adelanta desde la fase de textos porque los metadatos la necesitan.
28. `index.html`: `<title>`, `description`, og/twitter `title` y `description`, `lang`. `manifest.json`: `name`, `short_name` y `description`. Título por defecto de `utils/title-utils.ts`.
29. og:image y twitter:image con URL absoluta. `generate-front-config.ts` del server ya reescribe `index.html` al servirlo, así que puede armar la URL con `SERVER_URL` sin esperar el dominio.
30. Bloque de configuración inyectado: el comentario `Twenty Config` y el id `twenty-env-config`, en `index.html`, en `generate-front-config.ts` y en su test.

**3.2 Paquetes que no usamos**

31. Hecho el 2026-11-09: se borró `twenty-zapier` (ver registro). El resto (`twenty-website`, `twenty-docs`, `twenty-companion`, `twenty-codex-plugin`, `twenty-claude-skills`, `internal/twenty-partners`) se queda por ahora.

**3.3 Nombres de paquetes e infraestructura**

32. Inventario por categoría, antes de tocar nada. Cada referencia a un nombre de paquete cae en una de estas:
    - Nombre y dependencias `workspace:*` en cada `package.json`, `workspaces` del `package.json` raíz y nombre del paquete raíz.
    - Proyectos de nx: `project.json` (nombre, tags, `implicitDependencies`, rutas), `nx.json` y los comandos `nx run <proyecto>:...`.
    - Configuración de TypeScript, jest, vite, vitest, storybook, lingui y codegen de GraphQL: `tsconfig*.json`, `moduleNameMapper`, alias y rutas de salida.
    - Imports: `from 'twenty-shared/...'`, `jest.mock('twenty-ui/...')`, `import()` dinámicos y `require`.
    - Rutas de carpeta: `packages/twenty-*` en scripts, Dockerfile, compose, workflows y acciones de `.github`, `.vscode`, `.oxfmtrc.jsonc`, `.gitignore` y `.cursor/rules`.
    - Reglas propias de lint: `PACKAGE_TAG_MAP` de `twenty-oxlint-rules`.
    - Documentación: `ODELZA.md`, `CLAUDE.md`, `docs/` y `odd/` (los registros con fecha no se reescriben).
    - Contrato con las apps (ver la medición): ver el paso 33.
33. **Decidido por el usuario el 2026-11-09:**
    - Convención: carpeta `packages/odelza-<nombre>` y paquete `@odelza/<nombre>`, como `@odelza/cross-workspace-bridge`. Ejemplos: `twenty-shared` → `@odelza/shared`, imports `'@odelza/shared/utils'`; raíz `twenty` → `odelza`.
    - Paquetes publicados en npm (`twenty-sdk`, `twenty-client-sdk`, `twenty-ui`, `create-twenty-app`, `twenty-cli`): se renombran con compatibilidad. La plataforma acepta los dos nombres al ejecutar apps (`twenty-client-sdk/*` y `@odelza/client-sdk/*`), y las apps existentes que instalan los paquetes de Twenty desde npm siguen funcionando. Los alias viejos quedan como excepción documentada en este archivo.
    - Los paquetes de Twenty sin usar (`twenty-website`, `twenty-docs`, `twenty-companion`, `twenty-codex-plugin`, `twenty-claude-skills`) conservan su nombre. Solo se actualizan sus imports a los paquetes renombrados.
    - Todo en la rama `feat/odelza-platform-theme`, con un commit por paso.
34. Codemod `scripts/odelza-rename/renamePackages.ts`, con una tabla de nombres viejos y nuevos:
    - Modo de prueba que reporta cantidades por categoría y archivo, sin escribir nada.
    - Reemplaza solo coincidencias exactas del nombre de paquete, no cualquier texto con "twenty".
    - Lista de exclusiones: identificadores en datos, variables de entorno, headers `X-Twenty-*`, claves de `localStorage` y cookies, `yarn.lock` (se regenera) y registros con fecha de `odd/`.
    - `git mv` de las carpetas para conservar el historial.
    - Al terminar, `git grep` de cada nombre viejo debe dar cero, salvo las excepciones listadas en este archivo.
35. Nombres de infraestructura, en el mismo cambio: acciones y workflows de `.github` con "twenty" en el nombre, `.vscode/twenty.code-workspace`, nombre de la imagen local `twentycrm/twenty:odelza-local` y los comandos de `ODELZA.md`. Se corrigen también los nombres de contenedor que no coinciden (`odelza-server-1` contra `odelza-app` y `odelza-jobs`).
36. Regenerar `yarn.lock` con `yarn install` y revisar que no cambie ninguna versión: solo nombres de workspace.

**3.4 Nombres de archivos y símbolos**

37. Renombre en el server: `twenty-config` → `odelza-config` (`TwentyConfigService` → `OdelzaConfigService`), `twenty-orm` y `twenty-standard-application`. El archivo y la clase cambian de nombre; los identificadores guardados en datos (universal identifiers, nombres de la aplicación estándar, schemas) conservan su valor.
38. Renombre de los archivos y símbolos sueltos del front, `twenty-ui` y `twenty-shared`. `twenty-emails` queda para la fase de correos.

**3.5 Verificación y cierre**

39. Verificación en Linux, porque en Windows `nx typecheck` y `lint:diff-with-main` no corren completos. Para el renombre se corren en un contenedor `node:24` sobre el working tree, o en CI: build de `@odelza/shared` y de `@odelza/ui`, typecheck de front y server, lint, jest de los paquetes tocados y build de la imagen `odelza-local`.
40. Commits separados: metadatos, borrado de paquetes, renombre de paquetes e infraestructura, imports (codemod puro), archivos y símbolos. Así cada uno se puede revisar o revertir solo.
41. Imagen `odelza-local` reconstruida, app y jobs sanos, y revisión del usuario en la app real, que cierra la fase.

### Fase 4: textos

Replanteada el 2026-11-09 (ver "Decisiones"). Alcance: todo texto que ve el usuario en la app y en las respuestas del server dice Odelza, escrito en el código, con las traducciones conservadas. Los correos de `twenty-emails` siguen en la fase 6; los asuntos de correo, que viven en el catálogo del server, entran aquí.

**Medición del 2026-11-09:** 25 mensajes traducidos con "Twenty" en el front, 7 en el server y 10 en `twenty-emails`, cada uno en 34 idiomas. Fuera de los catálogos, unas 280 líneas en ~95 archivos de producción; casi la mitad es la plantilla DPA, que se resuelve en la fase 5. `lingui extract` corre en Windows; el catálogo del server ya tenía ~50 mensajes sin extraer antes de este cambio.

42. **Preparación.**
    - Quitar `APP_NAME` de `twenty-shared` y escribir "Odelza" en `title-utils.ts`.
    - Commit aparte que sincroniza los catálogos con el código (`lingui extract` en front y server, sin cambios de marca), para que el diff de marca muestre solo la marca.
    - Desactivar `i18n-pull.yaml` e `i18n-push.yaml`.
43. **Mensajes traducidos** (front y server).
    - Editar cada mensaje en el código. Los que no se leen bien con solo cambiar el nombre se reescriben: "contact Twenty team" → "contact the Odelza team", "Twenty fields" → "Odelza fields".
    - Script `scripts/odelza-brand/migrateCatalogBrand.mjs` con la tabla de mensajes viejos y nuevos: copia cada traducción al mensaje nuevo con "Twenty" → "Odelza" y calcula el ID con `generateMessageId` de Lingui. Modo de prueba que muestra lo que va a cambiar.
    - `lingui extract` y `lingui compile` en front y server. Verificación: ningún mensaje nuevo queda sin traducción en un idioma que tenía la vieja, y `git grep -w Twenty` en los `.po` da cero fuera de las excepciones.
44. **Literales sin traducir.**
    - Front: autor del timeline, nombre de workspace por defecto, configuración de MCP, ejemplos de campos compuestos, logger de Apollo.
    - Server: MCP (nombre, instrucciones y tarjeta de `well-known`), OpenAPI, issuer de 2FA, prompts del chat y de los agentes, helper de MCP del intérprete de código, herramienta de ayuda, mensajes de error de versión de apps y de dominio, `prodId` de iCal y descripciones de config que se muestran en el panel de administración.
    - Se quedan, como excepciones: headers `X-Twenty-Webhook-*`, User-Agent `Twenty-Marketplace` y `Twenty-AppUpgrade`, y nombres guardados en datos (fuera de alcance desde el inicio). Los comentarios del código van con el renombre de código pospuesto.
45. **Textos guardados en la base.** El agente de ayuda, las skills estándar y el registro de la app CLI se escriben al crear el workspace. Revisar si la sincronización de la aplicación estándar los actualiza en los workspaces que ya existen; si no, un comando de workspace los actualiza.
46. **Verificación.** Tests de los archivos tocados y snapshots actualizados, oxlint y oxfmt, `tsgo` de front y server, imagen `odelza-local` reconstruida y revisión del usuario en la app real en inglés y español: login, 404, importación de CSV, MCP, aplicaciones, 2FA y chat de IA.

### Fase 5: enlaces, términos y dominio

Replanteada el 2026-11-09 (ver "Decisiones"). Inventario hecho sobre el código el 2026-11-09.

47. **Quitar lo exclusivo de Twenty y lo que Odelza aún no tiene.**

    | Qué | Dónde | Qué se hace |
    |---|---|---|
    | Página Community: Discord de Twenty, X `@twentycrm`, partners (`twenty.com/partners/list`), changelog (`twenty.com/releases`) | `pages/settings/community/SettingsCommunity.tsx`, ruta en `SettingsRoutes.tsx`, ítem en `useSettingsNavigationItems.tsx`, `title-utils.ts` | Se quita la página, la ruta y el ítem del menú. Redes, partners y changelog van a "Precedentes" |
    | Funciones beta (lab) que viven dentro de Community: relaciones muchos a muchos y hero de descubrimiento | `settings/lab/components/SettingsLabContent.tsx` | Pasan a su propia sección "Funciones beta" en Settings > Other, con su ruta e ítem de menú (confirmado por el usuario el 2026-11-09) |
    | Chat de soporte (Front Chat de Twenty) | `useSettingsNavigationItems.tsx`, `MultiWorkspaceDropdownDefaultComponents.tsx`, `support/hooks/useInstantiateSupportChat.ts` | Ya está oculto sin `SUPPORT_FRONT_CHAT_ID`. Se verifica que no aparezca; va a "Precedentes" |
    | DPA dentro de la app: PDF "pre-signed by Twenty" con la plantilla de Twenty.com SAS, su DPO y sus proveedores | Front: `pages/settings/legal/*`, `modules/settings/legal/*`, rutas `LegalDpa`, `LegalDpaNew` y `/dpa`. Server: `core-modules/dpa/` | Se quitan las rutas y el resolver. Va a "Precedentes" |
    | Sellos PwC, République Française, GDPR y SOC2 | `onboarding/components/import-contacts/OnboardingTrustBadges.tsx`, `public/images/onboarding/trust-badges/` | Se quitan |
    | App oficial de Twenty en ChatGPT | `settings/mcp-and-apis/constants/McpSetup.ts` (`chatGptTwentyAppUrl`) | Se quita (ver paso 48 para el conector propio) |
    | Ayuda de la IA `search_help_center`: manda las preguntas a `twenty-help-search.com` | `tool/tools/search-help-center-tool/`, `common-preload-tools.const.ts`, `action-tool.provider.ts`, `mcp-protocol.service.ts`, `action-tool-label.constant.ts`, menciones en `build-mcp-server-instructions.util.ts` y `twenty-mcp-helper.const.ts` | Se quita la herramienta y sus menciones |
    | Billing: planes, pagos, créditos, "Subdomain (yourco.twenty.com)" | `settings/billing/*`, banners de `information-banner/components/billing/` | Ya apagado. Se verifica que ningún menú, banner ni tarjeta de "upgrade" lleve a billing |
    | Enlace de precios de Twenty y enlace al GitHub de Twenty, sin uso | `twenty-ui/src/navigation/Link/constants/TwentyPricingLink.ts` y `GithubLink.ts` | Se borran las constantes |

48. **Ocultar los enlaces legales y poner datos de Odelza en lo público de MCP y API.**

    | Qué | Dónde | Qué se hace |
    |---|---|---|
    | "By using Odelza, you agree to the Terms of Service and Data Processing Agreement" (login y registro) y "Privacy Policy · Terms of Service" (selección de workspace), con enlaces a `twenty.com/legal/*` | `auth/sign-in-up/components/FooterNote.tsx`, `SignInUpStandardContent.tsx` | Se ocultan. Va a "Precedentes" |
    | ChatGPT como conector propio | `buildMcpSetupCategories.tsx`, `McpSetup.ts`, `mcpSetup.test.ts` | La tarjeta deja de abrir la app de Twenty y explica cómo crear el conector con la URL del MCP de Odelza. Desactivada sin HTTPS, como la de Claude |
    | Tarjeta MCP (`/.well-known/mcp`): `name: com.twenty/twenty`, `websiteUrl: twenty.com`, `repository: github.com/twentyhq/twenty` | `well-known/utils/build-mcp-server-card.util.ts` y su test | Se adecua a Odelza, no se quita (decisión del usuario del 2026-11-09): `name` con identificador de Odelza, `websiteUrl` con la URL de Odelza, descripción de Odelza. `repository` apunta al de Twenty y se quita, porque el repo de Odelza es privado |
    | OpenAPI: `termsOfService` (código de conducta de Twenty), `contact.email: felix@twenty.com`, `externalDocs` "Find out more about Twenty", licencia con enlace al repo de Twenty | `open-api/utils/base-schema.utils.ts` | Se adecua a Odelza: contacto de Odelza, `externalDocs` "Find out more about Odelza" con la URL de Odelza, términos cuando existan. La licencia sigue siendo AGPL-3.0, con enlace al texto oficial de la licencia |
    | Valores de ejemplo con `twenty.com` | `SettingsCompositeFieldTypeConfigs.ts` (correos `tim@twenty.com` y otros en la vista previa del campo Emails), `prefill-workflows.util.ts` (salida de muestra del workflow "Extract domain from email") | Pasan a `example.com` |

49. **Documentación, precedentes, `ODELZA.md` y verificación.**
    - La documentación de Twenty se queda. Inventario de enlaces que llevan a ella:

      | Dónde se ve | Archivo |
      |---|---|
      | "Documentation" en la barra lateral | `navigation/components/NavigationDrawerOtherSection.tsx` |
      | Settings > Other > Documentation | `settings/hooks/useSettingsNavigationItems.tsx` |
      | Chat de IA sin API key configurada | `ai/components/AiChatApiKeyNotConfiguredMessage.tsx` |
      | Settings > Apps > Developer, "Read documentation" | `pages/settings/applications/tabs/SettingsApplicationsDeveloperTab.tsx` |
      | Descripción de las apps estándar y propias (`twenty.com/developers/...`) | `getStandardApplicationDescription.ts`, `getCustomApplicationDescription.ts` |
      | Aviso de buzón compartido en Communications | `pages/settings/communications/SettingsWorkspaceCommunicationGroupChannelDetail.tsx` |
      | Ayuda del formulario en workflows | `workflow/.../form-action/components/WorkflowEditActionFormBuilder.tsx` |
      | Widget "our documentation" del dashboard inicial (guardado en la base al crear el workspace) | `compute-my-first-dashboard-widgets.util.ts` |
      | Catálogo público de la API (`/.well-known/api-catalog`) | `well-known/utils/build-api-catalog.util.ts` |
      | Créditos de billing (oculto con billing apagado) | `settings/billing/components/SettingsBillingCreditsSection.tsx` |
      | Base de todas las URLs | `twenty-shared/src/constants/DocumentationBaseUrl.ts` (`https://docs.twenty.com`) |

    - Se quedan también, por ser de Twenty y funcionales: Admin Panel > Enterprise, `ENTERPRISE_API_URL` y las tarjetas de funciones enterprise.
    - Fuera de esta fase, para la fase 7: fotos de ejemplo de personas servidas desde `twentyhq.github.io` (`prefill-people.util.ts`).
    - Documentar en `ODELZA.md` las variables de producción (`SERVER_URL`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, subdominios), con lo que pasa si se dejan vacías.
    - Tests de lo tocado, lint, imagen reconstruida y revisión del usuario en la app real.

#### Precedentes (para implementar después)

Se quitaron en la fase 5 porque Odelza aún no los tiene. Al retomarlos, este es el punto de partida:

- **Redes y comunidad:** cuando existan las redes de Odelza, volver a una página de comunidad (el código de Twenty queda en git, commit de la fase 5) con las URLs de Odelza, idealmente desde variables de configuración.
- **Soporte:** el front ya integra Front Chat por `SUPPORT_DRIVER` y `SUPPORT_FRONT_CHAT_ID`. Si Odelza usa otra herramienta, agregar su integración en `support/hooks/useInstantiateSupportChat.ts`.
- **Términos y privacidad:** son necesarios antes de producción. Volver a mostrar el texto de `FooterNote.tsx` con las URLs de Odelza, desde variables que el server pase al front; si están vacías, el texto no se muestra.
- **DPA:** el generador de PDF es genérico (plantilla, versión, firma y región en `core-modules/dpa/`). Con un DPA propio de Odelza (responsable, DPO, proveedores reales), se cambia la plantilla y se vuelven a activar las rutas.
- **Changelog y partners:** solo si Odelza publica notas de versión u ofrece implementación.
- **App propia de Odelza en ChatGPT:** opcional. Requiere publicarla en el directorio de ChatGPT, con dominio, política de privacidad y revisión de OpenAI.
- **Documentación propia:** si se hace, `DOCUMENTATION_BASE_URL` y los enlaces del inventario del paso 49 pasan a ella.

### Fase 6: correos

Agregada el 2026-11-09: los correos tienen su propia revisión completa. El plan detallado se arma al empezar la fase. Por ahora incluye:

- Logo de correos servido desde nuestro server (`odd/tasks/email-logo-server-url.md`).
- Footer sin enlaces a Twenty, `WhatIsTwenty.tsx`, `<title>` de `BaseHead.tsx`, remitente (`from (via ...)`, `EMAIL_FROM_NAME`) y la paleta de `common-style.ts`. Los asuntos de correo, que viven en el catálogo del server, se hacen en la fase 4.
- Renombre de archivos y símbolos de `twenty-emails`.
- Revisión visual de las 12 plantillas, en claro y en un cliente de correo real.

### Fase 7: cierre

Incluye también, agregado el 2026-11-10:

- Fotos de ejemplo de personas que se cargan desde `twentyhq.github.io` (`prefill-people.util.ts`, datos de los workspaces nuevos).
- Enlace al código fuente para cumplir la AGPL (punto 7 de la estrategia): todavía no se hizo en ninguna fase. Decidir dónde va (Settings o pie) y a qué repo apunta, porque el de Odelza es privado.
- Revisar con el usuario las excepciones de "Lo que sigue diciendo Twenty a propósito" y decidir cuáles se quedan.

50. Barrido final con `git grep -w Twenty` sobre código visible, con lista de excepciones justificadas en este archivo.
51. Verificación visual de la app completa con la imagen construida desde el fork.
52. Registrar aquí lo hecho, cómo se verificó y el estado. Commit y PR solo con autorización explícita.

### Fase 8: ilustraciones

Tarea final, después de cerrar el branding. Empieza cuando el usuario tenga las ilustraciones propias.

53. Ilustraciones con el estilo de Twenty, según el inventario de assets: estados vacíos y de error (`placeholders/*`, 60 PNG), portadas de Settings (`cover-*.png` y `ai/*-cover-*.png`), ilustraciones de aplicaciones (`.webp`), `onboarding/welcome-halftone.svg` e `illustration-*.svg` de twenty-ui si usan colores fijos. Reemplazar por las de Odelza, adaptar a la paleta o quitar.
54. Revisión visual del usuario, que cierra la fase.

## Inventario de assets (fase 2, paso 20, 2026-11-05)

Rutas relativas a `packages/`. Clasificación: **M** marca Twenty (se reemplaza), **E** ilustración o captura con el estilo de Twenty (se reemplaza o se adapta), **T** terceros (se queda).

| Clase | Asset | Dónde se usa |
| --- | --- | --- |
| M | `twenty-front/public/images/icons/{android,ios,windows11}` (112 PNG) | Favicon y apple-touch-icon en `index.html`, íconos PWA en `manifest.json`, logo por defecto del login (`auth/components/Logo.tsx` usa `android-launchericon-192-192.png`) |
| M | `twenty-front/public/images/integrations/twenty-logo.svg` | `OnboardingHeader.tsx`, `OnboardingPulsingLogo.tsx`, `OnboardingImportPreviewSyncBadge.tsx`, `AppConnectionHeader.tsx` |
| M | `DEFAULT_WORKSPACE_LOGO` remoto (`twentyhq.github.io/.../twenty-logo.png`) | `twenty-front/.../navigation-drawer/constants/DefaultWorkspaceLogo.ts` y `twenty-emails/src/constants/DefaultWorkspaceLogo.ts` |
| M | Logo de correos remoto (`app.twenty.com/images/icons/windows11/Square150x150Logo.scale-100.png`) | `twenty-emails/src/components/Logo.tsx` |
| M | Imagen social remota (`raw.githubusercontent.com/twentyhq/.../social-card.png`) | og:image y twitter:image en `twenty-front/index.html` |
| M | `twenty-ui/src/assets/icons/twenty-star{,-filled}.svg` | `IconTwentyStar` en 2 archivos del front |
| M | `twenty-ui/logo.png` | README del paquete, no se ve en la app |
| E | `twenty-front/public/images/placeholders/{background,dark-background,moving-image,dark-moving-image}` (60 PNG) | Estados vacíos y de error (notas, tareas, inbox, 404, 500...). Formas con trazo negro y relleno pastel de la paleta Radix |
| E | `twenty-front/public/images/ai/ai-{skills,tools}-cover-{light,dark}.png` | `pages/settings/ai/SettingsAI.tsx` |
| E | `cover-{light,dark}.png` en `settings/{billing,data-model,mcp-and-apis}` y `pages/settings/{applications,members,...}` (18 PNG) | Portadas de Settings: capturas de la UI de Twenty con sus colores |
| E | `pages/settings/applications/assets/{custom,standard}-illustrations/*.webp` (8) | Descripción de aplicaciones |
| E | `twenty-front/public/images/onboarding/welcome-halftone.svg` | Onboarding |
| E | `twenty-ui/src/assets/icons/illustration-*.svg` (23) | Ilustraciones de tipos de campo en el modelo de datos. Revisar si usan colores fijos |
| T | `twenty-front/public/images/onboarding/trust-badges/*` (GDPR, SOC2, PwC, República Francesa) | `OnboardingTrustBadges.tsx`. Son certificaciones de Twenty Cloud: no aplican a Odelza, se ocultan en vez de reemplazarse |
| T | `twenty-front/public/images/integrations/*` (salvo `twenty-logo.svg`), `twenty-ui` (Google, Microsoft, OpenAI, Claude...), `mcp-and-apis/assets/mcp-clients/*` | Logos de integraciones, se quedan |
| T | `twenty-ui/src/assets/themes/{light,dark}-noise`, `misc/list-view-grip.svg`, `data-model/assets/{ArrowRight,OneToMany,OneToOne}.svg` | Texturas y glifos neutros, se quedan |

Fuera de la fase: los avatares y logos de `twentyhq.github.io` en el dev-seeder del server son datos de demo, no se ven en el workspace real.

`IconTwentyStar` (twenty-ui) es la estrella del campo rating y el ícono por defecto de tipo de campo, no un logo: se queda.

### Registro 2026-11-05 (fase 2, pasos 21, 22 y 25)

- **Decisiones del usuario:** organización aprobada (maestros en `docs/brand/`, generados en `twenty-front/public/images/odelza/`). Favicon sin los tres puntos diagonales en 16 y 32 px, porque a ese tamaño son ruido; el resto lleva el isotipo completo.
- **Maestros:** los 6 SVG (isotipo, logotipo e imagotipo, claro y oscuro) copiados a `docs/brand/` sin modificar. "Claro" es para fondo claro y "oscuro" para fondo oscuro.
- **Generador:** `node scripts/odelza-brand-assets.mjs` (usa `sharp` de `node_modules`). Quita los metadatos C2PA de las copias y genera: SVG limpios, `icon.svg` (gato butter sobre coffee bean, esquinas redondeadas), `favicon.{svg,ico}` y `favicon-{16,32}.png` sin puntos, `icon-{192,512}.png`, `icon-maskable-512.png` (dentro de la zona segura), `apple-touch-icon.png`, `workspace-logo.png` y `social-card.png` (1200x630, imagotipo sobre butter).
- **Referencias cambiadas:** `index.html` (favicon, apple-touch-icon, og/twitter image), `manifest.json` (de 112 íconos de Windows/iOS/Android a 4: SVG, 192, 512 y maskable), logo por defecto del login, logo del onboarding y de la conexión de apps (4 componentes), `DEFAULT_WORKSPACE_LOGO` del front (URL absoluta al front, porque `getImageAbsoluteURI` manda las rutas relativas a `/files` del server) y favicon por defecto de `PageFavicon` (antes usaba el logo de workspace).
- **Borrado:** `public/images/icons/` y `public/images/integrations/twenty-logo.svg`. `git grep` ya no encuentra referencias en el front.
- **Verificación:** `tsgo -p tsconfig.json` en el front con solo los 15 errores previos de `front-components`; `oxlint --type-aware` 0/0 y `oxfmt --check` correcto en los 7 archivos y el script. No hay tests sobre estas piezas. Revisión de los PNG generados con una hoja de contacto.
- **Docker:** respaldo previo con `pg_dump` (solo db arriba) en `backups/<fecha>-pre-phase2/`, porque `odelza-backup.sh` exige el server arriba y habría arrancado la imagen vieja. Imagen `odelza-local` reconstruida (`6382abbf`) y stack recreado con `up --detach --wait`: app y jobs sanos, sin reinicios, `/healthz` ok. El server sirve `images/odelza/*` con su tipo correcto, `index.html` y `manifest.json` apuntan a Odelza y la ruta vieja de íconos de Twenty ya no existe.
- **Revisión del usuario (2026-11-05):** aprobó los logos e íconos visibles en la app ("están perfectos"). Igual que con los colores, los ajustes futuros van en una tarea de corrección aparte.
- **Pendiente:** og:image es relativa; los crawlers necesitan URL absoluta, se resuelve en la fase 3 (paso 29) con `SERVER_URL`. Logo de correos y `DEFAULT_WORKSPACE_LOGO` de emails (paso 23, ahora en la fase 6), ilustraciones (paso 24, ahora en la fase 8), verificación en la app real y revisión del usuario (paso 26).

### Registro 2026-11-09 (fase 3, paso 31)

- **Hecho:** `git rm` de `packages/twenty-zapier` y `.github/workflows/ci-zapier.yaml`. Se quitaron las referencias en `package.json` (workspace y las resolutions `zapier-platform-core/form-data`, `zapier-platform-cli/esbuild` y `yeoman-environment`, que solo pedía Zapier), en `.oxfmtrc.jsonc`, en `.vscode/twenty.code-workspace`, en `CLAUDE.md`, en el `PACKAGE_TAG_MAP` de `enforce-module-boundaries.ts` y en un comentario de `call-webhook-jobs.job.ts`. La resolution de `tmp` se queda porque `external-editor` la sigue necesitando; solo se quitó Zapier de su comentario.
- **Verificación:** `corepack yarn install` correcto. En `yarn.lock` salieron 3109 líneas y no entró ninguna versión nueva: las líneas `resolution:` agregadas ya existían, solo se reagruparon. `yarn why yeoman-environment` sin consumidores. `nx show projects` resuelve el grafo sin `twenty-zapier`. `git grep twenty-zapier` sin resultados fuera de `twenty-docs`, `twenty-website` y `odd/`.
- **Sin cambios:** las menciones a Zapier como dato de demo (seeds, mocks, `IconBrandZapier`) y las de `twenty-docs`/`twenty-website`.
- **Estado:** hecho, en su propio commit.

### Registro 2026-11-09 (fase 3, pasos 27 a 30)

- **Hecho:**
  - `APP_NAME = 'Odelza'` en `twenty-shared/src/constants/AppName.ts`, con el barrel regenerado (`npx tsx packages/twenty-shared/scripts/generateBarrels.ts` desde la raíz). La tagline no lleva constante: solo la usan `index.html` y `manifest.json`, que son estáticos.
  - `index.html`: `<title>`, `description`, og/twitter `title` y `description` con Odelza y la tagline. Se agregaron `application-name`, `apple-mobile-web-app-title`, `og:type`, `og:site_name` y el tamaño y el alt de `og:image`. `lang` sigue en `en` porque la interfaz arranca en inglés.
  - `manifest.json`: `name`, `short_name` y `description`.
  - `title-utils.ts`: el título por defecto usa `APP_NAME`.
  - `generate-front-config.ts`: al arrancar, el server reescribe `og:image` y `twitter:image` con `${SERVER_URL}/images/odelza/social-card.png`. Sin `SERVER_URL`, o con `FRONT_AUTO_BASE_URL=true`, quedan relativas. El reemplazo sirve en cada arranque, aunque cambie `SERVER_URL`.
  - Bloque de config: `Twenty Config` → `Odelza Config` y `twenty-env-config` → `odelza-env-config` en `index.html`, `generate-front-config.ts`, su spec e `inject-runtime-env.sh`.
- **Verificación:**
  - jest `generate-front-config.spec.ts` 6/6, con 2 casos nuevos para la imagen social.
  - jest `title-utils.test.ts` 1/1, después de `nx build twenty-shared`.
  - `oxlint --type-aware` 0/0 en los archivos TS tocados. `oxfmt` aplicado a `index.html`: ya fallaba en HEAD, y además pasó a minúsculas dos hex del estilo inline, que ningún test compara.
  - `tsgo` del front con solo los 15 errores previos de `front-components`. `tsgo` del server con 12 errores, todos por paquetes sin compilar (`twenty-emails`, `twenty-sdk`), ninguno en lo tocado.
  - Simulación de dos arranques sobre el `index.html` real: el bloque de config y las URLs de imagen se reemplazan bien las dos veces.
- **Fuera de esta fase:** el título de la página 404 ("Page Not Found | Twenty") es un mensaje traducido y se resuelve en la fase 4 con `applyBrandToCatalog`.
- **Commit:** `69cf4d9070`, con push a `origin/feat/odelza-platform-theme`.
- **Docker (2026-11-09):** respaldo en `backups/20261109T204445Z-pre-phase3`. `odelza-backup.sh` falla en Git Bash: convierte `/data` del `docker run ... tar` en una ruta de Windows y deja el tar vacío. Se hicieron sus mismos pasos a mano con `MSYS_NO_PATHCONV=1` solo en el `tar`. Imagen `odelza-local` reconstruida (`cf7967cd`) y stack recreado: el primer `up --wait` venció antes de que el server terminara de arrancar; el segundo dio app healthy y jobs arriba, sin reinicios. `/healthz` 200, `<title>Odelza</title>`, `og:image` y `twitter:image` en `http://localhost:3000/images/odelza/social-card.png` (200, `image/png`), bloque `odelza-env-config` y `manifest.json` con nombre y tagline.
- **Pendiente:** revisión del usuario en la app real (paso 41).

### Registro 2026-11-09 (fase 4, pasos 42 a 45)

- **Paso 42:**
  - `APP_NAME` quitado; `title-utils.ts` devuelve `'Odelza'` (`a0bfb31029`).
  - Catálogos de front y server sincronizados con el código, sin cambios de marca (`89b0aaecee`): se agregaron los mensajes que faltaban y se quitaron los que el código ya no usa, sin cambiar ninguna traducción existente.
  - Los workflows de Crowdin de la app (`i18n-pull.yaml`, `i18n-push.yaml`) y `.github/crowdin-app.yml` se borraron en vez de desactivarse, porque no se van a usar (`55285b1429`). Los de docs y website se quedan con esos paquetes.
  - Se borraron los catálogos `aa-ER`, `hy-AM` y `uz-UZ` de front y server: no están en `APP_LOCALES`, Lingui no los extrae ni los compila y nada los importa (`13dc9aa0a9`).
- **Paso 43 (`d1ad17350b`):**
  - 22 mensajes del front y 7 del server editados en el código. "contact Twenty team" pasa a "contact the Odelza team".
  - `scripts/odelza-brand-catalogs.mjs` (no `scripts/odelza-brand/migrateCatalogBrand.mjs`, para seguir el nombre de `odelza-brand-assets.mjs`) busca los mensajes nuevos que quedaron sin traducir después de `lingui extract` y les copia la traducción del mensaje viejo en un commit dado, leída con el formato PO de Lingui.
  - Reglas por idioma para lo que el cambio directo rompe: elisión en francés y catalán (`de Twenty` → `d'Odelza`), sufijos en finés (`Twentyn` → `Odelzan`, `Twentyyn` → `Odelzaan`, `Twentyä` → `Odelzaa`) y turco (`Twenty'yi` → `Odelza'yı`, `Twenty'e` → `Odelza'ya`), y artículo y sufijos en húngaro (`a Twenty` → `az Odelza`, `-ben` → `-ában`).
  - Resultado: 658 traducciones migradas en el front y 210 en el server, ninguna perdida, cero cambios en otros mensajes.
  - Se quedan con Twenty, para la fase 5: "The PDF is pre-signed by Twenty..." (DPA), "Hire a partner... customize Twenty" (partners) y el texto de la clave enterprise. Renombrarlos los haría falsos.
- **Paso 44 (`dd972436b8`):**
  - Front: autor del timeline, nombre de workspace por defecto, servidor MCP (`odelza`/`Odelza`), loggers de Apollo, y ejemplos del campo Links (ahora `example.com`).
  - Server: nombre, instrucciones y tarjeta `well-known` del MCP, título de OpenAPI, issuer de 2FA, prompts del chat y de los workflows, textos del helper MCP del intérprete de código, descripción del esquema de favoritos, errores de versión de apps y de dominio, `prodId` de iCal, descripción de `APP_VERSION`, agente de ayuda, skill estándar y registro de la app CLI. Tests y snapshots actualizados.
  - Se quedan (excepciones): headers `X-Twenty-Webhook-*`, User-Agent `Twenty-Marketplace`/`Twenty-AppUpgrade`, la clase `TwentyMCP` y la variable `twenty` del helper de Python (el código del AI y las skills los usan), "Twenty standard application" (nombre guardado en datos), `npx create-twenty-app` (paquete de npm) y los comentarios del código.
- **Paso 45 (`3d1148b820`):**
  - No hay sincronización automática de la aplicación estándar: Twenty actualiza los workspaces existentes con comandos de upgrade, y el entrypoint corre `upgrade` en cada arranque.
  - Comando de workspace `upgrade:2-21:rebrand-standard-agent-and-skills`: cambia solo las frases exactas del agente de ayuda y de la skill, así que conserva lo que el workspace haya editado.
  - Comando de instancia rápido `RenameCliApplicationRegistrationFastInstanceCommand`: renombra el registro `Twenty CLI` → `Odelza CLI`, con `down`. Se escribió a mano porque el generador solo crea comandos desde un diff de esquema; se registró igual que lo hace el generador.
  - Estado de la base antes del upgrade: el agente `helper` y la skill `code-interpreter` con Twenty; no existe el registro de la CLI (se crea al usarla), así que ese comando no cambia nada en local.
- **Verificación:**
  - jest: `title-utils`, `mcp-and-apis`, `timeline-activities` (23/23), 2FA (115/115), versión de apps, MCP, `well-known`, OpenAPI, intérprete de código, calendario (207/207) y comandos 2.21 más el registro de upgrade (113/113).
  - `tsgo`: front con los 15 errores previos de `front-components`, server con 1 error previo (`twenty-sdk` sin compilar).
  - oxlint sin errores. En esta máquina el modo type-aware (`tsgolint`) se queda sin memoria con Docker corriendo, así que se corrió sin ese modo. `upgrade-version-command` está excluido de oxfmt por configuración.
- **Docker (2026-11-09):** respaldo en `backups/20261109T225435Z-pre-phase4` (mismos pasos a mano que en la fase 3). Imagen `odelza-local` reconstruida (`4a52fe73`) y stack recreado: app healthy, jobs arriba, sin reinicios, `/healthz` 200. En el arranque corrieron `2.21.0_RenameCliApplicationRegistrationFastInstanceCommand_1794263745624` y `RebrandStandardAgentAndSkillsCommand` (1 agente y 1 skill, 1 workspace bien, 0 fallos). En la base, el agente `helper` y la skill `code-interpreter` ya no dicen Twenty. La tarjeta MCP responde con `title: "Odelza"`. El bundle servido tiene "Bienvenido a Odelza" en `es-ES` y ninguna "Bienvenido a Twenty".
- **Pendiente:** revisión del usuario en la app real (paso 46).
- **Para la fase 5:** quitar la opción de ChatGPT del setup de MCP (abre la app oficial de Twenty en ChatGPT y su texto ahora dice Odelza). Revisar `name: 'com.twenty/twenty'`, `websiteUrl` y `repository` de la tarjeta MCP, el `externalDocs` de OpenAPI (texto y URL a twenty.com) y la herramienta `search_help_center`, que busca en la documentación de Twenty.

### Registro 2026-11-10 (fase 5, pasos 47 a 49)

- **Quitado (paso 47):**
  - Página Community (Discord y X de Twenty, partners, changelog), su ruta, su ítem del menú y su portada. Las funciones beta pasan a su propia página "Beta features" en Settings > Other (`pages/settings/lab/SettingsLab.tsx`, ruta `settings/lab`, `SettingsPath.Lab`).
  - DPA: páginas, componentes y rutas del front (`/settings/legal/dpa`, `/dpa`), el resolver GraphQL del server y su test de integración. Encontrado al implementar: al crear un workspace con `IS_MULTIWORKSPACE_ENABLED` el server guardaba la aceptación del DPA de Twenty (`sign-in-up.service.ts`); también se quitó. La plantilla, el servicio y la tabla se quedan para el precedente. Los tipos del DPA se quitaron a mano de `src/generated/graphql.ts`.
  - Sellos de confianza del onboarding y sus imágenes.
  - Ayuda de la IA `search_help_center`: herramienta, precarga, anotaciones MCP, etiqueta, instrucciones del MCP y del helper de Python, y las variables `MINTLIFY_*`. Encontrado al implementar: el agente estándar `helper` dependía de esa herramienta; su prompt se reescribió para ayudar con lo que ve en el workspace.
  - Constantes sin uso de twenty-ui con enlaces a Twenty: `GITHUB_LINK`, `GithubVersionLink`, `TWENTY_PRICING_LINK`. `CAL_LINK` ("talk to us" de Twenty) se queda: solo lo usa la pantalla de prueba gratis de billing, que está apagado.
  - Billing: encontrado al implementar que el Cmd+K mostraba "Go to Billing Settings" con billing apagado. Se agregó `isBillingEnabled` al contexto de los comandos y la condición del ítem pasa a `permissionFlags.WORKSPACE and isBillingEnabled`.
- **Adecuado a Odelza (paso 48):**
  - El pie del login ya no muestra el texto legal ni los enlaces a twenty.com; solo queda el botón "Bypass SSO" cuando aplica.
  - ChatGPT: la tarjeta pasa a "Other clients" como conector propio (enlace a la ayuda de OpenAI sobre el modo desarrollador), desactivada sin HTTPS como la de Claude.
  - Tarjeta MCP: `name: com.odelza/odelza`, `websiteUrl: https://odelza.com`, sin `repository`.
  - OpenAPI: sin términos ni contacto de Twenty, licencia AGPL-3.0 con enlace a gnu.org, `externalDocs` "Find out more about Odelza" con `https://odelza.com`, archivo de ejemplo `odelza-<schema>.json`. El correo de contacto se agrega cuando exista.
  - Ejemplos con `example.com` en la vista previa del campo Emails y en el workflow de muestra.
  - Ítem del Cmd+K "Go to Community Settings" pasa a "Go to Beta Features Settings" (`/settings/lab`, ícono `IconFlask`).
- **Datos guardados (comandos de actualización 2.21):**
  - `upgrade:2-21:update-standard-helper-agent-prompt`: cambia el prompt del agente `helper` solo si sigue siendo el exacto anterior.
  - `upgrade:2-21:update-community-and-billing-command-menu-items`: actualiza los dos ítems del Cmd+K solo si siguen como venían.
- **Traducciones:** `lingui extract` quitó 41 mensajes del front (DPA, Community, legal, ayuda) y 1 del server. Los 5 mensajes nuevos ("Beta features", su título, la descripción de "Quick install" y los dos de ChatGPT) se tradujeron a mano en los 29 idiomas, con los términos que cada catálogo ya usaba.
- **Paso 49:** variables de producción documentadas en `ODELZA.md` ("Production configuration"). La documentación de Twenty y la licencia enterprise se quedan según el inventario del plan.
- **Verificación:**
  - Tests: server 56 suites y 345 tests; shared 3 suites; front 110 suites, solo falla `formatDate.test.ts`, que también falla sin estos cambios por el idioma de la máquina ("ene" en vez de "Jan").
  - Typecheck de server y front: solo los errores previos por paquetes sin compilar.
  - Lint: reglas estándar de oxlint sin errores. Las reglas propias (`twenty-oxlint-rules`) no corrieron: oxlint no logra reservar memoria para su plugin JS en esta máquina. Formato con oxfmt corregido.
- **Respaldo:** `backups/20261110T125253Z-pre-phase5`.
- **Docker (2026-11-10):** los tres primeros builds tumbaron la VM de Docker. Causa: el servidor de lint de VS Code (`oxlint --lsp`, con el plugin JS de `twenty-oxlint-rules`) compromete unos 37 GB de memoria y deja a Windows casi en su límite (56 de 63,5 GB). Si se detiene, VS Code lo reabre al instante. El cuarto build, con el mismo comando de siempre, terminó bien: imagen `odelza-local` `6f1c333a`.
  - Stack recreado: app healthy, jobs arriba, sin reinicios, `/healthz` 200.
  - En el arranque: `UpdateStandardHelperAgentPromptCommand` actualizó 1 agente y `UpdateCommunityAndBillingCommandMenuItemsCommand` 2 ítems; resumen 1 workspace bien, 0 fallos.
  - Base: el agente `helper` tiene el prompt nuevo, sin `search_help_center`; el ítem del Cmd+K dice "Go to Beta Features Settings" (`/settings/lab`, `IconFlask`) y el de billing tiene `permissionFlags.WORKSPACE and isBillingEnabled`.
  - `/.well-known/mcp/server-card.json`: `com.odelza/odelza`, `https://odelza.com`, sin `repository`. La consulta GraphQL `dpaPreview` ya no existe en el schema.
  - Bundle servido: tiene "Funciones beta" y el enlace a la ayuda de OpenAI; no tiene `chatgpt.com/apps/twenty`, `twenty.com/legal`, `trust-badges` ni "By using Odelza".
  - Los tipos GraphQL no se pudieron regenerar contra Docker: la imagen corre en modo producción, con la introspección apagada. La edición a mano se sostiene con el typecheck del front y con la respuesta del server.
  - Las reglas propias de oxlint siguen sin correr por la misma falta de memoria.
- **Nota para producción:** esta fase agrega comandos en `upgrade-version-command/`, así que el CD de imagen se detiene y hace falta el despliegue manual guardado (igual que la fase 4).

### Registro 2026-11-10 (CI de main después de fusionar el PR #55)

- **Qué pasó:** después del último push, `copilot-swe-agent[bot]` mezcló `main` dentro de la rama (`400fac305a`). Entraron 19 commits de otros PRs (timeline #56, workflows #58 y otros) escritos con el tema de Twenty. El PR #55 se fusionó así y en `main` fallaron CI Front (Storybook), CI E2E Main (build del front) y CI Twenty Apps.
- **Causas:**
  - `RecordIndexTimelineContainer.tsx` y `TimelineViewSettings.tsx` usaban `themeCssVariables`, que la fase 1 quitó. Linaria no lo puede evaluar y el build se rompe.
  - `TimelineColorDropdown.tsx` y 12 tests importaban `@radix-ui/colors`, que la fase 1 sacó de las dependencias.
  - La fase 1 había cambiado el tema en 27 archivos de `twenty-apps`. Esas apps compilan contra `twenty-ui` de npm (el de Twenty), que no tiene `odelzaThemeCssVariables`. El paso 8 del plan (contrato con `twenty-apps`) no se cumplió.
- **Arreglo** (rama `fix/odelza-theme-after-main-merge`, `7bf114538c`): los dos componentes pasan a `odelzaThemeCssVariables`; el selector de color del timeline usa las familias de `ODELZA_THEME_LIGHT`/`ODELZA_THEME_DARK` (guarda hex); los tests usan esas mismas constantes; los 27 archivos de `twenty-apps` vuelven a su versión anterior a la fase 1.
- **Verificación local:** typecheck del front sin errores nuevos y 248 tests de timeline, tablas y panel lateral en verde.
- **Para el equipo:** todo código nuevo del front usa `odelzaThemeCssVariables` y las familias Odelza; ni `themeCssVariables` ni `@radix-ui/colors` existen ya. Las ramas creadas antes de la fase 1 hay que actualizarlas antes de fusionarlas.
- **Pendiente:** las apps de `twenty-apps` siguen usando el `twenty-ui` de npm, que pinta con variables `--t-*` que la plataforma ya no define. Revisar cómo se ven sus front components dentro de Odelza.

## Revisión del PR y pendientes a futuro

Actualizado el 2026-11-10, al cerrar la fase 5. Junta lo que quedó anotado en los registros de cada fase.

### Antes de fusionar el PR

- **Verificación en Linux o CI.** En Windows varias herramientas no corren completas. Falta correr en CI o en un contenedor `node:24`:
  - `nx typecheck` de front y server, y `nx lint:diff-with-main` (en Windows usan sintaxis POSIX en `cmd`).
  - Las reglas propias de lint (`twenty-oxlint-rules`) y el modo type-aware de oxlint: no corrieron en las fases 4 y 5 por falta de memoria.
  - El build de Storybook (pendiente desde la fase 1).
  - Los errores de typecheck que se dieron por previos (`front-components`, `twenty-sdk`, `@file-type/pdf`) deberían desaparecer con los paquetes compilados.
- **Tipos GraphQL.** Los tipos del DPA se quitaron a mano de `twenty-front/src/generated/graphql.ts`. Hay que regenerarlos con el server en modo desarrollo (`npx nx run twenty-front:graphql:generate`), porque la imagen de Docker tiene la introspección apagada, y confirmar que el archivo no cambia.
- **Test con el idioma de la máquina.** `formatDate.test.ts` falla en esta máquina porque el sistema está en español ("ene" en vez de "Jan"). En CI debería pasar; no es de este cambio.
- **Tamaño del PR.** El codemod del tema de la fase 1 toca unos 1150 archivos. Conviene revisarlo commit por commit, no como un solo diff.

### Antes de desplegar a producción

- **Despliegue manual.** Las fases 4 y 5 agregan comandos en `upgrade-version-command/`. El CD de imagen se detiene a propósito con esos cambios, así que hace falta el despliegue manual guardado, con respaldo previo. Los comandos corren solos al arrancar y solo cambian lo que sigue igual a como venía:
  - Instancia: `RenameCliApplicationRegistrationFastInstanceCommand` (registro "Twenty CLI" → "Odelza CLI").
  - Workspaces: `rebrand-standard-agent-and-skills`, `update-standard-helper-agent-prompt` y `update-community-and-billing-command-menu-items`.
- **Variables de producción** (`ODELZA.md`, "Production configuration"): `SERVER_URL` con HTTPS, `EMAIL_FROM_ADDRESS` y `EMAIL_FROM_NAME`. Mientras no se haga la fase 6, el nombre por defecto del remitente es "Felix from Twenty": hay que fijarlo en el `.env` de producción.
- **Términos y privacidad.** Se ocultaron en la fase 5, pero hacen falta antes de abrir la app a usuarios reales (ver "Precedentes").
- **AGPL.** Si la app se sirve al público, la licencia obliga a ofrecer el código fuente. Hoy no hay enlace (ver fase 7).
- **Dominio.** La tarjeta MCP se identifica como `com.odelza/odelza` y apunta a `https://odelza.com`; eso supone que el dominio es de Odelza.

### Probar cuando exista el dominio con HTTPS

- Conector de ChatGPT: crear el conector con `https://<dominio>/mcp` y entrar con OAuth. Hay reportes de errores de OAuth de ChatGPT con algunos servidores, y el modo desarrollador depende del plan de ChatGPT de cada usuario.
- Tarjetas de Claude y Replit, que también se activan solas con HTTPS.
- og:image al compartir un enlace (fase 3).
- Logo de los correos en un cliente real (fase 6, `odd/tasks/email-logo-server-url.md`).

### Lo que sigue diciendo Twenty a propósito

Se revisan en la fase 7. Hoy se quedan porque cambiarlas rompe algo o porque son de Twenty de verdad:

- **Contratos y datos:** headers `X-Twenty-Webhook-*`, User-Agent `Twenty-Marketplace` y `Twenty-AppUpgrade`, el nombre guardado "Twenty standard application", universal identifiers, `npx create-twenty-app` y los paquetes de npm. En el helper de Python que usa la IA, la clase `TwentyMCP` y la variable `twenty`.
- **Documentación de Twenty:** los 11 enlaces a `docs.twenty.com` del inventario del paso 49, incluido el widget "our documentation" del dashboard inicial.
- **Enterprise:** Admin Panel > Enterprise, `ENTERPRISE_API_URL` y las tarjetas de funciones enterprise.
- **Billing apagado:** el código sigue, con textos de Twenty Cloud ("Subdomain (yourco.twenty.com)", `CAL_LINK` "talk to us" de la prueba gratis). No se ve con `IS_BILLING_ENABLED=false`.
- **DPA:** la plantilla, el servicio y la tabla `dpaAgreement` siguen en el server, sin rutas ni API.
- **Correos:** remitente "(via Twenty)", footer, `WhatIsTwenty.tsx` y logo (fase 6).
- **2FA:** el nombre que muestra la app de autenticación cambia solo para lo que se active desde la fase 4. Quien ya tenía 2FA sigue viendo "Twenty" hasta que lo vuelva a activar.
- **Código:** comentarios, nombres de archivos, carpetas y paquetes (renombre pospuesto).

### Notas técnicas para el futuro

- **Memoria en Windows.** El servidor de lint de VS Code (`oxlint --lsp`, con el plugin JS de `twenty-oxlint-rules`) compromete unos 37 GB y deja a Windows cerca de su límite. Con eso, el build de la imagen puede tumbar la VM de Docker y oxlint por línea de comandos no arranca. Cerrar VS Code o desactivar la extensión durante el build lo evita.
- **`scripts/odelza-backup.sh` en Git Bash:** convierte `/data` en una ruta de Windows y deja el tar vacío. Mientras no se corrija, el respaldo se hace a mano con `MSYS_NO_PATHCONV=1` solo en el `tar` (ver registros de las fases 3 a 5).
- **Barrel de `twenty-ui`.** `npx nx run twenty-ui:generateBarrels` agrega `getTranslucentColorForSurface` a `src/theme/index.ts`, que quedó sin exportar desde la fase 1. No se corrigió en la fase 5 para no mezclar cambios.
- **Traducciones a mano.** Los 5 mensajes nuevos de la fase 5 se tradujeron con los términos de cada catálogo, sin revisión de hablantes nativos. Conviene revisarlos en los idiomas que importen.
- **Agente Helper.** Ya no busca en documentación; su prompt pide ayudar con lo que ve en el workspace. Si Odelza tiene documentación propia, se le puede volver a dar una herramienta de búsqueda (precedente "Documentación propia").
- **Fase 1:** los nombres provisionales de colores (`*`) y los colores finos de etiquetas siguen abiertos para una tarea de ajuste.

### Lo que falta para terminar el plan

1. **Fase 6, correos:** remitente, footer, `WhatIsTwenty.tsx`, `<title>`, paleta, logo servido por el server, renombre de `twenty-emails` y revisión de las 12 plantillas. Necesita el remitente y el dominio.
2. **Fase 7, cierre:** barrido de "Twenty" con la lista de excepciones, fotos de ejemplo, enlace AGPL, verificación visual completa y registro final.
3. **Fase 8, ilustraciones:** cuando estén las ilustraciones de Odelza.
4. **Renombre de código (pasos 32 a 38):** paquetes `@odelza/*`, carpetas, archivos y símbolos. Las decisiones del paso 33 siguen vigentes. Falta decidir cuándo, porque toca miles de archivos y conviene hacerlo con pocas ramas abiertas.
5. **Precedentes de la fase 5,** cuando existan: términos y privacidad (antes de producción), redes, soporte, DPA, changelog, partners, app propia en ChatGPT y documentación propia.

## Insumos pendientes

- **Fase 1:** ninguno. Los nombres provisionales (`*`) quedan para una tarea de ajuste.
- **Fase 2:** ninguno. Logo recibido el 2026-11-05.
- **Fase 3:** ninguno. Tagline recibida el 2026-11-09.
- **Fase 5:** ninguno. Sitio `odelza.com` recibido el 2026-11-09.
- **Fase 6:** nombre y dirección del remitente de correos, y el dominio de la app con HTTPS.
- **Fase 8:** ilustraciones propias de Odelza.
- **Producción:** URLs de términos y privacidad, correo de contacto para la API (OpenAPI) y la decisión del enlace al código fuente (AGPL).
- Confirmar que se avanza con el nombre "Odelza" aunque el registro de marca esté pendiente.

## Paleta Odelza

Transcripción de `docs/brand/odelza-paleta-web.png` ("Odelza · Paleta web", adaptada de Coffee Bean, Blood Red y Butter). Los valores marcados con `*` no están en la paleta oficial: son propuestas con nombre provisional que el usuario puede cambiar.

Reglas de la paleta:

- Reparto 60-30-10: 60% fondos y superficies, 30% navegación, 10% acciones.
- Contraste AA: 4.5:1 en texto y 3:1 en bordes y controles.
- Sin negro puro en modo oscuro.
- Rojo aclarado y desaturado en modo oscuro.
- Los estados siempre van con ícono y texto, nunca solo con color.

Carácter de cada modo:

- **Claro:** fondo cálido, navegación Coffee Bean, acción Blood Red.
- **Oscuro:** superficies Coffee Bean, acción en rojo suavizado, texto Butter.

### Colores de marca

| Nombre | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Coffee Bean | `--odz-coffee-bean` | `#2D120D` | `#2D120D` | Claro: marca principal, texto y navegación. Oscuro: superficie principal (tarjetas y tablas). |
| Blood Red | `--odz-blood-red` | `#6B0B0C` | | Marca secundaria, acción primaria. |
| Blood Red suave | `--odz-blood-red-soft` | | `#E0645B` | Rojo aclarado y desaturado para acciones en oscuro. |
| Butter | `--odz-butter` | `#FEEFB8` | `#FEEFB8` | Claro: marca de apoyo, resaltado y botón secundario. Oscuro: texto y acento (más suave en cuerpos). |

### Colores de estado y derivados

La paleta oficial nombra los estados por su rol, no por su color. Estos nombres de color son provisionales.

| Nombre | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Pine* | `--odz-pine` | `#1F6B3A` | `#7ED494` | Éxito, familia `green` |
| Honey* | `--odz-honey` | `#7A5200` | `#F2C14E` | Advertencia, familias `yellow`/`amber` |
| Chili* | `--odz-chili` | `#B3261E` | `#FF9A90` | Error, familia `red` |
| Denim* | `--odz-denim` | `#1D5F9E` | `#8EBBEF` | Información, familias `blue`/`sky` |
| Mocha* | `--odz-mocha` | `#5C463F` | `#CDB98F` | Neutro, familia `gray` |
| Mulberry* | `--odz-mulberry` | `#6E3B8F*` | `#C9A2E6*` | Familias `purple`/`violet`/`plum`/`pink` |
| Eucalyptus* | `--odz-eucalyptus` | `#14695F*` | `#6FCDBE*` | Familias `jade`/`mint`/`turquoise`/`cyan` |
| Cinnamon* | `--odz-cinnamon` | `#9A4310*` | `#F2A065*` | Familias `orange`/`tomato`/`bronze`/`brown` |

### Roles

Lo que consumen los componentes. El contraste es el que indica la paleta oficial.

**Fondos y superficies (60%)**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Fondo de página | `--odz-background-page` | `#FFFBF0` | `#1A0C09` | Lienzo de toda la interfaz |
| Superficie | `--odz-surface` | `#FFFFFF` | `#2D120D` | Tarjetas, tablas (y barra superior en claro) |
| Superficie alterna | `--odz-surface-alt` | `#FEF6D8` | `#3A1B15` | Encabezado de tabla, hover |
| Superficie elevada | `--odz-surface-elevated` | `#FFFFFF*` con sombra | `#47241C` | Menús, modales y tooltips |
| Selección | `--odz-selection` | `#FEF5D4` | `#4A3125*` | Fila o ítem seleccionado |

**Texto**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Texto principal | `--odz-text-primary` | `#2D120D` (17.4:1) | `#F6E9BF` (14.4:1) | Títulos y cuerpo |
| Texto secundario | `--odz-text-secondary` | `#5C463F` (8.7:1) | `#CDB98F` (9.1:1) | Etiquetas, metadatos y fechas |
| Texto terciario | `--odz-text-tertiary` | `#7C6A62` (5.1:1) | `#A39279` (5.8:1) | Ayudas y placeholders |
| Texto deshabilitado* | `--odz-text-disabled` | `#B8ACA5*` | `#6E5249*` | Controles deshabilitados |

**Bordes**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Borde sutil | `--odz-border-subtle` | `#E4DDD2` | `#4A2D25` | Divisores y contornos de tarjetas |
| Borde fuerte | `--odz-border-strong` | `#928481` (3.6:1) | `#8F6F63` (3.8:1) | Campos y controles (mín. 3:1) |

**Navegación (30%)**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Barra lateral | `--odz-nav-background` | `#2D120D` | `#140806` | Menú principal |
| Texto de navegación | `--odz-nav-text` | `#E5D4A3` (11.9:1) | `#DCCB9E` (12.3:1) | Normal |
| Texto de navegación atenuado | `--odz-nav-text-muted` | `#A69270` | `#A8977A` | Atenuado |
| Ítem activo | `--odz-nav-item-active` | `#4A3125` | `#2D120D` | Fondo del elemento seleccionado |

**Acciones (10%)**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Primaria | `--odz-primary` | `#6B0B0C` | `#E0645B` | Botón principal, normal |
| Primaria hover | `--odz-primary-hover` | `#861518` | `#EB7B72` | Botón principal, hover |
| Primaria presionada | `--odz-primary-pressed` | `#4D0809` | `#CC5047` | Botón principal, presionado |
| Texto sobre primaria | `--odz-on-primary` | `#FEEFB8` (10.9:1) | `#2D120D` (5.1:1) | Etiqueta del botón primario |
| Botón secundario | `--odz-secondary` | `#FEEFB8` | `#4A3125` | Normal |
| Botón secundario hover | `--odz-secondary-hover` | `#FAE29A` | `#5B4333` | Hover |
| Texto sobre secundario* | `--odz-on-secondary` | `#2D120D*` | `#F6E9BF*` | Etiqueta del botón secundario |
| Foco y enlaces | `--odz-focus` | `#6B0B0C` | `#F0A29B` | Anillo de foco, enlaces |

**Estados (siempre con ícono y texto)**

| Rol | Variable (color / fondo) | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Éxito | `--odz-status-success` / `-surface` | `#1F6B3A` / `#E2F2E6` (5.6:1) | `#7ED494` / `#17301F` (7.9:1) | Hecho, guardado |
| Advertencia | `--odz-status-warning` / `-surface` | `#7A5200` / `#FFEFC2` (6.1:1) | `#F2C14E` / `#3A2A0A` (8.3:1) | En revisión, pendiente |
| Error / urgente | `--odz-status-error` / `-surface` | `#B3261E` / `#FCE3E0` (5.4:1) | `#FF9A90` / `#451611` (7.5:1) | Prioridad alta, fallo |
| Información | `--odz-status-info` / `-surface` | `#1D5F9E` / `#E1EDF8` (5.6:1) | `#8EBBEF` / `#14283E` (7.5:1) | En progreso, avisos |
| Neutro | `--odz-status-neutral` / `-surface` | `#5C463F` / `#F1EAE0` (7.3:1) | `#CDB98F` / `#3A2A24` (7.1:1) | Por hacer, baja prioridad |

**Otros roles derivados**

| Rol | Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- | --- |
| Fondo invertido* | `--odz-inverted-background` | `#2D120D*` | `#F6E9BF*` | Tooltips oscuros, chips invertidos |
| Texto invertido* | `--odz-inverted-text` | `#FEEFB8*` | `#2D120D*` | Texto sobre fondo invertido |
| Overlay y sombra* | `--odz-overlay` | `#2D120D*` | `#140806*` | Fondo de modales, sombras (sin negro puro) |

### Notas para la implementación

- **Cambio respecto al commit `025bfb65d6`:** ahí el texto del botón principal quedó blanco porque `Button.module.scss` lo fija y no se quería tocar, y por eso el rojo del modo oscuro se reemplazó por `#CF3B30`. Ahora el código es nuestro: se usan los valores oficiales (`#E0645B` / `#EB7B72` / `#CC5047`) con texto Coffee Bean en oscuro y Butter en claro.
- **Neutros 1 a 12:** las escalas de grises que pide la UI (hover, divisores, fondos de controles) se interpolan entre los fondos, superficies, bordes y textos de la tabla de roles, sin agregar colores nuevos.
- **Por verificar:** contraste de los valores con `*` (selección y botón secundario en oscuro, texto deshabilitado) con los tests del paso 3.
