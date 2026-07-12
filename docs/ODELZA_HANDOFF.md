# Odelza Session Handoff

Use this document to resume Odelza work safely in a new OpenCode session. The
current priority is to configure the personal workspace with real persistent
data while retiring the old second-brain stack without losing recoverable data.

## Start Here

1. Read [`ODELZA.md`](../ODELZA.md) for the current local URL and Compose,
   verification, backup, and update commands.
2. Treat all UI experimentation as persistent local data stored in Docker
   volumes. Never run `docker compose down -v` casually.
3. Do **not** run `scripts/odelza-restore.sh`. Its failure cleanup can restart
   the application against partially restored data. Fix and validate it in a
   separate scoped task before approving restore use.
4. Do not delete any second-brain resource until the export and verification
   sequence below is complete.

## Repository And Product

| Topic | Current state |
| --- | --- |
| Product name | `Odelza` is provisional pending formal trademark clearance. No domains have been purchased. |
| Repository | Private GitHub repository `AndresMarulanda10/odelza-platform`. |
| Remotes | `origin` is the private Odelza repository; `upstream` is Twenty. |
| Fork strategy | Keep the core fork minimal and easy to update from upstream. |
| Future modules | Plan a separate `odelza-apps` monorepo for reusable core, personal, finance, projects, CRM, client portal, and workspace-bridge modules. Do not create it yet. |
| Licensing | Core is mostly AGPL. Files marked Enterprise require commercial-license compliance. Publicly served modified AGPL code requires a corresponding source offer. |

## Architecture

Odelza uses isolated personal and client workspaces. Each workspace owns its
branding, roles, and data. There is no direct cross-workspace data sharing.
Selective assignments may synchronize across workspace boundaries through an
explicit bridge, without exposing the underlying workspace data.

The current UI is a legitimate modeling environment, not disposable mock data.
Manual configuration persists in local Docker volumes. Once models stabilize,
codify reusable versions in the future apps monorepo rather than growing the
core fork.

## Local Operations

- Runtime URL and commands: [`ODELZA.md`](../ODELZA.md).
- Persistent volumes: `odelza_db-data` and `odelza_server-local-data`.
- Local environment: `packages/twenty-docker/.env`, ignored by Git and mode
  `600`.
- Current bootstrap image setting: `TAG=latest`. This is acceptable only as
  bootstrap history; production must pin a tested release and image digest.
- Safe container shutdown preserves volumes. Volume deletion destroys the
  current personal-workspace experiments.
- Backup remains available through `scripts/odelza-backup.sh`; restore is not
  approved until its partial-failure behavior is fixed.

## Second-Brain Retirement

No deletion has been performed.

### Audited Resources

| Service | Current evidence and risk |
| --- | --- |
| GitHub | Public `AndresMarulanda10/second_brain`, default branch `main`; 12 open PRs; `main`, `development`, `feature`, and Dependabot branches; two CodeQL SARIF artifacts; active CI, Release, Copilot, Dependabot, and CodeQL workflows. Delete last. |
| Vercel | Project `second-brain`, ID `prj_0ciOYqM6lEO0hCCnL64AcRWZ1zZr`; `live=false`; more than 20 deployments; latest preview is READY; three Vercel domains; a production deployment exists. Capture configuration and deployment evidence before deletion. |
| Supabase | Project ref `lejjltphpqsggzgfsple`, URL `https://lejjltphpqsggzgfsple.supabase.co`; default branch inactive with status `MIGRATIONS_FAILED`; PR88 preview branch inactive; no Edge Functions; DB and storage table listings time out, while storage configuration remains accessible. Do not delete until the project is resumed and exports are verified. |

### Required Order

1. Inventory all second-brain resources and dependencies.
2. Resume Supabase and export the database, Auth, and Storage.
3. Verify that the backup is complete and recoverable.
4. Capture Vercel configuration and deployment evidence.
5. Disable and delete Vercel resources.
6. Delete the Supabase project.
7. Delete the GitHub repository last.
8. Optionally remove the local second-brain checkout only after final recovery
   verification.

## Session Guardrails

- Keep core modifications minimal and upstream-compatible.
- Preserve workspace isolation; synchronize only explicit assignment data.
- Never expose secrets, environment values, or personal identifiers in commits.
- Do not create `odelza-apps`, purchase domains, approve the restore script, or
  delete second-brain resources without a separately scoped decision and
  verification.
