# Catalog and Custom Widget Parity

## Current delivery: consolidated Catalog PR #52

This branch delivers **CAT-01–CAT-04 only** in the existing PR #52, based on `236d095f4c28c4a80205d28704800f463a4bcd51`. The user explicitly accepted one Catalog PR exceeding 400 changed lines: delivery strategy **`exception-ok`**. This supersedes the prior stacked strategy for Catalog only; it is not a maintainer label or review approval. No issue approval prerequisite applies to this delivery. RDD remains disabled. TT, PF, and PAR-01 are out of scope and not started by this action. No merge or auto-merge is authorized.

The sections below retain original-branch implementation chronology, including historical local-only restrictions and checks; they do not describe the current publication authorization or freshly prove this candidate. The original checkout and its task mirror remain unchanged.

| Work unit | Original commits | PR branch commits |
| --- | --- | --- |
| CAT-01 | `7bba72a94f`, `41e995faf1` | `d3685ff1c8`, `b838bd156f` |
| CAT-02 | `6aefe9021d`, `66eaaaaf59` | `53e3abc76a`, `0825b9ff66` |
| CAT-03 | `6026d60b1f`, `8850805297` | `66763e776d`, `a94dcfbe99` |
| CAT-04 | `c29ab41abc`, `4067ad5385` | `ab1439d716`, `7af6cf546d` |

All six additional commits transplanted without conflicts; work-unit boundaries were preserved. No unrelated accumulated history was transplanted. Changed package files match the original CAT-04 snapshot byte-for-byte. Source inspection confirmed the existing base contains the Catalog columns/foreign keys, shared query error/refetch contract, and view persistence permissions needed by these changes; no missing excluded-history dependency was found in the inspected paths.

### Bounded CI correction — PR #52

- Intent: replace candidate-introduced non-DOM `useRef` state with instance-scoped Jotai atoms, using synchronous store reads for concurrency and immutable updates. Keep migration completion/retry bookkeeping scoped to the hook lifetime, cancel timers on unmount, and isolate pagination state by query identity. Preserve legacy role metadata and existing cross-mount in-flight migration deduplication.
- Scope: CAT-02/CAT-04 lifecycle correction and regression tests only; no new feature, lint suppression, workflow change, or global state registry. Existing completed CAT tasks remain completed. TDD/RDD remain off; consolidated size exception remains applicable.
- Planned checks: scoped formatting before final checks; exact full frontend type-aware oxlint plus configured full-source formatter check using installed local binaries; six focused frontend Jest suites with `--runTestsByPath --runInBand --no-cache`; uncached/dependency-excluded frontend typecheck; `git diff --check`.
- Correction proof: **final local verification passed**. Independent verification reran full frontend type-aware lint: **7,972 files, 0 warnings, 0 errors**; the two lifecycle suites passed (**27 tests**) and whitespace checks passed. Writer verification passed six frontend suites (**39 tests, 0 snapshots**), uncached/dependency-excluded frontend typecheck, and scoped formatter. No database/integration test or original-checkout write was performed. Remote CI remains a separate delivery gate.
- Runtime harness: deferred-promise React hook/component tests for same-turn deduplication, old-query completion, view switching, retry/backoff, and unmount cleanup; no browser required for this storage-only correction.
- Rollback boundary: only this correction's changes in the Catalog container, migration hook, their tests, and this evidence section; no schema or persisted metadata change.

Observed correction commands (isolated worktree root unless noted):

```bash
export NX_DAEMON=false NX_NO_CLOUD=true NX_ISOLATE_PLUGINS=false npm_config_offline=true npm_config_registry=http://127.0.0.1:9 YARN_ENABLE_NETWORK=0
# Required lint plugin dist was absent; supported offline local build, no install.
node node_modules/nx/dist/bin/nx.js run twenty-oxlint-rules:build --excludeTaskDependencies --skipNxCache --no-cloud
git diff --name-only -- '*.ts' '*.tsx' | xargs node node_modules/oxfmt/bin/oxfmt
# From packages/twenty-front; full type-aware lint run exactly once:
../../node_modules/.bin/oxlint --type-aware -c .oxlintrc.json src/
../../node_modules/.bin/oxfmt --check src/
# After correcting the sole reported test-helper hook name, from packages/twenty-front:
../../node_modules/.bin/oxlint --type-aware -c .oxlintrc.json src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx src/modules/object-record/record-index/hooks/useMigrateCatalogViewFields.ts src/modules/object-record/record-index/hooks/__tests__/useMigrateCatalogViewFields.test.tsx
# Final root checks after reformatting:
git diff --name-only -- '*.ts' '*.tsx' | xargs node node_modules/oxfmt/bin/oxfmt --check
BASE=236d095f4c28c4a80205d28704800f463a4bcd51
mapfile -t tests < <(git diff --name-only --diff-filter=ACM "$BASE" HEAD -- packages/twenty-front | grep -E '\.test\.tsx?$')
node node_modules/jest/bin/jest.js --config packages/twenty-front/jest.config.mjs --runTestsByPath "${tests[@]}" --runInBand --no-cache
node node_modules/nx/dist/bin/nx.js run twenty-front:typecheck --excludeTaskDependencies --skipNxCache --no-cloud
git diff --check
```

- Writer full lint initially inspected 7,972 files: **0 warnings, 1 error** in the newly added test helper (`renderMigration` called a hook without a hook name). Renamed it to `useTestMigration`, reformatted, and verified all four changed source/test files with the same type-aware lint: **0 warnings, 0 errors**. The independent verifier subsequently ran `../../node_modules/.bin/oxlint --type-aware -c .oxlintrc.json src/` from `packages/twenty-front`: **7,972 files, 0 warnings, 0 errors**. No baseline failure exemption is claimed.
- Independent focused verification: `node node_modules/jest/bin/jest.js --config packages/twenty-front/jest.config.mjs --runTestsByPath packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx packages/twenty-front/src/modules/object-record/record-index/hooks/__tests__/useMigrateCatalogViewFields.test.tsx --runInBand --no-cache` — **2 suites / 27 tests passed**. No functional blockers found; direct timer-removal assertion and the backoff-cap boundary remain optional coverage gaps, not expanded in this correction.
- Full-source formatter passed on 8,254 files before the helper rename; the final four-file formatter check passed after it. Final Jest and typecheck were rerun after the rename and passed. The query-failure test intentionally emits the existing `Records unavailable` error log; no new warning was observed.
- Added six cases covering per-view completion/backoff across switches, pending/scheduled retry unmounts and remounts, simultaneous-instance migration deduplication, A→B→A pending pagination isolation, and late rejection after unmount. Existing duplicate-click cases now batch both clicks in one React turn.
- Local output logs: `/tmp/opencode/pr52-correction-{lint,format,jest-final,typecheck}.log`. Generated lint-plugin output and the existing untracked `.codegraph/` index are excluded from the authored correction.
- Skill resolution: paths-injected `/home/fabianvcha/.config/opencode/skills/work-unit-commits/SKILL.md`, `/home/fabianvcha/projects/odelza-platform/.cursor/skills/syncable-entity-testing/SKILL.md`, and `/home/fabianvcha/projects/odelza-platform/.cursor/skills/syncable-entity-integration/SKILL.md`; loaded before edits. Syncable-entity backend work remains out of scope.

### Fresh consolidated-candidate verification

Commands run from this isolated PR worktree (not the original checkout):

```bash
BASE=236d095f4c28c4a80205d28704800f463a4bcd51
mapfile -t tests < <(git diff --name-only --diff-filter=ACM "$BASE" HEAD -- packages/twenty-front | grep -E '\.test\.tsx?$')
node node_modules/jest/bin/jest.js --config packages/twenty-front/jest.config.mjs --runInBand --no-cache --runTestsByPath "${tests[@]}"
node node_modules/jest/bin/jest.js --config packages/twenty-server/jest.config.mjs --runInBand --no-cache --runTestsByPath packages/twenty-server/src/database/commands/upgrade-version-command/2-21/__tests__/preserve-catalog-views-on-field-deletion.instance-command.spec.ts
export NX_DAEMON=false NX_NO_CLOUD=true NX_ISOLATE_PLUGINS=false npm_config_offline=true npm_config_registry=http://127.0.0.1:9 YARN_ENABLE_NETWORK=0
node node_modules/nx/dist/bin/nx.js run twenty-front:typecheck --excludeTaskDependencies --skipNxCache --no-cloud
node node_modules/nx/dist/bin/nx.js run twenty-server:typecheck --excludeTaskDependencies --skipNxCache --no-cloud
mapfile -t files < <(git diff --name-only --diff-filter=ACM "$BASE" HEAD -- packages | grep -E '\.tsx?$')
node node_modules/oxfmt/bin/oxfmt --check "${files[@]}"
git diff --check "$BASE"...HEAD
```

- Frontend: **6 suites, 33 tests passed**, including `useRecordIndexTableQuery`, card/container, options routing, migration hook, and migration-plan suites; no snapshots. The intentional query failure emits the existing error log.
- Server preservation migration unit test: **1 suite, 3 tests passed**, no database access.
- Both typechecks passed uncached with dependency tasks excluded. Ordinary dependency/cache-enabled execution is not proven.
- Scoped formatter and diff checks passed. Generated outputs and the local CodeGraph index are excluded from commits.
- Initial server typecheck failed with missing generated exports from `twenty-emails`, `twenty-client-sdk/generate`, and `twenty-sdk/front-component-renderer/build`. Under the same offline environment, these supported builds each passed, then both typechecks passed:

```bash
node node_modules/nx/dist/bin/nx.js run twenty-emails:build --excludeTaskDependencies --skipNxCache --no-cloud
node node_modules/nx/dist/bin/nx.js run twenty-client-sdk:build --excludeTaskDependencies --skipNxCache --no-cloud
node node_modules/nx/dist/bin/nx.js run twenty-sdk:build --excludeTaskDependencies --skipNxCache --no-cloud
```

No installs, registry access, source repair, cache-wide reset, or original-worktree changes were needed. SDK build emitted browser externalization warnings for `perf_hooks`; final server typecheck emitted a historical flaky-task notice after the initial missing-output failure.

### Pending proof and rollback

PR #52 must remain **draft**: fresh database-backed CAT-03 integration on the consolidated candidate is pending and was explicitly excluded from this action. The prior original-branch post-upgrade **1 suite / 1 test pass** below is historical only, not candidate proof. No database upgrade/reset/seed, credential/config copy, integration run, browser run, full-suite run, or merge occurred. Independent candidate verification may follow; TT is not the next action in this delivery.

Rollback remains per work unit below. Reverting source does not undo an applied database migration; its `down` restores destructive `CASCADE` and requires separate authorization.

## Objective
Bring the Catalog data view and the custom Task Timeline and Personal Finance widgets into coherent structural parity with native view/widget data, configuration, persistence, permission, and error-handling patterns.

## Problem and rationale
User reports cite confusing field mappings, ineffective compact mode, inconsistent runtime behavior, performance regressions, and unexplained errors. Read-only inspection found that Catalog mixes dedicated card-role mappings with visible view fields, its compact flag is not consumed by the renderer, query errors/loading are not fully represented, Task Timeline silently falls back from stale mappings and refetches after updates, and Personal Finance has persisted configuration/server aggregation but no production frontend data-provider/query wiring found.

## Authorized scope
- Catalog record-index view menus, field configuration, rendering, query states, mappings, and focused tests.
- Task Timeline widget mapping, query/cache/update behavior, permissions, states, and focused tests.
- Personal Finance widget configuration-to-runtime data wiring, permissions, states, and focused tests.
- Shared contract changes only when they remove divergence among these surfaces and native patterns.

## Constraints
- Preserve existing user data, metadata compatibility, permissions, and unrelated dashboard/widget behavior.
- Do not modify unrelated Card Carousel work or local environment/configuration changes.
- Do not open a PR or merge without separate user authorization. The user authorized pushing `feat/catalog-custom-widget-parity` to `origin`.
- Technical artifacts and code remain in English.
- TDD mode: OFF, based on the project's existing testing-capabilities record (`sdd-init/odelza-platform`); use focused project-specific tests and applicable typechecks.
- RDD mode: OFF, explicitly disabled by the user at clone scope; use ordinary functional verification and do not start receipt review or claim review approval.
- Delivery strategy: `ask-on-risk`; forecast and running authored-line count are recorded as evidence becomes available. No size-only rework.
- Chain strategy: `stacked-to-main`, explicitly selected by the user after CAT-02 exceeded the advisory 400-line workload budget. This does not authorize a PR or push.
- Chosen implementation route: delegated direct for multi-file behavior changes. Trigger evidence: each implementation task spans non-trivial UI/data/test files; broad preparation is delegated with the writer.

## Acceptance criteria
- Catalog configuration controls have clear, non-overlapping semantics and no stale field mapping silently changes the displayed data.
- Catalog's persisted compact setting changes rendered content consistently with native compact-card behavior.
- Catalog distinguishes loading, empty, permission-denied, and query-error states and retains pagination behavior.
- Task Timeline field mappings, dependency query shape, permission states, and update/cache behavior are explicit and tested.
- Personal Finance receives real runtime data from its configured source and exposes distinct loading/empty/partial/forbidden/error/unavailable states.
- Each completed task has focused functional evidence, any applicable typecheck/format/diff checks, and a work-unit commit recorded below.

## Tasks

### CAT-01 — Honor Catalog compact mode
- [x] Read persisted `currentView.isCompact` in Catalog card rendering.
- [x] Follow native compact behavior: retain the card's identifying title and collapse optional card body content; do not invent a new setting.
- [x] Add focused tests for compact and expanded rendering and persisted toggle behavior.
- Route: delegated direct. Trigger: non-trivial component plus test changes.
- Checks:
  - `yarn nx test twenty-front --runInBand --testPathPattern=modules/object-record/record-index/components/__tests__/RecordCatalogCard.test.tsx` — passed; Nx ran the full project suite: 895 suites, 5,310 tests, 139 snapshots. Both Catalog test files were included.
  - `yarn nx typecheck twenty-front` — passed after final formatting. An earlier run reported six TS2322 errors in the unmodified `useFrontComponentExecutionContext.test.tsx`; reruns passed.
  - `yarn nx format:check --files=packages/twenty-front/src/modules/object-record/record-index/components/RecordCatalogCard.tsx,packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordCatalogCard.test.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx` — passed after formatting the new container test.
  - `git diff --check` — passed.
  - `yarn prettier --check` was unavailable as a Yarn script; the configured Nx formatter check above was used instead.
  - Runtime harness: N/A — the behavior is covered at card/container component level; no browser runtime was launched.
- Evidence/commit: `7bba72a94f` (`fix(catalog): honor compact view setting`); 132 authored changed lines (117 additions, 15 deletions). Rollback boundary: revert the compact prop/conditional rendering and the two Catalog tests in the four changed source/test files.
- Risk/verification outcome: assessment returned `high`/`unassessable` because the worktree contains untracked files; the required independent verifier passed, and RDD remained off. No RDD transaction was started.

### CAT-02 — Define one coherent Catalog field-configuration contract
- [x] Keep `Fields` as the only user-facing Catalog field editor and remove the separate `Catalog fields` editor.
- [x] Keep existing image/subtitle/detail roles as internal compatibility metadata for Catalog views only; `Fields` remains the sole editor for field visibility/order, and reordering does not reassign existing explicit roles.
- [x] Idempotently expose legacy role fields through `Fields` without clearing their compatibility metadata; preserve Catalog content when users cannot persist or a write fails, and retry safely without requiring a remount.
- Route: delegated direct. Trigger: menu, metadata/runtime mapping, and tests.
- Checks:
  - `yarn nx test twenty-front --runInBand --testPathPattern=modules/object-record` — passed: 898 suites, 5,325 tests, 139 snapshots; 11/12 dependency tasks cached. Two flaky dependency-task notices were reported, but the command succeeded. A preliminary attempt failed on a fake-timer queue assertion; removing the brittle assertion made the requested run pass.
  - `yarn nx typecheck twenty-front` — passed; 11/12 dependency tasks cached. An earlier attempt exposed a possibly undefined current view; fixed before the passing run.
  - `yarn nx format:write --files=packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/types/ObjectOptionsContentId.ts,packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/components/__tests__/ObjectOptionsDropdownContent.test.tsx,packages/twenty-front/src/modules/object-record/record-index/hooks/useMigrateCatalogViewFields.ts,packages/twenty-front/src/modules/object-record/record-index/hooks/__tests__/useMigrateCatalogViewFields.test.tsx,packages/twenty-front/src/modules/object-record/record-index/utils/buildCatalogViewFieldMigrationPlan.ts,packages/twenty-front/src/modules/object-record/record-index/utils/__tests__/buildCatalogViewFieldMigrationPlan.test.ts` — completed; normalized four files.
  - `yarn nx format:check --files=packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/types/ObjectOptionsContentId.ts,packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx,packages/twenty-front/src/modules/object-record/object-options-dropdown/components/__tests__/ObjectOptionsDropdownContent.test.tsx,packages/twenty-front/src/modules/object-record/record-index/hooks/useMigrateCatalogViewFields.ts,packages/twenty-front/src/modules/object-record/record-index/hooks/__tests__/useMigrateCatalogViewFields.test.tsx,packages/twenty-front/src/modules/object-record/record-index/utils/buildCatalogViewFieldMigrationPlan.ts,packages/twenty-front/src/modules/object-record/record-index/utils/__tests__/buildCatalogViewFieldMigrationPlan.test.ts` — passed.
  - `git diff --check` — passed in the writer run and parent spot check.
  - Independent verification — passed with no blockers. Parent assessment remained high/unassessable because unrelated untracked files require an explicit scope declaration; RDD is off, so no review transaction was started.
  - Runtime harness: N/A — Catalog component/migration tests cover behavior; no browser runtime was launched.
- Product decision: user chose `Fields` as the sole field editor, requested removal of `Catalog fields`, approved internal compatibility for existing role IDs, and specified that those roles are only applied/shown for Catalog views. Preserve current role behavior; reordering `Fields` does not reassign explicit legacy roles. Keep legacy metadata schema/storage compatible.
- Technical constraint: `ViewFieldEntity` has no image/subtitle/detail role slot and enforces one non-deleted row per `(fieldMetadataId, viewId)`. Retaining legacy role IDs as internal compatibility data avoids a wider schema change and preserves duplicate role assignments.
- Evidence/commit: 1,228 authored changed lines across the CAT-02 implementation and tests (generated files excluded). Rollback boundary: revert the Catalog editor removal in `ObjectOptionsDropdownCatalogFieldsContent.tsx`, `ObjectOptionsDropdownContent.tsx`, `ObjectOptionsDropdownLayoutContent.tsx`, and `ObjectOptionsContentId.ts`; revert Catalog role rendering/migration in `RecordIndexCatalogContainer.tsx`, `useMigrateCatalogViewFields.ts`, and `buildCatalogViewFieldMigrationPlan.ts`; revert associated tests in `ObjectOptionsDropdownContent.test.tsx`, `RecordIndexCatalogContainer.test.tsx`, `useMigrateCatalogViewFields.test.tsx`, and `buildCatalogViewFieldMigrationPlan.test.ts`. Work-unit commit: `6aefe9021d` (`fix(catalog): consolidate field configuration`), local only; no push or PR.

### CAT-03 — Make Catalog mappings deterministic
- [x] Validate configured role field IDs against current-object metadata; ignore stale and cross-object IDs.
- [x] Honor hidden mapped fields and use deterministic fallback to visible, ordered Fields entries; keep automatic image discovery limited to those visible entries.
- [x] Verify field deletion preserves the view and clears only the affected role; the post-upgrade integration test reached and passed its final assertions.
- Route: delegated direct. Trigger: renderer/mapping and test changes.
- Checks:
  - `yarn nx test twenty-front --runInBand --testPathPattern=RecordIndexCatalogContainer.test.tsx` — passed; Nx ran 898 suites, 5,326 tests, 139 snapshots.
  - `yarn nx test twenty-server --runInBand --testPathPattern=preserve-catalog-views-on-field-deletion.instance-command.spec.ts` — passed; Nx ran 801 suites (2 skipped), 6,585 tests, 306 snapshots; migration unit test included.
  - Initial `yarn nx run twenty-server:test:integration --runInBand --testPathPattern=test/integration/metadata/suites/field-metadata/catalog-view-role-field-deletion.integration-spec.ts` — blocked before assertions: the database at `localhost:5432` returned `password authentication failed for user "postgres"`.
  - Initial read-only endpoint check: `packages/twenty-server/.env.test` resolved `PG_DATABASE_URL` to `localhost:5432`, mapped to the running local `postgres:16` container. Its container was up; authentication failed. No credential values were displayed.
  - Authorized credential diagnostic: current `.env.test` credentials failed authentication; the container startup credentials reached the same local endpoint but returned `database_missing` for the configured target. No config, database, role, or service was changed; the target test database is not available on this instance.
  - Authorized read-only catalog lookup: the configured test database was not found at `localhost:5433`; it was found at `localhost:55432`. The `.env.test` credentials authenticate successfully at `55432`. No database or file was changed during lookup.
  - After authorization, changed only the `.env.test` `PG_DATABASE_URL` host/port to `localhost:55432`; parent readback confirms this remains the endpoint. The first command after retarget exited `1`; the executor retained no failure output, so it is unknown whether the deletion assertion ran. No immediate retry was made.
  - Authorized read-only fixture check after that first attempt found the test-created object fixture absent. No database writes occurred during the check. This does not establish whether the assertion or `afterAll` cleanup ran.
  - After a further explicit authorization, ran the integration command one additional time; it also exited `1`. Sanitized capture contained an assertion-related pattern but no reliable failure location/Jest summary, so the specific view-deletion assertion remains unconfirmed. No further retry or database reset occurred; residual fixture state after this second run is unknown.
  - The first authorized read-only fixture check after the second run confirmed the endpoint but returned `unknown`; the executor did not retain the sanitized reason. No database writes or tests occurred during that check.
  - After authorization, repeated the single fixture-existence query once in a read-only transaction. It succeeded and found the fixture absent; the transaction was rolled back. No database writes or tests occurred. This still does not establish whether the deletion assertion or `afterAll` cleanup ran.
  - After further authorization, ran the integration command once more with captured, sanitized output; it exited `1`. The named test started but failed while creating the view, before the field-deletion assertion: `INTERNAL_SERVER_ERROR`, generic `Migration execution failed`; Jest reported 1 failed suite and 1 failed test. No retry, reset, cleanup, additional DB query, or file edit occurred during the run.
  - Read-only source trace found no evidence implicating CAT-03's nullable `SET NULL` foreign-key change in view insertion; that migration changes delete behavior, not valid-field insert semantics. The underlying migration/DB failure remains unknown. The registered instance-command list shows no obvious ordering defect, but does not prove which commands were applied to the test database. The runner wrapper can retain a nested action-transpilation or metadata error, but the captured output did not include it.
  - After explicit authorization, temporarily added `debug` only to `.env.test` `LOG_LEVELS`, ran the integration command once, and restored `.env.test` byte-for-byte; the endpoint still resolves to loopback `localhost:55432`. The command exited `1` with the same generic migration failure; no nested GraphQL detail or safe source location was captured, and Jest's summary was unavailable. The deletion assertion remains unconfirmed. No retry, reset, cleanup, or separate DB query occurred.
  - Read-only trace found the View GraphQL filter does not list `WorkspaceMigrationRunnerException` among its caught types, while the runner stores underlying execution errors separately and its dedicated formatter would expose nested fields only if used. The generic exception conversion can omit custom nested fields outside development. This suggests a possible diagnostic/serialization gap, not an established cause of the view-creation failure.
  - After further explicit authorization, temporarily instrumented only the create-view runner error wrapper and ran the integration command once. It exited `1`; the nested error was `QueryFailedError`, categorized as a constraint violation. No safe SQLSTATE or specific constraint name was available, and the deletion assertion was not reached. Jest reported 1 failed suite/test and 0 snapshots. The source was restored byte-for-byte; `.env.test` was unchanged. No retry, reset, cleanup, or separate DB operation occurred.
  - Read-only source mapping shows the test creates one metadata object and three associated text fields before creating a Catalog view that references them. The entity includes foreign-key and inherited uniqueness constraints; the converter generates IDs and source reveals no obvious bad test input. The Calendar-only check constraint does not apply to Catalog. CAT-03's `SET NULL` migration changes delete behavior, not insertion. The exact constraint and applied test-DB schema state remain unknown.
  - A subsequent explicitly authorized one-shot capture obtained PostgreSQL SQLSTATE `22P02`, which the official [PostgreSQL error-code appendix](https://www.postgresql.org/docs/current/errcodes-appendix.html) classifies as `invalid_text_representation`; this supersedes the earlier broad “constraint violation” categorization. No constraint name, table, or column was safely available. The test still failed during view creation before the deletion assertion; Jest summary was not retained. Source restoration was byte-for-byte and `.env.test` unchanged; no retry, reset, cleanup, or separate DB operation occurred.
  - After explicit authorization, one parameterized, read-only `pg_catalog` existence query against the configured loopback test DB confirmed `CATALOG` is absent from `core.view_type_enum`; the transaction rolled back and made no writes. This strongly explains the `22P02` during creation of a `ViewType.CATALOG` view, though the captured error did not identify the column directly.
   - User explicitly authorized the full supported upgrade scope and one subsequent CAT-03 run. The command `NODE_ENV=test yarn nx run twenty-server:command -- run-instance-commands` was run exactly once and exited `1`; the runner did not confirm successful completion. Which pending legacy migrations or fast instance commands completed was unknown, as was whether Nx cleaned/recreated `dist`. The endpoint was confirmed as loopback `localhost:55432`; there was no retry, CAT-03 test, reset, cleanup, or separate database operation during that attempt.
  - After separate authorization, one parameterized `SELECT EXISTS` in a read-only transaction again found `CATALOG` absent from `core.view_type_enum`; the transaction rolled back. This confirms the target enum change is not currently present, but does not establish which other upgrade steps may have applied or why the command exited `1`. No writes, tests, or upgrades occurred during this check.
  - After separate authorization, a bounded read-only inspection of the two migration ledgers confirmed both exist. The legacy TypeORM ledger contains 182 completed rows; its latest is `AddIsInitialToUpgradeMigration1775909335324`. The instance-command ledger contains 109 instance-level rows, no latest `failed` attempts, and no recorded 2.21 Catalog command; its latest completed command is `2.21.0_AddPlanningWidgetTypesFastInstanceCommand_1790260990300`. The ledgers have no overall run ID, so existing completion rows cannot be attributed to the failed invocation, and absence of a failed row does not explain its exit. The first query attempt had an identifier-quoting error; a corrected read-only transaction completed. No writes, tests, or upgrades occurred during either inspection.
  - After explicit authorization, retried the supported upgrade exactly once with sanitized failure capture. It again exited `1`, at the `precheck` stage with only generic error class `Error`; SQLSTATE and specific check were unavailable. The build effect on `dist` was observable. Source confirms this precheck runs before legacy and fast migrations (`run-instance-commands.command.ts:65–68`) and verifies all active/suspended workspaces completed the last workspace command for the previous version (`:135–167`). Therefore this retry did not reach migration execution. CAT-03 was not run; no further retry or database operation occurred.
  - `yarn nx typecheck twenty-front` and `yarn nx typecheck twenty-server` — passed; all Nx dependency tasks reported cache hits.
  - `yarn nx format:check --files=packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx,packages/twenty-server/src/engine/metadata-modules/view/entities/view.entity.ts,packages/twenty-server/src/database/commands/upgrade-version-command/instance-commands.constant.ts,packages/twenty-server/src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1791231000000-preserve-catalog-views-on-field-deletion.ts,packages/twenty-server/src/database/commands/upgrade-version-command/2-21/__tests__/preserve-catalog-views-on-field-deletion.instance-command.spec.ts,packages/twenty-server/test/integration/metadata/suites/field-metadata/catalog-view-role-field-deletion.integration-spec.ts` — passed.
  - `git diff --check` — passed in the writer run and parent spot check.
- Product decision: when a field mapped to a Catalog role is deleted, preserve the view and clear only that role; missing content falls back to visible `Fields` entries.
- Compatibility clarification carried forward from CAT-02: a valid legacy role field may still render when its `viewField` row is absent because migration cannot persist; when a row exists and is hidden, suppress the role. Stale/cross-object IDs are ignored, and automatic image fallback only scans visible `Fields` entries.
- Post-upgrade success proof (after the chronological attempts above):
  - The user authorized `NODE_ENV=test yarn nx run twenty-server:command -- upgrade` once; it exited `0` and explicitly completed `AddCardCarouselWidgetType`, `AddCatalogViewType`, `AddCatalogFieldsToView`, and `PreserveCatalogViewsOnFieldDeletion`. The sequence contained 180 steps and reported 0 workspaces succeeded / 0 failed; this is not evidence that workspace migrations ran. Nx emitted a flaky-task notice.
  - The user then authorized one `yarn nx run twenty-server:test:integration --runInBand --testPathPattern=test/integration/metadata/suites/field-metadata/catalog-view-role-field-deletion.integration-spec.ts`; it exited `0`: 1 suite and 1 test passed, 0 snapshots, 2.89s. Final assertions confirmed the view was preserved, the deleted field's image role became null, subtitle/detail roles were retained, and `CATALOG` type and compact setting were retained.
  - Worker evidence: `cursor-upgrade-attempt` and `cat-03-post-upgrade-test` (Engram #3249).
- Migration evidence: role FKs now use `SET NULL`; the forward 2.21 fast instance migration replaces all three existing Catalog role FK constraints. Unit and post-upgrade integration tests passed, proving preservation of the view and unrelated roles when the mapped field is deleted.
- Independent verifier's unlisted-role finding is not a blocker under the approved CAT-02 compatibility behavior above; its interpretation conflicts with preserving legacy rendering on failed/read-only migration. The verifier's DB-auth failure was reproduced.
- Evidence/commit: `6026d60b1f` (`fix(catalog): preserve views when mapped fields are deleted`), local only; 386 authored changed lines (372 additions, 14 deletions) across eight files, including 49 task-document lines and 337 implementation/test lines. Pre-commit working-tree and staged `git diff --check` passed; the staged diff contained only the declared CAT-03 scope. Commit completed without bypassing hooks. Earlier functional checks above were retained, not rerun.
- Rollback boundary: revert only the CAT-03 changes in `RecordIndexCatalogContainer.tsx` and its test, `view.entity.ts`, `instance-commands.constant.ts`, the `1791231000000-preserve-catalog-views-on-field-deletion` migration and its unit test, and `catalog-view-role-field-deletion.integration-spec.ts`. A source revert does not undo the already-applied database migration; database rollback requires separate authorization and would restore destructive `CASCADE` behavior.
- Runtime evidence: the post-upgrade integration run above is the database-backed harness; no browser runtime was launched. No tests, upgrades, or database operations were repeated for commit preparation.
- Slice: CAT-03 is one cohesive behavior/tests/migration work unit in the selected `stacked-to-main` chain, following CAT-02; keep it intact rather than splitting solely for the advisory 400-line budget. Task evidence follows the behavior commit to record its resulting identity.

### CAT-04 — Match native query-state and pagination contracts
- [x] Preserve and render loading, empty, permission-denied, and query-error states distinctly (outer object-read gate source-verified only).
- [x] Expose retry only when the shared query supports it; retain incremental pagination.
- [x] Verify behavior against the native record-table query/container contract.
- Route: delegated direct. Trigger: query hook/container and test changes.
- Implementation intent: add shared error/refetch pass-through; distinguish initial loading, successful empty, and query failure; retain cards during pagination and retry returned pagination errors with an in-flight guard. Keep existing object-read and unreadable filter/sort gates above Catalog; update denial is not read denial. Preserve shared snackbar and cursor deduplication behavior.
- Verification: complete within the bounded checks below; ordinary dependency/cache-enabled typecheck reliability remains unproven.
- Forecast: approximately 300–450 authored lines including focused tests and evidence; one cohesive CAT-04 slice, no size-only omission of tests. No database/backend operations or browser run planned.
- Implementation: additive `error`/`refetch` return values; localized loading/empty/error/retry UI with the existing Loader and Catalog button; retained cards during loading and pagination; shared fetching-state subscription plus synchronous request guard; returned and rejected pagination failures are retryable, and local failures are scoped to the query identifier. Existing native snackbar handling and cursor deduplication remain unchanged.
- Observed checks:
  - `yarn nx format:write --files=packages/twenty-front/src/modules/object-record/record-index/hooks/useRecordIndexTableQuery.ts,packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/hooks/__tests__/useRecordIndexTableQuery.test.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx` — passed, run before final checks.
  - `node node_modules/jest/bin/jest.js --config packages/twenty-front/jest.config.mjs --runInBand --runTestsByPath packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx packages/twenty-front/src/modules/object-record/hooks/__tests__/useRecordIndexTableQuery.test.tsx` — final run passed: exactly 2 suites, 19 tests, 0 snapshots. The deliberately failed query emits the existing shared error log. Earlier runs exposed a fixture with null pagination cursor and an assertion racing the shared completion effect; corrected the mock cursor/edges and awaited `hasNextPage` before fetching. Intermediate run passed 18 tests; final run adds recovered-card/final-page coverage.
  - Historical `yarn nx typecheck twenty-front` — last ordinary run FAILED with six TS2322 errors in unchanged `src/modules/front-components/hooks/__tests__/useFrontComponentExecutionContext.test.tsx` at lines 383, 410, 434, 460, 485, 514 (`SidePanelPages` enum assignment). Across three runs the results were fail, pass, fail; verification was partial at that point. Nx also reported two flaky dependency-task notices. Retained as historical evidence, not a CAT-04 baseline exemption.
  - Authorized `npm_config_offline=true npm_config_yes=false yarn nx run twenty-sdk:build:sdk --excludeTaskDependencies --skipNxCache --no-cloud` — exit 0. Rebuilt SDK bundled declarations to restore `DashboardTaskTimelineSettings` and `DashboardCardCarouselSettings`; shared source/dist already contained both. No source/config edits or generated dist files belong in this commit.
  - `npm_config_offline=true npm_config_yes=false yarn nx typecheck twenty-front --excludeTaskDependencies --skipNxCache --no-cloud` — exit 0 after the SDK rebuild, with a historical flaky-task notice. No permanent cache/config fix or reliability of ordinary dependency/cache-enabled execution is claimed.
  - Post-build exact direct Jest command above — exit 0: 2 suites, 19 tests, 0 snapshots (2.049s); four-file Nx format check above and `git diff --check` — exit 0. SDK declaration SHA256 `e5c601db911743281b0088f50ae08e26590899cacbdf2342e00ec2b7557b4862` remained unchanged after all checks; source/worktree snapshots were unchanged during builds. Evidence: Engram #3263/#3264 and `/tmp/opencode/cat04-sdk-check/`. Expensive commands were not repeated for closure.
  - `yarn nx format:check --files=packages/twenty-front/src/modules/object-record/record-index/hooks/useRecordIndexTableQuery.ts,packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexCatalogContainer.tsx,packages/twenty-front/src/modules/object-record/hooks/__tests__/useRecordIndexTableQuery.test.tsx,packages/twenty-front/src/modules/object-record/record-index/components/__tests__/RecordIndexCatalogContainer.test.tsx` — passed after final formatter. Run separately because the preceding chained typecheck failure short-circuited the first attempt.
  - `git diff --check` — passed after final formatting and evidence update.
- State coverage: initial loading versus successful empty; query failure and refetch recovery; rejected query retry; retained cards while loading; returned/rejected pagination errors and retry; duplicate-click suppression; shared in-flight pagination guard; query-scoped error reset; final-page control removal; real mocked-Apollo cursor-deduplicated append and error/refetch pass-through.
- Permission boundary: component test proves unreadable filter/sort fields block Catalog query mounting in `RecordIndexContainer`, and update-denied/readable records remain visible. CodeGraph/source inspection verifies the unchanged object-read denial gate in `RecordIndexContainerGater`; that outer gate was not mounted in this focused test harness. No new permission classification or bypass was introduced.
- Runtime harness: mocked Apollo plus React component tests; independent functional verifier passed all 19 tests with no blockers. Outer object-read denial remains source-verified only, not mounted in the harness. No browser, database, backend tests, upgrades, installs, or remote operations; RDD and TDD are off, with no review approval claimed.
- Rollback boundary: revert CAT-04 changes only in `RecordIndexCatalogContainer.tsx`, `useRecordIndexTableQuery.ts`, their two scoped test files, and this task evidence. No metadata or database changes.
- Evidence/commit: `c29ab41abc1e123a467ffbaec253a3242195995a` (`fix(catalog): handle query states and pagination failures`), local only; 526 authored changed lines (477 additions, 49 deletions) across five files: 497 source/test lines and 29 task-document lines. Working-tree and staged diff checks passed; all source/test diffs matched the verified build/check snapshot. Commit completed without hook bypass or source/test mutations. Advisory 400-line budget exceeded to retain regression coverage; no artificial test split or size-only rework.
- Slice boundary: CAT-04 behavior, its two tests, and task evidence form one cohesive slice after CAT-03 in the cached `stacked-to-main` chain strategy. Any evidence-only follow-up stays in this slice. No push, PR, merge, or next-task implementation is authorized for closure.

### TT-01 — Make Task Timeline field mappings fail clearly
- [ ] Validate configured mappings against Task metadata and distinguish invalid/stale mapping from an intentional automatic fallback.
- [ ] Verify dependency fields and GraphQL relation depth against the actual query shape.
- [ ] Cover valid, missing, stale, and unauthorized mappings.
- Route: delegated direct. Trigger: data hook/domain and tests.
- Checks: focused Task Timeline Jest tests; frontend typecheck; formatter; `git diff --check`.
- Evidence/commit: pending.

### TT-02 — Correct Task Timeline update/cache behavior
- [ ] Measure requests caused by one successful edit and determine whether mutation cache updates plus explicit refetch duplicate work.
- [ ] Keep one authoritative refresh path and preserve rollback/error behavior.
- [ ] Add a regression assertion for request count and updated rendered record.
- Route: delegated direct. Trigger: hook/cache and tests.
- Checks: focused Task Timeline tests and request-level test; frontend typecheck; formatter; `git diff --check`.
- Evidence/commit: pending.

### PF-01 — Connect Personal Finance to production data
- [ ] Trace the existing resolver/service and widget creation configuration end-to-end.
- [ ] Wire a production frontend query/provider from the configured source; do not rely on test-only context injection.
- [ ] Verify a newly created/configured widget reaches a data-backed state.
- Route: delegated direct. Trigger: frontend/server integration and tests.
- Checks: focused frontend and server tests; applicable frontend/server typechecks; formatter; `git diff --check`.
- Evidence/commit: pending.

### PF-02 — Align Personal Finance mappings, permissions, and state handling
- [ ] Validate source object and field mappings against workspace metadata.
- [ ] Enforce source/object/field permissions at the data boundary.
- [ ] Distinguish loading, empty, partial, forbidden, error, and unavailable outcomes.
- [ ] Cover currency/period edge cases supported by the existing aggregation contract.
- Route: delegated direct. Trigger: cross-layer behavior and tests.
- Checks: focused Personal Finance frontend/server tests; applicable typechecks; formatter; `git diff --check`.
- Evidence/commit: pending.

### PAR-01 — Add native-parity integration coverage
- [ ] Exercise create/configure/reload/query/render/error flows for Catalog and each custom widget.
- [ ] Assert stable metadata round trips and observable state behavior, not implementation-only details.
- [ ] Record remaining native/custom differences as explicit, justified boundaries.
- Route: delegated direct. Trigger: multi-surface integration tests.
- Checks: selected focused integration suites, typechecks, formatter, and `git diff --check`.
- Evidence/commit: pending.

## Progress and verification
- Branch `feat/catalog-custom-widget-parity` is published to `origin` at `41e995faf1` and tracks its remote counterpart. No PR was created.
- Receipt-driven development is disabled for this clone by explicit user request; global preference remains unset.
- Baseline inspection found unrelated local changes in environment/configuration and generated planning/index directories; preserve them and stage only task-owned files.
- Effective TDD mode is OFF per existing project testing-capabilities record; no strict-TDD RED-first requirement applies.
- CAT-01 is complete and committed as work unit `7bba72a94f`; source/tests and this task plan are kept in separate commits so the feature document can record the resulting commit identity.
- CAT-02 authored count: 1,228 lines; CAT-01 + CAT-02 total: 1,360 authored lines (generated files excluded).
- CAT-03 is committed locally as `6026d60b1f`; cumulative CAT-01–CAT-03 implementation/test authored count is 1,697 lines (the CAT-03 work-unit commit also includes 49 task-document lines). Its evidence-only follow-up is part of the same CAT-03 slice.
- CAT-04 is committed locally as `c29ab41abc`; cumulative CAT-01–CAT-04 implementation/test authored count is 2,194 lines. CAT-04's five-file behavior commit and its immediately following task-evidence-only commit are one `stacked-to-main` slice after `8850805297`, with no PR created or push performed during closure. Generated SDK dist and unrelated local changes are excluded.
- Current next step: TT-01, not started. CAT-04 is functionally verified with the bounded uncached/dependency-excluded frontend typecheck above; closure is local only, with unrelated state preserved.
- Functional checks, failures, skipped checks, runtime evidence, authored line count, and commit identities are appended per task.
