#!/usr/bin/env python3
"""Synthetic-only command and privacy boundary tests; never contact production."""

import json
import os
from pathlib import Path
import fnmatch
import re
import shutil
import subprocess
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/odelza-production-diagnose.sh"
IMAGE = "twentycrm/twenty:odelza-2e0e891db44cc075c26ca00f73bb6c054c4dae10"
CANARY = "PRIVATE_SQL_customer_email_token_::error::LEAK"
FORMAT = (
    "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|"
    "{{.State.ExitCode}}|{{.RestartCount}}|"
    "{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}"
)

# Executable fake: every Docker invocation is checked before supplying any data.
FAKE = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
name = pathlib.Path(sys.argv[0]).name
a = sys.argv[1:]
cfg = json.loads(pathlib.Path(os.environ["FIXTURE"]).read_text())
with open(os.environ["TRACE"], "a") as f:
    f.write(json.dumps([name] + a) + "\n")
def deny():
    with open(os.environ["DENIED"], "a") as f:
        f.write(json.dumps([name] + a) + "\n")
    sys.exit(97)
if name == "timeout":
    if a[:3] != ["-k", "2s", "8s"]: deny()
    if a[3] not in ("docker", "stat", "head"): deny()
    if cfg.get("timeout"): sys.exit(124)
    if cfg.get("real_timeout"):
        os.execv(cfg["real_timeout"], ["timeout"] + a)
    os.execv(str(pathlib.Path(sys.argv[0]).parent / a[3]), a[3:])
elif name == "docker":
    if len(a) == 6 and a[:4] == ["inspect", "--type", "container", "--format"]:
        if a[4] != cfg["format"] or a[5] not in ("odelza-app", "odelza-jobs"): deny()
        if cfg.get("hang_inspect"):
            import time
            time.sleep(30)
        print(cfg.get("inspect", "a"*64 + "|sha256:" + "b"*64 + "|" + cfg["image"] + "|running|0|2|healthy"))
    elif len(a) == 8 and a[:3] == ["logs", "--tail", "200"]:
        if a[3:7] != ["--since", "2026-11-09T13:06:00Z", "--until", "2026-11-09T13:21:00Z"]: deny()
        if a[7] not in ("odelza-app", "odelza-jobs"): deny()
        print(cfg.get("logs", "fatal: " + cfg["canary"]))
    else: deny()
    message = cfg.get("log_stderr", cfg["canary"]) if a[0] == "logs" else cfg["canary"]
    if message: print(message, file=sys.stderr)
    sys.exit(cfg.get("docker_exit", 0))
elif name in ("head", "stat"):
    root = pathlib.Path(os.environ["SYNTHETIC_ROOT"])
    if name == "head":
        if a == ["-c", "32768"]:
            os.execv("/usr/bin/head", ["head"] + a)
        if len(a) != 4 or a[:3] != ["-c", "4097", "--"]: deny()
        p = pathlib.Path(a[3])
        if not p.is_relative_to(root) or p.name not in ("DEPLOYMENT.txt", "SHA256SUMS"): deny()
        os.execv("/usr/bin/head", ["head"] + a)
    if len(a) != 4 or a[:3] != ["-c", "%u:%a:%s", "--"]: deny()
    p = pathlib.Path(a[3])
    if not (p == pathlib.Path("/opt") or p == root or p.is_relative_to(root) or p in root.parents): deny()
    if cfg.get("owner_bad"): print("1000:700:1")
    else: print("0:" + cfg.get("mode", "700") + ":" + str(p.stat().st_size))
else:
    deny()
'''


class Diagnostics(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.bin = self.base / "bin"
        self.bin.mkdir()
        self.root = self.base / "production"
        self.root.mkdir()
        self.cfg = {"format": FORMAT, "image": IMAGE, "canary": CANARY}
        for name in ("timeout", "docker", "head", "stat", "ssh", "sudo", "rm", "mkdir", "cat", "find", "sha256sum"):
            p = self.bin / name
            p.write_text(FAKE)
            p.chmod(0o700)
        for name in ("awk",):
            (self.bin / name).symlink_to("/usr/bin/" + name)
        # Fake interpreter resolution is explicit, not ambient Docker/SSH access.
        (self.bin / "python3").symlink_to(os.sys.executable)

    def run_script(self, source=None):
        if source is None:
            source = SCRIPT.read_text()
        source = source.replace("PRODUCTION_ROOT=/opt/odelza", f"PRODUCTION_ROOT={self.root}")
        source = source.replace("PATH=/usr/sbin:/usr/bin:/sbin:/bin", f"PATH={self.bin}")
        fixture = self.base / "fixture.json"
        fixture.write_text(json.dumps(self.cfg))
        env = dict(os.environ, FIXTURE=str(fixture), TRACE=str(self.base / "trace"),
                   DENIED=str(self.base / "denied"), SYNTHETIC_ROOT=str(self.root))
        result = subprocess.run(["/bin/sh"], input=source, text=True, capture_output=True,
                                env=env, timeout=40)
        denied = self.base / "denied"
        self.assertFalse(denied.exists(), "command outside exact allowlist: " + (denied.read_text() if denied.exists() else ""))
        self.assertNotIn(CANARY, result.stdout + result.stderr)
        self.assertEqual(result.stderr, "")
        self.assertLess(len(result.stdout.encode()), 12000)
        return result

    def metadata(self, stamp="20261109T130700Z", extra=""):
        directory = self.root / "backups/cd-metadata" / stamp
        directory.mkdir(parents=True)
        text = (f"created_utc={stamp}\nprevious_tag=2.3.0\n"
                "previous_server_image=twentycrm/twenty:2.3.0\n"
                f"previous_server_image_id=sha256:{'c' * 64}\n"
                f"candidate_image={IMAGE}\n"
                f"candidate_local_image_id=sha256:{'b' * 64}\n"
                f"candidate_image_config_digest=sha256:{'d' * 64}\n")
        (directory / "DEPLOYMENT.txt").write_text(text + extra)
        return directory

    def backups(self, stamp="20261109T130700Z"):
        directory = self.root / "backups/cd-data" / ("cd-" + stamp)
        directory.mkdir(parents=True)
        files = ("postgres.dump", "server-local-data.tar.gz", "MANIFEST.txt")
        for name in files:
            (directory / name).write_text(CANARY)
        (directory / "SHA256SUMS").write_text(
            "".join("a" * 64 + "  " + name + "\n" for name in files))
        return directory

    def test_harness_detects_unsafe_prototype(self):
        # The pre-implementation RED was this privacy assertion, not a missing file.
        with self.assertRaisesRegex(AssertionError, "unexpectedly found"):
            self.run_script("PATH=" + str(self.bin) + "\ndocker logs --tail 200 --since 2026-11-09T13:06:00Z --until 2026-11-09T13:21:00Z odelza-app\n")

    def test_harness_denies_mutation(self):
        with self.assertRaisesRegex(AssertionError, "command outside exact allowlist"):
            self.run_script("PATH=" + str(self.bin) + "\ndocker restart odelza-app\n")

    def test_valid_observations_never_claim_health_or_integrity(self):
        self.metadata(extra=f"db_identity={CANARY}\nunknown_private={CANARY}\n")
        self.backups()
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("class.fatal=1", result.stdout)
        self.assertIn("metadata=unique_candidate_not_deployment_success", result.stdout)
        self.assertIn("integrity=not_checked", result.stdout)
        self.assertIn("backup.checksum_syntax=valid_only_not_verified", result.stdout)
        self.assertIn("health_conclusion=not_inferred", result.stdout)
        self.assertIn("root_cause=unknown", result.stdout)
        trace = [json.loads(line) for line in (self.base / "trace").read_text().splitlines()]
        self.assertEqual(sum(row[0] == "docker" for row in trace), 4)
        for row in trace:
            if row[0] == "head" and len(row) == 5:
                self.assertIn(Path(row[-1]).name, ("DEPLOYMENT.txt", "SHA256SUMS"))

    def test_inspect_rejects_every_untrusted_field(self):
        fields = ["a" * 64, "sha256:" + "b" * 64, IMAGE, "running", "0", "2", "healthy"]
        for index in range(len(fields)):
            with self.subTest(field=index):
                bad = fields.copy()
                bad[index] = CANARY + "\n::add-mask::secret"
                self.cfg["inspect"] = "|".join(bad)
                result = self.run_script()
                self.assertIn("odelza-app.inspect=invalid_value", result.stdout)
                self.assertNotEqual(result.returncode, 0)
        for value in ("-1", "256", "999999999999999999999"):
            bad = fields.copy()
            bad[4] = value
            self.cfg["inspect"] = "|".join(bad)
            self.assertIn("inspect=invalid_value", self.run_script().stdout)

    def test_large_and_sensitive_logs_fail_closed(self):
        self.cfg["logs"] = ("fatal " + CANARY + "\n") * 3000
        self.assertIn("logs=truncated", self.run_script().stdout)
        self.cfg["logs"] = (
            f"\x1b[31m::error::{CANARY}\x00\x01\nSELECT * FROM invoices; {CANARY}\n"
            '{"email":"' + CANARY + '"}\n'
            f"at privateProperty.{CANARY} (http://private/{CANARY})\n"
            "TypeError: arbitrary property\nCannot find module private\n"
            "Warning: Upgrade completed with errors. Some workspaces\n"
        )
        result = self.run_script()
        self.assertIn("class.type_error=1", result.stdout)
        self.assertIn("class.module_missing=1", result.stdout)
        self.assertIn("class.startup_upgrade_warning=1", result.stdout)
        for private in ("SELECT", "invoices", "privateProperty", "http://", "::error::", "::add-mask::", "\x1b", "\x01"):
            self.assertNotIn(private, result.stdout + result.stderr)

    def test_empty_logs_are_not_health_evidence(self):
        self.cfg["logs"] = ""
        self.cfg["log_stderr"] = ""
        result = self.run_script()
        self.assertIn("observed_lines=0", result.stdout)
        self.assertIn("health_conclusion=not_inferred", result.stdout)

    def test_container_stderr_is_bounded_and_classified_not_forwarded(self):
        self.cfg["logs"] = ""
        self.cfg["log_stderr"] = "TypeError: " + CANARY
        self.assertIn("class.type_error=1", self.run_script().stdout)
        self.cfg["log_stderr"] = (CANARY + "\n") * 2000
        self.assertIn("logs=truncated", self.run_script().stdout)

    def test_timeout_and_read_failure_are_distinct(self):
        self.cfg["timeout"] = True
        self.assertIn("inspect=timeout", self.run_script().stdout)
        self.cfg.pop("timeout")
        self.cfg["docker_exit"] = 1
        result = self.run_script()
        self.assertIn("inspect=read_failed", result.stdout)
        self.assertIn("logs=read_failed", result.stdout)
        self.assertIn("diagnostics=partial", result.stdout)

    @unittest.skipUnless(shutil.which("timeout"), "native timeout executable unavailable")
    def test_actual_timeout_bounds_hanging_synthetic_docker(self):
        self.cfg["real_timeout"] = shutil.which("timeout")
        self.cfg["hang_inspect"] = True
        started = time.monotonic()
        result = self.run_script()
        self.assertIn("odelza-app.inspect=timeout", result.stdout)
        self.assertIn("odelza-jobs.inspect=timeout", result.stdout)
        self.assertLess(time.monotonic() - started, 30)

    def test_required_tools_missing_skip_reads(self):
        for tool in ("timeout", "stat", "awk", "head"):
            with self.subTest(tool=tool):
                p = self.bin / tool
                moved = self.bin / (tool + ".disabled")
                p.rename(moved)
                result = self.run_script()
                moved.rename(p)
                self.assertEqual(result.returncode, 2)
                self.assertIn(tool + "_unavailable", result.stdout)
                self.assertFalse((self.base / "trace").exists())

    def test_docker_unavailable_does_not_probe_context(self):
        (self.bin / "docker").unlink()
        result = self.run_script()
        self.assertIn("containers=docker_unavailable", result.stdout)

    def test_duplicate_and_malformed_metadata_are_unavailable(self):
        directory = self.metadata(extra="candidate_image=" + IMAGE + "\n")
        self.assertIn("metadata=unavailable_candidate", self.run_script().stdout)
        p = directory / "DEPLOYMENT.txt"
        p.write_text(p.read_text().replace("previous_tag=2.3.0", "previous_tag=" + CANARY))
        self.assertIn("metadata=unavailable_candidate", self.run_script().stdout)

    def test_ambiguous_candidates_do_not_select_newest(self):
        self.metadata()
        self.metadata("20261109T130800Z")
        result = self.run_script()
        self.assertIn("metadata=ambiguous", result.stdout)
        self.assertNotIn("previous_server_image=", result.stdout)
        self.assertNotIn("backup.postgres.dump=", result.stdout)

    def test_ownership_and_symlinks_refuse_reads(self):
        directory = self.metadata()
        p = directory / "DEPLOYMENT.txt"
        target = directory / "private"
        p.rename(target)
        p.symlink_to(target)
        result = self.run_script()
        self.assertIn("metadata=unavailable_candidate", result.stdout)
        trace = (self.base / "trace").read_text()
        self.assertNotIn('"head", "-c", "4097"', trace)
        self.cfg["owner_bad"] = True
        self.assertIn("metadata=unavailable_path", self.run_script().stdout)

    def test_malicious_path_names_are_not_read_or_printed(self):
        directory = self.root / "backups/cd-metadata"
        directory.mkdir(parents=True)
        (directory / ("20261109T130700Z\n" + CANARY)).mkdir()
        self.assertIn("metadata=not_found", self.run_script().stdout)

    def test_metadata_limit_and_checksum_syntax(self):
        directory = self.metadata()
        p = directory / "DEPLOYMENT.txt"
        original = p.read_text()
        p.write_text(original + "unknown=" + "x" * 5000)
        self.assertIn("metadata=unavailable_candidate", self.run_script().stdout)
        p.write_text(original)
        backup = self.backups()
        (backup / "SHA256SUMS").write_text("a" * 64 + "  " + CANARY + "\n")
        self.assertIn("backup.checksum_syntax=invalid", self.run_script().stdout)
        archive = backup / "postgres.dump"
        archive.unlink()
        archive.symlink_to(backup / "MANIFEST.txt")
        self.assertIn("backup.postgres.dump=unavailable_file", self.run_script().stdout)

    def test_scan_limit_never_produces_partial_selection(self):
        self.metadata()
        for second in range(1, 34):
            self.metadata(f"20261109T1307{second:02d}Z")
        result = self.run_script()
        self.assertIn("metadata=scan_limit", result.stdout)
        self.assertNotIn("previous_server_image=", result.stdout)

    def test_incident_window_includes_1321_and_excludes_later_records(self):
        self.metadata("20261109T132100Z")
        self.metadata("20261109T132101Z")
        result = self.run_script()
        self.assertIn("metadata=unique_candidate_not_deployment_success", result.stdout)
        self.assertIn("created_utc=20261109T132100Z", result.stdout)

    def test_writable_paths_and_parent_symlinks_are_rejected(self):
        self.metadata()
        self.cfg["mode"] = "777"
        self.assertIn("metadata=unavailable_path", self.run_script().stdout)
        self.cfg.pop("mode")
        p = self.root / "backups/cd-metadata"
        target = self.root / "private_metadata"
        p.rename(target)
        p.symlink_to(target)
        self.assertIn("metadata=unavailable_path", self.run_script().stdout)

    def test_script_has_no_mutation_or_dynamic_runtime_inputs(self):
        source = SCRIPT.read_text()
        for forbidden in ("sudo ", "docker exec", "docker compose", "docker ps", "docker restart", "curl ", "wget ", "mktemp ", "rm ", "mkdir ", "sha256sum ", "eval ", "source "):
            self.assertNotIn(forbidden, source)
        self.assertEqual(source.count("timeout -k 2s 8s"), 2)
        self.assertIn("head -c 32768", source)
        self.assertNotIn("$ODELZA", source)


class Workflow(unittest.TestCase):
    def test_runner_uses_static_stdin_and_cleans_only_local_credentials(self):
        text = (ROOT / ".github/workflows/diagnose-odelza-production.yaml").read_text()
        block = text.split("        run: |\n", 1)[1]
        block = "\n".join(line[10:] for line in block.splitlines()) + "\n"
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            runner_bin = base / "bin"
            runner_bin.mkdir()
            trace = base / "trace"
            ssh = runner_bin / "ssh"
            ssh.write_text(f'''#!{os.sys.executable}
import os, pathlib, stat, sys
a = sys.argv[1:]
assert len(a) == 20, a
key, hosts = pathlib.Path(a[1]), pathlib.Path(a[17].split("=", 1)[1])
expected = ["-i", str(key), "-p", "22", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "-o", "IdentitiesOnly=yes", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "StrictHostKeyChecking=yes", "-o", "UserKnownHostsFile=" + str(hosts), "deploy@example.invalid", "sh -s"]
assert a == expected, a
assert key.read_text() == "synthetic-key\\n"
assert hosts.read_text() == "synthetic-known-hosts\\n"
assert stat.S_IMODE(key.stat().st_mode) == 0o600
assert stat.S_IMODE(hosts.stat().st_mode) == 0o600
assert sys.stdin.read() == pathlib.Path("scripts/odelza-production-diagnose.sh").read_text()
pathlib.Path(os.environ["TRACE"]).write_text("checked")
sys.exit(int(os.environ.get("SSH_EXIT", "0")))
''')
            ssh.chmod(0o700)
            timeout = runner_bin / "timeout"
            timeout.write_text(f'''#!{os.sys.executable}
import os, sys
assert sys.argv[1:5] == ["-k", "5s", "480s", "ssh"]
os.execv({str(ssh)!r}, ["ssh"] + sys.argv[5:])
''')
            timeout.chmod(0o700)
            env = dict(os.environ, PATH=str(runner_bin) + ":/usr/bin:/bin", RUNNER_TEMP=tmp,
                       TRACE=str(trace), GITHUB_REPOSITORY="AndresMarulanda10/odelza-platform",
                       GITHUB_REF="refs/heads/main", GITHUB_EVENT_NAME="workflow_dispatch",
                       GITHUB_SHA="2e0e891db44cc075c26ca00f73bb6c054c4dae10",
                       ODELZA_DEPLOY_HOST="example.invalid", ODELZA_DEPLOY_PORT="22",
                       ODELZA_DEPLOY_USER="deploy", ODELZA_DEPLOY_SSH_KEY="synthetic-key",
                       ODELZA_DEPLOY_KNOWN_HOSTS="synthetic-known-hosts")
            for code in (0, 2, 124):
                result = subprocess.run(["/bin/bash"], input=block, text=True, capture_output=True,
                                        cwd=ROOT, env=dict(env, SSH_EXIT=str(code)), timeout=10)
                self.assertEqual(result.returncode, 0 if code == 0 else 1, result.stderr)
                self.assertTrue(trace.exists(), result.stderr)
                self.assertEqual(list(base.glob("odelza-diagnose.*")), [])
                self.assertNotIn("synthetic-key", result.stdout + result.stderr)
                trace.unlink()
            for key, value in (("ODELZA_DEPLOY_HOST", "-oProxyCommand=bad"),
                               ("ODELZA_DEPLOY_USER", "root -bad"),
                               ("ODELZA_DEPLOY_PORT", "65536"),
                               ("ODELZA_DEPLOY_PORT", "00000"),
                               ("ODELZA_DEPLOY_PORT", "$(bad)"),
                               ("GITHUB_REF", "refs/heads/other"),
                               ("GITHUB_REPOSITORY", "fork/odelza-platform"),
                               ("GITHUB_EVENT_NAME", "push")):
                with self.subTest(key=key, value=value):
                    result = subprocess.run(["/bin/bash"], input=block, text=True, capture_output=True,
                                            cwd=ROOT, env=dict(env, **{key: value}), timeout=10)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertFalse(trace.exists())
                    self.assertEqual(list(base.glob("odelza-diagnose.*")), [])

    def test_manual_revision_and_production_guards(self):
        text = (ROOT / ".github/workflows/diagnose-odelza-production.yaml").read_text()
        trigger = text.split("on:\n", 1)[1].split("\npermissions:", 1)[0]
        self.assertEqual(trigger.strip(), "workflow_dispatch:")
        self.assertIn("permissions:\n  contents: read\n", text)
        self.assertIn("group: odelza-production\n  cancel-in-progress: false", text)
        self.assertIn("if: github.repository == 'AndresMarulanda10/odelza-platform' && github.ref == 'refs/heads/main'", text)
        self.assertIn("name: production\n      url: https://second-brain.odelza.com/", text)
        self.assertIn("timeout-minutes: 10", text)
        self.assertIn("ref: ${{ github.sha }}\n          persist-credentials: false", text)
        production = (ROOT / ".github/workflows/cd-odelza-production.yaml").read_text()
        pin = re.search(r"uses: (actions/checkout@[0-9a-f]{40})", production).group(1)
        self.assertIn("uses: " + pin, text)
        secrets = re.findall(r"secrets\.([A-Z_]+)", text)
        self.assertEqual(set(secrets), {"ODELZA_DEPLOY_" + suffix for suffix in ("HOST", "PORT", "USER", "SSH_KEY", "KNOWN_HOSTS")})
        for option in ("BatchMode=yes", "ConnectTimeout=15", "IdentitiesOnly=yes", "ServerAliveInterval=30", "ServerAliveCountMax=3", "StrictHostKeyChecking=yes", 'UserKnownHostsFile="$known_hosts_file"'):
            self.assertIn(option, text)
        self.assertIn("timeout -k 5s 480s ssh", text)
        self.assertIn("'sh -s' \\\n            < scripts/odelza-production-diagnose.sh 2>/dev/null", text)
        for forbidden in ("scp ", "sftp ", "set -x", "upload-artifact", "inputs.", "write-all", "sudo "):
            self.assertNotIn(forbidden, text)
        filters = production.split("    paths:\n", 1)[1].split("  workflow_dispatch:", 1)[0]
        patterns = re.findall(r"- '([^']+)'", filters)
        self.assertGreater(len(patterns), 10)
        for path in (".github/workflows/diagnose-odelza-production.yaml", "scripts/odelza-production-diagnose.sh", "scripts/ci/test_odelza_production_diagnose.py", "odd/tasks/production-read-only-diagnostics.md"):
            self.assertFalse(any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns), path)


if __name__ == "__main__":
    unittest.main()
