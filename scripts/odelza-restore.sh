#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
COMPOSE_FILE="$ROOT/packages/twenty-docker/docker-compose.yml"
ENV_FILE="$ROOT/packages/twenty-docker/.env"
BACKUP_DIR=${1:-}

compose() {
  docker compose --project-name odelza --env-file "$ENV_FILE" --file "$COMPOSE_FILE" "$@"
}

resume_application() {
  compose up --detach --wait server worker >/dev/null
}

if [ -z "$BACKUP_DIR" ]; then
  printf 'Usage: %s backups/<timestamp>\n' "$0" >&2
  exit 1
fi

case "$BACKUP_DIR" in
  /*) ;;
  *) BACKUP_DIR="$ROOT/$BACKUP_DIR" ;;
esac

for file in postgres.dump server-local-data.tar.gz MANIFEST.txt SHA256SUMS; do
  if [ ! -f "$BACKUP_DIR/$file" ]; then
    printf 'Missing backup file: %s\n' "$BACKUP_DIR/$file" >&2
    exit 1
  fi
done

(cd "$BACKUP_DIR" && shasum -a 256 -c SHA256SUMS)

printf '%s\n' 'WARNING: this destroys the current Odelza database and local file storage.' >&2
printf '%s' 'Type RESTORE ODELZA to continue: ' >&2
IFS= read -r confirmation
if [ "$confirmation" != 'RESTORE ODELZA' ]; then
  printf '%s\n' 'Restore cancelled.' >&2
  exit 1
fi

server_container=$(compose ps --quiet server)
if [ -z "$server_container" ] || [ -z "$(compose ps --quiet db)" ]; then
  printf '%s\n' 'The Odelza server and database must be running before restore.' >&2
  exit 1
fi
server_image=$(docker inspect --format '{{.Config.Image}}' "$server_container")

compose stop worker server >/dev/null
trap resume_application EXIT HUP INT TERM

compose exec --no-TTY db sh -c \
  'dropdb --if-exists --force --username="$POSTGRES_USER" "$POSTGRES_DB" && createdb --username="$POSTGRES_USER" "$POSTGRES_DB"'
compose exec --no-TTY db sh -c \
  'exec pg_restore --exit-on-error --no-owner --no-privileges --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  <"$BACKUP_DIR/postgres.dump"

docker run --rm --entrypoint sh \
  --volume odelza_server-local-data:/data \
  --volume "$BACKUP_DIR:/backup:ro" \
  "$server_image" -c 'find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C /data -xzf /backup/server-local-data.tar.gz'

resume_application
trap - EXIT HUP INT TERM

compose ps
curl --fail --silent --show-error http://localhost:3000/healthz >/dev/null
printf '%s\n' 'Restore completed; service state is shown above and /healthz returned success.'
