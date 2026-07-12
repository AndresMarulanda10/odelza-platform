# Odelza Platform

This repository is a private, upstream-tracking derivative of
[Twenty](https://github.com/twentyhq/twenty). It is an independent GitHub
repository, not a member of Twenty's GitHub fork network. Twenty's history is
preserved so upstream changes can be merged normally.

## Local runtime

The local runtime uses Twenty's official self-hosting Compose file and an
ignored `packages/twenty-docker/.env`. Docker resources use the `odelza`
Compose project name to avoid collisions with other Twenty installations.

Run commands from the repository root.

```bash
# Start the local stack
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  up --detach --wait

# Pull the configured images, then recreate the stack
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  pull
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  up --detach --wait

# Check service state
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  ps

# Follow logs
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  logs --follow

# Stop containers while preserving local data
docker compose --project-name odelza \
  --env-file packages/twenty-docker/.env \
  --file packages/twenty-docker/docker-compose.yml \
  down
```

The application is available at <http://localhost:3000>. Its health endpoint
is <http://localhost:3000/healthz>.

## Local secrets

Create `packages/twenty-docker/.env` locally. The repository-wide `.gitignore`
excludes `.env` files. Never commit this file or reuse its secrets outside the
local environment.

Required values:

```dotenv
TAG=latest
PG_DATABASE_PASSWORD=<strong alphanumeric password>
SERVER_URL=http://localhost:3000
ENCRYPTION_KEY=<output of: openssl rand -base64 32>
STORAGE_TYPE=local
```

## Update from Twenty

Review upstream changes before merging them into Odelza.

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
