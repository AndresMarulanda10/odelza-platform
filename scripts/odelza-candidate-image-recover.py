"""Recover exactly one image as CMS ciphertext; validate decrypted tar locally.

No private recipient key, plaintext runner file, container operation or retry.
Export is restricted to the original build's fixed, log-bound application image.
"""
import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import selectors
import shlex
import shutil
import signal
import subprocess
import sys
import tarfile
import tempfile
import time

TAG = 'twentycrm/twenty:odelza-2e0e891db44cc075c26ca00f73bb6c054c4dae10'
IMAGE_ID = 'sha256:51fccaa93ef5f9503f8faaf9ec20e9ce04e48cd840bdd74d8e16a4262eda9b42'
ARCHIVE_LIMIT = 8 * 1024**3
CIPHER_LIMIT = ARCHIVE_LIMIT + 64 * 1024**2
META_LIMIT = 32768
# Ordinary build provenance: run 42549926656, job 128942982820. Its checkout
# logged SHA 2e0e891db44cc075c26ca00f73bb6c054c4dae10 at 12:57:02.5182604Z
# on 2026-11-09. BuildKit logged this image ID at 13:05:16.0159293Z and this
# tag at 13:05:16.0159982Z; build platform linux/amd64, target twenty. Historical
# CD supplied no build arguments/secret mounts and wrote SSH keys after build,
# outside context. This is not signed attestation or a universal secret-free
# claim. The tuple is source-only evidence, never a consumer env/flag override.
PROVENANCE_IMAGE = (
    'twentycrm/twenty:odelza-2e0e891db44cc075c26ca00f73bb6c054c4dae10',
    'sha256:51fccaa93ef5f9503f8faaf9ec20e9ce04e48cd840bdd74d8e16a4262eda9b42',
    'linux', 'amd64',
)
PROBE = (
    "timeout -k 2s 15s docker image inspect --format "
    "'{\"Id\":{{json .Id}},\"Os\":{{json .Os}},"
    "\"Architecture\":{{json .Architecture}},\"Size\":{{json .Size}}}' "
    + TAG + ' 2>/dev/null'
)
EXPORT = (
    "v=$(timeout -k 2s 10s docker image inspect --format "
    "'{{.Id}} {{.Os}} {{.Architecture}} {{.Size}}' " + TAG +
    " 2>/dev/null) || exit 20; "
    "set -f; set -- $v; [ \"$#\" -eq 4 ] || exit 21; "
    '[ "$1 $2 $3" = "' + IMAGE_ID + ' linux amd64" ] || exit 21; '
    'case "$4" in ""|*[!0-9]*) exit 21;; esac; '
    '[ "${#4}" -le 10 ] && [ "$4" -gt 0 ] && '
    '[ "$4" -le 8589934592 ] || exit 21; '
    'exec timeout -k 5s 580s docker image save ' + IMAGE_ID + ' 2>/dev/null'
)


class RecoveryError(Exception):
    """Only literal, non-sensitive status codes cross the logging boundary."""


def require(condition, status):
    if not condition:
        raise RecoveryError(status)


def check_identity(value):
    require(isinstance(value, dict), 'inspect_invalid')
    require(value.get('Id') == IMAGE_ID, 'identity_mismatch')
    require((value.get('Os'), value.get('Architecture')) == ('linux', 'amd64'),
            'platform_mismatch')
    size = value.get('Size')
    require(type(size) is int and 0 < size <= ARCHIVE_LIMIT, 'image_size_invalid')


def child(command, **kwargs):
    # Do not hand production bindings or runner credentials to child programs.
    return subprocess.Popen(command, start_new_session=True,
                            env={'PATH': os.environ.get('PATH', '/usr/bin:/bin'),
                                 'LC_ALL': 'C'}, stderr=subprocess.DEVNULL, **kwargs)


def kill_group(process):
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    except PermissionError:
        # Darwin may report EPERM for an already-exited session leader. Reap
        # first; never reinterpret a live child's cleanup denial as success.
        if process.poll() is None:
            process.kill()
            process.wait()
            raise RecoveryError('process_group_cleanup_failed') from None
    process.wait()


def bounded_capture(command, seconds=15, limit=META_LIMIT, failure='inspect_unavailable'):
    process = child(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE)
    result = bytearray()
    deadline = time.monotonic() + seconds
    try:
        with selectors.DefaultSelector() as selector:
            selector.register(process.stdout, selectors.EVENT_READ)
            while selector.get_map():
                require(time.monotonic() < deadline, 'probe_timeout')
                for key, _ in selector.select(min(.1, max(0, deadline - time.monotonic()))):
                    data = os.read(key.fd, 16384)
                    require(len(result) + len(data) <= limit, 'metadata_limit')
                    if not data:
                        selector.unregister(key.fileobj)
                    result.extend(data)
        process.wait(timeout=max(.001, deadline - time.monotonic()))
        require(process.returncode == 0, failure)
        return bytes(result)
    finally:
        try:
            kill_group(process)
        finally:
            process.stdout.close()


def recipient(encoded, directory):
    require(isinstance(encoded, str) and 0 < len(encoded) <= 16384,
            'recipient_invalid')
    try:
        raw = base64.b64decode(encoded, validate=True)
        if raw.startswith(b'-----BEGIN CERTIFICATE-----'):
            match = re.fullmatch(
                rb'-----BEGIN CERTIFICATE-----\r?\n([A-Za-z0-9+/=\r\n]+)'
                rb'-----END CERTIFICATE-----\r?\n?', raw)
            require(match is not None, 'recipient_invalid')
            raw = base64.b64decode(re.sub(rb'\s', b'', match[1]), validate=True)
        require(256 <= len(raw) <= 12288, 'recipient_invalid')
        cert = directory / 'recipient.der'
        cert.write_bytes(raw)
        normalized = bounded_capture(['openssl', 'x509', '-inform', 'DER',
                                      '-in', str(cert), '-outform', 'DER'], 5,
                                     failure='recipient_invalid')
        require(normalized == raw, 'recipient_extra_or_noncanonical')
        public = directory / 'recipient.pub'
        public.write_bytes(bounded_capture(['openssl', 'x509', '-inform', 'DER',
                                           '-in', str(cert), '-pubkey', '-noout'], 5,
                                          failure='recipient_invalid'))
        details = bounded_capture(['openssl', 'rsa', '-pubin', '-in', str(public),
                                   '-text', '-noout'], 5, failure='recipient_not_rsa')
        match = re.search(rb'Public-Key: \((\d+) bit\)', details)
        require(match is not None and 3072 <= int(match[1]) <= 8192,
                'recipient_rsa_size_invalid')
        pem = directory / 'recipient.pem'
        pem.write_bytes(bounded_capture(['openssl', 'x509', '-inform', 'DER',
                                        '-in', str(cert), '-outform', 'PEM'], 5,
                                       failure='recipient_invalid'))
        return pem
    except (ValueError, OSError, subprocess.SubprocessError):
        raise RecoveryError('recipient_invalid') from None


class TarBoundary:
    """Constant-memory framing check before publishing any encrypted archive.

    Identity/content verification stays local after decryption. A successful
    producer exit alone does not prove its tar stream was complete.
    """
    def __init__(self):
        self.header = bytearray()
        self.skip = 0
        self.zero_blocks = 0
        self.members = 0

    def feed(self, data):
        view = memoryview(data)
        while view:
            if self.skip:
                count = min(len(view), self.skip)
                self.skip -= count
                view = view[count:]
                continue
            count = min(len(view), 512 - len(self.header))
            self.header.extend(view[:count])
            view = view[count:]
            if len(self.header) < 512:
                continue
            header = bytes(self.header)
            self.header.clear()
            if header == bytes(512):
                self.zero_blocks += 1
                continue
            require(self.zero_blocks == 0, 'archive_trailing_payload')
            try:
                item = tarfile.TarInfo.frombuf(header, 'utf-8', 'strict')
            except (tarfile.TarError, ValueError, UnicodeError):
                raise RecoveryError('archive_header_invalid') from None
            self.members += 1
            require(self.members <= 200000
                    and item.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE)
                    and not item.issparse() and not item.pax_headers,
                    'archive_type_or_format_unsupported')
            require(0 <= item.size <= ARCHIVE_LIMIT, 'archive_member_size')
            require(not item.isdir() or item.size == 0, 'archive_directory_payload')
            self.skip = ((item.size + 511) // 512) * 512

    def finish(self):
        require(self.members > 0 and self.zero_blocks >= 2
                and not self.header and self.skip == 0, 'archive_truncated')


def encrypt_stream(producer_command, cert, output, seconds=600,
                   archive_limit=ARCHIVE_LIMIT, cipher_limit=CIPHER_LIMIT):
    """Nonblocking bounded pump: plaintext lives only in bounded pipe buffers."""
    processes = []
    deadline = time.monotonic() + seconds
    succeeded = False
    created = False
    boundary = TarBoundary()
    try:
        with output.open('xb') as ciphertext, selectors.DefaultSelector() as selector:
            created = True
            producer = child(producer_command, stdin=subprocess.DEVNULL,
                             stdout=subprocess.PIPE)
            processes.append(producer)
            encryptor = child(['openssl', 'cms', '-encrypt', '-binary', '-stream',
                               '-outform', 'DER', '-aes256', str(cert)],
                              stdin=subprocess.PIPE, stdout=subprocess.PIPE)
            processes.append(encryptor)
            for pipe in (producer.stdout, encryptor.stdin, encryptor.stdout):
                os.set_blocking(pipe.fileno(), False)
            selector.register(producer.stdout, selectors.EVENT_READ, 'plain')
            selector.register(encryptor.stdout, selectors.EVENT_READ, 'cipher')
            pending = bytearray()
            plain_count = cipher_count = 0
            producer_eof = False
            while selector.get_map():
                require(time.monotonic() < deadline, 'export_timeout')
                for key, _ in selector.select(.1):
                    if key.data == 'write':
                        count = os.write(key.fd, pending)
                        del pending[:count]
                        if not pending:
                            selector.unregister(encryptor.stdin)
                            if producer_eof:
                                encryptor.stdin.close()
                            else:
                                selector.register(producer.stdout, selectors.EVENT_READ, 'plain')
                    else:
                        data = os.read(key.fd, 65536)
                        if key.data == 'plain':
                            plain_count += len(data)
                            require(plain_count <= archive_limit, 'archive_limit')
                            boundary.feed(data)
                            selector.unregister(producer.stdout)
                            if data:
                                pending.extend(data)
                                selector.register(encryptor.stdin, selectors.EVENT_WRITE, 'write')
                            else:
                                boundary.finish()
                                producer_eof = True
                                encryptor.stdin.close()
                        else:
                            cipher_count += len(data)
                            require(cipher_count <= cipher_limit, 'ciphertext_limit')
                            ciphertext.write(data)
                            if not data:
                                selector.unregister(encryptor.stdout)
            for process in processes:
                process.wait(timeout=max(.001, deadline - time.monotonic()))
                require(process.returncode == 0, 'export_or_encryption_failed')
            require(plain_count > 0 and cipher_count > 0, 'empty_export')
            succeeded = True
    except (OSError, subprocess.SubprocessError):
        raise RecoveryError('export_or_encryption_failed') from None
    finally:
        cleanup_failed = False
        for process in processes:
            try:
                kill_group(process)
            except (OSError, RecoveryError):
                cleanup_failed = True
            finally:
                for pipe in (process.stdin, process.stdout):
                    if pipe and not pipe.closed:
                        pipe.close()
        if created and (not succeeded or cleanup_failed):
            output.unlink(missing_ok=True)
        require(not cleanup_failed, 'process_group_cleanup_failed')


def ssh_command(environment, directory):
    host, user, port = (environment.get('ODELZA_DEPLOY_' + key, '')
                        for key in ('HOST', 'USER', 'PORT'))
    require(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9.-]{0,252}', host) is not None
            and re.fullmatch(r'[A-Za-z_][A-Za-z0-9_-]{0,31}', user) is not None
            and re.fullmatch(r'[0-9]{1,5}', port) is not None, 'ssh_inputs_invalid')
    require(1 <= int(port) <= 65535, 'ssh_inputs_invalid')
    for name, binding in [('key', 'SSH_KEY'), ('known-hosts', 'KNOWN_HOSTS')]:
        value = environment.get('ODELZA_DEPLOY_' + binding, '')
        require(0 < len(value) <= 65536, 'ssh_inputs_invalid')
        (directory / name).write_text(value + '\n')
        (directory / name).chmod(0o600)
    return ['ssh', '-F', '/dev/null', '-i', str(directory / 'key'), '-p', port,
            '-o', 'IdentityAgent=none', '-o', 'ForwardAgent=no',
            '-o', 'ClearAllForwardings=yes', '-o', 'BatchMode=yes',
            '-o', 'IdentitiesOnly=yes', '-o', 'ConnectTimeout=10',
            '-o', 'ServerAliveInterval=15', '-o', 'ServerAliveCountMax=2',
            '-o', 'StrictHostKeyChecking=yes',
            '-o', 'UserKnownHostsFile=' + str(directory / 'known-hosts'),
            '-o', 'GlobalKnownHostsFile=/dev/null', user + '@' + host]


def recover(environment):
    require(environment.get('GITHUB_REPOSITORY') == 'AndresMarulanda10/odelza-platform'
            and environment.get('GITHUB_REF') == 'refs/heads/main'
            and environment.get('GITHUB_EVENT_NAME') == 'workflow_dispatch'
            and re.fullmatch('[0-9a-f]{40}', environment.get('GITHUB_SHA', '')),
            'runner_guard_denied')
    # Fail before SSH, disk allocation, recipient processing or export.
    require(PROVENANCE_IMAGE == (TAG, IMAGE_ID, 'linux', 'amd64'), 'provenance_mismatch')
    root = Path(environment['RUNNER_TEMP'])
    require(shutil.disk_usage(root).free >= 10 * 1024**3, 'runner_space_insufficient')
    output = root / 'odelza-candidate-image.cms'
    require(not output.exists(), 'output_exists')
    with tempfile.TemporaryDirectory(prefix='odelza-recover-', dir=root) as scratch:
        directory = Path(scratch)
        cert = recipient(environment.get('RECIPIENT_CERT_BASE64', ''), directory)
        ssh = ssh_command(environment, directory)
        try:
            metadata = json.loads(bounded_capture(ssh + [PROBE]))
        except (ValueError, UnicodeError):
            raise RecoveryError('inspect_invalid') from None
        check_identity(metadata)
        encrypt_stream(ssh + [EXPORT], cert, output)


DIAGNOSTIC_INSPECT_FORMAT = (
    '{"Id":{{json .Id}},"Os":{{json .Os}},'
    '"Architecture":{{json .Architecture}},"Size":{{json .Size}},'
    '"RepoTags":{{json .RepoTags}}}'
)
DIAGNOSTIC_DESCRIPTOR_FORMAT = (
    '{"digest":{{json .Descriptor.Digest}},'
    '"mediaType":{{json .Descriptor.MediaType}}}'
)
DIAGNOSTIC_VERSION_FORMAT = (
    '{"server":{{json .Server.Version}},"client":{{json .Client.Version}}}'
)
DIAGNOSTIC_STORE_FORMAT = (
    '{{range .DriverStatus}}{{if and (eq (index . 0) "driver-type") '
    '(eq (index . 1) "io.containerd.snapshotter.v1")}}true{{end}}{{end}}'
)
# Only fixed source arguments reach this shell. Every result is independently
# bounded and must be a single JSON line; raw stderr never crosses SSH.
_DIAGNOSTIC_QUERIES = [
    ['docker', 'image', 'inspect', '--format', fmt, selector]
    for selector in (TAG, IMAGE_ID)
    for fmt in (DIAGNOSTIC_INSPECT_FORMAT, DIAGNOSTIC_DESCRIPTOR_FORMAT)
] + [
    ['docker', 'version', '--format', DIAGNOSTIC_VERSION_FORMAT],
    ['docker', 'info', '--format', DIAGNOSTIC_STORE_FORMAT],
]
DIAGNOSTIC = 'timeout -k 2s 75s /bin/sh -c ' + shlex.quote(
    "LC_ALL=C; export LC_ALL; "
    "query() { v=$({ timeout -k 2s 10s \"$@\" 2>/dev/null; "
    "printf '\\nstatus=%s' \"$?\"; } | head -c 32790); "
    "case \"$v\" in *'\nstatus=0') v=${v%'\nstatus=0'};; *) v=null;; esac; "
    # Docker normally ends its template output with one newline.
    "v=${v%'\n'}; "
    "[ ${#v} -le 32768 ] || v=null; "
    "case \"$v\" in ''|*'\n'*) v=null;; esac; printf '%s\\n' \"$v\"; }; "
    + '; '.join('query ' + shlex.join(command) for command in _DIAGNOSTIC_QUERIES)
)


def diagnostic_report(raw):
    """Whitelist typed metadata; never reflect arbitrary remote strings."""
    lines = raw.splitlines()
    require(len(lines) == 6, 'diagnostic_protocol_invalid')
    values = []
    for line in lines:
        require(len(line) <= META_LIMIT, 'metadata_limit')
        try:
            values.append(json.loads(line))
        except (ValueError, UnicodeError, RecursionError):
            values.append(None)

    def digest(value):
        return value if isinstance(value, str) and re.fullmatch(
            r'sha256:[0-9a-f]{64}', value) else None

    images = []
    for offset, selector in ((0, 'tag'), (2, 'expected_config')):
        value = values[offset]
        found = (isinstance(value, dict) and digest(value.get('Id')) is not None
                 and all(isinstance(value.get(key), str) and re.fullmatch(
                     r'[a-z0-9][a-z0-9_.-]{0,63}', value[key])
                     for key in ('Os', 'Architecture'))
                 and type(value.get('Size')) is int and value['Size'] >= 0
                 and 'RepoTags' in value and (value['RepoTags'] is None or (
                     isinstance(value['RepoTags'], list)
                     and all(isinstance(tag, str) for tag in value['RepoTags']))))
        value = value if found else {}
        descriptor = values[offset + 1]
        descriptor = descriptor if found and isinstance(descriptor, dict) else {}
        identifier = digest(value.get('Id'))
        tags, size = value.get('RepoTags'), value.get('Size')
        media = descriptor.get('mediaType')
        images.append({
            'selector': selector, 'status': 'found' if found else 'unavailable',
            'id': identifier,
            'idMatchesExpected': identifier == IMAGE_ID if identifier else None,
            'repoTagsContainsExpectedTag': TAG in tags if isinstance(tags, list) else None,
            'linuxAmd64': (value['Os'], value['Architecture']) == ('linux', 'amd64')
            if isinstance(value.get('Os'), str) and isinstance(value.get('Architecture'), str)
            else None,
            'sizeWithinBound': 0 < size <= ARCHIVE_LIMIT if type(size) is int else None,
            'descriptorDigest': digest(descriptor.get('digest')),
            'descriptorMediaType': media if media in (
                'application/vnd.oci.image.index.v1+json',
                'application/vnd.oci.image.manifest.v1+json',
                'application/vnd.docker.distribution.manifest.list.v2+json',
                'application/vnd.docker.distribution.manifest.v2+json') else None,
        })
    versions = values[4] if isinstance(values[4], dict) else {}
    safe_versions = {}
    for key in ('server', 'client'):
        value = versions.get(key)
        safe_versions[key] = value if isinstance(value, str) and re.fullmatch(
            r'[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}', value) else None
    return {'images': images, 'versions': safe_versions,
            'containerdSnapshotter': True if values[5] is True else None}


def diagnose(environment):
    require(environment.get('GITHUB_REPOSITORY') == 'AndresMarulanda10/odelza-platform'
            and environment.get('GITHUB_REF') == 'refs/heads/main'
            and environment.get('GITHUB_EVENT_NAME') == 'workflow_dispatch'
            and re.fullmatch('[0-9a-f]{40}', environment.get('GITHUB_SHA', '')),
            'runner_guard_denied')
    with tempfile.TemporaryDirectory(prefix='odelza-diagnose-',
                                     dir=environment['RUNNER_TEMP']) as scratch:
        ssh = ssh_command(environment, Path(scratch))
        raw = bounded_capture(ssh + [DIAGNOSTIC], seconds=90,
                              limit=6 * (META_LIMIT + 1), failure='diagnostic_unavailable')
        print(json.dumps(diagnostic_report(raw), sort_keys=True))
    print('recovery=metadata_only')


def validate_archive(path):
    """Read only; never extract or load. Unknown save formats stop safely.

    Docker's OCI-compatible save has manifest.json plus content-addressed blobs;
    legacy save uses config.json and layer.tar. Both are accepted, not arbitrary
    extra files. Validate every referenced byte and all layer diff_ids.
    """
    require(0 < path.stat().st_size <= ARCHIVE_LIMIT, 'archive_size_invalid')
    members = {}
    small = {}
    metadata_bytes = 0
    try:
        # Docker save's fixed digest paths fit USTAR. Deny extension records
        # before tarfile can allocate an attacker-sized PAX/GNU header buffer.
        with path.open('rb') as raw:
            headers = 0
            while True:
                header = raw.read(512)
                require(len(header) == 512, 'archive_truncated')
                if header == bytes(512):
                    require(raw.read(512) == bytes(512), 'archive_truncated')
                    while True:
                        tail = raw.read(65536)
                        if not tail:
                            break
                        require(not any(tail), 'archive_trailing_payload')
                    require(path.stat().st_size % 512 == 0, 'archive_truncated')
                    break
                item = tarfile.TarInfo.frombuf(header, 'utf-8', 'strict')
                headers += 1
                require(headers <= 200000
                        and item.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE)
                        and not item.issparse() and not item.pax_headers,
                        'archive_type_or_format_unsupported')
                require(0 <= item.size <= ARCHIVE_LIMIT, 'archive_member_size')
                require(not item.isdir() or item.size == 0, 'archive_directory_payload')
                end = raw.tell() + ((item.size + 511) // 512) * 512
                require(end <= path.stat().st_size, 'archive_truncated')
                raw.seek(end)
        with tarfile.open(path, mode='r|') as archive:
            for member in archive:
                name = member.name
                parts = PurePosixPath(name).parts
                require(name and not name.startswith('/') and '\\' not in name
                        and '..' not in parts and name.rstrip('/') == '/'.join(parts)
                        and name not in members and len(members) < 200000,
                        'archive_path_invalid')
                require(member.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE)
                        and not member.issparse() and not member.pax_headers,
                        'archive_type_or_format_unsupported')
                require(0 <= member.size <= ARCHIVE_LIMIT, 'archive_member_size')
                digest = hashlib.sha256()
                if member.isfile():
                    stream = archive.extractfile(member)
                    count = 0
                    collected = bytearray()
                    while True:
                        data = stream.read(65536)
                        if not data:
                            break
                        count += len(data)
                        digest.update(data)
                        if member.size <= META_LIMIT:
                            collected.extend(data)
                    require(count == member.size, 'archive_truncated')
                    if member.size <= META_LIMIT:
                        metadata_bytes += member.size
                        require(metadata_bytes <= 4 * 1024**2, 'archive_metadata_limit')
                        small[name] = bytes(collected)
                members[name] = (member, digest.hexdigest())
        manifest = json.loads(small.get('manifest.json', b'null'))
        require(isinstance(manifest, list) and len(manifest) == 1
                and isinstance(manifest[0], dict), 'archive_manifest_invalid')
        entry = manifest[0]
        config_name, layers = entry.get('Config'), entry.get('Layers')
        require(isinstance(config_name, str) and config_name in small
                and isinstance(layers, list) and layers
                and all(isinstance(layer, str) and layer in members for layer in layers)
                and len(set(layers)) == len(layers), 'archive_references_invalid')
        require('sha256:' + members[config_name][1] == IMAGE_ID, 'archive_identity_mismatch')
        config = json.loads(small[config_name])
        require(config.get('os') == 'linux' and config.get('architecture') == 'amd64',
                'archive_platform_mismatch')
        require(config.get('rootfs', {}).get('diff_ids') ==
                ['sha256:' + members[layer][1] for layer in layers], 'archive_layers_mismatch')
        allowed = {'manifest.json', config_name, *layers}
        oci = config_name == 'blobs/sha256/' + IMAGE_ID[7:]
        if oci:
            require(json.loads(small.get('oci-layout', b'null')) ==
                    {'imageLayoutVersion': '1.0.0'}, 'archive_oci_layout_invalid')
            index = json.loads(small.get('index.json', b'null'))
            require(isinstance(index, dict) and index.get('schemaVersion') == 2
                    and isinstance(index.get('manifests'), list)
                    and len(index['manifests']) == 1, 'archive_oci_index_unsupported')

            def descriptor(value, media_types):
                require(isinstance(value, dict) and value.get('mediaType') in media_types
                        and isinstance(value.get('digest'), str)
                        and re.fullmatch(r'sha256:[0-9a-f]{64}', value['digest']),
                        'archive_oci_descriptor_invalid')
                name = 'blobs/sha256/' + value['digest'][7:]
                require(name in members and type(value.get('size')) is int
                        and value['size'] == members[name][0].size,
                        'archive_oci_descriptor_invalid')
                allowed.add(name)
                return name

            image_manifest = descriptor(index['manifests'][0], {
                'application/vnd.oci.image.manifest.v1+json',
                'application/vnd.docker.distribution.manifest.v2+json'})
            require(image_manifest in small, 'archive_oci_manifest_invalid')
            image = json.loads(small[image_manifest])
            require(image.get('schemaVersion') == 2, 'archive_oci_manifest_invalid')
            require(descriptor(image.get('config'), {
                'application/vnd.oci.image.config.v1+json',
                'application/vnd.docker.container.image.v1+json'}) == config_name,
                'archive_oci_config_mismatch')
            require(isinstance(image.get('layers'), list), 'archive_oci_manifest_invalid')
            require([descriptor(layer, {
                'application/vnd.oci.image.layer.v1.tar',
                'application/vnd.docker.image.rootfs.diff.tar'})
                for layer in image['layers']] == layers, 'archive_oci_layers_mismatch')
            allowed.update({'index.json', 'oci-layout'})
        else:
            require(config_name == IMAGE_ID[7:] + '.json', 'archive_format_unsupported')
        for name, (member, digest) in members.items():
            if member.isdir():
                require(any(item.startswith(name.rstrip('/') + '/') for item in allowed),
                        'archive_extra_payload')
            else:
                require(name in allowed, 'archive_extra_payload')
                if name.startswith('blobs/sha256/'):
                    require(name == 'blobs/sha256/' + digest, 'archive_blob_mismatch')
    except (tarfile.TarError, ValueError, KeyError, TypeError, AttributeError):
        raise RecoveryError('archive_invalid_or_unsupported') from None


def main():
    os.umask(0o077)
    try:
        if len(sys.argv) == 3 and sys.argv[1] == 'validate':
            validate_archive(Path(sys.argv[2]))
            print('recovery=archive_validated_not_loaded')
        elif sys.argv[1:] == ['diagnose']:
            diagnose(os.environ)
        elif sys.argv[1:] == ['operation']:
            operation = os.environ.get('RECOVERY_OPERATION', 'diagnose')
            require(operation in ('diagnose', 'recover'), 'operation_denied')
            if operation == 'diagnose':
                diagnose(os.environ)
            else:
                recover(os.environ)
                print('recovery=encrypted_complete')
        else:
            require(sys.argv[1:] == ['recover'], 'usage_denied')
            recover(os.environ)
            print('recovery=encrypted_complete')
    except (RecoveryError, OSError, subprocess.SubprocessError) as error:
        status = str(error) if isinstance(error, RecoveryError) else 'local_operation_failed'
        print('recovery=' + status, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
