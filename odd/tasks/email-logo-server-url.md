# Logo de correos servido por el server de Odelza

## Objetivo

Que los correos muestren el logo de Odelza cargado desde nuestro propio server, en lugar de `app.twenty.com` y `twentyhq.github.io`.

Viene del paso 23 de `odelza-platform-theme.md`. Se separó el 2026-11-05 para hacerla después de fusionar el branding a `main`, porque el resultado real solo se ve con el server desplegado en un dominio público.

## Contexto

- Los íconos de Odelza ya se sirven desde el front en `/images/odelza/*` (generados por `scripts/odelza-brand-assets.mjs`).
- Un correo lleva un enlace a la imagen, no la imagen. El cliente de correo la descarga, así que la URL tiene que ser pública y con HTTPS. Con `SERVER_URL=http://localhost:3000` el logo no se ve en Gmail; en producción funciona sin cambios.
- Hoy está fijo en:
  - `packages/twenty-emails/src/components/Logo.tsx` (`app.twenty.com/images/icons/windows11/...`, ruta que ya no existe).
  - `packages/twenty-emails/src/constants/DefaultWorkspaceLogo.ts` (`twentyhq.github.io`), usado en `validate-approved-access-domain.email.tsx`.
- Solo 2 de las 12 plantillas reciben `serverUrl` (`send-invite-link`, `validate-approved-access-domain`).

## Plan

1. `BaseEmail` recibe `serverUrl` y se lo pasa a `Logo`, que arma `${serverUrl}/images/odelza/icon-192.png`.
2. Las 12 plantillas reciben `serverUrl` y se lo pasan a `BaseEmail`.
3. Los servicios del server que renderizan correos pasan `SERVER_URL` desde la configuración: `admin-panel-server-admin`, `approved-access-domain`, `auth`, `reset-password`, `billing-reminder`, `email-verification`, `workspace-invitation`, `cleaner.workspace-service`.
4. `DEFAULT_WORKSPACE_LOGO` de emails pasa a `${serverUrl}/images/odelza/workspace-logo.png`.
5. Verificación: typecheck de emails y server, render de una plantilla revisando el HTML, y un correo real una vez desplegado con dominio.

## Estado

- Pendiente. Empieza después de fusionar `feat/odelza-platform-theme` a `main`.
