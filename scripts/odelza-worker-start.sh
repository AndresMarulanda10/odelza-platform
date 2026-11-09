#!/bin/sh
# One start of the existing worker; no deployment, retry, or rollback.
set -eu
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH
export LC_ALL=C
failure=precondition_or_observation_failed
fail() { printf '%s\n' "worker_start=$failure" >&2; exit 1; }
[ "$#" -eq 0 ] || fail
for tool in timeout docker python3 sleep; do
    command -v "$tool" >/dev/null 2>&1 || {
        printf '%s\n' 'worker_start=required_tool_unavailable' >&2
        exit 1
    }
done
timeout -k 1s 1s python3 -c 'pass' >/dev/null 2>&1 || fail

# Docker Go templates emit only identity, enums, and exact configuration proofs.
# Env proofs emit one T/F per occurrence of each known key: only a lone T passes.
tag=twentycrm/twenty:odelza-2c449260b87aef0dc90e4eb8cd6ceca0fa02149f
common='{{.Id}}|{{.Image}}|{{eq .Name "NAME"}}|{{eq .Config.Image "TAG"}}|{{if eq (len .Config.Entrypoint) 1}}{{eq (index .Config.Entrypoint 0) "/app/entrypoint.sh"}}{{else}}false{{end}}|{{if eq (len .Config.Cmd) 2}}{{and (eq (index .Config.Cmd 0) "COMMAND") (eq (index .Config.Cmd 1) "ARGUMENT")}}{{else}}false{{end}}|'
flags='{{range .Config.Env}}{{if eq (index (split . "=") 0) "DISABLE_DB_MIGRATIONS"}}{{if eq . "DISABLE_DB_MIGRATIONS=true"}}T{{else}}F{{end}}{{end}}{{end}}|{{range .Config.Env}}{{if eq (index (split . "=") 0) "DISABLE_CRON_JOBS_REGISTRATION"}}{{if eq . "DISABLE_CRON_JOBS_REGISTRATION=true"}}T{{else}}F{{end}}{{end}}{{end}}'
state='|{{eq .HostConfig.RestartPolicy.Name "always"}}|{{.State.Status}}|{{.State.Paused}}|{{.State.Restarting}}|{{.State.ExitCode}}|{{.RestartCount}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}'

# All substitutions are fixed source literals, never environment or runtime input.
app_template=$(printf '%s' "$common" | python3 -c 'import sys; print(sys.stdin.read().replace("NAME", "/odelza-app").replace("TAG", sys.argv[1]).replace("COMMAND", "node").replace("ARGUMENT", "dist/main"), end="")' "$tag")
worker_template=$(printf '%s' "$common" | python3 -c 'import sys; print(sys.stdin.read().replace("NAME", "/odelza-jobs").replace("TAG", sys.argv[1]).replace("COMMAND", "yarn").replace("ARGUMENT", "worker:prod"), end="")' "$tag")
app_template="${app_template}T|T${state}"
worker_template="${worker_template}${flags}${state}"

inspect() {
    # Byte-first, full-buffer/status validation: never accept a truncated prefix,
    # a stripped newline/NUL, or valid-looking stdout from an unsuccessful CLI.
    timeout -k 1s 8s python3 - "$1" "$2" <<'PY' 2>/dev/null
import re
import subprocess
import sys

p = subprocess.Popen(["docker", "inspect", "--type", "container",
                      "--format=" + sys.argv[2], sys.argv[1]],
                     stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
try:
    data = p.stdout.read(2049)
    if len(data) > 2048:
        p.kill()
        p.wait()
        sys.exit(1)
    if p.wait(timeout=1) != 0:
        sys.exit(1)
    pattern = (rb"[0-9a-f]{64}\|sha256:[0-9a-f]{64}"
               rb"(?:\|(?:true|false)){4}\|[TF]{0,100}\|[TF]{0,100}"
               rb"\|(?:true|false)\|(?:created|running|exited|restarting|paused|dead|removing)"
               rb"(?:\|(?:true|false)){2}(?:\|[0-9]{1,10}){2}"
               rb"\|(?:none|starting|healthy|unhealthy)\n")
    if re.fullmatch(pattern, data) is None:
        sys.exit(1)
    sys.stdout.buffer.write(data)
finally:
    if p.poll() is None:
        p.kill()
        p.wait()
PY
}

parse() {
    IFS='|' read -r id image name_ok tag_ok entry_ok cmd_ok migration cron policy status paused restarting exit_code restarts health <<EOF
$1
EOF
    [ "$name_ok|$tag_ok|$entry_ok|$cmd_ok|$migration|$cron|$policy" = 'true|true|true|true|T|T|true' ] || fail
    [ "$paused|$restarting|$exit_code|$restarts" = 'false|false|0|0' ] || fail
}

app=$(inspect odelza-app "$app_template") || fail
parse "$app"
[ "$status|$health" = 'running|healthy' ] || fail
app_id=$id
image_id=$image
worker=$(inspect odelza-jobs "$worker_template") || fail
parse "$worker"
[ "$image" = "$image_id" ] || fail
worker_id=$id
initial_status=$status
case "$status" in
    created) [ "$health" = none ] || fail ;;
    running) case "$health" in none|healthy) ;; *) fail ;; esac ;;
    *) fail ;;
esac
[ "$app_id" != "$worker_id" ] || fail

# Re-resolve both names immediately before mutation and compare the full proof.
# Actions concurrency is not a lock against privileged external Docker changes.
again_app=$(inspect odelza-app "$app_template") || fail
again_worker=$(inspect odelza-jobs "$worker_template") || fail
[ "$again_app" = "$app" ] && [ "$again_worker" = "$worker" ] || fail
outcome=already_running_not_started_by_this_run
if [ "$initial_status" = created ]; then
    # Sole mutation; full validated ID prevents name replacement retargeting.
    if timeout -k 2s 15s docker start "$worker_id" >/dev/null 2>&1; then
        outcome=started
    else
        # Ambiguous start: one read-only reconciliation, never another start.
        printf '%s\n' 'worker_start=outcome_unknown' >&2
        if reconciliation=$(inspect "$worker_id" "$worker_template"); then
            parse "$reconciliation"
            [ "$id" = "$worker_id" ] && [ "$image" = "$image_id" ] || fail
            printf '%s\n' "worker_state=$status"
        fi
        exit 1
    fi
fi

# Observe the pinned ID for 30 seconds. Existing restart=always is unchanged.
failure=unstable_or_observation_unavailable
iteration=0
while [ "$iteration" -le 6 ]; do
    observed=$(inspect "$worker_id" "$worker_template") || fail
    parse "$observed"
    [ "$id" = "$worker_id" ] && [ "$image" = "$image_id" ] || fail
    [ "$status" = running ] || fail
    case "$health" in none|healthy) ;; *) fail ;; esac
    [ "$iteration" -eq 6 ] || sleep 5
    iteration=$((iteration + 1))
done
readiness=process_running_only
[ "$health" != healthy ] || readiness=container_healthcheck_healthy
final_app=$(inspect "$app_id" "$app_template") || fail
[ "$final_app" = "$app" ] || fail
printf '%s\n' "worker_start=$outcome" "readiness=$readiness" 'observation_seconds=30' 'restart_policy=always_unchanged'
