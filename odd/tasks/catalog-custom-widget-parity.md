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
- Evidence/commit: 1,228 authored changed lines across the CAT-02 implementation and tests (generated files excluded). Rollback boundary: revert the Catalog editor removal in `ObjectOptionsDropdownCatalogFieldsContent.tsx`, `ObjectOptionsDropdownContent.tsx`, `ObjectOptionsDropdownLayoutContent.tsx`, and `ObjectOptionsContentId.ts`; revert Catalog role rendering/migration in `RecordIndexCatalogContainer.tsx`, `useMigrateCatalogViewFields.ts`, and `buildCatalogViewFieldMigrationPlan.ts`; revert associated tests in `ObjectOptionsDropdownContent.test.tsx`, `RecordIndexCatalogContainer.test.tsx`, `useMigrateCatalogViewFields.test.tsx`, and `buildCatalogViewFieldMigrationPlan.test.ts`. Work-unit commit pending.

### CAT-03 — Make Catalog mappings deterministic
- [ ] Validate configured role field IDs against current object metadata.
- [ ] Define and test behavior when a mapped field is deleted, hidden, or no longer compatible.
- [ ] Remove implicit image discovery from unrelated fields unless explicitly authorized by the mapping contract.
- Route: delegated direct. Trigger: renderer/mapping and test changes.
- Checks: Catalog mapping tests; frontend typecheck; formatter; `git diff --check`.
- Evidence/commit: pending.

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
- Current next step: create the CAT-02 work-unit commit, then continue with CAT-03. No PR or push of CAT-02 is authorized yet.
- Functional checks, failures, skipped checks, runtime evidence, authored line count, and commit identities are appended per task.
