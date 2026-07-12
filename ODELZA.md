# Odelza Platform

This repository is a private, upstream-tracking derivative of
[Twenty](https://github.com/twentyhq/twenty). It is an independent GitHub
repository, not a member of Twenty's GitHub fork network. Twenty's history is
preserved so upstream changes can be merged normally.

## Local runtime

The local runtime uses Twenty's official self-hosting Compose file and an
ignored `packages/twenty-docker/.env`. Docker resources use the `odelza`
Compose project name to avoid collisions with other Twenty installations.
These procedures are for local development, not production operations.

Run commands from the repository root. Port `3000` is fixed by the upstream
Compose file; stop the conflicting process before starting Odelza.

```bash
# Preflight: no output means port 3000 is available
lsof -nP -iTCP:3000 -sTCP:LISTEN

# Validate configuration without printing the rendered environment
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  config --quiet

# Start the local stack
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  up --detach --wait
```

The application is available at <http://localhost:3000>. Its health endpoint
is <http://localhost:3000/healthz>.

### Repeatable verification

```bash
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml ps
curl --fail --silent --show-error --output /dev/null \
  --write-out 'healthz=%{http_code}\n' http://localhost:3000/healthz

# The upstream worker has no healthcheck; verify it is running and scan recent logs.
test -n "$(docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml ps --quiet --status running worker)"
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  logs --since 10m worker | grep -Eai 'error|fatal|panic|unhandled' || true

git status --short --branch
test "$(stat -f '%Lp' packages/twenty-docker/.env)" = 600
```

Observability is intentionally local-only: Compose state, container logs, and
`/healthz`. No remote metrics, alerting, or log retention is configured.

To stop containers while preserving local data:

```bash
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml down
```

## Local secrets

Create `packages/twenty-docker/.env` locally with mode `600`. The
repository-wide `.gitignore` excludes `.env` files. Never commit, print, back
up, or reuse this file outside the local environment.

Required values:

```dotenv
TAG=<release-tag>@sha256:<matching-image-digest>
PG_DATABASE_PASSWORD=<strong alphanumeric password>
SERVER_URL=http://localhost:3000
ENCRYPTION_KEY=<output of: openssl rand -base64 32>
STORAGE_TYPE=local
```

## Backup and restore

Create a timestamped PostgreSQL and `server-local-data` backup. The script
briefly stops the server and worker for a consistent snapshot, leaves the
database running for `pg_dump`, restarts the application even after failure,
and never reads or copies `.env` into the backup.

```bash
./scripts/odelza-backup.sh
```

Backups are mode `600` under the ignored `backups/<UTC timestamp>/` directory.
Each contains a custom-format PostgreSQL dump, local-storage archive, image
metadata, and SHA-256 checksums. Copy the full timestamped directory if an
off-machine local-development backup is needed.

Restore is DESTRUCTIVE. It replaces the current database and all
`server-local-data`. Take a fresh backup first, confirm the selected timestamp,
and never run restore against the live instance merely as a test.

```bash
./scripts/odelza-backup.sh
./scripts/odelza-restore.sh backups/<UTC timestamp>
```

The restore script validates checksums before prompting for the exact phrase
`RESTORE ODELZA`, stops application writers, restores both data stores, starts
the stack, displays service state, and requires `/healthz` to succeed. After a
restore, also run the worker verification and log scan above and inspect the
application's expected records and uploaded files.

## Safe image update

Never update using `latest`. First inspect the configured reference, running
image ID, and registry digest without exposing `.env` values:

```bash
grep '^TAG=' packages/twenty-docker/.env
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml images server worker
docker inspect --format '{{.Config.Image}} {{.Image}}' odelza-server-1
docker image inspect --format '{{json .RepoDigests}}' \
  "$(docker inspect --format '{{.Config.Image}}' odelza-server-1)"
```

Choose a published Twenty release tag, read its release notes for migration
requirements, pull it explicitly, and record its matching digest. Then manually
set only `TAG` in the local `.env` to `<release-tag>@sha256:<digest>`; do not
rewrite or regenerate the file because it contains local secrets.

```bash
RELEASE_TAG='<published-release-tag>'
docker pull "twentycrm/twenty:$RELEASE_TAG"
docker image inspect --format '{{index .RepoDigests 0}}' \
  "twentycrm/twenty:$RELEASE_TAG"

./scripts/odelza-backup.sh
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  config --quiet
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  pull server worker
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  up --detach --wait server worker
```

Validate `/healthz`, worker state/logs, and application data immediately. Scan
server logs for failed migrations before accepting the update:

```bash
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  logs --since 10m server | grep -Eai 'migration.*(error|fail)|error.*migration' || true
```

If validation fails, restore the previous `TAG` value and run `up --detach
--wait server worker` again. This is the first rollback boundary and does not
touch data. Restore the pre-update backup only when the release migrated or
otherwise changed data incompatibly; data restore is destructive and discards
changes made after that backup.

## Update from Twenty

Application image updates and source-history updates are separate operations.
Review upstream source changes before merging them into Odelza:

```bash
git fetch upstream
git switch main
git pull --ff-only origin main
git merge upstream/main
git push origin main
```

The remotes must remain:

```text
origin   git@github.com:AndresMarulanda10/odelza-platform.git
upstream https://github.com/twentyhq/twenty.git
```
