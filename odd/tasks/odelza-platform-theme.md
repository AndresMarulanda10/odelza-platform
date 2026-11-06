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

- Identificadores técnicos que el usuario no ve y que no son del tema: nombres de paquetes, imports `twenty-*`, `twenty-env-config`, headers `X-Twenty-Webhook-*`, User-Agent, schemas de base de datos, "Twenty standard application". Cambiarlos rompe integraciones.
- Las claves de color guardadas como datos (`red`, `blue`, `green`... en opciones de select, etiquetas y vistas). Se conservan como identificadores porque están en la base de datos; lo que cambia es el color que muestran.
- Branding por workspace (ya existe en Twenty).
- `twenty-website`, `twenty-docs`, `twenty-zapier`, `twenty-companion`, `twenty-codex-plugin` y `create-twenty-app`.
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

## Estado

- **Fase 1 (tema Odelza):** replanteada el 2026-11-05. El commit `025bfb65d6` (traductor sobre la paleta de Twenty) queda como antecedente: se reemplaza su mecanismo y sus valores por la paleta oficial (ver "Paleta Odelza"). La paleta oficial se agregó al repo en `docs/brand/odelza-paleta-web.png` y se transcribió en este archivo.
- **Fase 1, revisión:** el 2026-11-05 el usuario aprobó los colores en la app real ("por ahora"). Si hacen falta ajustes de color, se agregan como tarea previa a la fase que los necesite. Falta el commit y el PR de la fase.
- **Fase 2 (logos y assets):** siguiente, desbloqueada por la aprobación de la fase 1.
- **Fases 3 a 5:** planeadas, sin empezar.
- **Bloqueos:** ninguno para la fase 1 (la paleta ya está transcrita). La fase 2 necesita los assets del logo Odelza. Ver "Insumos pendientes".

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
4. **Textos traducidos: reemplazo de marca al cargar el catálogo.** Lingui genera el ID de cada mensaje a partir de su texto. Editar ~70 strings haría que esos mensajes pierdan sus traducciones en los 30 idiomas. En su lugar, una función `applyBrandToCatalog` reemplaza `\bTwenty\b` por el nombre de la marca en los valores del catálogo, en los dos puntos de carga:
   - `twenty-front/src/utils/i18n/dynamicActivate.ts`
   - `twenty-server/src/engine/core-modules/i18n/i18n.service.ts`

   Así se cubren front, asuntos de correo y, si usan la misma instancia de i18n (hay que confirmarlo), los cuerpos de los correos, en todos los idiomas. Las frases que no tienen sentido con otro nombre ("Visit Twenty's GitHub", "Twenty.com, Public Benefit Corporation", "contact Twenty team") se editan o se quitan a mano.
5. **Literales sin traducir:** edición directa usando una constante `APP_NAME` en `twenty-shared`, para que un cambio de nombre futuro sea de una línea. El nombre Odelza sigue pendiente del registro de marca.
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
23. Logo de correos (`twenty-emails/src/components/Logo.tsx`) servido por nuestro server.
24. Ilustraciones con el estilo de Twenty (`ai/*-cover-*.png`, `onboarding/welcome-halftone.svg`, `onboarding/trust-badges`, `placeholders/*`): reemplazar o adaptar a la paleta.
25. Imagen social de los metadatos (og/twitter).
26. Verificación visual propia y **revisión visual del usuario**, que cierra la fase.

### Fase 3: textos

27. `applyBrandToCatalog` en front y server, con tests unitarios (reemplaza la palabra completa, no toca IDs ni placeholders, funciona en todos los idiomas).
28. Constante `APP_NAME` en `twenty-shared` y edición de los literales del front y del backend listados en el inventario (título por defecto, nombre de workspace por defecto, autor del timeline, MCP, issuer de 2FA, OpenAPI, prompts de IA, iCal, `from (via ...)`).
29. Frases que no se pueden resolver con el reemplazo: mensajes de error de billing, "Twenty fields" y similares. Editar solo las que no se lean bien.
30. Correos: footer sin enlaces a Twenty, reemplazar o quitar `WhatIsTwenty.tsx`, `<title>` en `BaseHead.tsx`.
31. Metadatos de texto en `index.html` y `manifest.json` (title, description, name, short_name) y valor por defecto de `EMAIL_FROM_NAME`.

### Fase 4: enlaces y dominio

32. Términos, privacidad y documentación: cambiar a URLs de Odelza (configurables) u ocultar. Incluye `FooterNote.tsx` y `DOCUMENTATION_BASE_URL`.
33. Ocultar Community, partners y DPA si no aplican. Verificar primero si ya quedan ocultos con billing desactivado.
34. Documentar en `ODELZA.md` las variables de dominio y correo para producción (`SERVER_URL`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, subdominios).

### Fase 5: cierre

35. Barrido final con `git grep -w Twenty` sobre código visible, con lista de excepciones justificadas en este archivo.
36. Verificación visual de la app completa con la imagen construida desde el fork.
37. Registrar aquí lo hecho, cómo se verificó y el estado. Commit y PR solo con autorización explícita.

## Insumos pendientes

- **Fase 1:** ninguno. Los nombres provisionales (`*`) se revisan en la revisión visual.
- **Fase 2:** logo Odelza: SVG maestro, isotipo cuadrado y variantes para fondo claro y oscuro. Ilustraciones propias, si se quieren reemplazar las de Twenty.
- Confirmar que se avanza con el nombre "Odelza" aunque el registro de marca esté pendiente.
- URLs propias de términos, privacidad y documentación, o la decisión de ocultar esos enlaces.
- Nombre y dirección del remitente de correos, y el dominio cuando exista.
- Tagline o descripción para los metadatos, e imagen social (opcional).

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
