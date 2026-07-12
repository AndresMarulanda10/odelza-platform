#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
COMPOSE_FILE="$ROOT/packages/twenty-docker/docker-compose.yml"
ENV_FILE="$ROOT/packages/twenty-docker/.env"
BACKUP_ROOT="$ROOT/backups"
TIMESTAMP=$(date -u '+%Y%m%dT%H%M%SZ')
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"

compose() {
  docker compose --project-name odelza --env-file "$ENV_FILE" --file "$COMPOSE_FILE" "$@"
}

resume_application() {
  compose up --detach --wait server worker >/dev/null
}

if [ ! -f "$ENV_FILE" ]; then
  printf '%s\n' "Missing $ENV_FILE" >&2
  exit 1
fi

server_container=$(compose ps --quiet server)
if [ -z "$server_container" ] || [ -z "$(compose ps --quiet db)" ]; then
  printf '%s\n' 'The Odelza server and database must be running before backup.' >&2
  exit 1
fi

server_image=$(docker inspect --format '{{.Config.Image}}' "$server_container")
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_ROOT" "$BACKUP_DIR"

compose stop worker server >/dev/null
trap resume_application EXIT HUP INT TERM

compose exec --no-TTY db sh -c \
  'exec pg_dump --format=custom --no-owner --no-privileges --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  >"$BACKUP_DIR/postgres.dump"

docker run --rm --entrypoint tar \
  --volume odelza_server-local-data:/data:ro \
  "$server_image" -C /data -czf - . >"$BACKUP_DIR/server-local-data.tar.gz"

{
  printf 'created_utc=%s\n' "$TIMESTAMP"
  printf 'compose_project=odelza\n'
  printf 'server_image=%s\n' "$server_image"
  docker image inspect --format 'server_image_id={{.Id}}' "$server_image"
  docker image inspect --format 'server_repo_digests={{json .RepoDigests}}' "$server_image"
} >"$BACKUP_DIR/MANIFEST.txt"

(cd "$BACKUP_DIR" && shasum -a 256 postgres.dump server-local-data.tar.gz MANIFEST.txt >SHA256SUMS)
chmod 600 "$BACKUP_DIR"/*

resume_application
trap - EXIT HUP INT TERM

printf 'Backup created: %s\n' "$BACKUP_DIR"
printf '%s\n' 'Validate it with: shasum -a 256 -c SHA256SUMS (from that directory)'
