import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cwd, env } from 'node:process';

const SCHEMA_VERSION = '2';
const MAX_OUTPUT_BYTES = 8_192;
const MAX_SUMMARY_CHARACTERS = 1_200;
const COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const repositoryRoot = cwd();
const SENSITIVE_ENVIRONMENT_KEY_PATTERN =
  /(?:^|_)(?:API[_-]?KEY|ACCESS[_-]?KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|AUTH|PRIVATE|CERT|SIGNING|DSN|CONNECTION)(?:_|$)|(?:DATABASE|REDIS)_(?:URL|URI)$/i;
const safeEnvironment = Object.fromEntries(
  Object.entries(env).filter(
    ([key]) => !SENSITIVE_ENVIRONMENT_KEY_PATTERN.test(key),
  ),
);
const sensitiveEnvironmentValues = Object.entries(env)
  .filter(
    ([key, value]) => SENSITIVE_ENVIRONMENT_KEY_PATTERN.test(key) && value,
  )
  .map(([, value]) => value)
  .filter((value) => value.length >= 4);

type Status = 'PASS' | 'FAIL' | 'N/A';

type Command = {
  args: string[];
  cwd: string;
  display: string;
  executable: string;
};

type Plan = {
  command?: Command;
  name: string;
  reason?: string;
  status?: Status;
};

type Result = Plan & {
  durationMs: number;
  errorSummary: string;
  exitCode: number | null;
  outputSummary: string;
  status: Status;
};

type AppInfo = {
  name: string;
  parseable: boolean;
  path: string;
  scripts: Record<string, string>;
};

type ManualSuite = {
  applicable: boolean;
  commandReference: string;
  name: string;
  reason: string;
  reference: string;
};

const quote = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

const markdown = (value: string): string =>
  value
    .replaceAll('`', "'")
    .replaceAll('|', '\\|')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const redact = (value: string): string =>
  sensitiveEnvironmentValues
    .reduce(
      (redacted, secret) => redacted.replaceAll(secret, '[REDACTED]'),
      value,
    )
    .replaceAll(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
    .replaceAll(
      /((?:api[_-]?key|access[_-]?token|authorization|password|secret|token)\s*[=:]\s*)([^\s,;"']+)/gi,
      '$1[REDACTED]',
    )
    .replaceAll(/(Bearer\s+)[^\s]+/gi, '$1[REDACTED]')
    .replaceAll(/\bgh[pousr]_[A-Za-z0-9_]+\b/g, '[REDACTED]')
    .replaceAll(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      '[REDACTED]',
    );

const summary = (value: string): string => {
  const clean = redact(value).replaceAll(/\s+/g, ' ').trim();

  if (clean.length === 0) {
    return 'none';
  }

  const clipped = clean.slice(0, MAX_SUMMARY_CHARACTERS);

  return markdown(clipped.length < clean.length ? `${clipped}...` : clipped);
};

const makeCommand = (
  executable: string,
  args: string[],
  commandCwd = repositoryRoot,
): Command => {
  const displayCommand = [executable, ...args].map(quote).join(' ');
  const displayCwd = relative(repositoryRoot, commandCwd);

  return {
    args,
    cwd: commandCwd,
    display:
      displayCwd.length === 0
        ? displayCommand
        : `(cd ${quote(displayCwd)} && ${displayCommand})`,
    executable,
  };
};

const capture = () => {
  let bytes = 0;
  let value = '';

  return {
    add(chunk: Buffer | string) {
      if (bytes >= MAX_OUTPUT_BYTES) {
        return;
      }

      const text = String(chunk);
      const remaining = MAX_OUTPUT_BYTES - bytes;
      const clipped = text.slice(0, remaining);

      value += clipped;
      bytes += Buffer.byteLength(clipped);
    },
    read: () => value,
  };
};

const run = (command: Command) =>
  new Promise<{
    error?: string;
    exitCode: number | null;
    stderr: string;
    stdout: string;
    timedOut: boolean;
  }>((resolve) => {
    const child = spawn(command.executable, command.args, {
      cwd: command.cwd,
      detached: process.platform !== 'win32',
      env: safeEnvironment,
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    const stdout = capture();
    const stderr = capture();
    let finished = false;
    let timedOut = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let forceKillTimeout: ReturnType<typeof setTimeout> | undefined;

    const terminate = (signal: NodeJS.Signals) => {
      if (process.platform !== 'win32' && child.pid) {
        try {
          process.kill(-child.pid, signal);
          return;
        } catch {
          // The process group may already have exited.
        }
      }

      child.kill(signal);
    };

    child.stdout?.on('data', (chunk: Buffer | string) => stdout.add(chunk));
    child.stderr?.on('data', (chunk: Buffer | string) => stderr.add(chunk));

    const finish = (exitCode: number | null, error?: string) => {
      if (finished) {
        return;
      }

      finished = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (forceKillTimeout) {
        clearTimeout(forceKillTimeout);
      }
      resolve({
        error,
        exitCode: timedOut ? 124 : exitCode,
        stderr: stderr.read(),
        stdout: stdout.read(),
        timedOut,
      });
    };

    timeout = setTimeout(() => {
      timedOut = true;
      terminate('SIGTERM');
      forceKillTimeout = setTimeout(() => terminate('SIGKILL'), 5_000);
      forceKillTimeout.unref();
    }, COMMAND_TIMEOUT_MS);

    child.once('error', (error: Error) => finish(127, error.message));
    child.once('close', (exitCode) => finish(exitCode));
  });

const git = (args: string[], maxBuffer = MAX_OUTPUT_BYTES) => {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer,
  });

  return {
    output: typeof result.stdout === 'string' ? result.stdout : '',
    status: result.status,
  };
};

const gitValue = (args: string[]): string | undefined => {
  const result = git(args);
  const value = result.output.trim();

  return result.status === 0 && value.length > 0 ? value : undefined;
};

const commitSha = (args: string[]): string | undefined => {
  const value = gitValue(args);

  return value && /^[0-9a-f]{40}$/.test(value) ? value : undefined;
};

const yarnVersion = (): string | undefined => {
  const result = spawnSync('yarn', ['--version'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 1024,
  });

  return result.status === 0 && typeof result.stdout === 'string'
    ? result.stdout.trim() || undefined
    : undefined;
};

const repositoryName = (): string => {
  const remote = gitValue(['config', '--get', 'remote.origin.url']);
  const match = remote
    ?.replace(/\.git$/, '')
    .match(/(?:github\.com[/:])([^/]+\/[^/]+)$/);

  return match?.[1] ?? 'unknown';
};

const changedFiles = (
  baseSha: string,
  headSha: string,
): string[] | undefined => {
  const result = git(
    ['diff', '--name-only', '-z', baseSha, headSha],
    4 * 1024 * 1024,
  );

  return result.status === 0
    ? result.output.split('\0').filter(Boolean)
    : undefined;
};

const matches = (files: string[], patterns: RegExp[]) =>
  files.some((file) => patterns.some((pattern) => pattern.test(file)));

const readApp = (appPath: string): AppInfo | undefined => {
  const packageJson = join(repositoryRoot, appPath, 'package.json');

  if (!existsSync(packageJson)) {
    return undefined;
  }

  try {
    const value = JSON.parse(readFileSync(packageJson, 'utf8')) as {
      scripts?: Record<string, unknown>;
    };
    const scripts = Object.fromEntries(
      Object.entries(value.scripts ?? {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );

    return {
      name: appPath.split('/').at(-1) ?? appPath,
      parseable: true,
      path: appPath,
      scripts,
    };
  } catch {
    return {
      name: appPath.split('/').at(-1) ?? appPath,
      parseable: false,
      path: appPath,
      scripts: {},
    };
  }
};

const changedApps = (files: string[]): AppInfo[] => {
  const paths = new Set<string>();

  for (const file of files) {
    const match = file.match(
      /^(packages\/twenty-apps\/(?:internal|public)\/[^/]+)/,
    );

    if (match) {
      paths.add(match[1]);
    }
  }

  return [...paths]
    .map(readApp)
    .filter((app): app is AppInfo => app !== undefined)
    .sort((left, right) => left.path.localeCompare(right.path));
};

const FRONT_PATHS = [
  /^\.github\/actions\//,
  /^\.github\/workflows\/(?:changed-files|ci-front)\.yaml$/,
  /^(?:\.nvmrc|\.yarnrc\.yml|package\.json|tsconfig\.base\.json|nx\.json|yarn\.config\.cjs|yarn\.lock)$/,
  /^\.yarn\//,
  /^packages\/(?:twenty-front|twenty-front-component-renderer|twenty-ui|twenty-shared|twenty-sdk|twenty-client-sdk|twenty-oxlint-rules)\//,
];

const APP_PATHS = [
  /^\.github\/actions\//,
  /^\.github\/workflows\/(?:changed-files|ci-twenty-apps|discover-apps)\.yaml$/,
  /^(?:\.nvmrc|\.yarnrc\.yml|package\.json|tsconfig\.base\.json|nx\.json|yarn\.config\.cjs|yarn\.lock)$/,
  /^\.yarn\//,
  /^packages\/twenty-apps\/(?:internal|public)\//,
  /^packages\/(?:twenty-emails|twenty-server|twenty-shared|twenty-client-sdk)\//,
];

const SHARED_IMPACT_PATHS = [
  /^\.github\/actions\//,
  /^\.github\/workflows\/(?:changed-files|ci-twenty-apps|discover-apps)\.yaml$/,
  /^(?:\.nvmrc|\.yarnrc\.yml|package\.json|tsconfig\.base\.json|nx\.json|yarn\.config\.cjs|yarn\.lock)$/,
  /^\.yarn\//,
  /^packages\/(?:twenty-emails|twenty-server|twenty-shared|twenty-client-sdk)\//,
];

const SERVER_PATHS = [
  /^\.github\/actions\//,
  /^\.github\/workflows\/(?:changed-files|ci-cross-version-upgrade|ci-server|discover-apps)\.yaml$/,
  /^(?:\.nvmrc|\.yarnrc\.yml|package\.json|tsconfig\.base\.json|nx\.json|yarn\.config\.cjs|yarn\.lock)$/,
  /^\.yarn\//,
  /^packages\/(?:twenty-client-sdk|twenty-emails|twenty-front\/src\/generated(?:-admin|-metadata)?|twenty-server|twenty-shared|twenty-utils|twenty-oxlint-rules)\//,
];

const UPGRADE_PATHS = [
  /^packages\/twenty-server\/src\/database\/commands\/upgrade-version-command\//,
  /^packages\/twenty-server\/src\/engine\/core-modules\/upgrade\//,
];

const fastPlans = (
  files: string[],
  baseSha: string,
  headSha: string,
): Plan[] => {
  const plans: Plan[] = [
    {
      command: makeCommand('npx', [
        'nx',
        'affected',
        '--nxBail',
        '--configuration=ci',
        '-t=lint,typecheck,test,build,lingui:extract,lingui:compile',
        '--parallel=3',
        `--base=${baseSha}`,
        `--head=${headSha}`,
      ]),
      name: 'Affected lint, typecheck, unit, build, and Lingui checks',
    },
  ];

  for (const app of changedApps(files)) {
    if (!app.parseable) {
      plans.push({
        name: `App static checks: ${app.name}`,
        reason: 'The changed app package.json could not be parsed safely.',
      });
      continue;
    }

    for (const script of ['lint', 'typecheck', 'test:unit']) {
      if (!app.scripts[script]) {
        plans.push({
          name: `App ${script}: ${app.name}`,
          reason:
            script === 'lint'
              ? 'CI invokes yarn lint for every discovered app; no local lint script is available.'
              : `CI skips this optional task when the app has no ${script} script.`,
          status: script === 'lint' ? 'FAIL' : 'N/A',
        });
        continue;
      }

      plans.push({
        command: makeCommand('yarn', [script], join(repositoryRoot, app.path)),
        name: `App ${script}: ${app.name}`,
      });
    }
  }

  return plans;
};

const manualSuites = (
  files: string[] | undefined,
  applicabilityUnknown = false,
): ManualSuite[] => {
  const safeFiles = files ?? [];
  const apps = changedApps(safeFiles);
  const sharedImpact =
    applicabilityUnknown || matches(safeFiles, SHARED_IMPACT_PATHS);
  const appIntegration =
    sharedImpact ||
    apps.some((app) => !app.parseable || typeof app.scripts.test === 'string');
  const front = applicabilityUnknown || matches(safeFiles, FRONT_PATHS);
  const appWorkflow = matches(safeFiles, APP_PATHS);
  const server = applicabilityUnknown || matches(safeFiles, SERVER_PATHS);
  const upgrade = applicabilityUnknown || matches(safeFiles, UPGRADE_PATHS);
  const unknownReason =
    'Applicability could not be determined safely; review manually.';

  return [
    {
      applicable: front,
      commandReference:
        'npx nx storybook:build twenty-front; npx nx storybook:test twenty-front --configuration=modules --shard=1/1',
      name: 'Frontend Storybook build and tests',
      reason: applicabilityUnknown
        ? unknownReason
        : front
          ? 'Not executed by this safe verifier.'
          : 'No changed file matches the CI Front trigger paths.',
      reference:
        '.github/workflows/ci-front.yaml#front-sb-build and #front-sb-test',
    },
    {
      applicable: applicabilityUnknown || appIntegration,
      commandReference:
        'yarn test from each changed app root via .github/actions/test-twenty-app/action.yml',
      name: 'Changed app integration tests',
      reason: applicabilityUnknown
        ? unknownReason
        : sharedImpact
          ? 'Shared-impact change expands app integration coverage to all discovered app roots.'
          : appIntegration
            ? 'Not executed by this safe verifier.'
            : appWorkflow
              ? 'CI has no changed app with a test script, so the integration matrix is skipped.'
              : 'No changed app matches the CI Twenty Apps trigger paths.',
      reference: '.github/workflows/ci-twenty-apps.yaml#integration',
    },
    {
      applicable: server,
      commandReference:
        'npx nx build twenty-shared; npx nx build twenty-server; review remaining service-backed steps in .github/workflows/ci-server.yaml#server-validation',
      name: 'Server validation',
      reason: applicabilityUnknown
        ? unknownReason
        : server
          ? 'Not executed by this safe verifier.'
          : 'No changed file matches the CI Server trigger paths.',
      reference: '.github/workflows/ci-server.yaml#server-validation',
    },
    {
      applicable: server,
      commandReference:
        'Review the exact service-backed commands in .github/workflows/ci-server.yaml#server-integration-test',
      name: 'Server integration tests',
      reason: applicabilityUnknown
        ? unknownReason
        : server
          ? 'Not executed by this safe verifier.'
          : 'No changed file matches the CI Server trigger paths.',
      reference: '.github/workflows/ci-server.yaml#server-integration-test',
    },
    {
      applicable: upgrade,
      commandReference:
        'Review .github/workflows/ci-cross-version-upgrade.yaml#cross-version-upgrade',
      name: 'Cross-version upgrade',
      reason: applicabilityUnknown
        ? unknownReason
        : upgrade
          ? 'No safe local equivalent is executed by this verifier.'
          : 'No changed upgrade command file matches the upgrade CI trigger paths.',
      reference:
        '.github/workflows/ci-cross-version-upgrade.yaml#cross-version-upgrade',
    },
    {
      applicable: server,
      commandReference:
        'Review the installation-only action steps in .github/actions/test-twenty-app/action.yml',
      name: 'Server app-install smoke tests',
      reason: applicabilityUnknown
        ? unknownReason
        : server
          ? 'Not executed by this safe verifier.'
          : 'No changed file matches the CI Server trigger paths.',
      reference:
        '.github/workflows/ci-server.yaml#server-apps-install-smoke and .github/actions/test-twenty-app/action.yml',
    },
  ];
};

const execute = async (
  plans: Plan[],
  blockedReason?: string,
): Promise<Result[]> => {
  const results: Result[] = [];

  for (const plan of plans) {
    if (plan.status === 'N/A') {
      results.push({
        ...plan,
        durationMs: 0,
        errorSummary: 'none',
        exitCode: null,
        outputSummary: 'none',
        status: 'N/A',
      });
      continue;
    }

    if (blockedReason || !plan.command) {
      results.push({
        ...plan,
        durationMs: 0,
        errorSummary:
          blockedReason ?? plan.reason ?? 'No safe command available.',
        exitCode: null,
        outputSummary: 'none',
        status: 'FAIL',
      });
      continue;
    }

    const startedAt = Date.now();
    const result = await run(plan.command);

    results.push({
      ...plan,
      durationMs: Date.now() - startedAt,
      errorSummary: summary(
        result.error ??
          (result.timedOut
            ? `Command timed out after ${COMMAND_TIMEOUT_MS / 1000}s.`
            : result.stderr),
      ),
      exitCode: result.exitCode,
      outputSummary: summary(result.stdout),
      status: result.exitCode === 0 ? 'PASS' : 'FAIL',
    });
  }

  return results;
};

const baseRef = (): string => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return 'origin/main';
  }

  if (args.length === 2 && args[0] === '--base' && args[1]) {
    return args[1];
  }

  throw new Error('Usage: yarn ci:local-verify [--base <ref>]');
};

const report = (input: {
  baseRef: string;
  baseSha: string;
  checks: Result[];
  headSha: string;
  manual: ManualSuite[];
  repository: string;
  timestamp: string;
  worktree: string;
  yarn: string;
}): string => {
  const fastPass = input.checks.every((check) => check.status !== 'FAIL');
  const manualRequired = input.manual.some((suite) => suite.applicable);
  const overall = fastPass
    ? manualRequired
      ? 'FAST_CHECKS_PASS_MANUAL_REVIEW_REQUIRED'
      : 'FAST_CHECKS_PASS'
    : manualRequired
      ? 'FAST_CHECKS_FAIL_MANUAL_REVIEW_REQUIRED'
      : 'FAST_CHECKS_FAIL';
  const checks = input.checks
    .map(
      (check) => `### ${check.name}

- Result: **${check.status}**
- Exact command: \`${markdown(check.command?.display ?? 'N/A')}\`
- Exit code: \`${check.exitCode ?? '-'}\`
- Duration: \`${(check.durationMs / 1000).toFixed(1)}s\`
- Output summary: ${check.outputSummary}
- Error summary: ${check.errorSummary}
${check.reason ? `- Note: ${markdown(check.reason)}\n` : ''}`,
    )
    .join('\n');
  const manual = input.manual
    .map(
      (suite) =>
        `| ${suite.name} | ${suite.applicable ? 'yes' : 'no'} | ${suite.applicable ? 'MANUAL REVIEW REQUIRED' : 'N/A'} | ${markdown(suite.reference)} | ${markdown(suite.commandReference)} | ${markdown(suite.reason)} |`,
    )
    .join('\n');

  return `# Local verification report

- Schema version: \`${SCHEMA_VERSION}\`
- Repository: \`${input.repository}\`
- HEAD SHA: \`${input.headSha}\`
- Base ref: \`${input.baseRef}\`
- Base SHA: \`${input.baseSha}\`
- UTC timestamp: \`${input.timestamp}\`
- Worktree state before checks: **${input.worktree}**
- Node.js: \`${process.version}\`
- Yarn: \`${input.yarn}\`
- Overall result: **${overall}**

## Safe fast checks

Only commands in this section are executed. A **PASS** means only that the safe fast check passed.

${checks}
## Expensive suites requiring manual review

These suites are never executed by this verifier. Every applicable row requires maintainer-reviewed local evidence before applying \`ci:local-verified\`.

| Suite | Applicable | Status | Repository reference | Exact command/reference | Reason |
| --- | --- | --- | --- | --- | --- |
${manual}

## Maintainer checklist

- [ ] Confirm the report HEAD SHA exactly matches the current PR HEAD SHA.
- [ ] Confirm the base SHA is intended and the worktree was clean before checks.
- [ ] Confirm every safe fast check is **PASS**; optional app typecheck/unit rows may be **N/A** only when CI skips them because the script is absent.
- [ ] Review local logs/results for every applicable **MANUAL REVIEW REQUIRED** suite.
- [ ] Apply \`ci:local-verified\` only after reviewing both fast-check output and manual evidence.

The \`ci:local-verified\` label is scheduling/resource metadata, not cryptographic proof and not a security boundary. Main and the existing merge-queue path remain authoritative for full validation.
`;
};

const main = async () => {
  const requestedBase = baseRef();
  const head = commitSha(['rev-parse', 'HEAD']);
  const base = commitSha([
    'rev-parse',
    '--verify',
    `${requestedBase}^{commit}`,
  ]);
  const yarn = yarnVersion();
  const status = git(['status', '--porcelain=v1', '--untracked-files=all']);
  const worktree =
    status.status === 0
      ? status.output.trim().length === 0
        ? 'CLEAN'
        : 'DIRTY'
      : 'UNKNOWN';
  const files = head && base ? changedFiles(base, head) : undefined;
  const unknownApplicability = !files;
  const plans =
    head && base && files
      ? fastPlans(files, base, head)
      : [
          {
            name: 'Affected lint, typecheck, unit, build, and Lingui checks',
            reason:
              'Exact base/head SHAs or the changed-file list could not be resolved.',
          },
        ];
  const blockedReason =
    worktree !== 'CLEAN'
      ? 'Blocked because the worktree was not clean before checks started.'
      : !head || !base
        ? 'Blocked because the exact base or HEAD SHA could not be resolved.'
        : !files
          ? 'Blocked because the base-to-HEAD file list could not be resolved.'
          : !yarn
            ? 'Blocked because the Yarn version could not be resolved.'
            : undefined;
  const checks = await execute(plans, blockedReason);

  process.stdout.write(
    report({
      baseRef: requestedBase,
      baseSha: base ?? 'unavailable',
      checks,
      headSha: head ?? 'unavailable',
      manual: manualSuites(files, unknownApplicability),
      repository: repositoryName(),
      timestamp: new Date().toISOString(),
      worktree,
      yarn: yarn ?? 'unavailable',
    }),
  );
  process.exitCode = checks.every((check) => check.status !== 'FAIL') ? 0 : 1;
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  process.stdout.write(
    report({
      baseRef: 'unavailable',
      baseSha: 'unavailable',
      checks: [
        {
          durationMs: 0,
          errorSummary: summary(message),
          exitCode: 1,
          name: 'Local verification preflight',
          outputSummary: 'none',
          reason: 'The verifier could not initialize safely.',
          status: 'FAIL',
        },
      ],
      headSha: 'unavailable',
      manual: manualSuites(undefined, true),
      repository: repositoryName(),
      timestamp: new Date().toISOString(),
      worktree: 'UNKNOWN',
      yarn: 'unavailable',
    }),
  );
  process.exitCode = 1;
});
