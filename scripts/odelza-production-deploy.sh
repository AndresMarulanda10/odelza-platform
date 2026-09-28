#!/bin/sh
set -eu

umask 077

PROJECT_NAME=odelza
PRODUCTION_ROOT=/opt/odelza
COMPOSE_DIR=$PRODUCTION_ROOT/packages/twenty-docker
COMPOSE_FILE=$COMPOSE_DIR/docker-compose.yml
ENV_FILE=$COMPOSE_DIR/.env
BACKUP_ROOT=$PRODUCTION_ROOT/backups
CD_DATA_ROOT=$BACKUP_ROOT/cd-data
CD_METADATA_ROOT=$BACKUP_ROOT/cd-metadata
CD_DATA_RETENTION=10
CD_METADATA_RETENTION=10
APP_CONTAINER=odelza-app
WORKER_CONTAINER=odelza-jobs
HEALTH_URL=

APP_SERVICE=
WORKER_SERVICE=
IMAGE_ARCHIVE=
IMAGE_REF=
IMAGE_TAG=
LOCAL_IMAGE_ID=
IMAGE_CONFIG_DIGEST=
LOADED_IMAGE_ID=
BACKUP_DIR=
METADATA_DIR=
TEMP_ENV=
ROLLBACK_NEEDED=0
SERVER_IMAGE=
SERVER_IMAGE_ID=
DB_CONTAINER=
REDIS_CONTAINER=
DB_IDENTITY=
REDIS_IDENTITY=
PREVIOUS_TAG=
COMPOSE_CHECKSUM=

die() {
  printf 'odelza-production-deploy: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

compose() {
  docker compose \
    --project-name "$PROJECT_NAME" \
    --env-file "$ENV_FILE" \
    --file "$COMPOSE_FILE" \
    "$@"
}

wait_for_health() {
  attempt=0
  while [ "$attempt" -lt 60 ]; do
    if curl --fail --silent --show-error --output /dev/null "$HEALTH_URL"; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 5
  done
  printf 'server health check did not succeed at %s\n' "$HEALTH_URL" >&2
  return 1
}

verify_stateful_identities() {
  if ! current_db_identity=$(docker inspect --format '{{.Id}} {{.Image}}' "$DB_CONTAINER"); then
    printf '%s\n' 'could not inspect the PostgreSQL container' >&2
    return 1
  fi
  if ! current_redis_identity=$(docker inspect --format '{{.Id}} {{.Image}}' "$REDIS_CONTAINER"); then
    printf '%s\n' 'could not inspect the Redis container' >&2
    return 1
  fi
  if [ "$current_db_identity" != "$DB_IDENTITY" ]; then
    printf '%s\n' 'PostgreSQL container identity changed' >&2
    return 1
  fi
  if [ "$current_redis_identity" != "$REDIS_IDENTITY" ]; then
    printf '%s\n' 'Redis container identity changed' >&2
    return 1
  fi
}

verify_application() {
  expected_image=$1
  expected_image_id=$2
  if ! app_image=$(docker inspect --format '{{.Config.Image}}' "$APP_CONTAINER"); then
    printf 'could not inspect %s\n' "$APP_CONTAINER" >&2
    return 1
  fi
  if ! worker_image=$(docker inspect --format '{{.Config.Image}}' "$WORKER_CONTAINER"); then
    printf 'could not inspect %s\n' "$WORKER_CONTAINER" >&2
    return 1
  fi
  if ! app_image_id=$(docker inspect --format '{{.Image}}' "$APP_CONTAINER"); then
    printf 'could not inspect the image ID for %s\n' "$APP_CONTAINER" >&2
    return 1
  fi
  if ! worker_image_id=$(docker inspect --format '{{.Image}}' "$WORKER_CONTAINER"); then
    printf 'could not inspect the image ID for %s\n' "$WORKER_CONTAINER" >&2
    return 1
  fi
  if [ "$app_image" != "$expected_image" ] || [ "$worker_image" != "$expected_image" ]; then
    printf '%s\n' 'server or worker is not running the expected image reference' >&2
    return 1
  fi
  if [ "$app_image_id" != "$expected_image_id" ] || [ "$worker_image_id" != "$expected_image_id" ]; then
    printf '%s\n' 'server or worker is not running the expected image ID' >&2
    return 1
  fi
  if [ "$(docker inspect --format '{{.State.Running}}' "$APP_CONTAINER")" != true ]; then
    printf '%s is not running\n' "$APP_CONTAINER" >&2
    return 1
  fi
  if [ "$(docker inspect --format '{{.State.Running}}' "$WORKER_CONTAINER")" != true ]; then
    printf '%s is not running\n' "$WORKER_CONTAINER" >&2
    return 1
  fi
}

scan_logs() {
  if ! log_file=$(mktemp /tmp/odelza-production-logs.XXXXXX); then
    printf '%s\n' 'could not create a temporary log scan file' >&2
    return 1
  fi
  if ! compose logs --no-color --since 10m "$APP_SERVICE" "$WORKER_SERVICE" >"$log_file" 2>&1; then
    rm -f "$log_file"
    printf '%s\n' 'could not read recent server/worker logs' >&2
    return 1
  fi
  if grep -Eai 'fatal|panic|unhandled[[:space:]]+(rejection|exception)|migration[^[:cntrl:]]*(error|fail)|error[^[:cntrl:]]*migration' "$log_file" >/dev/null; then
    rm -f "$log_file"
    printf '%s\n' 'recent server/worker logs contain a fatal, panic, unhandled, or migration error' >&2
    return 1
  fi
  rm -f "$log_file"
}

start_application() {
  expected_image=$1
  expected_image_id=$2
  if ! compose start "$APP_SERVICE" >/dev/null; then
    printf 'could not start %s\n' "$APP_SERVICE" >&2
    return 1
  fi
  if ! wait_for_health; then
    return 1
  fi
  if ! compose start "$WORKER_SERVICE" >/dev/null; then
    printf 'could not start %s\n' "$WORKER_SERVICE" >&2
    return 1
  fi
  verify_application "$expected_image" "$expected_image_id"
}

compute_image_config_digest() {
  image_ref=$1
  save_archive=$(mktemp /tmp/odelza-image-save.XXXXXX.tar) || {
    printf '%s\n' 'could not create a temporary image archive' >&2
    return 1
  }
  config_file=$(mktemp /tmp/odelza-image-config.XXXXXX.json) || {
    rm -f "$save_archive"
    printf '%s\n' 'could not create a temporary image config file' >&2
    return 1
  }
  if ! docker save "$image_ref" >"$save_archive"; then
    rm -f "$save_archive" "$config_file"
    printf '%s\n' 'could not save the loaded image for config verification' >&2
    return 1
  fi
  if ! config_member=$(tar -xOf "$save_archive" manifest.json | sed -n 's/.*"Config"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'); then
    rm -f "$save_archive" "$config_file"
    printf '%s\n' 'could not read manifest.json from the loaded image' >&2
    return 1
  fi
  case "$config_member" in
    ''|*..*|/*|*[!ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._:/-]*)
      rm -f "$save_archive" "$config_file"
      printf '%s\n' 'loaded image manifest contains an invalid config member' >&2
      return 1
      ;;
  esac
  if ! tar -xOf "$save_archive" "$config_member" >"$config_file"; then
    rm -f "$save_archive" "$config_file"
    printf '%s\n' 'could not extract the loaded image config member' >&2
    return 1
  fi
  if ! config_hash_line=$(sha256sum "$config_file"); then
    rm -f "$save_archive" "$config_file"
    printf '%s\n' 'could not hash the loaded image config member' >&2
    return 1
  fi
  config_hash=${config_hash_line%% *}
  rm -f "$save_archive" "$config_file"
  printf 'sha256:%s\n' "$config_hash"
}

set_tag() {
  tag_value=$1
  if ! TEMP_ENV=$(mktemp "$COMPOSE_DIR/.env.cd.XXXXXX"); then
    printf '%s\n' 'could not create a temporary production environment file' >&2
    return 1
  fi
  chmod 600 "$TEMP_ENV" || return 1
  if ! awk -v tag="$tag_value" '
    BEGIN { found = 0 }
    /^TAG=/ {
      found++
      if (found == 1) print "TAG=" tag
      next
    }
    { print }
    END { if (found != 1) exit 1 }
  ' "$ENV_FILE" >"$TEMP_ENV"; then
    printf '%s\n' 'could not rewrite only the production TAG entry' >&2
    return 1
  fi
  if ! mv "$TEMP_ENV" "$ENV_FILE"; then
    printf '%s\n' 'could not activate the updated production TAG entry' >&2
    return 1
  fi
  TEMP_ENV=
  chmod 600 "$ENV_FILE"
}

verify_compose_checksum() {
  current_compose_checksum=$(sha256sum "$COMPOSE_FILE" | awk '{print $1}') || {
    printf '%s\n' 'could not calculate the production Compose checksum' >&2
    return 1
  }
  if [ "$current_compose_checksum" != "$COMPOSE_CHECKSUM" ]; then
    printf '%s\n' 'production Compose changed after the deployment snapshot' >&2
    return 1
  fi
}

prune_cd_metadata() {
  metadata_paths=$(ls -1dt "$CD_METADATA_ROOT"/* 2>/dev/null || true)
  [ -n "$metadata_paths" ] || return 0
  retained=0
  printf '%s\n' "$metadata_paths" | while IFS= read -r metadata_path; do
    [ -d "$metadata_path" ] || continue
    retained=$((retained + 1))
    if [ "$retained" -gt "$CD_METADATA_RETENTION" ]; then
      rm -rf -- "$metadata_path" || exit 1
    fi
  done
}

prune_cd_data_backups() {
  data_paths=$(ls -1dt "$CD_DATA_ROOT"/cd-* 2>/dev/null || true)
  [ -n "$data_paths" ] || return 0
  retained=1
  printf '%s\n' "$data_paths" | while IFS= read -r data_path; do
    [ -d "$data_path" ] || continue
    if [ "$data_path" = "$BACKUP_DIR" ]; then
      continue
    fi
    if [ "$retained" -ge "$CD_DATA_RETENTION" ]; then
      rm -rf -- "$data_path" || exit 1
    else
      retained=$((retained + 1))
    fi
  done
}

rollback() {
  printf '%s\n' 'Activation failed; restoring the previous TAG without restoring data.' >&2
  if ! verify_compose_checksum; then
    printf '%s\n' 'Rollback refused because production Compose changed.' >&2
    return 1
  fi
  if ! set_tag "$PREVIOUS_TAG"; then
    printf '%s\n' 'Rollback could not restore the previous TAG.' >&2
    return 1
  fi
  if ! compose config --quiet >/dev/null; then
    printf '%s\n' 'Rollback Compose validation failed.' >&2
    return 1
  fi
  if ! compose up --no-start --force-recreate --no-deps "$APP_SERVICE" "$WORKER_SERVICE" >/dev/null; then
    printf '%s\n' 'Rollback server/worker recreation failed.' >&2
    return 1
  fi
  if ! start_application "$SERVER_IMAGE" "$SERVER_IMAGE_ID"; then
    printf '%s\n' 'Rollback server/worker startup failed.' >&2
    return 1
  fi
  if ! verify_stateful_identities; then
    printf '%s\n' 'Rollback changed a PostgreSQL or Redis identity.' >&2
    return 1
  fi
  if ! scan_logs; then
    printf '%s\n' 'Rollback log verification failed.' >&2
    return 1
  fi
  printf '%s\n' 'Application rollback completed; PostgreSQL and Redis were not restored.' >&2
  return 0
}

on_exit() {
  exit_status=$?
  trap - EXIT HUP INT TERM
  if [ "$ROLLBACK_NEEDED" -eq 1 ]; then
    if ! rollback; then
      printf '%s\n' 'Rollback did not complete cleanly; manual intervention is required.' >&2
      exit_status=1
    fi
  fi
  if [ -n "$TEMP_ENV" ]; then
    rm -f "$TEMP_ENV" || true
  fi
  if [ -n "$IMAGE_ARCHIVE" ] && [ -f "$IMAGE_ARCHIVE" ]; then
    rm -f "$IMAGE_ARCHIVE" || true
  fi
  exit "$exit_status"
}

trap on_exit EXIT
trap 'exit 1' HUP INT TERM

[ "$(id -u)" = 0 ] || die 'this script must run through the root deployment route'
[ "$#" -eq 8 ] || die 'usage: deploy.sh --image-archive /tmp/odelza-cd-*/image.tar.gz --image-ref twentycrm/twenty:odelza-<sha> --local-image-id sha256:<id> --image-config-digest sha256:<digest>'
[ "$1" = --image-archive ] || die 'first argument must be --image-archive'
[ "$3" = --image-ref ] || die 'third argument must be --image-ref'
[ "$5" = --local-image-id ] || die 'fifth argument must be --local-image-id'
[ "$7" = --image-config-digest ] || die 'seventh argument must be --image-config-digest'
IMAGE_ARCHIVE=$2
IMAGE_REF=$4
LOCAL_IMAGE_ID=$6
IMAGE_CONFIG_DIGEST=$8

case "$IMAGE_ARCHIVE" in
  /tmp/odelza-cd-*/image.tar.gz) ;;
  *) die 'image archive must be a staged /tmp/odelza-cd-*/image.tar.gz file' ;;
esac
case "$IMAGE_REF" in
  twentycrm/twenty:*) ;;
  *) die 'image reference must use the twentycrm/twenty repository' ;;
esac
IMAGE_TAG=${IMAGE_REF#twentycrm/twenty:}
case "$LOCAL_IMAGE_ID" in
  sha256:*) ;;
  *) die 'local image ID must use the sha256:<hex> format' ;;
esac
case "$IMAGE_CONFIG_DIGEST" in
  sha256:*) ;;
  *) die 'image config digest must use the sha256:<hex> format' ;;
esac
[ -f "$IMAGE_ARCHIVE" ] || die "missing image archive: $IMAGE_ARCHIVE"

for command_name in docker curl tar sha256sum mktemp stat grep sed awk date ls; do
  require_command "$command_name"
done
printf '%s\n' "$IMAGE_TAG" | grep -Eq '^odelza-[0-9a-f]{40}$' ||
  die 'image tag must be odelza- followed by a full commit SHA'
printf '%s\n' "$LOCAL_IMAGE_ID" | grep -Eq '^sha256:[0-9a-f]{64}$' ||
  die 'local image ID must contain exactly 64 hexadecimal characters'
printf '%s\n' "$IMAGE_CONFIG_DIGEST" | grep -Eq '^sha256:[0-9a-f]{64}$' ||
  die 'image config digest must contain exactly 64 hexadecimal characters'
docker compose version >/dev/null 2>&1 || die 'Docker Compose is not available'

[ -d "$PRODUCTION_ROOT" ] || die "missing production root: $PRODUCTION_ROOT"
[ -d "$COMPOSE_DIR" ] || die "missing production Compose directory: $COMPOSE_DIR"
[ -f "$COMPOSE_FILE" ] || die "missing production Compose file: $COMPOSE_FILE"
[ -f "$ENV_FILE" ] || die "missing production environment file: $ENV_FILE"
[ "$(stat -c '%u' "$COMPOSE_FILE")" = 0 ] || die 'production Compose file must be root-owned'
[ "$(stat -c '%u' "$ENV_FILE")" = 0 ] || die 'production environment file must be root-owned'

APP_SERVICE=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.service"}}' "$APP_CONTAINER") ||
  die "could not identify the Compose service for $APP_CONTAINER"
WORKER_SERVICE=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.service"}}' "$WORKER_CONTAINER") ||
  die "could not identify the Compose service for $WORKER_CONTAINER"
[ -n "$APP_SERVICE" ] || die "missing Compose service label on $APP_CONTAINER"
[ -n "$WORKER_SERVICE" ] || die "missing Compose service label on $WORKER_CONTAINER"
[ "$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$APP_CONTAINER")" = "$PROJECT_NAME" ] ||
  die "$APP_CONTAINER does not belong to Compose project $PROJECT_NAME"
[ "$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$WORKER_CONTAINER")" = "$PROJECT_NAME" ] ||
  die "$WORKER_CONTAINER does not belong to Compose project $PROJECT_NAME"

DB_CONTAINER=$(compose ps --quiet db)
REDIS_CONTAINER=$(compose ps --quiet redis)
[ -n "$DB_CONTAINER" ] || die 'PostgreSQL container is not running'
[ -n "$REDIS_CONTAINER" ] || die 'Redis container is not running'
[ "$(docker inspect --format '{{.State.Running}}' "$DB_CONTAINER")" = true ] ||
  die 'PostgreSQL container is not running'
[ "$(docker inspect --format '{{.State.Running}}' "$REDIS_CONTAINER")" = true ] ||
  die 'Redis container is not running'
DB_IDENTITY=$(docker inspect --format '{{.Id}} {{.Image}}' "$DB_CONTAINER")
REDIS_IDENTITY=$(docker inspect --format '{{.Id}} {{.Image}}' "$REDIS_CONTAINER")
SERVER_IMAGE=$(docker inspect --format '{{.Config.Image}}' "$APP_CONTAINER") ||
  die "could not inspect $APP_CONTAINER"
SERVER_IMAGE_ID=$(docker inspect --format '{{.Image}}' "$APP_CONTAINER") ||
  die "could not inspect the image ID for $APP_CONTAINER"
APP_HOST_PORT=$(docker inspect --format '{{with index .NetworkSettings.Ports "3000/tcp"}}{{(index . 0).HostPort}}{{end}}' "$APP_CONTAINER") ||
  die "could not inspect the published 3000/tcp port for $APP_CONTAINER"
case "$APP_HOST_PORT" in
  ''|*[!0123456789]*) die "invalid published 3000/tcp port for $APP_CONTAINER" ;;
esac
[ "$APP_HOST_PORT" -ge 1 ] && [ "$APP_HOST_PORT" -le 65535 ] ||
  die "published 3000/tcp port for $APP_CONTAINER is outside the valid TCP range"
HEALTH_URL=http://127.0.0.1:$APP_HOST_PORT/healthz
storage_volume=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/app/packages/twenty-server/.local-storage"}}{{.Name}}{{end}}{{end}}' "$APP_CONTAINER") ||
  die "could not inspect local storage for $APP_CONTAINER"
[ -n "$storage_volume" ] || die 'could not identify the server local-storage volume'

tag_count=$(grep -c '^TAG=' "$ENV_FILE" || true)
[ "$tag_count" -eq 1 ] || die 'production .env must contain exactly one TAG entry'
PREVIOUS_TAG=$(sed -n 's/^TAG=//p' "$ENV_FILE")
[ -n "$PREVIOUS_TAG" ] || die 'production TAG entry must not be empty'
COMPOSE_CHECKSUM=$(sha256sum "$COMPOSE_FILE" | awk '{print $1}') ||
  die 'could not calculate the production Compose checksum'

timestamp=$(date -u '+%Y%m%dT%H%M%SZ')
mkdir -p "$CD_DATA_ROOT" "$CD_METADATA_ROOT"
BACKUP_DIR=$CD_DATA_ROOT/cd-$timestamp
METADATA_DIR=$CD_METADATA_ROOT/$timestamp
mkdir "$BACKUP_DIR" "$METADATA_DIR"
chmod 700 "$CD_DATA_ROOT" "$CD_METADATA_ROOT" "$BACKUP_DIR" "$METADATA_DIR"
{
  printf 'created_utc=%s\n' "$timestamp"
  printf 'previous_tag=%s\n' "$PREVIOUS_TAG"
  printf 'compose_sha256=%s\n' "$COMPOSE_CHECKSUM"
  printf 'compose_owner_uid=%s\n' "$(stat -c '%u' "$COMPOSE_FILE")"
  printf 'compose_mode=%s\n' "$(stat -c '%a' "$COMPOSE_FILE")"
  printf 'previous_server_image=%s\n' "$SERVER_IMAGE"
  printf 'previous_server_image_id=%s\n' "$SERVER_IMAGE_ID"
  printf 'db_identity=%s\n' "$DB_IDENTITY"
  printf 'redis_identity=%s\n' "$REDIS_IDENTITY"
  printf 'candidate_image=%s\n' "$IMAGE_REF"
  printf 'candidate_local_image_id=%s\n' "$LOCAL_IMAGE_ID"
  printf 'candidate_image_config_digest=%s\n' "$IMAGE_CONFIG_DIGEST"
} >"$METADATA_DIR/DEPLOYMENT.txt"
chmod 600 "$METADATA_DIR/DEPLOYMENT.txt"

ROLLBACK_NEEDED=1
compose stop "$WORKER_SERVICE" "$APP_SERVICE" >/dev/null
compose exec --no-TTY db sh -c \
  'exec pg_dump --format=custom --no-owner --no-privileges --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  >"$BACKUP_DIR/postgres.dump"
docker run --rm --entrypoint tar \
  --volume "$storage_volume:/data:ro" \
  "$SERVER_IMAGE" -C /data -czf - . >"$BACKUP_DIR/server-local-data.tar.gz"

{
  printf 'created_utc=%s\n' "$timestamp"
  printf 'compose_project=%s\n' "$PROJECT_NAME"
  printf 'previous_server_image=%s\n' "$SERVER_IMAGE"
  printf 'previous_server_image_id=%s\n' "$SERVER_IMAGE_ID"
  printf 'db_identity=%s\n' "$DB_IDENTITY"
  printf 'redis_identity=%s\n' "$REDIS_IDENTITY"
  printf 'candidate_image=%s\n' "$IMAGE_REF"
  printf 'candidate_local_image_id=%s\n' "$LOCAL_IMAGE_ID"
  printf 'candidate_image_config_digest=%s\n' "$IMAGE_CONFIG_DIGEST"
} >"$BACKUP_DIR/MANIFEST.txt"
(cd "$BACKUP_DIR" && sha256sum \
  postgres.dump \
  server-local-data.tar.gz \
  MANIFEST.txt \
  >SHA256SUMS)
chmod 600 \
  "$BACKUP_DIR/postgres.dump" \
  "$BACKUP_DIR/server-local-data.tar.gz" \
  "$BACKUP_DIR/MANIFEST.txt" \
  "$BACKUP_DIR/SHA256SUMS"
(cd "$METADATA_DIR" && sha256sum DEPLOYMENT.txt >SHA256SUMS)
chmod 600 "$METADATA_DIR/SHA256SUMS"
prune_cd_metadata

docker load <"$IMAGE_ARCHIVE" >/dev/null
LOADED_IMAGE_ID=$(docker image inspect --format '{{.Id}}' "$IMAGE_REF") ||
  die 'loaded image does not have the expected immutable reference'
if ! loaded_config_digest=$(compute_image_config_digest "$IMAGE_REF"); then
  die 'could not compute the loaded image config digest'
fi
[ "$loaded_config_digest" = "$IMAGE_CONFIG_DIGEST" ] ||
  die 'loaded image config digest does not match the build archive'
printf 'loaded_image_id=%s\n' "$LOADED_IMAGE_ID" >>"$METADATA_DIR/DEPLOYMENT.txt"
(cd "$METADATA_DIR" && sha256sum DEPLOYMENT.txt >SHA256SUMS)

set_tag "$IMAGE_TAG" || die 'could not update the production TAG entry'

if ! compose config --quiet >/dev/null; then
  die 'candidate Compose configuration is invalid'
fi
compose up --no-start --force-recreate --no-deps "$APP_SERVICE" "$WORKER_SERVICE" >/dev/null
if ! start_application "$IMAGE_REF" "$LOADED_IMAGE_ID"; then
  die 'candidate server/worker activation failed'
fi
if ! verify_stateful_identities; then
  die 'stateful container identity verification failed'
fi
if ! scan_logs; then
  die 'candidate server/worker log verification failed'
fi

ROLLBACK_NEEDED=0
if ! prune_cd_data_backups; then
  printf '%s\n' 'Activation completed, but CD data-backup retention pruning failed; manual cleanup is required.' >&2
  exit 1
fi
printf 'Odelza production activation completed: %s\n' "$IMAGE_REF"
printf 'Backup and rollback snapshot: %s\n' "$BACKUP_DIR"
