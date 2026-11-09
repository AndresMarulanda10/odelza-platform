#!/usr/bin/env python3
"""Deny-by-default synthetic protocol tests; never invoke real Docker or SSH."""

import fnmatch
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/odelza-worker-start.sh"
WORKFLOW = ROOT / ".github/workflows/start-odelza-worker.yaml"
APP = "a" * 64
WORKER = "b" * 64
IMAGE = "sha256:" + "c" * 64

FAKE = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
p = pathlib.Path(os.environ['FAKE_STATE'])
s = json.loads(p.read_text())
a = sys.argv[1:]
s['calls'].append(a)
p.write_text(json.dumps(s))
if a == ['start', 'b' * 64]:
    assert sum(x[0] == 'start' for x in s['calls']) == 1
    s['started'] = True
    p.write_text(json.dumps(s))
    print('PRIVATE_START_OUTPUT')
    print('PRIVATE_STDERR', file=sys.stderr)
    sys.exit(s.get('start_code', 0))
if len(a) != 5 or a[:3] != ['inspect', '--type', 'container'] or a[3][:9] != '--format=':
    print('FORBIDDEN_ARGV', file=sys.stderr)
    sys.exit(97)
t, target = a[3][9:], a[4]
assert '.State.Health' in t
assert target in ['odelza-app', 'odelza-jobs', 'a' * 64, 'b' * 64]
app = target in ['odelza-app', 'a' * 64]
key = 'app' if app else 'worker'
count = sum(x[0] == 'inspect' and x[-1] in
            (['odelza-app', 'a' * 64] if app else ['odelza-jobs', 'b' * 64])
            for x in s['calls'])
row = ['a' * 64 if app else 'b' * 64, 'sha256:' + 'c' * 64,
       'true', 'true', 'true', 'true', 'T', 'T', 'true',
       'running' if app or s.get('started') else 'created',
       'false', 'false', '0', '0', 'healthy' if app else 'none']
for i, v in s.get(key, {}).items():
    row[int(i)] = v
if count >= s.get('drift_at', 999):
    for i, v in s.get(key + '_drift', {}).items():
        row[int(i)] = v
if s.get('started'):
    for i, v in s.get(key + '_post', {}).items():
        row[int(i)] = v
print('PRIVATE_STDERR', file=sys.stderr)
output = '|'.join(row) + '\n'
sys.stdout.write(s.get(key + '_post_raw', s.get(key + '_raw', s.get('raw', output)))
                 if s.get('started') else s.get(key + '_raw', s.get('raw', output)))
sys.exit(s.get('post_inspect_code', 0) if s.get('started') else s.get('inspect_code', 0))
'''


class Protocol(unittest.TestCase):
    def run_case(self, changes=None, source=None, args=(), missing_tool=None,
                 workflow_boundary=False, inherited_condition=None, probe_code=0):
        with tempfile.TemporaryDirectory(prefix="odelza-start-test-") as directory:
            home = Path(directory)
            state = home / "state.json"
            state.write_text(json.dumps({"calls": [], **(changes or {})}))
            for name, body in {
                "docker": FAKE,
                "sleep": "#!/bin/sh\nexit 0\n",
                "timeout": '''#!/bin/sh
case "$*" in
    '-k 1s 1s python3 -c pass')
        [ "${FAKE_PROBE_CODE:-0}" -eq 0 ] || exit "$FAKE_PROBE_CODE" ;;
    '-k 1s 8s python3 - '*|'-k 2s 15s docker start '*|'-k 5s 480s ssh '*) ;;
    *) exit 96 ;;
esac
shift 3
exec "$@"
''',
            }.items():
                if name == missing_tool:
                    continue
                path = home / name
                path.write_text(body)
                path.chmod(0o700)
            if missing_tool != "python3":
                (home / "python3").symlink_to(os.sys.executable)
            # Instrument only the fixed PATH in an owned copy, never production.
            text = source if source is not None else SCRIPT.read_text()
            text = text.replace("PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                                "PATH=" + str(home))
            copy = home / "subject.sh"
            copy.write_text(text)
            command = ["/bin/sh", str(copy), *args]
            env = {"FAKE_STATE": str(state), "FAKE_PROBE_CODE": str(probe_code)}
            if inherited_condition is not None:
                env["condition"] = inherited_condition
            if workflow_boundary:
                # Execute the actual runner body, including SSH 2>/dev/null.
                # Only script input and PATH are redirected to owned fakes.
                ssh = home / "ssh"
                ssh.write_text('''#!/usr/bin/env python3
import os, sys
assert len(sys.argv) == 21
assert sys.argv[-2:] == ['synthetic@synthetic.invalid', 'sh -s']
print('PRIVATE_SSH_STDERR', file=sys.stderr, flush=True)
os.execv('/bin/sh', ['/bin/sh', '-s'])
''')
                ssh.chmod(0o700)
                body = WORKFLOW.read_text().split("        run: |\n", 1)[1]
                runner = home / "runner.sh"
                runner.write_text("\n".join(line[10:] for line in body.splitlines())
                                  .replace("< scripts/odelza-worker-start.sh", "< " + str(copy)))
                command = ["/bin/bash", str(runner)]
                env.update(PATH=str(home) + ":/usr/bin:/bin", RUNNER_TEMP=str(home),
                           GITHUB_REPOSITORY="AndresMarulanda10/odelza-platform",
                           GITHUB_REF="refs/heads/main", GITHUB_EVENT_NAME="workflow_dispatch",
                           GITHUB_SHA="d" * 40, ODELZA_DEPLOY_HOST="synthetic.invalid",
                           ODELZA_DEPLOY_USER="synthetic", ODELZA_DEPLOY_PORT="22",
                           ODELZA_DEPLOY_SSH_KEY="PRIVATE_SYNTHETIC_KEY",
                           ODELZA_DEPLOY_KNOWN_HOSTS="PRIVATE_SYNTHETIC_HOSTS")
            result = subprocess.run(command, env=env,
                                    capture_output=True, text=True, timeout=8)
            calls = json.loads(state.read_text())["calls"]
            self.assertNotIn("PRIVATE", result.stdout + result.stderr)
            self.assertNotIn("::", result.stdout + result.stderr)
            self.assertNotIn("FORBIDDEN_ARGV", result.stdout + result.stderr)
            allowed = {
                "worker_start=" + value for value in [
                    "precondition_or_observation_failed", "required_tool_unavailable",
                    "outcome_unknown", "reconciliation_validation_failed",
                    "unstable_or_observation_unavailable", "started",
                    "already_running_not_started_by_this_run"]
            } | {"preflight=" + value for value in [
                "runtime_guard", "app_inspection", "app_contract", "worker_inspection", "worker_contract",
                "pre_start_app_inspection", "pre_start_worker_inspection", "pre_start_contract"]
            } | {"worker_state=" + value for value in [
                "created", "running", "exited", "restarting", "paused", "dead", "removing"]} | {
                "reconciliation=unavailable", "readiness=process_running_only",
                "readiness=container_healthcheck_healthy", "observation_seconds=30",
                "restart_policy=always_unchanged", "transport=completed_not_health_proof"}
            self.assertTrue(set(result.stdout.splitlines()) <= allowed, result.stdout)
            starts = [a for a in calls if a[0] == "start"]
            for argv in calls:
                if argv[0] == "start":
                    self.assertEqual(argv, ["start", WORKER])
                else:
                    self.assertEqual(argv[:3], ["inspect", "--type", "container"])
                    self.assertEqual(len(argv), 5)
                    self.assertTrue(argv[3].startswith("--format="))
                    self.assertIn(argv[4], ["odelza-app", "odelza-jobs", APP, WORKER])
                    for forbidden in ["{{json", ".Mounts", ".Args", ".Health.Log", ".Health.Output"]:
                        self.assertNotIn(forbidden, argv[3])
                    # JSON is used only internally for optional Health null detection.
                    self.assertEqual(argv[3].count('(json '), 1)
                    self.assertIn('(json (index .State "Health")) "null"', argv[3])
            self.assertLessEqual(len(starts), 1)
            self.assertTrue(all(a == ["start", WORKER] for a in starts))
            return result, calls, starts

    def test_failure_markers_survive_workflow_stderr_suppression(self):
        cases = [({"worker": {"6": "TT"}}, "precondition_or_observation_failed", 0),
                 ({"raw": "PRIVATE\n::error::PRIVATE"}, "precondition_or_observation_failed", 0),
                 ({"start_code": 124}, "outcome_unknown", 1),
                 ({"worker_post": {"9": "exited"}}, "unstable_or_observation_unavailable", 1)]
        for changes, reason, attempts in cases:
            with self.subTest(reason=reason):
                result, _, starts = self.run_case(changes, workflow_boundary=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(len(starts), attempts)
                self.assertIn("worker_start=" + reason, result.stdout)
                self.assertNotIn("readiness=", result.stdout)
                self.assertNotIn("worker_start=started", result.stdout)
                self.assertEqual(result.stderr, "transport=failed_or_partial_or_timeout\n")

    def test_reconciliation_reports_only_validated_values_through_workflow(self):
        for changes, marker in [
            ({"post_inspect_code": 1}, "reconciliation=unavailable"),
            ({"worker_post": {"6": "TT"}}, "worker_start=reconciliation_validation_failed"),
            ({"worker_post": {"9": "::error::PRIVATE"}}, "reconciliation=unavailable"),
            ({}, "worker_state=running"),
        ]:
            with self.subTest(marker=marker, changes=changes):
                result, _, starts = self.run_case(
                    {"start_code": 124, **changes}, workflow_boundary=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(len(starts), 1)
                self.assertIn("worker_start=outcome_unknown", result.stdout)
                self.assertIn(marker, result.stdout)
                self.assertNotIn("readiness=", result.stdout)
                self.assertEqual(result.stderr, "transport=failed_or_partial_or_timeout\n")

    def test_duplicate_flag_denied(self):
        result, _, starts = self.run_case(
            {"worker": {"6": "TT"}})
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(starts, [])

    def test_preflight_failure_phases(self):
        for changes, phase in [
            ({"app_raw": "PRIVATE"}, "app_inspection"),
            ({"app": {"14": "none"}}, "app_contract"),
            ({"worker_raw": "PRIVATE"}, "worker_inspection"),
            ({"worker": {"6": "TT"}}, "worker_contract"),
            ({"drift_at": 2, "app_drift": {"14": "::error::PRIVATE"}},
             "pre_start_app_inspection"),
            ({"drift_at": 2, "worker_drift": {"14": "::error::PRIVATE"}},
             "pre_start_worker_inspection"),
            ({"drift_at": 2, "worker_drift": {"6": "TT"}}, "pre_start_contract"),
        ]:
            with self.subTest(phase=phase):
                result, _, starts = self.run_case(changes, workflow_boundary=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("preflight=" + phase, result.stdout)
                self.assertEqual(starts, [])

    def test_inherited_condition_never_reaches_output(self):
        canary = "::error::PRIVATE_CANARY\n::workflow::PRIVATE_CANARY"
        # Exact source, original PATH and early argument refusal: no tools or
        # Docker can be reached. Preserve the independently reported repro.
        for inherited in ("::error::PRIVATE_CANARY", canary):
            result = subprocess.run(["/bin/sh", str(SCRIPT), "unexpected"],
                                    env={"condition": inherited}, capture_output=True,
                                    text=True, timeout=8)
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn("PRIVATE_CANARY", result.stdout + result.stderr)
            self.assertNotIn("::", result.stdout + result.stderr)
            self.assertEqual(result.stdout, "worker_start=precondition_or_observation_failed\n"
                             "preflight=runtime_guard\n")
            self.assertEqual(result.stderr, "")

        cases = [
            ({"args": ("unexpected",)}, "precondition_or_observation_failed", "runtime_guard", 0),
            *[({"missing_tool": tool}, "required_tool_unavailable", None, 0)
              for tool in ("timeout", "docker", "python3", "sleep")],
            ({"probe_code": 124}, "precondition_or_observation_failed", "runtime_guard", 0),
            ({"changes": {"app": {"14": "none"}}},
             "precondition_or_observation_failed", "app_contract", 0),
            ({"changes": {"worker": {"6": "TT"}}, "workflow_boundary": True},
             "precondition_or_observation_failed", "worker_contract", 0),
            ({"changes": {"start_code": 124}, "workflow_boundary": True},
             "outcome_unknown", None, 1),
            ({"changes": {"worker_post": {"9": "exited"}}, "workflow_boundary": True},
             "unstable_or_observation_unavailable", None, 1),
            ({"changes": {"worker": {"9": "running"}}},
             "already_running_not_started_by_this_run", None, 0),
            ({}, "started", None, 1),
        ]
        for kwargs, status, phase, attempts in cases:
            with self.subTest(kwargs=kwargs):
                result, calls, starts = self.run_case(inherited_condition=canary, **kwargs)
                self.assertIn("worker_start=" + status, result.stdout.splitlines())
                self.assertEqual(result.returncode == 0, status in (
                    "started", "already_running_not_started_by_this_run"))
                self.assertNotIn("PRIVATE_CANARY", result.stdout + result.stderr)
                self.assertNotIn("::", result.stdout + result.stderr)
                self.assertEqual(len(starts), attempts)
                if phase is not None:
                    self.assertIn("preflight=" + phase, result.stdout.splitlines())
                else:
                    self.assertNotIn("preflight=", result.stdout)
                if "args" in kwargs or "missing_tool" in kwargs or "probe_code" in kwargs:
                    self.assertEqual(calls, [])

    def test_phase_assignments_are_source_literals(self):
        source = SCRIPT.read_text()
        assignments = re.findall(r"^condition=(.*)$", source, re.MULTILINE)
        self.assertEqual(assignments, [
            "runtime_guard", "app_inspection", "app_contract", "worker_inspection",
            "worker_contract", "pre_start_app_inspection", "pre_start_worker_inspection",
            "pre_start_contract", "",
        ])
        self.assertLess(source.index("condition=runtime_guard\n"), source.index("fail()"))

    def test_created_starts_pinned_id(self):
        result, calls, starts = self.run_case()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(starts, [["start", WORKER]])
        self.assertIn("worker_start=started", result.stdout)
        self.assertIn("readiness=process_running_only", result.stdout)
        self.assertEqual(sum(a[0] == "inspect" and a[-1] == WORKER for a in calls), 7)
        self.assertEqual(calls[-1][-1], APP)
        after_start = calls[calls.index(["start", WORKER]) + 1:]
        self.assertTrue(all(a[0] == "inspect" and a[-1] in [APP, WORKER] for a in after_start))

    def test_already_running_is_noop(self):
        result, _, starts = self.run_case({"worker": {"9": "running"}})
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(starts, [])
        self.assertIn("already_running_not_started_by_this_run", result.stdout)

    def test_preconditions_deny(self):
        cases = []
        for key in ("app", "worker"):
            for index, values in {
                "0": ["", "a" * 63, "b" * 64 if key == "app" else APP],
                "1": ["", "sha256:" + "d" * 64, "invalid"],
                "2": ["false"], "3": ["false"], "4": ["false"],
                "5": ["false"], "8": ["false"],
                "10": ["true"], "11": ["true"], "12": ["1"], "13": ["1"],
            }.items():
                cases.extend({key: {index: v}} for v in values)
        for index in ("6", "7"):
            cases.extend({"worker": {index: v}}
                         for v in ["", "F", "TF", "FT", "TT", "true", "T\n", "T\x00"])
        cases.extend({"worker": {"9": v}}
                     for v in ["exited", "restarting", "paused", "dead", "removing", "unknown"])
        cases.extend({"app": {"9": v}} for v in ["created", "exited", "restarting"])
        cases.extend({"app": {"14": v}} for v in ["none", "starting", "unhealthy"])
        cases.extend({"worker": {"14": v}} for v in ["starting", "unhealthy", "invalid"])
        cases.extend([{"inspect_code": 1}, {"inspect_code": 124},
                      {"raw": "PRIVATE"}, {"raw": "x" * 2049}])
        for changes in cases:
            with self.subTest(changes=changes):
                result, _, starts = self.run_case(changes)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(starts, [])

    def test_full_buffer_and_status(self):
        valid = "|".join([APP, IMAGE, *(["true"] * 4), "T", "T", "true",
                          "running", "false", "false", "0", "0", "healthy"]) + "\n"
        for suffix in ["\n", "\x00", "x" * 2049]:
            with self.subTest(suffix=repr(suffix[:8])):
                result, _, starts = self.run_case({"app_raw": valid + suffix})
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(starts, [])
        for code in (1, 124):
            result, _, starts = self.run_case({"app_raw": valid, "inspect_code": code})
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(starts, [])

    def test_drift_before_start(self):
        for key in ("app", "worker"):
            for index, value in [("0", "d" * 64), ("3", "false"),
                                 ("6", "TT"), ("9", "exited")]:
                with self.subTest(key=key, index=index):
                    result, _, starts = self.run_case(
                        {"drift_at": 2, key + "_drift": {index: value}})
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(starts, [])

    def test_start_failure_unknown_never_retries(self):
        for code in (1, 124, 137):
            result, calls, starts = self.run_case({"start_code": code})
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(len(starts), 1)
            self.assertIn("outcome_unknown", result.stdout)
            self.assertEqual(calls[-1][-1], WORKER)
            self.assertEqual(sum(a[0] == "inspect" for a in calls), 5)

    def test_post_start_failure_never_rolls_back(self):
        for key, index, value in [("worker", "9", "exited"),
                                  ("worker", "13", "1"),
                                  ("worker", "14", "unhealthy"),
                                  ("worker", "0", "d" * 64),
                                  ("app", "14", "unhealthy")]:
            with self.subTest(key=key, index=index):
                result, _, starts = self.run_case({key + "_post": {index: value}})
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(len(starts), 1)
                self.assertNotIn("worker_start=started", result.stdout)

    def test_runtime_arguments_and_missing_timeout(self):
        for kwargs in [{"args": ["start"]}, *[{"missing_tool": tool}
                                             for tool in ["timeout", "docker", "python3", "sleep"]]]:
            result, calls, starts = self.run_case(**kwargs)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(calls, [])
            self.assertEqual(starts, [])

    def test_post_start_inspect_unavailable(self):
        result, _, starts = self.run_case({"post_inspect_code": 1})
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(starts), 1)
        self.assertIn("unstable_or_observation_unavailable", result.stdout)

    def test_optional_healthcheck_readiness(self):
        result, _, starts = self.run_case({"worker_post": {"14": "healthy"}})
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(starts), 1)
        self.assertIn("readiness=container_healthcheck_healthy", result.stdout)


class Workflow(unittest.TestCase):
    def test_exact_reviewed_transport_equivalence_and_existing_fake_ssh(self):
        base = (ROOT / ".github/workflows/diagnose-odelza-production.yaml").read_text()
        actual = WORKFLOW.read_text()
        self.assertEqual(actual.split("        run: |\n")[1],
                         base.split("        run: |\n")[1].replace(
                             "scripts/odelza-production-diagnose.sh", "scripts/odelza-worker-start.sh"))
        self.assertEqual(actual.split("        env:\n")[1].split("        run:")[0],
                         base.split("        env:\n")[1].split("        run:")[0])
        # Execute the pre-existing strict fake-SSH harness for the identical body.
        spec = importlib.util.spec_from_file_location(
            "diagnostics_tests", ROOT / "scripts/ci/test_odelza_production_diagnose.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.Workflow().test_runner_uses_static_stdin_and_cleans_only_local_credentials()

    def test_manual_guards_and_no_normal_application_cd_match(self):
        text = WORKFLOW.read_text()
        self.assertEqual(text.split("on:\n")[1].split("\npermissions:")[0].strip(),
                         "workflow_dispatch:")
        for required in ["contents: read", "group: odelza-production\n  cancel-in-progress: false",
                         "github.repository == 'AndresMarulanda10/odelza-platform'",
                         "github.ref == 'refs/heads/main'", "github.event_name == 'workflow_dispatch'",
                         "name: production\n      url: https://second-brain.odelza.com/",
                         "timeout-minutes: 10", "ref: ${{ github.sha }}\n          persist-credentials: false",
                         "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683"]:
            self.assertIn(required, text)
        production = (ROOT / ".github/workflows/cd-odelza-production.yaml").read_text()
        filters = production.split("    paths:\n")[1].split("  workflow_dispatch:")[0]
        patterns = re.findall(r"- '([^']+)'", filters)
        self.assertGreater(len(patterns), 10)
        for path in [".github/workflows/start-odelza-worker.yaml", "scripts/odelza-worker-start.sh",
                     "scripts/ci/test_odelza_worker_start.py", "odd/tasks/production-worker-start.md"]:
            self.assertFalse(any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns), path)


class NativeTemplates(unittest.TestCase):
    @unittest.skipUnless(shutil.which("go"), "Go unavailable: native template modeling not run")
    def test_real_go_template_guards(self):
        # Strict raw-map fallback, with Docker's split/json bindings and both
        # JSON number modes. Not a target Docker daemon/version proof.
        _, calls, _ = Protocol().run_case()
        template = next(a[3][9:] for a in calls if a[-1] == "odelza-jobs")
        app_template = next(a[3][9:] for a in calls if a[-1] == "odelza-app")
        data = {"Id": WORKER, "Image": IMAGE, "Name": "/odelza-jobs",
                "Config": {"Image": "twentycrm/twenty:odelza-2c449260b87aef0dc90e4eb8cd6ceca0fa02149f",
                           "Entrypoint": ["/app/entrypoint.sh"], "Cmd": ["yarn", "worker:prod"],
                           "Env": ["DISABLE_DB_MIGRATIONS=true", "DISABLE_CRON_JOBS_REGISTRATION=true"]},
                "HostConfig": {"RestartPolicy": {"Name": "always"}},
                "State": {"Status": "created", "Paused": False, "Restarting": False, "ExitCode": 0},
                "RestartCount": 0}
        cases = [(data, True)]
        for field, variants in {
            "Entrypoint": [None, [], ["wrong"], ["/app/entrypoint.sh", "extra"]],
            "Cmd": [None, [], ["yarn"], ["yarn", "wrong"], ["yarn", "worker:prod", "extra"]],
        }.items():
            for value in variants:
                candidate = json.loads(json.dumps(data))
                candidate["Config"][field] = value
                cases.append((candidate, False))
        for key in ["DISABLE_DB_MIGRATIONS", "DISABLE_CRON_JOBS_REGISTRATION"]:
            for values in [[], ["false"], [""], [None], ["TRUE"], ["true", "true"],
                           ["true", "false"], ["false", "true"], ["true=extra"]]:
                candidate = json.loads(json.dumps(data))
                env = [v for v in candidate["Config"]["Env"] if not v.startswith(key + "=")]
                env.extend(key if value is None else key + "=" + value for value in values)
                candidate["Config"]["Env"] = env
                cases.append((candidate, False))
        self.assertEqual(len(cases), 28)  # Retain every original configuration case.
        requests = [(template, candidate, expected, False) for candidate, expected in cases]
        for app in (False, True):
            for status in ("created", "running"):
                for health in ["OMITTED", None, {"Status": "healthy"},
                               {"Status": "unhealthy"}, {"Status": "starting"},
                               {}, [], 0, False, "", "healthy", {"Status": "invalid"}]:
                    candidate = json.loads(json.dumps(data))
                    candidate["State"]["Status"] = status
                    if health != "OMITTED":
                        candidate["State"]["Health"] = health
                    if app:
                        candidate.update(Id=APP, Name="/odelza-app")
                        candidate["Config"]["Cmd"] = ["node", "dist/main"]
                    expected = (status == "running" and health == {"Status": "healthy"}
                                if app else health in ("OMITTED", None) or
                                (status == "running" and health == {"Status": "healthy"}))
                    requests.append((app_template if app else template, candidate, expected, app))
        program = r'''package main
import ("bytes"; "encoding/json"; "os"; "strings"; "text/template")
type Case struct { Template string; Data map[string]interface{} }
type Request struct { Cases []Case }
func main() {
    var request Request
    decoder := json.NewDecoder(os.Stdin)
    // Select decoding before consuming stdin, matching Docker's raw fallback.
    if os.Args[1] == "use-number" { decoder.UseNumber() }
    if err := decoder.Decode(&request); err != nil { panic(err) }
    outputs := []string{}
    for _, item := range request.Cases {
        funcs := template.FuncMap{"split": strings.Split, "json": func(v interface{}) (string, error) {
            b, err := json.Marshal(v); return string(b), err
        }}
        t := template.Must(template.New("inspect").Option("missingkey=error").Funcs(funcs).Parse(item.Template))
        var output bytes.Buffer
        if err := t.Execute(&output, item.Data); err != nil {
            outputs = append(outputs, "TEMPLATE_ERROR: " + err.Error())
        } else { outputs = append(outputs, output.String()) }
    }
    json.NewEncoder(os.Stdout).Encode(outputs)
}
'''
        with tempfile.TemporaryDirectory(prefix="odelza-native-template-") as directory:
            home = Path(directory)
            source = home / "main.go"
            source.write_text(program)
            env = dict(os.environ, GOPROXY="off", GOTOOLCHAIN="local", GOTELEMETRY="off",
                       GOCACHE=str(home / "cache"), GOPATH=str(home / "go"))
            for mode in ("use-number", "ordinary-json"):
                result = subprocess.run([shutil.which("go"), "run", str(source), mode],
                                        input=json.dumps({"Cases": [
                                            {"Template": t, "Data": d} for t, d, _, _ in requests]}),
                                        text=True, capture_output=True, env=env, timeout=120)
                self.assertEqual(result.returncode, 0, result.stderr)
                outputs = json.loads(result.stdout)
                self.assertEqual(len(outputs), 76)
                for index, (output, (_, candidate, expected, app)) in enumerate(zip(outputs, requests)):
                    fields = output.split("|")
                    accepted = (len(fields) == 15 and
                                fields[2:9] == ["true"] * 4 + ["T", "T", "true"] and
                                fields[10:14] == ["false", "false", "0", "0"] and
                                (fields[9:10] == ["running"] and fields[14] == "healthy"
                                 if app else (fields[9] == "created" and fields[14] == "none") or
                                 (fields[9] == "running" and fields[14] in ("none", "healthy"))))
                    self.assertEqual(accepted, expected, (mode, output))
                    if index >= 28:
                        # Feed actual native output into the full denying shell
                        # protocol; only the synthetic created->running transition
                        # changes after a successful fake start.
                        key = "app" if app else "worker"
                        changes = {key + "_raw": output + "\n"}
                        if not app:
                            changes["worker_post_raw"] = output.replace(
                                "|created|", "|running|") + "\n"
                        protocol, _, starts = Protocol().run_case(changes)
                        self.assertEqual(protocol.returncode == 0, expected, (mode, output))
                        expected_starts = int(expected and
                                              (app or candidate["State"]["Status"] == "created"))
                        self.assertEqual(len(starts), expected_starts)


if __name__ == "__main__":
    unittest.main()
