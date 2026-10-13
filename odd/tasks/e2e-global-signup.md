# Global signup E2E recovery

- Base: actual main `b05590e7bde4b8d14be461e13cd10af539116495`.
- Scope: navigate onboarding signup to the client-config global origin and assert that scope before submitting. Preserve all onboarding assertions and authorization behavior.
- Modes: TDD off; RDD off.
- Acceptance: formatting/static checks and an isolated ACT E2E execution with runtime evidence. ACT must pass before any push; publication remains a parent-session gate.
- Safety: no deployment, secrets, host-runner execution, existing database reuse, or changes to the original checkout/preview. Temporary ACT adaptations must be disclosed.
- Rollback: remove only the onboarding test change and this recovery record.
- Progress: test correction committed as `c91fcad06c5dd5cf3a66892d21ffbeb86772b565`; formatting and whitespace checks passed.
- Focused type check passed inside the isolated runner: `node node_modules/typescript/bin/tsc --noEmit --skipLibCheck --esModuleInterop --target ES2021 --moduleResolution node packages/twenty-e2e-testing/tests/authentication/onboarding.spec.ts` (exit 0; not a full-project type check).
- ACT result: BLOCKED (exit 1). Dependencies, browser installation, shared/frontend/server builds executed successfully. Database setup failed before Playwright: `could not translate host name "postgres" to address`.
- Cause of local harness failure: explicit `--network bridge` put the runner on Docker's bridge while ACT put services on its generated job network. No application failure is inferred. No Playwright test or global-origin assertion executed.
- Adaptations: removed service host bindings, used service DNS in database/Redis URLs and psql, uncached original Yarn installation commands with Node 24, installed container PostgreSQL client/browser libraries, omitted cache/upload/notification jobs, selected only onboarding with its setup dependency.
- Evidence: `/tmp/opencode/e2e-global-signup-act/{workflow.yaml,event.json,act.log,exit.txt}` and preparation script. An initial YAML schema failure (PyYAML parsed `on` as boolean) was corrected before the actual container run; its log is retained separately.
- Next gate: correct only the temporary harness networking after parent review, rerun isolated ACT, and prove actual onboarding execution. Push remains blocked; no remote mutation occurred.
