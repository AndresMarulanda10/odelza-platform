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
    '{{if index .State "Health"}}{{.State.Health.Status}}{{else}}none{{end}}'
)
TIMES = "{{.Created}}|{{.State.StartedAt}}"
START = "2026-11-09T14:00:00.123456789Z"

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
    if a[3] not in ("docker", "stat", "head", "date"): deny()
    if cfg.get("timeout"): sys.exit(124)
    if cfg.get("real_timeout"):
        os.execv(cfg["real_timeout"], ["timeout"] + a)
    os.execv(str(pathlib.Path(sys.argv[0]).parent / a[3]), a[3:])
elif name == "docker":
    if len(a) == 6 and a[:4] == ["inspect", "--type", "container", "--format"]:
        # Keep the exact previous template for reproducible regression RED runs.
        legacy = cfg["format"].replace('index .State "Health"', '.State.Health')
        if a[4] not in (cfg["format"], legacy, "{{.Created}}|{{.State.StartedAt}}") or a[5] not in ("odelza-app", "odelza-jobs"): deny()
        if a[4] == "{{.Created}}|{{.State.StartedAt}}":
            print(cfg.get("times", "2026-11-09T13:59:00Z|2026-11-09T14:00:00.123456789Z"))
            sys.exit(cfg.get("times_exit", cfg.get("docker_exit", 0)))
        if cfg.get("inspect_exit"): sys.exit(cfg["inspect_exit"])
        if cfg.get("hang_inspect"):
            import time
            time.sleep(30)
        if cfg.get("no_health") and '.State "Health"' not in a[4]: sys.exit(1)
        print(cfg.get("inspect", "a"*64 + "|sha256:" + "b"*64 + "|" + cfg["image"] + "|running|0|2|" + ("none" if cfg.get("no_health") and a[5] == "odelza-jobs" else "healthy")))
    elif a == ["ps", "--all", "--filter", "name=^/odelza-app$", "--format", "{{.Names}}"] or a == ["ps", "--all", "--filter", "name=^/odelza-jobs$", "--format", "{{.Names}}"]:
        sys.stdout.write(cfg.get("probe", a[3][7:-1] + "\n"))
        print(cfg["canary"], file=sys.stderr)
        sys.exit(cfg.get("probe_exit", cfg.get("docker_exit", 0)))
    elif len(a) == 8 and a[:3] == ["logs", "--tail", "200"]:
        windows = [["--since", "2026-11-09T13:06:00Z", "--until", "2026-11-09T13:21:00Z"]]
        for fraction in ("", ".1", ".123456789"):
            windows.append(["--since", "2026-11-09T14:00:00" + fraction + "Z", "--until", "2026-11-09T14:10:00" + fraction + "Z"])
        if a[3:7] not in windows: deny()
        if a[7] not in ("odelza-app", "odelza-jobs"): deny()
        print(cfg.get("logs", "fatal: " + cfg["canary"]))
    else: deny()
    message = cfg.get("log_stderr", cfg["canary"]) if a[0] == "logs" else cfg["canary"]
    if message: print(message, file=sys.stderr)
    sys.exit(cfg.get("docker_exit", 0))
elif name == "date":
    if a == ["-u", "+%s"]: print(cfg.get("date_now", "1794236400"))
    elif a in (["-u", "-d", "2026-11-09T13:59:00Z", "+%s"], ["-u", "-d", "2026-11-09T14:00:00Z", "+%s"], ["-u", "-d", "2026-11-09T14:00:00.1Z", "+%s"], ["-u", "-d", "2026-11-09T14:00:00.123456789Z", "+%s"]):
        print("1794232740" if a[2].endswith("13:59:00Z") else "1794232800")
    elif a == ["-u", "-d", "@1794233400", "+%Y-%m-%dT%H:%M:%S"]: print(cfg.get("date_end", "2026-11-09T14:10:00"))
    else:
        ends = {
            "2026-11-09T14:10:00": "1794233400",
            "2026-11-10T14:10:00": "1794319800",
            "2026-11-09T14:00:00": "1794232800",
            "2026-11-09T13:59:59": "1794232799",
            "2026-11-09T14:09:59": "1794233399",
            "2026-11-09T14:10:01": "1794233401",
        }
        allowed = {tuple(["-u", "-d", base + fraction + "Z", "+%s"]): epoch
                   for base, epoch in ends.items() for fraction in ("", ".1", ".123456789")}
        if tuple(a) not in allowed: deny()
        print(cfg.get("end_epoch", allowed[tuple(a)]))
        sys.exit(cfg.get("end_epoch_exit", cfg.get("date_exit", 0)))
    sys.exit(cfg.get("date_exit", 0))
elif name == "od":
    if a != ["-An", "-v", "-tu1"]: deny()
    os.execv("/usr/bin/od", ["od"] + a)
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
    if cfg.get("stat_target") == str(p):
        print(cfg.get("stat_value", cfg["canary"]))
        sys.exit(cfg.get("stat_exit", 0))
    elif cfg.get("owner_bad"): print("1000:700:1")
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
        for name in ("timeout", "docker", "head", "stat", "od", "date", "ssh", "sudo", "rm", "mkdir", "cat", "find", "sha256sum"):
            p = self.bin / name
            p.write_text(FAKE)
            p.chmod(0o700)
        for name in ("awk",):
            (self.bin / name).symlink_to("/usr/bin/" + name)
        # Fake interpreter resolution is explicit, not ambient Docker/SSH access.
        (self.bin / "python3").symlink_to(os.sys.executable)

    def run_script(self, source=None, trace_check=None):
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
        if trace_check is not None:
            trace_check([json.loads(line) for line in (self.base / "trace").read_text().splitlines()])
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
        original_observations = [row for row in trace if row[0] == "docker" and (
            row[1] == "logs" and row[5] == "2026-11-09T13:06:00Z" or
            row[1] == "inspect" and row[5] == FORMAT)]
        self.assertEqual(len(original_observations), 4)
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

    def test_exact_cap_payload_status_cannot_forge_success(self):
        # First 32768 bytes end in payload '\n0\n'; real trailer is lost.
        self.cfg.update(logs="x" * 32765 + "\n0\nfatal: later error", log_stderr="", docker_exit=1)
        result = self.run_script()
        self.assertIn("odelza-app.logs=truncated", result.stdout)
        self.assertNotIn("logs=bounded_incident", result.stdout)
        self.assertNotIn("class.", result.stdout)

    def test_capture_boundaries_and_binary_bytes(self):
        self.cfg["log_stderr"] = ""
        # Fake print adds one newline; trusted success trailer adds three bytes.
        for size in (32767, 32768, 32769):
            for unit in ("x", "\n", "é", "\x00", "\x01"):
                with self.subTest(size=size, unit=repr(unit)):
                    count, remainder = divmod(size - 4, len(unit.encode()))
                    self.cfg["logs"] = unit * count + "x" * remainder
                    result = self.run_script()
                    if size >= 32768:
                        self.assertIn("logs=truncated", result.stdout)
                        self.assertNotIn("class.", result.stdout)
                    else:
                        self.assertIn("logs=bounded_incident", result.stdout)

    def test_uncapped_payload_status_is_not_real_status(self):
        for code, status in ((0, "bounded_incident"), (1, "read_failed"), (124, "timeout"), (137, "timeout")):
            with self.subTest(code=code):
                self.cfg.update(logs="fatal\n0\n124\n137\n" + "\n" * 100, log_stderr="", docker_exit=code)
                result = self.run_script()
                self.assertIn("logs=" + status, result.stdout)
                if code:
                    self.assertNotIn("class.", result.stdout)

    def test_structured_nul_is_not_silently_removed(self):
        self.cfg["inspect"] = "a" * 64 + "|sha256:" + "b" * 64 + "|" + IMAGE + "|running|0\x00|2|healthy"
        result = self.run_script()
        self.assertIn("inspect=invalid_value", result.stdout)
        self.assertNotIn("inspect=" + "a" * 64, result.stdout)

    def test_metadata_byte_limit_preserves_trailing_newlines(self):
        directory = self.metadata()
        p = directory / "DEPLOYMENT.txt"
        original = p.read_text()
        for size in (4095, 4096, 4097):
            with self.subTest(size=size):
                p.write_text(original + "\n" * (size - len(original.encode())))
                result = self.run_script()
                expected = "unique_candidate_not_deployment_success" if size <= 4096 else "unavailable_candidate"
                self.assertIn("metadata=" + expected, result.stdout)

    def test_oversize_payload_with_error_and_timeout_is_unavailable(self):
        for code in (0, 1, 124, 137):
            with self.subTest(code=code):
                self.cfg.update(logs="x" * 32765 + "\n0\n" + "\n" * 50000 + "fatal", log_stderr="", docker_exit=code)
                result = self.run_script()
                self.assertIn("logs=truncated", result.stdout)
                self.assertNotIn("class.", result.stdout)

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
        for tool in ("timeout", "stat", "awk", "head", "od"):
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
        # Preserve the inventory prohibition except for this exact authorized probe.
        without_probe = source.replace('read_bounded docker ps --all --filter "name=^/$1$" --format \'{{.Names}}\'', '')
        for forbidden in ("sudo ", "docker exec", "docker compose", "docker ps", "docker restart", "curl ", "wget ", "mktemp ", "rm ", "mkdir ", "sha256sum ", "eval ", "source "):
            self.assertNotIn(forbidden, without_probe)
        self.assertEqual(source.count("timeout -k 2s 8s"), 2)
        self.assertIn("head -c 32768", source)
        self.assertNotIn("$ODELZA", source)

    def test_second_pass_exact_existence_and_optional_health(self):
        self.cfg["no_health"] = True
        result = self.run_script()
        self.assertIn("|running|0|2|none", result.stdout)
        self.assertIn("|running|0|2|healthy", result.stdout)
        self.cfg["inspect_exit"] = 1
        for payload, code, expected in (
            ("odelza-jobs\n", 0, "present_at_probe"),
            ("", 0, "absent_at_probe"), ("", 1, "unknown"),
            ("odelza-jobs\nodelza-jobs\n", 0, "unknown"),
            (CANARY, 0, "unknown"), ("odelza-worker\n", 0, "unknown"),
            ("odelza-jobs\x00\n", 0, "unknown"),
        ):
            with self.subTest(payload=payload, code=code):
                self.cfg.update(probe=payload, probe_exit=code)
                self.assertIn("odelza-jobs.existence=" + expected, self.run_script().stdout)

    def test_second_pass_metadata_fixed_failure_reasons(self):
        self.metadata()
        targets = (
            ("/", "root"), ("/opt", "opt"), (str(self.root), "odelza"),
            (str(self.root / "backups"), "backups"),
            (str(self.root / "backups/cd-metadata"), "cd_metadata"),
        )
        for target, stage in targets:
            for value, code, reason in (("1000:700:1", 0, "not_root_owned"), ("0:777:1", 0, "insecure_mode"), (CANARY, 0, "invalid_stat"), ("0:700:1", 1, "stat_failed")):
                with self.subTest(stage=stage, reason=reason):
                    (self.base / "trace").unlink(missing_ok=True)
                    self.cfg.update(stat_target=target, stat_value=value, stat_exit=code)
                    result = self.run_script()
                    self.assertIn("metadata.path_stage=" + stage, result.stdout)
                    self.assertIn("metadata.path_reason=" + reason, result.stdout)
                    self.assertNotIn('"head", "-c", "4097"', (self.base / "trace").read_text())

    def test_second_pass_startup_window_and_untrusted_times(self):
        result = self.run_script()
        self.assertIn("odelza-jobs.started_at=" + START, result.stdout)
        self.assertIn("odelza-jobs.startup.logs=bounded_current_startup_first_ten_minutes", result.stdout)
        trace = [json.loads(x) for x in (self.base / "trace").read_text().splitlines()]
        self.assertIn(["docker", "logs", "--tail", "200", "--since", START, "--until", "2026-11-09T14:10:00.123456789Z", "odelza-jobs"], trace)
        for stamp in (CANARY, "--date=" + CANARY, "2026-11-09T14:00:00Z\nfatal", "2026-11-09T14:00:00.1234567890Z", "2026-19-09T14:00:00Z"):
            self.cfg["times"] = "2026-11-09T13:59:00Z|" + stamp
            self.assertIn("startup=invalid_timestamp", self.run_script().stdout)
        self.cfg["times"] = "2026-11-09T13:59:00Z|0001-01-01T00:00:00Z"
        self.assertIn("startup=not_started", self.run_script().stdout)
        self.cfg.pop("times")
        self.cfg["date_exit"] = 1
        self.assertIn("startup=date_unavailable", self.run_script().stdout)
        self.cfg.pop("date_exit")
        (self.bin / "date").unlink()
        self.assertIn("startup=date_unavailable", self.run_script().stdout)

    def test_second_pass_probe_capture_and_command_boundaries(self):
        self.cfg["inspect_exit"] = 1
        for payload, code in (("x" * 32765 + "\n0\n", 0), ("odelza-jobs\n", 124), ("odelza-jobs\n\n", 0), ("odelza-jobs\n" + CANARY, 0)):
            with self.subTest(code=code, size=len(payload)):
                self.cfg.update(probe=payload, probe_exit=code)
                self.assertIn("odelza-jobs.existence=unknown", self.run_script().stdout)
        for command in (
            "docker ps --all --format '{{.Names}}'",
            "docker ps --all --filter 'name=odelza' --format '{{.Names}}'",
            "docker inspect --type container --format '{{.Config.Env}}' odelza-jobs",
            "date -s 2026-11-09", "date -u -d '$(bad)' +%s",
        ):
            with self.subTest(command=command):
                (self.base / "denied").unlink(missing_ok=True)
                with self.assertRaisesRegex(AssertionError, "command outside exact allowlist"):
                    self.run_script("PATH=" + str(self.bin) + "\n" + command + "\n")

    def test_second_pass_metadata_path_types_stop_content_reads(self):
        self.metadata()
        p = self.root / "backups/cd-metadata"
        held = self.root / "held"
        p.rename(held)
        for kind, reason in (("missing", "not_found"), ("file", "not_directory"), ("symlink", "symlink")):
            with self.subTest(kind=kind):
                if kind == "file": p.write_text(CANARY)
                if kind == "symlink": p.symlink_to(held)
                (self.base / "trace").unlink(missing_ok=True)
                result = self.run_script()
                self.assertIn("metadata.path_stage=cd_metadata", result.stdout)
                self.assertIn("metadata.path_reason=" + reason, result.stdout)
                self.assertNotIn('"head", "-c", "4097"', (self.base / "trace").read_text())
                if kind != "missing": p.unlink()

    def test_second_pass_startup_precision_future_and_capture(self):
        for fraction in ("", ".1", ".123456789"):
            self.cfg["times"] = "2026-11-09T13:59:00Z|2026-11-09T14:00:00" + fraction + "Z"
            self.assertIn("startup.logs=bounded_current_startup_first_ten_minutes", self.run_script().stdout)
        self.cfg.pop("times")
        self.cfg["date_now"] = "1794232800"
        self.assertIn("startup=timestamp_order_or_future_unknown", self.run_script().stdout)
        self.cfg["date_now"] = CANARY
        self.assertIn("startup=date_unavailable", self.run_script().stdout)
        self.cfg.pop("date_now")
        self.cfg["date_end"] = CANARY
        self.assertIn("startup=invalid_timestamp", self.run_script().stdout)
        self.cfg.pop("date_end")
        for stamp in (
            "2026-02-30T14:00:00Z", "2026-11-09T24:00:00Z",
            "2026-11-09T14:60:00Z", "2026-11-09T14:00:60Z",
            "2026-11-09T14:00:00+00:00", "2026-11-09T14:00:00Z\n",
            "2026-11-09T14:00:00Z|" + CANARY,
        ):
            self.cfg["times"] = "2026-11-09T13:59:00Z|" + stamp
            self.assertIn("startup=invalid_timestamp", self.run_script().stdout)
        self.cfg["times"] = "x" * 32765 + "\n0\n"
        self.assertIn("startup=truncated", self.run_script().stdout)
        self.cfg["times"] = "2026-11-09T13:59:00Z|" + START + "\x00"
        self.assertIn("startup=invalid_value", self.run_script().stdout)

    def test_second_pass_startup_log_privacy_and_fake_status(self):
        self.cfg.update(logs="TypeError: " + CANARY, log_stderr="SELECT " + CANARY)
        result = self.run_script()
        self.assertIn("startup.logs=bounded_current_startup_first_ten_minutes", result.stdout)
        self.assertNotIn("SELECT", result.stdout)
        for code in (0, 1, 124):
            self.cfg.update(logs="x" * 32765 + "\n0\nfatal", log_stderr="", docker_exit=code, times_exit=0)
            result = self.run_script()
            self.assertIn("odelza-jobs.startup.logs=truncated", result.stdout)
            self.assertNotIn("class.", result.stdout)

    def test_startup_end_requires_exact_ten_minute_duration(self):
        def no_startup_logs(trace):
            attempted = [row for row in trace if row[:2] == ["docker", "logs"]
                         and row[5] != "2026-11-09T13:06:00Z"]
            self.assertEqual(attempted, [], "invalid-duration startup log read was attempted")

        for end in (
            "2026-11-10T14:10:00",  # Wrong day: 24 hours and ten minutes.
            "2026-11-09T14:00:00",  # Same as start.
            "2026-11-09T13:59:59",  # Earlier than start.
            "2026-11-09T14:09:59",  # 599 seconds.
            "2026-11-09T14:10:01",  # 601 seconds.
        ):
            with self.subTest(end=end):
                (self.base / "trace").unlink(missing_ok=True)
                self.cfg["date_end"] = end
                result = self.run_script(trace_check=no_startup_logs)
                self.assertIn("odelza-app.startup=invalid_duration", result.stdout)
                self.assertIn("odelza-jobs.startup=invalid_duration", result.stdout)
                self.assertEqual(result.returncode, 2)

    def test_startup_end_roundtrip_failure_and_fractional_proof(self):
        for value, code in ((CANARY, 0), ("1794233400", 1), ("1794233400", 124),
                            ("x" * 32765 + "\n0\n", 0), ("1794233400\x00", 0)):
            with self.subTest(code=code, size=len(value)):
                (self.base / "trace").unlink(missing_ok=True)
                self.cfg.update(end_epoch=value, end_epoch_exit=code)
                result = self.run_script()
                self.assertIn("startup=date_unavailable", result.stdout)
                trace = [json.loads(x) for x in (self.base / "trace").read_text().splitlines()]
                self.assertFalse(any(row[:2] == ["docker", "logs"] and row[5] == START for row in trace))
        self.cfg.pop("end_epoch")
        self.cfg.pop("end_epoch_exit")
        self.cfg.update(times="2026-11-09T13:59:00Z|2026-11-09T14:00:00Z",
                        date_end="2026-11-09T14:10:00.1")
        self.assertIn("startup=invalid_timestamp", self.run_script().stdout)
        self.cfg.pop("date_end")
        for fraction in ("", ".1", ".123456789"):
            (self.base / "trace").unlink(missing_ok=True)
            start = "2026-11-09T14:00:00" + fraction + "Z"
            end = "2026-11-09T14:10:00" + fraction + "Z"
            self.cfg["times"] = "2026-11-09T13:59:00Z|" + start
            self.run_script()
            trace = [json.loads(x) for x in (self.base / "trace").read_text().splitlines()]
            for target in ("odelza-app", "odelza-jobs"):
                self.assertIn(["docker", "logs", "--tail", "200", "--since", start, "--until", end, target], trace)
            self.assertIn(["date", "-u", "-d", end, "+%s"], trace)
            self.assertEqual(1794233400 - 1794232800, 600)
            self.assertEqual(start[19:], end[19:])  # Equal nanoseconds: exactly 600 seconds.


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
