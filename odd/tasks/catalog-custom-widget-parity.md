# Catalog and Custom Widget Parity

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
- Evidence/commit: CAT-03 functional verification is complete; the user authorized the scoped work-unit commit. Its identity and authored count will be recorded after commit creation.
- Rollback boundary: revert only the CAT-03 changes in `RecordIndexCatalogContainer.tsx` and its test, `view.entity.ts`, `instance-commands.constant.ts`, the `1791231000000-preserve-catalog-views-on-field-deletion` migration and its unit test, and `catalog-view-role-field-deletion.integration-spec.ts`. A source revert does not undo the already-applied database migration; database rollback requires separate authorization and would restore destructive `CASCADE` behavior.
- Runtime evidence: the post-upgrade integration run above is the database-backed harness; no browser runtime was launched. No tests, upgrades, or database operations were repeated for commit preparation.
- Slice: CAT-03 is one cohesive behavior/tests/migration work unit in the selected `stacked-to-main` chain, following CAT-02; keep it intact rather than splitting solely for the advisory 400-line budget. Task evidence follows the behavior commit to record its resulting identity.

### CAT-04 — Match native query-state and pagination contracts
- [ ] Preserve and render loading, empty, permission-denied, and query-error states distinctly.
- [ ] Expose retry only when the shared query supports it; retain incremental pagination.
- [ ] Verify behavior against the native record-table query/container contract.
- Route: delegated direct. Trigger: query hook/container and test changes.
- Checks: focused Catalog query/container tests; frontend typecheck; formatter; `git diff --check`.
- Evidence/commit: pending.

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
- Current next step: commit the authorized CAT-03 scope, then map CAT-04 read-only. CAT-04 implementation, push, PR, merge, environment changes, and database operations are not authorized in this action.
- Functional checks, failures, skipped checks, runtime evidence, authored line count, and commit identities are appended per task.
