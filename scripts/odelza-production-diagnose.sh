#!/bin/sh
# Read-only, fixed-target observations. No raw diagnostic data may be emitted.
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
LC_ALL=C
export LC_ALL
PRODUCTION_ROOT=/opt/odelza
CANDIDATE=twentycrm/twenty:odelza-2e0e891db44cc075c26ca00f73bb6c054c4dae10
PARTIAL=0
NL='
'

unavailable() {
  printf '%s=%s\n' "$1" "$2"
  PARTIAL=1
}

# Capture only bounded bytes in memory, with a separate final status line.
# A full buffer is discarded, including any partial classification or metadata.
read_bounded() {
  RAW=$({
    if [ "$1" = docker ] && [ "$2" = logs ]; then
      # Docker routes the container stderr stream to CLI stderr. Classify both,
      # never forward either stream (including daemon errors) to Actions logs.
      timeout -k 2s 8s "$@" 2>&1
    else
      timeout -k 2s 8s "$@" 2>/dev/null
    fi
    printf '\n%s\n' "$?"
  } | head -c 32768) 2>/dev/null
  DATA=
  READ_STATUS=read_failed
  if [ "${#RAW}" -ge 32768 ]; then
    READ_STATUS=truncated
    return
  fi
  case "$RAW" in
    *"$NL"*)
      CODE=${RAW##*"$NL"}
      case "$CODE" in
        0) READ_STATUS=ok; DATA=${RAW%"$NL"*} ;;
        124|137) READ_STATUS=timeout ;;
      esac
      ;;
  esac
}

# Exact types only: a printable-looking but unexpected value is NOT safe.
inspect_container() {
  read_bounded docker inspect --type container --format \
    '{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|{{.State.ExitCode}}|{{.RestartCount}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$1"
  if [ "$READ_STATUS" != ok ]; then
    unavailable "$1.inspect" "$READ_STATUS"
    return
  fi
  SAFE=$(printf '%s' "$DATA" | awk -F '|' '
    function hex(s) { return length(s)==64 && s !~ /[^0-9a-f]/ }
    function digest(s) { return substr(s,1,7)=="sha256:" && hex(substr(s,8)) }
    function tag(s) {
      return (substr(s,1,7)=="odelza-" && length(s)==47 && substr(s,8) !~ /[^0-9a-f]/) ||
        (length(s)<=32 && s ~ /^v?[0-9]+\.[0-9]+\.[0-9]+$/)
    }
    NR==1 && NF==7 && hex($1) && digest($2) &&
      substr($3,1,17)=="twentycrm/twenty:" && tag(substr($3,18)) &&
      $4 ~ /^(created|running|paused|restarting|removing|exited|dead)$/ &&
      $5 ~ /^[0-9]+$/ && length($5)<=3 && $5<=255 &&
      $6 ~ /^[0-9]+$/ && length($6)<=9 &&
      $7 ~ /^(none|starting|healthy|unhealthy)$/ { value=$0; valid=1 }
    END { if (NR==1 && valid) print value; else exit 1 }
  ') || SAFE=
  if [ -z "$SAFE" ]; then
    unavailable "$1.inspect" invalid_value
    return
  fi
  printf '%s.inspect=%s\n' "$1" "$SAFE"
}

classify_logs() {
  read_bounded docker logs --tail 200 --since 2026-11-09T13:06:00Z \
    --until 2026-11-09T13:21:00Z "$1"
  if [ "$READ_STATUS" != ok ]; then
    unavailable "$1.logs" "$READ_STATUS"
    return
  fi
  printf '%s.logs=bounded_incident_window_current_container_only\n' "$1"
  printf '%s' "$DATA" | awk '
    BEGIN {
      n=split("fatal panic unhandled_exception dependency_resolution module_missing connection_failure migration_failure type_error reference_error syntax_error startup_upgrade_warning startup_jobs_warning", names," ")
    }
    {
      if ($0=="") next
      total++; s=tolower($0); matched=0
      if (s ~ /fatal/) { c[1]++; matched=1 }
      if (s ~ /panic/) { c[2]++; matched=1 }
      if (s ~ /unhandled(rejection|exception)|unhandled (rejection|exception)/) { c[3]++; matched=1 }
      if (s ~ /cannot resolve dependencies|cannot resolve dependency|can.t resolve dependencies/) { c[4]++; matched=1 }
      if (s ~ /cannot find module|module_not_found/) { c[5]++; matched=1 }
      if (s ~ /econnrefused|enotfound|connection refused/) { c[6]++; matched=1 }
      if (s ~ /migration.*(error|fail)|(error|fail).*migration/) { c[7]++; matched=1 }
      if (s ~ /typeerror:/) { c[8]++; matched=1 }
      if (s ~ /referenceerror:/) { c[9]++; matched=1 }
      if (s ~ /syntaxerror:/) { c[10]++; matched=1 }
      if (s ~ /warning: upgrade completed with errors/) { c[11]++; matched=1 }
      if (s ~ /warning: failed to register background jobs/) { c[12]++; matched=1 }
      if (!matched) unknown++
    }
    END {
      for (i=1;i<=n;i++) printf "class.%s=%d\n", names[i], c[i]
      printf "unclassified_lines=%d\nobserved_lines=%d\n", unknown, total
      print "frames=not_collected"
      print "cause=unknown_classifications_are_not_root_cause"
    }
  ' || unavailable "$1.logs" classifier_failed
}

# Reject symlinks, non-root owners and group/world-writable path components.
# Fixed directories are traversed from /, before reading any selected file.
trusted() {
  [ ! -L "$1" ] || return 1
  case "$2" in
    directory) [ -d "$1" ] || return 1 ;;
    file) [ -f "$1" ] || return 1 ;;
    *) return 1 ;;
  esac
  read_bounded stat -c '%u:%a:%s' -- "$1"
  [ "$READ_STATUS" = ok ] || return 1
  SIZE=$(printf '%s' "$DATA" | awk -F: '
    NR==1 && NF==3 && $1=="0" && $2 ~ /^[0-7]+$/ &&
      (length($2)==3 || length($2)==4) && $3 ~ /^[0-9]+$/ && length($3)<=15 {
      mode=substr($2,length($2)-1)
      if (substr(mode,1,1) ~ /^[0145]$/ && substr(mode,2,1) ~ /^[0145]$/) { ok=1; size=$3 }
    }
    END { if (NR==1 && ok) print size; else exit 1 }
  ') || return 1
}

metadata_fields() {
  printf '%s' "$DATA" | awk -v stamp="$STAMP" -v candidate="$CANDIDATE" '
    function hex(s) { return length(s)==64 && s !~ /[^0-9a-f]/ }
    function digest(s) { return substr(s,1,7)=="sha256:" && hex(substr(s,8)) }
    function tag(s) {
      return (substr(s,1,7)=="odelza-" && length(s)==47 && substr(s,8) !~ /[^0-9a-f]/) ||
        (length(s)<=32 && s ~ /^v?[0-9]+\.[0-9]+\.[0-9]+$/)
    }
    BEGIN { n=split("created_utc previous_tag previous_server_image previous_server_image_id candidate_image candidate_local_image_id candidate_image_config_digest loaded_image_id", keys," ") }
    {
      at=index($0,"="); if (!at) next
      k=substr($0,1,at-1); v=substr($0,at+1); allowed=0
      for (i=1;i<=n;i++) if (k==keys[i]) allowed=1
      if (!allowed) next
      if (seen[k]++) bad=1
      valid=0
      if (k=="created_utc") valid=(v==stamp)
      else if (k=="previous_tag") valid=tag(v)
      else if (k=="previous_server_image") valid=(substr(v,1,17)=="twentycrm/twenty:" && tag(substr(v,18)))
      else if (k=="candidate_image") valid=(v==candidate)
      else valid=digest(v)
      if (!valid) bad=1
      values[k]=v
    }
    END {
      for (i=1;i<n;i++) if (!seen[keys[i]]) bad=1
      if (bad) exit 1
      for (i=1;i<=n;i++) if (seen[keys[i]]) print keys[i] "=" values[keys[i]]
    }
  '
}

backup_status() {
  BACKUP=$PRODUCTION_ROOT/backups/cd-data/cd-$SELECTED
  if ! trusted "$PRODUCTION_ROOT/backups/cd-data" directory || ! trusted "$BACKUP" directory; then
    unavailable backup unavailable_path
    return
  fi
  for FILE in postgres.dump server-local-data.tar.gz MANIFEST.txt SHA256SUMS; do
    if ! trusted "$BACKUP/$FILE" file; then
      unavailable "backup.$FILE" unavailable_file
      continue
    fi
    printf 'backup.%s=regular_root_owned,size:%s\n' "$FILE" "$SIZE"
    if [ "$FILE" = SHA256SUMS ]; then
      read_bounded head -c 4097 -- "$BACKUP/SHA256SUMS"
      if [ "$READ_STATUS" != ok ] || [ "${#DATA}" -gt 4096 ]; then
        unavailable backup.checksum_syntax unavailable
        continue
      fi
      if printf '%s' "$DATA" | awk '
        NF!=2 || length($1)!=64 || $1 ~ /[^0-9a-f]/ { bad=1 }
        $2 !~ /^(postgres.dump|server-local-data.tar.gz|MANIFEST.txt)$/ { bad=1 }
        { if (seen[$2]++) bad=1 }
        END { exit (bad || NR!=3 || !seen["postgres.dump"] || !seen["server-local-data.tar.gz"] || !seen["MANIFEST.txt"]) }
      '; then
        printf '%s\n' 'backup.checksum_syntax=valid_only_not_verified'
      else
        unavailable backup.checksum_syntax invalid
      fi
    fi
  done
}

deployment_metadata() {
  # No recursive discovery. The literal incident-day/hour glob is capped at 32.
  for DIR in / /opt "$PRODUCTION_ROOT" "$PRODUCTION_ROOT/backups" "$PRODUCTION_ROOT/backups/cd-metadata"; do
    if ! trusted "$DIR" directory; then
      unavailable metadata unavailable_path
      return
    fi
  done
  COUNT=0
  MATCHES=0
  SELECTED=
  SELECTED_FIELDS=
  UNCERTAIN=0
  for DIR in "$PRODUCTION_ROOT"/backups/cd-metadata/20261109T13[012][0-9][0-5][0-9]Z; do
    [ -e "$DIR" ] || [ -L "$DIR" ] || continue
    COUNT=$((COUNT + 1))
    if [ "$COUNT" -gt 32 ]; then
      unavailable metadata scan_limit
      return
    fi
    STAMP=${DIR##*/}
    CLOCK=${STAMP#20261109T}
    CLOCK=${CLOCK%Z}
    [ "$CLOCK" -ge 130600 ] && [ "$CLOCK" -le 132100 ] || continue
    if ! trusted "$DIR" directory || ! trusted "$DIR/DEPLOYMENT.txt" file; then
      UNCERTAIN=1
      continue
    fi
    read_bounded head -c 4097 -- "$DIR/DEPLOYMENT.txt"
    if [ "$READ_STATUS" != ok ] || [ "${#DATA}" -gt 4096 ]; then
      UNCERTAIN=1
      continue
    fi
    if FIELDS=$(metadata_fields); then
      MATCHES=$((MATCHES + 1))
      SELECTED=$STAMP
      SELECTED_FIELDS=$FIELDS
    else
      # Malformed or different candidate: never silently choose another record.
      UNCERTAIN=1
    fi
  done
  if [ "$MATCHES" -gt 1 ]; then
    unavailable metadata ambiguous
  elif [ "$UNCERTAIN" -ne 0 ]; then
    unavailable metadata unavailable_candidate
  elif [ "$MATCHES" -eq 0 ]; then
    unavailable metadata not_found
  else
    printf '%s\n' 'metadata=unique_candidate_not_deployment_success' "$SELECTED_FIELDS"
    backup_status
  fi
}

main() {
  printf '%s\n' 'incident_run=42549926656' 'diagnostics=read_only' 'integrity=not_checked'
  if [ "$#" -ne 0 ]; then
    unavailable diagnostics arguments_refused
    return 2
  fi
  for TOOL in timeout head awk stat; do
    if ! command -v "$TOOL" >/dev/null 2>&1; then
      unavailable diagnostics "${TOOL}_unavailable"
      return 2
    fi
  done
  if command -v docker >/dev/null 2>&1; then
    inspect_container odelza-app
    classify_logs odelza-app
    inspect_container odelza-jobs
    classify_logs odelza-jobs
  else
    unavailable containers docker_unavailable
  fi
  deployment_metadata
  printf '%s\n' 'health_conclusion=not_inferred' 'root_cause=unknown'
  if [ "$PARTIAL" -ne 0 ]; then
    printf '%s\n' 'diagnostics=partial'
    return 2
  fi
  printf '%s\n' 'diagnostics=observations_collected_not_recovery'
}

# Docker, metadata and operating-system error text are untrusted too.
main "$@" 2>/dev/null
