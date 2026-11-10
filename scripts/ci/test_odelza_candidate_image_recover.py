"""Offline recovery tests; never invoke real SSH or Docker."""
import importlib.util
import base64
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    'recover', ROOT / 'scripts/odelza-candidate-image-recover.py')
recover = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(recover)


class PortableTests(unittest.TestCase):
    def test_setup_uses_available_tmpdir_without_host_specific_directories(self):
        with tempfile.TemporaryDirectory() as base:
            script = '''
import importlib.util, os, pathlib, sys, tempfile
spec = importlib.util.spec_from_file_location('offline_tests', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
base = pathlib.Path(sys.argv[2]).resolve()
os.environ['TMPDIR'] = str(base)
tempfile.tempdir = None
mkdir = os.mkdir
def isolated_mkdir(path, *args, **kwargs):
    if base not in pathlib.Path(path).resolve().parents:
        raise FileNotFoundError('directory unavailable on portable runner')
    return mkdir(path, *args, **kwargs)
os.mkdir = isolated_mkdir
module.OfflineTests.setUpClass()
try:
    assert module.OfflineTests.root.parent == base
finally:
    module.OfflineTests.tearDownClass()
'''
            result = subprocess.run([sys.executable, '-B', '-c', script, __file__, base],
                                    capture_output=True, text=True, timeout=40)
            self.assertEqual(result.returncode, 0, result.stderr)


class IdentityTests(unittest.TestCase):
    def test_wrong_identity_denies_export(self):
        with self.assertRaises(recover.RecoveryError):
            recover.check_identity({'Id': 'sha256:wrong', 'Os': 'linux',
                                    'Architecture': 'amd64', 'Size': 1})

    def test_platform_and_size_denials(self):
        for field, value in [('Os', 'windows'), ('Architecture', 'arm64'),
                             ('Size', 0), ('Size', True),
                             ('Size', recover.ARCHIVE_LIMIT + 1)]:
            metadata = {'Id': recover.IMAGE_ID, 'Os': 'linux',
                        'Architecture': 'amd64', 'Size': 1024}
            metadata[field] = value
            with self.subTest(field=field, value=value), self.assertRaises(recover.RecoveryError):
                recover.check_identity(metadata)

    def test_fixed_provenance_needs_no_operator_override(self):
        environment = {'GITHUB_REPOSITORY': 'AndresMarulanda10/odelza-platform',
                       'GITHUB_REF': 'refs/heads/main',
                       'GITHUB_EVENT_NAME': 'workflow_dispatch', 'GITHUB_SHA': 'a' * 40,
                       'RUNNER_TEMP': '/unused-offline-path'}
        with mock.patch.object(shutil, 'disk_usage', return_value=shutil._ntuple_diskusage(1, 0, 1)), \
                mock.patch.object(recover, 'child') as child:
            with self.assertRaisesRegex(recover.RecoveryError, 'runner_space_insufficient'):
                recover.recover(environment)
            child.assert_not_called()

    def test_provenance_mismatch_denies_before_any_child(self):
        environment = {'GITHUB_REPOSITORY': 'AndresMarulanda10/odelza-platform',
                       'GITHUB_REF': 'refs/heads/main',
                       'GITHUB_EVENT_NAME': 'workflow_dispatch', 'GITHUB_SHA': 'a' * 40}
        for name, value in [('TAG', 'twentycrm/twenty:other'), ('IMAGE_ID', 'sha256:wrong')]:
            with self.subTest(constant=name), mock.patch.object(recover, name, value), \
                    mock.patch.object(recover, 'child') as child:
                with self.assertRaisesRegex(recover.RecoveryError, 'provenance_mismatch'):
                    recover.recover(environment)
                child.assert_not_called()

    def test_runner_guard_denies(self):
        with self.assertRaisesRegex(recover.RecoveryError, 'runner_guard_denied'):
            recover.recover({})


def synthetic_archive(config=None, extras=(), oci=False):
    layer = b'synthetic application layer, no production data'
    layer_digest = hashlib.sha256(layer).hexdigest()
    config = config or {'os': 'linux', 'architecture': 'amd64',
                        'rootfs': {'type': 'layers', 'diff_ids': ['sha256:' + layer_digest]}}
    encoded = json.dumps(config).encode()
    digest = hashlib.sha256(encoded).hexdigest()
    config_name = ('blobs/sha256/' + digest) if oci else digest + '.json'
    layer_name = ('blobs/sha256/' + layer_digest) if oci else layer_digest + '/layer.tar'
    files = [(config_name, encoded), (layer_name, layer)]
    manifest = [{'Config': config_name, 'RepoTags': None, 'Layers': [layer_name]}]
    files.append(('manifest.json', json.dumps(manifest).encode()))
    if oci:
        def descriptor(content, media):
            return {'mediaType': media, 'digest': 'sha256:' + hashlib.sha256(content).hexdigest(),
                    'size': len(content)}
        image = json.dumps({'schemaVersion': 2,
                            'config': descriptor(encoded, 'application/vnd.oci.image.config.v1+json'),
                            'layers': [descriptor(layer, 'application/vnd.oci.image.layer.v1.tar')]}).encode()
        files += [('blobs/sha256/' + hashlib.sha256(image).hexdigest(), image),
                  ('oci-layout', b'{"imageLayoutVersion":"1.0.0"}'),
                  ('index.json', json.dumps({'schemaVersion': 2, 'manifests': [
                      descriptor(image, 'application/vnd.oci.image.manifest.v1+json')]}).encode())]
    files.extend(extras)
    result = io.BytesIO()
    with tarfile.open(fileobj=result, mode='w') as archive:
        for name, content in files:
            item = tarfile.TarInfo(name)
            if content is None:
                item.type = tarfile.SYMTYPE
                item.linkname = '/etc/passwd'
                archive.addfile(item)
            else:
                item.size = len(content)
                archive.addfile(item, io.BytesIO(content))
    return result.getvalue(), 'sha256:' + digest


class OfflineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scratch = tempfile.TemporaryDirectory(prefix='recovery-offline-')
        cls.root = Path(cls.scratch.name)
        cls.key = cls.root / 'local-only.key'
        cls.cert = cls.root / 'local-only.pem'
        subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:3072', '-nodes',
                        '-keyout', str(cls.key), '-out', str(cls.cert),
                        '-subj', '/CN=offline-recovery-test', '-days', '1'],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                       timeout=30)
        cls.encoded = base64.b64encode(cls.cert.read_bytes()).decode()

    @classmethod
    def tearDownClass(cls):
        cls.scratch.cleanup()

    def setUp(self):
        self.case = tempfile.TemporaryDirectory(dir=self.root)
        self.directory = Path(self.case.name)
        self.addCleanup(self.case.cleanup)

    def test_recipient_accepts_one_public_pem_and_der(self):
        result = recover.recipient(self.encoded, self.directory)
        self.assertEqual(result.read_bytes(), self.cert.read_bytes())
        der = subprocess.check_output(['openssl', 'x509', '-in', str(self.cert),
                                       '-outform', 'DER'])
        recover.recipient(base64.b64encode(der).decode(), self.directory)

    def test_recipient_rejects_private_extra_and_malformed(self):
        der = subprocess.check_output(['openssl', 'x509', '-in', str(self.cert),
                                       '-outform', 'DER'])
        for raw in [self.key.read_bytes(), self.cert.read_bytes() * 2, der * 2,
                    b'garbage', b'-----BEGIN CERTIFICATE-----\n!!!\n-----END CERTIFICATE-----']:
            with self.subTest(size=len(raw)), self.assertRaises(recover.RecoveryError):
                recover.recipient(base64.b64encode(raw).decode(), self.directory)
        for encoded in ['', '!', 'A' * 16385]:
            with self.assertRaises(recover.RecoveryError):
                recover.recipient(encoded, self.directory)

    def test_recipient_rejects_weak_rsa(self):
        weak = self.directory / 'weak.pem'
        subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
                        '-keyout', str(self.directory / 'weak.key'), '-out', str(weak),
                        '-subj', '/CN=weak-test', '-days', '1'], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
        with self.assertRaisesRegex(recover.RecoveryError, 'rsa_size'):
            recover.recipient(base64.b64encode(weak.read_bytes()).decode(), self.directory)

    def producer(self, script):
        return [sys.executable, '-c', script]

    def test_encrypted_roundtrip_no_plaintext_file(self):
        archive, digest = synthetic_archive()
        source = self.directory / 'synthetic.tar'
        source.write_bytes(archive)
        output = self.directory / 'image.cms'
        recover.encrypt_stream(self.producer(
            f'import sys;sys.stdout.buffer.write(open({str(source)!r},"rb").read())'),
            self.cert, output, seconds=5)
        decrypted = subprocess.check_output(['openssl', 'cms', '-decrypt', '-binary',
                                            '-inform', 'DER', '-in', str(output),
                                            '-recip', str(self.cert), '-inkey', str(self.key)])
        self.assertEqual(decrypted, archive)
        self.assertNotIn(b'synthetic application layer', output.read_bytes())
        self.assertNotIn(self.key.read_bytes(), output.read_bytes())
        with mock.patch.object(recover, 'IMAGE_ID', digest):
            recover.validate_archive(source)
        self.assertEqual({p.name for p in self.directory.iterdir()}, {'synthetic.tar', 'image.cms'})

    def test_stream_failures_delete_partial_output(self):
        archive, _ = synthetic_archive()
        valid = f'import sys;sys.stdout.buffer.write({archive!r})'
        cases = [('import time;time.sleep(5)', {'seconds': .1}),
                 ('import sys;sys.stdout.buffer.write(b"x"*1024)', {'archive_limit': 16}),
                 (valid, {'cipher_limit': 16}),
                 (valid + ';sys.exit(3)', {}),
                 ('pass', {})]
        for script, options in cases:
            output = self.directory / 'failed.cms'
            with self.subTest(script=script, options=options), self.assertRaises(recover.RecoveryError):
                recover.encrypt_stream(self.producer(script), self.cert, output, **options)
            self.assertFalse(output.exists())

    def test_successful_but_truncated_producer_cannot_publish(self):
        archive, _ = synthetic_archive()
        output = self.directory / 'truncated.cms'
        with self.assertRaisesRegex(recover.RecoveryError, 'archive_truncated'):
            recover.encrypt_stream(self.producer(
                f'import sys;sys.stdout.buffer.write({archive[:1200]!r})'),
                self.cert, output, seconds=5)
        self.assertFalse(output.exists())

    def test_stream_cipher_limit_and_producer_exit_status_are_checked(self):
        archive, _ = synthetic_archive()
        script = f'import sys;sys.stdout.buffer.write({archive!r})'
        for command, options, status in [(script, {'cipher_limit': 16}, 'ciphertext_limit'),
                                         (script + ';sys.exit(7)', {}, 'export_or_encryption_failed')]:
            output = self.directory / 'failed.cms'
            with self.subTest(status=status), self.assertRaisesRegex(recover.RecoveryError, status):
                recover.encrypt_stream(self.producer(command), self.cert, output, **options)
            self.assertFalse(output.exists())

    def test_encryptor_failure_and_existing_output(self):
        output = self.directory / 'failed.cms'
        with self.assertRaises(recover.RecoveryError):
            recover.encrypt_stream(self.producer('print("data")'),
                                   self.directory / 'missing.pem', output, seconds=3)
        self.assertFalse(output.exists())
        output.write_bytes(b'preexisting user data')
        with self.assertRaises(recover.RecoveryError):
            recover.encrypt_stream(self.producer('print("data")'), self.cert, output)
        self.assertEqual(output.read_bytes(), b'preexisting user data')

    def test_capture_unavailable_not_absent_and_bounds(self):
        cases = [('import sys;sys.stderr.write("SECRET_CANARY");sys.exit(1)', 'inspect_unavailable', {}),
                 ('print("x"*40000)', 'metadata_limit', {}),
                 ('import time;time.sleep(5)', 'probe_timeout', {'seconds': .1})]
        for script, status, options in cases:
            with self.subTest(status=status), self.assertRaisesRegex(recover.RecoveryError, status):
                recover.bounded_capture(self.producer(script), **options)

    def test_owned_descendant_killed_on_timeout(self):
        marker = self.directory / 'should-not-appear'
        descendant = f'import time;time.sleep(.6);open({str(marker)!r},"w").write("leaked")'
        script = f'import subprocess,time;subprocess.Popen([{sys.executable!r},"-c",{descendant!r}]);time.sleep(5)'
        with self.assertRaises(recover.RecoveryError):
            recover.bounded_capture(self.producer(script), seconds=.15)
        # Wait via a bounded local synthetic process, never a production poll.
        subprocess.run(self.producer('import time;time.sleep(.8)'), check=True, timeout=2)
        self.assertFalse(marker.exists())

    def environment(self):
        return {'GITHUB_REPOSITORY': 'AndresMarulanda10/odelza-platform',
                'GITHUB_REF': 'refs/heads/main', 'GITHUB_EVENT_NAME': 'workflow_dispatch',
                'GITHUB_SHA': 'a' * 40, 'RUNNER_TEMP': str(self.directory),
                'RECIPIENT_CERT_BASE64': self.encoded,
                'ODELZA_DEPLOY_HOST': 'example.invalid', 'ODELZA_DEPLOY_USER': 'offline',
                'ODELZA_DEPLOY_PORT': '22', 'ODELZA_DEPLOY_SSH_KEY': 'FAKE_KEY_CANARY',
                'ODELZA_DEPLOY_KNOWN_HOSTS': 'FAKE_HOSTS_CANARY'}

    def test_fake_ssh_end_to_end_and_identity_failure_zero_save(self):
        archive, _ = synthetic_archive()
        archive_path = self.directory / 'synthetic-source.tar'
        archive_path.write_bytes(archive)
        calls = self.directory / 'calls'
        metadata_path = self.directory / 'metadata'
        metadata = {'Id': recover.IMAGE_ID, 'Os': 'linux', 'Architecture': 'amd64', 'Size': len(archive)}
        metadata_path.write_text(json.dumps(metadata))
        fake = self.directory / 'ssh'
        fake.write_text(f'''#!{sys.executable}
import json,os,sys
assert 'ODELZA_DEPLOY_SSH_KEY' not in os.environ
assert '-F' in sys.argv and 'IdentityAgent=none' in sys.argv
assert 'StrictHostKeyChecking=yes' in sys.argv
with open({str(calls)!r}, 'a') as log: log.write(sys.argv[-1]+'\\n')
sys.stderr.write('SECRET_CANARY_NOT_FOR_LOGS')
if sys.argv[-1] == {recover.PROBE!r}:
    data = open({str(metadata_path)!r}).read()
    if data == 'UNAVAILABLE': sys.exit(20)
    sys.stdout.write(data)
elif sys.argv[-1] == {recover.EXPORT!r}:
    sys.stdout.buffer.write(open({str(archive_path)!r}, 'rb').read())
else:
    sys.exit(90)
''')
        fake.chmod(0o700)
        path = str(self.directory) + os.pathsep + os.environ['PATH']
        with mock.patch.dict(os.environ, {'PATH': path}), \
                mock.patch.object(shutil, 'disk_usage', return_value=shutil._ntuple_diskusage(20*1024**3, 0, 20*1024**3)):
            stdout, stderr = io.StringIO(), io.StringIO()
            with mock.patch.object(sys, 'argv', ['recover.py', 'recover']), \
                    mock.patch.dict(os.environ, self.environment()), \
                    contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                self.assertEqual(recover.main(), 0)
            self.assertEqual(stdout.getvalue(), 'recovery=encrypted_complete\n')
            self.assertEqual(stderr.getvalue(), '')
            self.assertEqual(calls.read_text().splitlines(), [recover.PROBE, recover.EXPORT])
            output = self.directory / 'odelza-candidate-image.cms'
            decrypted = subprocess.check_output(['openssl', 'cms', '-decrypt', '-binary',
                                                '-inform', 'DER', '-in', str(output),
                                                '-recip', str(self.cert), '-inkey', str(self.key)])
            self.assertEqual(decrypted, archive)
            output.unlink()
            calls.unlink()
            metadata['Id'] = 'sha256:wrong'
            metadata_path.write_text(json.dumps(metadata))
            with self.assertRaisesRegex(recover.RecoveryError, 'identity_mismatch'):
                recover.recover(self.environment())
            self.assertEqual(calls.read_text().splitlines(), [recover.PROBE])
            self.assertFalse(output.exists())
            for value, status in [('UNAVAILABLE', 'inspect_unavailable'),
                                  ('[]', 'inspect_invalid'), ('invalid', 'inspect_invalid'),
                                  (json.dumps(dict(metadata, Id=recover.IMAGE_ID,
                                                   Architecture='arm64')), 'platform_mismatch')]:
                calls.unlink()
                metadata_path.write_text(value)
                with self.subTest(status=status), self.assertRaisesRegex(recover.RecoveryError, status):
                    recover.recover(self.environment())
                self.assertEqual(calls.read_text().splitlines(), [recover.PROBE])
                self.assertFalse(output.exists())
        self.assertFalse(list(self.directory.glob('odelza-recover-*')))

    def test_free_space_denies_before_ssh_or_save(self):
        with mock.patch.object(shutil, 'disk_usage', return_value=shutil._ntuple_diskusage(1, 0, 1)), \
                mock.patch.object(recover, 'child') as child:
            with self.assertRaisesRegex(recover.RecoveryError, 'runner_space_insufficient'):
                recover.recover(self.environment())
            child.assert_not_called()

    def test_actual_export_shell_with_denying_local_tools(self):
        tools = self.directory / 'tools'
        tools.mkdir()
        (tools / 'openssl').symlink_to(shutil.which('openssl'))
        scenario = self.directory / 'scenario.json'
        calls = self.directory / 'export-calls.jsonl'
        archive, _ = synthetic_archive()
        fake_docker = tools / 'docker'
        fake_docker.write_text(f'''#!{sys.executable}
import base64, json, sys
from pathlib import Path
args = sys.argv[1:]
with Path({str(calls)!r}).open('a') as log:
    log.write(json.dumps(args) + '\\n')
state = json.loads(Path({str(scenario)!r}).read_text())
if args == ['image', 'inspect', '--format', '{{{{.Id}}}} {{{{.Os}}}} {{{{.Architecture}}}} {{{{.Size}}}}', {recover.TAG!r}]:
    if state.get('unavailable'): sys.exit(20)
    print(state['metadata'])
elif args == ['image', 'save', {recover.IMAGE_ID!r}]:
    sys.stdout.buffer.write(base64.b64decode({base64.b64encode(archive).decode()!r}))
    if state.get('save_failure'): sys.exit(23)
else:
    sys.exit(90)
''')
        fake_timeout = tools / 'timeout'
        fake_timeout.write_text(f'''#!{sys.executable}
import os, sys
args = sys.argv[1:]
if not (args[:4] in [['-k', '2s', '10s', 'docker'],
                     ['-k', '5s', '580s', 'docker']]):
    sys.exit(91)
os.execv({str(fake_docker)!r}, ['docker'] + args[4:])
''')
        for tool in [fake_docker, fake_timeout]:
            tool.chmod(0o700)
        good = recover.IMAGE_ID + ' linux amd64 ' + str(len(archive))
        cases = [('matched', good, {}, 0, 1),
                 ('id', 'sha256:wrong linux amd64 1024', {}, 21, 0),
                 ('os', recover.IMAGE_ID + ' windows amd64 1024', {}, 21, 0),
                 ('arch', recover.IMAGE_ID + ' linux arm64 1024', {}, 21, 0),
                 ('unavailable', good, {'unavailable': True}, 20, 0),
                 ('oversized', recover.IMAGE_ID + ' linux amd64 8589934593', {}, 21, 0),
                 ('zero', recover.IMAGE_ID + ' linux amd64 0', {}, 21, 0),
                 ('invalid-size', recover.IMAGE_ID + ' linux amd64 nope', {}, 21, 0),
                 ('save-failure', good, {'save_failure': True}, 23, 1)]
        # PATH contains only the two fakes and explicit local OpenSSL. No host Docker, SSH or timeout
        # can be found; /bin/sh and the fake shebang interpreter are explicit.
        with mock.patch.dict(os.environ, {'PATH': str(tools)}):
            for name, metadata, options, status, saves in cases:
                with self.subTest(case=name):
                    scenario.write_text(json.dumps(dict(metadata=metadata, **options)))
                    calls.unlink(missing_ok=True)
                    result = subprocess.run(['/bin/sh', '-c', recover.EXPORT],
                                            env={'PATH': str(tools), 'LC_ALL': 'C'},
                                            capture_output=True, timeout=5)
                    self.assertEqual(result.returncode, status)
                    logged = [json.loads(line) for line in calls.read_text().splitlines()]
                    self.assertEqual(logged[0], ['image', 'inspect', '--format',
                                                '{{.Id}} {{.Os}} {{.Architecture}} {{.Size}}', recover.TAG])
                    self.assertEqual(logged[1:], [['image', 'save', recover.IMAGE_ID]] * saves)
                    self.assertEqual(result.stdout, archive if saves else b'')
                    output = self.directory / 'shell-export.cms'
                    if status:
                        calls.unlink()
                        with self.assertRaises(recover.RecoveryError):
                            recover.encrypt_stream(['/bin/sh', '-c', recover.EXPORT],
                                                   self.cert, output, seconds=5)
                        self.assertFalse(output.exists())
                        logged = [json.loads(line) for line in calls.read_text().splitlines()]
                        self.assertEqual(logged[1:], [['image', 'save', recover.IMAGE_ID]] * saves)

    def test_ssh_input_injection_and_options(self):
        environment = self.environment()
        options = recover.ssh_command(environment, self.directory)
        for required in ['ForwardAgent=no', 'ClearAllForwardings=yes', 'IdentitiesOnly=yes',
                         'BatchMode=yes', 'GlobalKnownHostsFile=/dev/null']:
            self.assertIn(required, options)
        for key, value in [('HOST', '-oProxyCommand=bad'), ('USER', 'root;bad'),
                           ('PORT', '0'), ('PORT', '65536')]:
            invalid = dict(environment, **{'ODELZA_DEPLOY_' + key: value})
            with self.assertRaises(recover.RecoveryError):
                recover.ssh_command(invalid, self.directory)

    def validate(self, archive, digest):
        path = self.directory / 'archive.tar'
        path.write_bytes(archive)
        with mock.patch.object(recover, 'IMAGE_ID', digest):
            recover.validate_archive(path)

    def test_archive_legacy_and_oci_compatible(self):
        for oci in [False, True]:
            with self.subTest(oci=oci):
                self.validate(*synthetic_archive(oci=oci))

    def unsupported_archives(self):
        item = tarfile.TarInfo('sparse')
        item.type = tarfile.GNUTYPE_SPARSE
        yield 'gnu-sparse', item.tobuf(format=tarfile.GNU_FORMAT) + bytes(1024)
        for metadata in [{'GNU.sparse.size': '4096'}, {'GNU.sparse.map': '0,1'},
                         {'GNU.sparse.realsize': '4096'}, {'GNU.sparse.numblocks': '1'},
                         {'GNU.sparse.offset': '0', 'GNU.sparse.numbytes': '1'},
                         {'GNU.sparse.name': 'sparse'},
                         {'GNU.sparse.major': '1', 'GNU.sparse.minor': '0'},
                         {'SCHILY.realsize': '4096'}]:
            output = io.BytesIO()
            with tarfile.open(fileobj=output, mode='w', format=tarfile.PAX_FORMAT) as archive:
                item = tarfile.TarInfo('sparse')
                item.pax_headers = metadata
                archive.addfile(item)
            yield repr(metadata), output.getvalue()
        for kind in [tarfile.XGLTYPE, tarfile.LNKTYPE, tarfile.SYMTYPE,
                     tarfile.CHRTYPE, tarfile.BLKTYPE, tarfile.FIFOTYPE,
                     tarfile.GNUTYPE_LONGNAME, tarfile.GNUTYPE_LONGLINK,
                     tarfile.CONTTYPE]:
            item = tarfile.TarInfo('unsupported')
            item.type = kind
            yield repr(kind), item.tobuf(format=tarfile.GNU_FORMAT) + bytes(1024)

    def test_runner_rejects_sparse_and_extensions_before_publication(self):
        for name, archive in self.unsupported_archives():
            with self.subTest(format=name):
                output = self.directory / 'unsupported.cms'
                output.unlink(missing_ok=True)
                with self.assertRaisesRegex(recover.RecoveryError, 'archive_type_or_format_unsupported'):
                    recover.encrypt_stream(self.producer(
                        f'import sys;sys.stdout.buffer.write({archive!r})'),
                        self.cert, output, seconds=5)
                self.assertFalse(output.exists())

    def test_local_preflight_rejects_sparse_and_extensions(self):
        for name, archive in self.unsupported_archives():
            with self.subTest(format=name), self.assertRaisesRegex(
                    recover.RecoveryError, 'archive_type_or_format_unsupported'):
                self.validate(archive, recover.IMAGE_ID)

    def directory_archive(self, payload, oci=False):
        archive, digest = synthetic_archive(oci=oci)
        with tarfile.open(fileobj=io.BytesIO(archive), mode='r:') as source:
            manifest = json.load(source.extractfile('manifest.json'))
            parent = manifest[0]['Layers'][0].rsplit('/', 1)[0]
            end = max(item.offset_data + ((item.size + 511) // 512) * 512
                      for item in source.getmembers())
        directory = tarfile.TarInfo(parent)
        directory.type = tarfile.DIRTYPE
        directory.size = len(payload)
        # Write the actual USTAR directory header and payload, rather than
        # relying on TarFile.addfile's special treatment of directory data.
        return (archive[:end] + directory.tobuf(format=tarfile.USTAR_FORMAT)
                + payload + bytes((-len(payload)) % 512) + bytes(1024), digest)

    def test_archive_rejects_nonzero_directory_payload(self):
        for oci in [False, True]:
            for payload in [bytes(512), b'unreferenced private bytes'.ljust(512, b'x')]:
                with self.subTest(oci=oci, zero_filled=not any(payload)):
                    archive, digest = self.directory_archive(payload, oci)
                    with self.assertRaisesRegex(recover.RecoveryError, 'archive_directory_payload'):
                        self.validate(archive, digest)

    def test_runner_rejects_nonzero_directory_payload_before_publication(self):
        for oci in [False, True]:
            for payload in [bytes(512), b'unreferenced private bytes'.ljust(512, b'x')]:
                with self.subTest(oci=oci, zero_filled=not any(payload)):
                    archive, _ = self.directory_archive(payload, oci)
                    boundary = recover.TarBoundary()
                    with self.assertRaisesRegex(recover.RecoveryError, 'archive_directory_payload'):
                        for offset in range(0, len(archive), 37):
                            boundary.feed(archive[offset:offset + 37])
                        boundary.finish()
                    output = self.directory / 'directory-payload.cms'
                    with self.assertRaisesRegex(recover.RecoveryError, 'archive_directory_payload'):
                        recover.encrypt_stream(self.producer(
                            f'import sys;sys.stdout.buffer.write({archive!r})'),
                            self.cert, output, seconds=5)
                    self.assertFalse(output.exists())

    def test_zero_size_directories_remain_valid_in_runner_and_local_archive(self):
        for oci in [False, True]:
            with self.subTest(oci=oci):
                archive, digest = self.directory_archive(b'', oci)
                self.validate(archive, digest)
                boundary = recover.TarBoundary()
                for offset in range(0, len(archive), 37):
                    boundary.feed(archive[offset:offset + 37])
                boundary.finish()

    def test_archive_rejects_unsafe_extra_duplicate_and_symlink(self):
        for name, value in [('../escape', b'x'), ('/absolute', b'x'),
                            ('manifest.json', b'[]'), ('extra.env', b'private'),
                            ('link', None), ('x\\y', b'x')]:
            with self.subTest(name=name), self.assertRaises(recover.RecoveryError):
                self.validate(*synthetic_archive(extras=[(name, value)]))

    def test_archive_rejects_identity_platform_layers_truncation_and_tail(self):
        archive, digest = synthetic_archive()
        cases = [(archive, 'sha256:' + '0' * 64), (archive[:1200], digest),
                 (archive + b'PRIVATE_TRAILING_PAYLOAD', digest),
                 synthetic_archive({'os': 'linux', 'architecture': 'arm64', 'rootfs': {}}),
                 synthetic_archive({'os': 'linux', 'architecture': 'amd64', 'rootfs': {}})]
        for content, identity in cases:
            with self.subTest(size=len(content)), self.assertRaises(recover.RecoveryError):
                self.validate(content, identity)

    def test_archive_rejects_extension_headers_and_missing_eof(self):
        archive, digest = synthetic_archive()
        pax = io.BytesIO()
        with tarfile.open(fileobj=pax, mode='w', format=tarfile.PAX_FORMAT) as output:
            item = tarfile.TarInfo('x' * 200)
            output.addfile(item)
        for value in [pax.getvalue(), archive.rstrip(b'\0'), archive[:512]]:
            with self.assertRaises(recover.RecoveryError):
                self.validate(value, digest)

    def test_archive_rejects_multi_image_manifest_and_unknown_oci_payload(self):
        archive, digest = synthetic_archive(oci=True, extras=[('blobs/sha256/' + '0' * 64, b'unknown')])
        with self.assertRaises(recover.RecoveryError):
            self.validate(archive, digest)
        archive, digest = synthetic_archive(extras=[('manifest.json', b'[{},{}]')])
        with self.assertRaises(recover.RecoveryError):
            self.validate(archive, digest)

    def test_archive_metadata_memory_limit(self):
        extras = [(f'metadata-{i}', bytes(32768)) for i in range(130)]
        with self.assertRaisesRegex(recover.RecoveryError, 'archive_metadata_limit'):
            self.validate(*synthetic_archive(extras=extras))

    def test_cli_never_logs_private_exception_or_environment(self):
        result = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/odelza-candidate-image-recover.py'),
                                 'validate', '/nonexistent/SECRET_CANARY'],
                                capture_output=True, text=True, timeout=5)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stderr, 'recovery=local_operation_failed\n')
        self.assertEqual(result.stdout, '')


class WorkflowTests(unittest.TestCase):
    def test_encrypted_only_pinned_artifact_and_native_gates(self):
        workflow = (ROOT / '.github/workflows/recover-odelza-candidate-image.yaml').read_text()
        for required in ['github.event_name == \'workflow_dispatch\'', 'refs/heads/main',
                         'group: odelza-production', 'cancel-in-progress: false',
                         'name: production', '22950075734', 'contents: read',
                         'ref: ${{ github.sha }}', 'persist-credentials: false',
                         'actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683',
                         'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02',
                         'path: ${{ runner.temp }}/odelza-candidate-image.cms',
                         'retention-days: 1', 'if-no-files-found: error',
                         'include-hidden-files: false', 'overwrite: false']:
            self.assertIn(required, workflow)
        self.assertNotIn('always()', workflow)
        self.assertNotIn('continue-on-error', workflow)
        self.assertEqual(workflow.count('path:'), 1)
        self.assertNotIn('PROVENANCE_VERIFIED', vars(recover))
        self.assertEqual(recover.EXPORT.count('docker image save'), 1)
        self.assertIn('docker image save ' + recover.IMAGE_ID, recover.EXPORT)


if __name__ == '__main__':
    unittest.main()
