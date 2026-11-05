# Odelza platform theme

## Objetivo

Reemplazar la paleta Gruvbox por la paleta Odelza (claro y oscuro) usando el mecanismo de tema que ya existe. Es un tema global para todos los usuarios y workspaces. La paleta sale de `odelza-paleta-web-dashboard.pdf`; las maquetas del PDF son solo referencia, no un diseño que haya que replicar.

Fuera de alcance: cambiar componentes o el layout (barra lateral oscura, barra indicadora de ítem activo, botón secundario Butter), tipografía, logo/favicon/título, branding por workspace, correos.

## Estado

Implementado en la rama `feat/odelza-platform-theme` (cambios en stage, sin commit). Falta la verificación visual (paso 8). Los ajustes que salgan de la revisión van en un arreglo posterior.

### Registro 2026-11-04

- Pasos 1 a 6 hechos tal como en el plan. `git mv` de los tres archivos Gruvbox. Al traductor se le agregaron `primary` y `createPrimaryRamp`, y `--t-color-blue*`, `--t-accent-*`, `--t-border-color-blue`, `--t-background-transparent-blue` y `--t-buttons-secondary-text-color` usan ahora el primario. Etiquetas `blue`/`sky`, snackbar de info, código e ilustraciones mantienen el azul informativo. `git grep -i gruvbox` sin resultados fuera de `odd/`.
- Test: `npx jest src/modules/ui/theme/utils/__tests__/resolveOdelzaTheme.test.ts --config=jest.config.mjs` → 12/12. Incluye casos nuevos para la familia `blue` como acción (hover en el tono 10, presionado en el 12) y para el azul informativo en etiquetas y snackbar.
- Lint: `nx lint:diff-with-main` no corre en Windows (usa sintaxis POSIX en `cmd`). Se corrieron sus mismos comandos desde bash sobre los 5 archivos: `oxlint --type-aware` 0 warnings / 0 errores y `oxfmt --check` correcto.
- Typecheck: `nx typecheck` falla en Windows antes de llegar al chequeo, porque el build de `twenty-ui` vía nx falla en Windows (con `npx vite build` directo compila). `npx tsgo -p tsconfig.json` en `twenty-front` da 15 errores, todos en `modules/front-components` por paquetes sin compilar (`twenty-front-component-renderer`, `twenty-sdk`, cuyo build tampoco corre en Windows). Hay 0 errores en `ui/theme`. Queda pendiente un typecheck limpio en Linux/macOS o en CI.
- Entorno: `corepack yarn install` (sin cambios en `yarn.lock`) y `nx build twenty-shared`, necesario para jest.

## Cómo funciona hoy

`createGruvboxThemeOverrides(paleta)` convierte unos 30 colores en las variables CSS `--t-*` de Twenty. `gruvboxLight/DarkThemeOverrides.ts` le pasan los valores, y `resolveOdelzaTheme` elige claro u oscuro y los aplica en `<html>`. El plan cambia los valores y hace dos ajustes al traductor. No toca archivos de Twenty.

## Ajustes necesarios al traductor (y por qué)

1. **Separar el color de acción del azul informativo.** En Twenty, la familia `blue` es el color de acción de la interfaz: el botón principal usa `--t-color-blue` (hover `blue10`, presionado `blue12`), y lo mismo el foco, los enlaces, los widgets, los workflows y la IA (68 archivos). Gruvbox no lo notaba porque su acento era azul. En Odelza la acción es Blood Red y el azul es solo "Información". Se agrega `primary` a la paleta y se asigna a `--t-color-blue*`, `--t-accent-*`, `--t-buttons-secondary-text-color`, `--t-border-color-blue` y `--t-background-transparent-blue`. El azul de la paleta queda para lo informativo: etiquetas `blue`/`sky`, el snackbar de info y el código.
2. **Hover y presionado reales en el botón principal.** Hoy la escala usa el mismo color en las posiciones 8 a 11 y el color de texto en la 12, así que al presionar el botón su fondo pasa al color del texto. En modo oscuro el botón queda crema con texto blanco, ilegible por un instante (es un bug que ya existe con Gruvbox). La escala del primario usa el hover de la paleta en la posición 10 y el presionado en la 12.

## Adaptaciones de la paleta

- **Rojo de acción en modo oscuro.** El texto de los botones principales es blanco fijo en `twenty-ui` (`Button.module.scss`, no se puede cambiar con tokens). Con texto blanco, el rojo oscuro del PDF da 3.42:1 en normal y 2.76:1 en hover, así que no pasa AA. Se usa un rojo más intenso del mismo tono: `#CF3B30` / `#C6392F` / `#B6342B` (4.86 / 5.21 / 5.97 con blanco, y 3.93 contra el fondo). En modo claro se usan los del PDF sin cambios (12.5 / 9.8 / 15.5).
- **El texto sobre el botón principal queda blanco**, no Butter, por la misma razón.
- **Colores que el PDF no define** y que el traductor necesita: morado, aqua y naranja (para las familias purple/violet/plum/pink, jade/mint/turquoise/cyan y orange/tomato/bronze/brown de las etiquetas). Se derivaron en el mismo estilo. También se derivan un texto extra-claro (deshabilitados) y algunos pasos de la escala de grises. Todos están marcados con `*` en la tabla.

## Valores

| Campo del traductor | Claro | Oscuro |
| --- | --- | --- |
| `background[0..3]` (contenido, paneles, hover, activo) | `#FFFFFF` `#FFFBF0` `#FEF6D8` `#E4DDD2` | `#1A0C09` `#2D120D` `#3A1B15` `#47241C` |
| `foreground[0..4]` (principal, secundario, terciario, placeholder, deshabilitado) | `#2D120D` `#5C463F` `#7C6A62` `#928481` `#B8ACA5*` | `#F6E9BF` `#CDB98F` `#A39279` `#8F6F63` `#6E5249*` |
| `neutralRamp[1..12]` | `#FFFFFF` `#FFFBF0` `#FEF6D8` `#F1EAE0` `#E4DDD2` `#C9BDB4*` `#928481` `#7C6A62` `#5C463F` `#4A3125` `#3A1B15` `#2D120D` | `#1A0C09` `#2D120D` `#3A1B15` `#47241C` `#4A2D25` `#5B4333` `#8F6F63` `#A39279` `#B8A584*` `#CDB98F` `#DCCB9E` `#F6E9BF` |
| `primary` normal / hover / presionado (nuevo) | `#6B0B0C` `#861518` `#4D0809` | `#CF3B30*` `#C6392F*` `#B6342B*` |
| `accents.red` (error) | `#B3261E` | `#FF9A90` |
| `accents.green` (éxito) | `#1F6B3A` | `#7ED494` |
| `accents.yellow` (advertencia) | `#7A5200` | `#F2C14E` |
| `accents.blue` (información) | `#1D5F9E` | `#8EBBEF` |
| `accents.purple` / `aqua` / `orange` | `#6E3B8F*` `#14695F*` `#9A4310*` | `#C9A2E6*` `#6FCDBE*` `#F2A065*` |
| `invertedBackground` / `invertedForeground` | `#2D120D` / `#FEEFB8` | `#F6E9BF` / `#2D120D` |
| `overlay` / `shadow` | `#2D120D` | `#140806` (sin negro puro) |

Resultado esperado: en claro, contenido blanco sobre un marco y una barra lateral crema (`gray3` = `#FEF6D8`), texto café y acción Blood Red. En oscuro, contenido `#1A0C09`, barra lateral `#3A1B15`, texto Butter y acción roja.

Contraste verificado (WCAG 2.1): textos principal, secundario y terciario ≥ 4.5:1 sobre sus fondos; etiquetas de estado y derivadas sobre su fondo translúcido ≥ 5.1:1 en claro y ≥ 7:1 en oscuro; botón de peligro 6.54 (claro) y 9.34 (oscuro); placeholder 3.6 (claro) y 4.2 (oscuro), mejor que el gris por defecto de Twenty.

## Plan de implementación

1. Crear la rama `feat/odelza-platform-theme` desde `main`.
2. `git mv` de `utils/createGruvboxThemeOverrides.ts` a `utils/createOdelzaThemeOverrides.ts`. Renombrar el tipo a `OdelzaPalette`, agregar `primary: { base, hover, pressed }` y aplicar los ajustes 1 y 2. El resto de la asignación de tokens no cambia.
3. `git mv` de `constants/gruvboxLightThemeOverrides.ts` y `gruvboxDarkThemeOverrides.ts` a `odelzaLightThemeOverrides.ts` y `odelzaDarkThemeOverrides.ts`, con los valores de la tabla.
4. Actualizar los imports en `utils/resolveOdelzaTheme.ts`. No cambia su lógica.
5. Actualizar `utils/__tests__/resolveOdelzaTheme.test.ts` con los valores Odelza, y agregar casos para que `--t-color-blue` y `--t-accent-primary` sean el primario mientras `--t-tag-text-blue` y el snackbar de info sigan siendo azules, y para que `blue10`/`blue12` sean hover/presionado.
6. Buscar referencias sueltas a "gruvbox" en el repo.
7. `npx jest` del test, `npx nx lint:diff-with-main twenty-front` y `npx nx typecheck twenty-front`.
8. Verificación visual en claro y oscuro: Storybook en esta máquina y la app real donde corre el stack. Revisar botón principal (normal/hover/presionado), botón de peligro, foco, fila seleccionada, etiquetas de colores, snackbars, dropdowns, modales, tabla, kanban, dashboards y workflows.
9. Ajustar valores solo en los archivos de paleta si algo se ve mal, y registrar aquí lo hecho, cómo se verificó y el estado.
10. Commit y PR solo con autorización explícita.

## Archivos

- Renombrados y modificados: `ui/theme/utils/createGruvboxThemeOverrides.ts` → `createOdelzaThemeOverrides.ts`; `ui/theme/constants/gruvbox{Light,Dark}ThemeOverrides.ts` → `odelza{Light,Dark}ThemeOverrides.ts`.
- Modificados: `ui/theme/utils/resolveOdelzaTheme.ts` (imports) y su test.
- Sin cambios en `twenty-ui`, en componentes de Twenty, en backend, en base de datos ni en GraphQL.

## Puntos a revisar en la verificación visual

- **Fila seleccionada:** usa el primario al 12% de opacidad, así que en claro se verá rosado suave. Si no convence, se cambia por el `#FEF5D4` del PDF en una línea.
- Las opciones o series de gráficos con color "blue" que lean `--t-color-blue` directamente (sin pasar por los tokens de etiqueta) se verán rojas.
- Enlaces y foco en modo oscuro: `#CF3B30` sobre el fondo da 3.93:1. Pasa para controles (3:1), pero queda bajo 4.5:1 para texto pequeño. Twenty acepta lo mismo con su azul por defecto.
- Componentes de Twenty con colores fijos que no usan tokens: se anotan, no se parchean.

## Problemas conocidos (para el próximo arreglo)

### Gráficas "blue" en rojo

- **Causa:** `page-layout/widgets/graph/utils/createGraphColorRegistry.ts` arma la paleta de las gráficas con `theme.color.<familia>1..12` (color sólido = tono 8; series agrupadas = tonos 3 a 8). Este plan asigna el primario Blood Red a `--t-color-blue*`, porque Twenty usa esa familia como color de acción: botón principal (`blue`, `blue10`, `blue12`), casilla (`blue7`), celda enfocada (`blue8`), botones ligeros (`blue3`), tarjetas y grilla (`blue7`). Las gráficas leen las mismas variables.
- **Efectos:**
  - Las gráficas en modo automático arrancan en rojo, porque `getColorSchemeByIndex` toma las familias en orden y `blue` es la primera.
  - Una opción select azul se ve azul en la tabla (tokens `--t-tag-*`) pero roja en la gráfica.
  - Las series "blue" y "red" se confunden.
- **Por qué no se arregla solo con la paleta:** las gráficas y la interfaz usan los mismos números de tono (3, 5, 7 y 8), así que no se pueden separar con variables.
- **Opciones:**
  - A) Aceptarlo y documentar que "blue" es el color de marca en las gráficas.
  - B) **Recomendada:** que la entrada `blue` de `createGraphColorRegistry.ts` lea `colorSource.sky1..12`, que en el traductor es el azul informativo. Son unas 13 líneas en un archivo de Twenty.
  - C) Envolver las gráficas en un `ThemeProvider` con ámbito propio. Es más complejo que B para el mismo resultado.

### Matices de las familias de color (ya ocurre con Gruvbox)

- `createRamp` llena los tonos 1 a 7 de todas las familias con la escala de grises y solo los tonos 8 a 11 con el color. Una gráfica agrupada de un solo color con 5 grupos muestra 4 tonos neutros y uno con color.
- **Posible arreglo dentro del traductor:** generar matices reales (el color mezclado con el fondo en pasos). Afecta también a componentes que usan esos tonos (botones ligeros, casillas, grilla), así que requiere revisión visual.
