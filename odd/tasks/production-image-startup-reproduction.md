# Validate consolidated main locally; retain historical image diagnosis

Consolidated main `c9c7a603e0bfbbd7dae73f17888acbc4d7f0c030` is the current validation target. Compilation and an isolated fresh-database process startup succeeded; application correctness, seeded-workspace behavior and the original production failure remain unproven. The user's decision “todo debe de estar consolidado” supersedes old-image recovery as the primary path, without declaring that recovery complete.

## Current decision and scope

Parent-verified ancestry includes Uribe PR55 (`f7f9e23383326191f3fcea476d835b0154646a9e`), PR64 (`c9a586b7d3b0f5ba13ef54272faa96179bab603c`), generic capabilities PR58 (`2e0e891db44cc075c26ca00f73bb6c054c4dae10`) and diagnostic PR65. Do not follow a newer main without pin reassessment. The failed historical deployment targeted 2e0, not this consolidated target; current validation cannot retrospectively identify its exception.

Current authorization: user answered “Si, dale” to the three-file theme correction and E2E without production deployment, then chose “Un PR con excepción” for this current 672-line R6 UI unit plus routine bookkeeping. This is a new, single-UI-correction-PR `exception-ok`, not inherited PR63 consent. Parent authorizes local Conventional source-unit and passive documentation checkpoint commits only. No push, PR creation, Actions, merge, deployment, Docker or E2E by the bookkeeping actor; no further source writes or formatters. Preserve `.atl/` and diagnostic checkpoint `74246e5fb5e50a41a5383ddf4e1882c0d182d148`; branch `fix/consolidated-theme-compatibility`, base c9c. Earlier writer-only restrictions are historical.

One feature document; R5 diagnostic-only test-first exception was historical. R6 uses default applicable meaningful test-first RED/GREEN. Loaded work-unit-commits/cognitive-doc-design; English artifacts, no line-budget code-golf.

## Acceptance checklist

- [x] **R1 — Recovery tooling:** independent technical acceptance at 33 tests; all bounded PR63 findings closed; merged reviewed bytes verified.
- [ ] **R2 — Exact original image recovery:** PR63 published/merged, but sole export attempt stopped at the first identity guard. Export, decryption, archive validation and engine load remain blocked. Superseded as the primary path, not completed.
- [ ] **R3 — Original candidate cold start:** never executed; superseded/unused. Its isolation requirements carry into R5, not its image identity or diagnostic conclusion.
- [x] **R4 — Metadata-only identity diagnosis:** independent 43-test technical acceptance, reviewed PR65 merged, one metadata-only run completed. Selected-manifest config identity remains unknown; this is not recovery.
- [ ] **R5 — Consolidated validation:** complete only after the pending functional/test boundaries below have actual receipts.
  - [x] **R5a — Source/platform prerequisites:** exact archive/tree verified, clean tracked context, offline amd64 Node 24.18.0 probe and disk headroom passed.
  - [x] **R5b — Production compilation:** production build passed; cached production task reuse prevents a fresh-all-compile claim. Focused acceptance is tracked separately under R5e and remains PARTIAL.
  - [x] **R5c — Disposable process startup:** one actual cold start reached stable HTTP 200/Docker healthy; source-classified pre-migration fallback messages are tolerated bootstrap behavior. This checks process startup only, not DB schema/workspace functionality.
  - [x] **R5d — Immutable test dependency image:** explicit immutable install passed; offline Node/binary-existence probe passed and was removed. No suite/typecheck/service launched.
  - [x] **R5e — Focused tests/typechecks:** historical R5 partial results below are superseded by independently accepted final R6: same93 suites/853 assertions all pass after duplicate-symbol hardening; shared/server/frontend native tsgo exit0, zero diagnostics. Not browser or financial-workflow acceptance.
  - [x] **Backend 2.21/MCP/native PostgreSQL checks:** selected mocked checks passed in R5e; R5f native PostgreSQL passed1 suite/18 tests, zero failures/pending. Synthetic metadata/event transport, not financial end-to-end coverage.
  - [x] **Post-bootstrap SQL schema:** R5f SELECT1/four core tables passed; actual core migration ledger182, upgrade rows116, workspace0. Fresh initialization only, not populated upgrades.
  - [ ] **Seeded E2E:** reset/seed expected Apple workspace, then explicitly run required server/frontend/worker and E2E in a separately assigned isolated phase. Not launched in R5f; no historical E2E failure is declared fixed.

## R6 — Theme compatibility correction

Route: bounded source writer followed by independent parent acceptance and delegated local bookkeeping. Delivery strategy: `exception-ok`, one UI-correction PR under the user's current “Un PR con excepción” choice for 672 lines (374 source/test + 298 documentation), plus routine status/commit bookkeeping. Restored R5 progress remains intact; no slicing, compression or trimming to fit. Publication remains held for parent E2E or a further actual decision.

- [x] Reconcile latest checkpoint and Engram10812 before source writes; preserve R5 partial 836/2 and native PostgreSQL 18-test/schema evidence.
- [x] Observe baseline RED and new compatibility/safety regression RED before implementation.
- [x] Migrate two inline maps to existing light/dark Odelza tokens; preserve 25 external named imports.
- [x] Enforce narrow published named-import ABI compatibility without hiding local aliases, shadows or raw legacy CSS.
- [x] Normalize only allowed files; focused GREEN, same 93-suite union and three native typechecks (final hardening boundary below).
- [x] Freeze candidate hashes, source delta and exact owned-runner cleanup proof.
- [x] Parent independent verification accepted final frozen candidate; mandatory independent review fulfilled. RDD OFF; global/native HIGH assessment unassessable, not fabricated approval.
- [x] Source commit `328378be9f4dabfd8bcfd4958afb9a80e7f3baa7`, tree `f1bdeeb3af196c489c10a33759b63c0fddaf7b5b`; staged tree and three frozen source blobs/modes verified after hooks. Four files:466 additions/207 deletions (673 lines with bookkeeping). Passive checkpoint changes only this task; final build HEAD/tree is in handoff.
- [ ] R7 — Seeded E2E: read-only plan completed; runtime not executed, no active explorer runtime.

### R6 result — technically accepted and locally committed; R7 pending

The two maps preserve every semantic suffix while replacing `--t-` with existing `--odz-`: document-generator 21 distinct tokens, Slack 25. Slack's owned accessor and all its references become `odelzaThemeCssVariables`; SDK extraction still uses inline values, not an imported runtime accessor. Both generated light/dark property-definition tests pass. No palette, SDK/export/version or UI-copy change.

Compatibility is limited to the two previously verified standalone npm consumers whose manifest devDependency remains `twenty-ui:^1.0.0-alpha.1`. The TypeScript checker admits only the exact named import from `twenty-ui/theme-constants` and references bound to its import-only symbol. It never exempts a whole file. Local declarations, nested shadows, duplicate same-scope declarations, object keys, strings, wrong-module/default/namespace imports and unsupported re-exports remain rejected. Raw legacy CSS remains independently forbidden, including beside a legitimate external import. All 25 original external consumers remain unchanged.

Actual test-first receipts in `R/evidence/theme-fix-*`:

| Boundary | Actual result |
| --- | --- |
| Original four UI suites | RED: 155 passed / 2 failed assertions; 3/1 suites |
| New compatibility fixtures before implementation | RED: 164/3 assertions; named-import compatibility fails meaningfully |
| First implementation | 170/1; actual manifests use devDependencies, not dependencies; narrow manifest classification corrected |
| Normalized UI | GREEN: 171/0 assertions, 4/0 suites |
| Same 93-suite selection, one full run | PASS: 93/0 suites, 852/0 assertions, zero pending; group assertions 304/91/18/61/207/171 |
| Three original native tsgo checks | Shared/server/frontend exit 0, zero diagnostics; 1.039s / 11.659s / 10.940s |
| Post-union safety probe | TypeScript merges invalid duplicate import/local declarations into one symbol; dedicated regression RED: 171/1 |
| Final import-only-symbol hardening | GREEN: 172/0 assertions, 4/0 UI suites; 2.941s |

The writer's 852-assertion union and original typechecks preceded duplicate-symbol hardening and remain historical. Parent subsequently independently validated the final frozen candidate: 93 suites/853 assertions ALL PASS (server34/304; frontend9/91; shared4/18; additional server12/61; additional frontend30/207; UI4/172); shared/server/frontend native tsgo exit0, zero diagnostics. Parent diff-check rerun PASS; all writer/verifier containers removed. Runtime/browser and financial-workflow coverage remain pending; existing R5f native PostgreSQL18/SQL evidence is retained unchanged, not rerun.

One owned Node24.18/linux-amd64 built-image runner, network none, no mounts/ports/credentials, 4CPU/8GiB/1024PIDs/dropALL/no-new-privileges. Only the three reviewed public source files were copied over the immutable built image; each copy hash was verified. The creation patch label identifies the baseline overlay; the final candidate manifest identifies the later frozen overlay. Neither the original image nor source context was patched. Normalization used existing image Prettier via stdin for only the four allowed files; no host Node or package installs. A rejected helper patch envelope occurred before file creation or Docker execution and was corrected; receipts preserve substantive failed tests above.

Source patch SHA-256 `4982e77da29c3fbda2feab64f0b74098477f203c0ca48b10c863669c4cd0dce2`; modes/blob SHA-256 in `evidence/theme-fix-source-freeze.json`. All 25 external consumer bytes match c9c and the runner; all 26,152 original context regular files still match the archive (`theme-fix-preserved-imports.json`, `theme-fix-original-context.json`). Exact runner `ce04962bf057926f25807d4dd3000bd919ece323b9562349d5084902127783d8` was removed after ownership verification. Original cleanup checker rejected lowercase `error: no such object`; actual removal succeeded. Retained original/final cleanup receipts prove exact-ID inspect exit 1, empty array and exact-ID absence, with no service rerun. No images/context/cache/private keys were removed. SWC printed a nonfatal missing `typescript.js.map` diagnostic when loading the existing compiler package; actual assertions executed and passed, not suppressed or replaced by a preload failure.

Actual source/test diff alone is 374 authored changed lines (261 additions / 113 deletions). The consent boundary was 672 lines across four files, including298 documentation lines; final numstat includes routine bookkeeping. User explicitly chose one PR with a size exception for this unit; no inherited exception or code-golf. All25 public ABI consumers remain byte-identical; light/dark `--odz-*` properties are valid, with only prefix/local-accessor changes in the two forms. CI/CD, SDK, dependencies and all other source paths are unchanged.

## Local operating boundary and retained artifacts

Owned root (`R`, mode 0700): `/private/var/folders/5q/j0cmnbmd3b54y_strvlmjngw0000gn/T/opencode/consolidated-c9c7a603-vmsdjm_w`.

Every Docker command uses `/usr/local/bin/docker --host unix:///Users/andresmarulanda/.orbstack/run/docker.sock --config "$R/docker-empty"`, sanitized without ambient context/TLS/auth/SSH/private proxies/registry/npm credentials. OrbStack29.8.2 linux/arm64, VM15.66GiB; existing amd64 works, no daemon/emulation changes. Public dependency networking allowed during builds; runtime internal-only/no mounts/ports/egress/production data.

Retain context/source.git/archive, sanitized fetch log, docker-empty, evidence, harness and cleanup inventory. Dockerfile.validation is outside immutable public context. Never copy/read private RSA material or report synthetic secrets. Retain images/shared cache; no global prune. Resource limits are not measured peak usage.

### Source and platform identity

| Receipt | Accepted value |
| --- | --- |
| Commit | `c9c7a603e0bfbbd7dae73f17888acbc4d7f0c030` |
| Tree | `1b79838710378b8c4e6b58afeb4fe920c1c68f27` |
| Archive SHA-256 | `6d59650e1288c724204179f3595c6eff9c812a2fce8e954ae2205a4c5423f27c` |
| Context | 26,152 tracked paths; 272,663,788 regular-file bytes; archive path/type/symlink containment checked before extraction |
| Manifest SHA-256 | `1564d908fe3d370b6465103e48cf75a54a9dce41e21e838e749bc5cceaa47860` |
| yarn.lock SHA-256 | `f15b065d7644b879d94d248a2704f0558d1d69ff4e9b62b93987f18604a4e64b` |
| Production Dockerfile SHA-256 | `d29004938dc6bfbfcb30d1921f88da18bdcd323d2766e7467fce6862a99e4693` |

Anonymous main identity was c9c at acquisition. Isolated depth-one public fetch/archive excluded the user's checkout, `.git`, `.atl`, untracked environment files and keys; intentionally public tracked examples/tests remain. Git acquisition disabled ambient configuration, credentials, SSH, prompts and hooks. Before/after production build and runtime checks found zero changed/added/missing context paths and unchanged archive; host source was neither installed into nor generated over.

R5a official Node24.18.0-alpine offline probe passed x64/linux, isolated/read-only/resource-bounded, then exact CID removal verified (`evidence/probe.json`). VM/host free113,781,243,904/119,005,552,640 bytes exceeded30GiB. It proved amd64 execution, not the distinct production-base digest; full identities remain in that retained receipt.

### R5b production compilation

Unchanged pinned Dockerfile serial targets `twenty-front-build`, `twenty-server-build`, `twenty` all exited 0 at `2026-11-10T18:29:48Z–18:39:43Z`: 415.012s +169.075s +11.049s =595.368s. BuildKit cached lines 1/4/37; Nx reused frontend 6/12 and server 3/5 tasks. Frontend built in Docker; server SWC compiled 6,827 files. This is compile evidence, not typecheck, suite union or uncached-all proof. Logs 283,303 bytes stayed below 32 MiB/60-minute bounds; clients reaped normally.

Final tag `opencode-consolidated:c9c7a603-vmsdjm_w`; image/config `sha256:866b7849ed21f619003a390b6af03a3335433530d20bcf4b805a8e78ba53eb63`, linux/amd64,1,126,793,621 bytes. Buildx config and revision/run/task labels matched; entrypoint `/app/entrypoint.sh`, Cmd `["node","dist/main"]`.

Exact base `node:24.18.0-alpine3.23@sha256:595398b0081eacda8e1c4c5b97b76cd1020e4d58a8ebcb4843b9bca1e79e7436`; resolved amd64 manifest is retained in `build-base.json`. Serial stages avoided overlapping heavy heaps; host free-space change and frontend8192-MiB heap ceiling are not exclusive consumption/peak usage measurements.

Receipts: `evidence/build-{timings,base,source-before,source-after}.json`, three target logs/metadata and builder log. Retain front/server/final images. Front has focused dev dependencies, server is production-pruned: neither proves full test dependencies. Production workspace focus was not explicitly immutable; client Yarn environment does not enter builds automatically. No producer Dockerfile/source/argument override or secrets.

### R5c startup: what passed and what did not

Initial harness failed before app start: CREATED endpoint fields are empty. Authorized lifecycle-aware repair reproduced line54 RED on actual metadata, then validated configured CREATED network and allocated exact started network/endpoint/IP. All15 unsafe variants denied (network/ports/privilege/binds/mounts/internalness/endpoint/resource/restart). `python3 -B "$R/ownobserver.py" --guard-test` passed, no disabled guard; original helper/receipts preserved.

One actual start `2026-11-10T19:00:21.865181Z`, pre/post isolation passed. Manual health200 at51.676s; first Docker health ended19:01:12.507950148Z/50.642769s,1.033231s earlier (5s sampling, not simultaneous transition). Starting max failing streak9, never observed unhealthy;7 healthy/200 samples over31.095s, observation82.771s. Root at82.851s:200/title Odelza/branding/1script/39stylesheet-like refs, not browser execution. No OOM/restarts/natural exit; all healthy before teardown.

**Bootstrap classification:** missing `core.keyValuePair`/`core.appToken`/`core.upgradeMigration` at19:00:40–41 preceded182 legacy migrations. Stderr appended later; capture order was misleading. `DatabaseConfigDriver`37–51 catches/falls back to env; `EnterprisePlanService`67–120 catches token load/warns. Tolerated fresh-DB CLI bootstrap, not production-root-cause proof. Two cache flushes succeeded; migrations complete19:01:05.191Z, final PID1 HTTP start19:01:11.781Z/success19:01:11.793Z. No swallowed migration/cache/upgrade failure, retry/SQL/source/env workaround. Init's own --force was not a harness override.

Upgrade186steps/zero workspaces is not populated-upgrade coverage. `health.check([])` is not schema health; no post-SQL query before teardown. Schema/browser/business proof pending. PR64 `tests/login.setup.ts:46` workspaceApple undefined remains unresolved: E2E needs database:reset seed/workspace:seed:dev, tim@apple.dev/Apple/apple origin and explicit server/frontend/worker, not merely fresh migrations. Only actual rerun closes it.

PG16.15/Redis8.10.3 linux-amd64, latest Redis not producer-parity proof. Internal-only/no binds/ports/worker/egress/volumes/restarts; PG2CPU/2GiB/256PIDs/2GiB tmpfs, Redis1CPU/512MiB/128PIDs/maxmemory256mb-noeviction, app4CPU/6GiB/512PIDs/dropALL/no-new-privileges. Synthetic/cron-disabled. Bounds90s readiness/600s observation/4MiB logs; actual638,325B. Benign ExceptionHandlerModule matches are not exceptions.

`fixture-images.json` retains immutable PG/Redis IDs/digests. Exact-ID cleanup in runtime receipts confirms all3containers/internal network and initial unstarted PG/network removed; no runtime leftovers/volumes, all images retained/no prune. Full IDs remain in cleanup inventory and archived10917 rather than repeated here.

Receipts in evidence: runtime-receipt/network, fixture-images/pull logs, runtime-harness-original/repair-probe/guard-tests, runtime2-receipt/latest-inspects, health2-timeline/http2-root, startup2 logs/analysis. Initial instrumentation failure remains historical, not app failure.

### R5d immutable dependency image: declared checks

Predeclared: owned external Dockerfile.validation, exact base/linux-amd64/testfinal/unique tests tag; COPY public context, explicit `node .yarn/releases/yarn-4.13.0.cjs install --immutable`. Preserve Node^24.5.0, hardened mode/constraints/node-modules/enableScripts:false; no compiler install/patch/bypass/retry. CI=true; disable Nx daemon/cloud/cache and Yarn telemetry only in test image. No app/services/suites/Nx/typecheck.

Check absent tag, unchanged archive/context/lock, existing local builder/empty credentials. Stop first failure, 30-minute/32-MiB bounds. Record command/time/metadata/config/platform/hashes. Optional one offline read-only capped Node/filesystem probe only; no executable package import/mount/ports/credentials. Retain image/logs; immutable lock integrity is not full-network reproducibility.

### R5d result: ready for focused checks, not test acceptance

Build exit0/131.105s/27,150B logs; immutable Yarn4.13.0 install approximately105s, 4,463 packages/+3.37GiB, peer warnings/scripts-disabled notices, no install cache/bypass/retry. Tag `opencode-consolidated:c9c7a603-vmsdjm_w-tests`, config/image `sha256:d736e3407fee2f80bd98a1153c0d3eba16e975df1e8e0f5916ae4a675e5aa73c`, linux/amd64,8,343,682,519B, labels/Buildx config verified. Builder ref `default/default/yx4hf0gju2emielfifjnba0i9`; provenance arm64 is builder, not output. Actual131s is not the earlier15–45+minute whole-validation forecast; no measured peak.

Offline read-only probe exit0: Node24.18.0/x64/linux, yarn@4.13.0, Jest/tsgo shim/native-linux-x64 paths exist; not native-loading/test proof. 1CPU/256MiB/64PIDs/dropALL/no-new-privileges/no mounts/ports/network. CID `2f4839a2bb4f7c3007e50dc67fd562b0a8d0157604f4a99ef051edba6ba4a80e` removed/absence verified. No app/fixtures/tests; future test-only heap cap6GiB, not production setting.

All26,152 regular archive members/original lock/archive SHA matched; no host install/source changes. `evidence/test-deps-{build.log,metadata.json,timings.json,source-before.json,source-after.json,probe.json,probe.cid}` retained with Dockerfile/image; inventory updated/no prune. Disabled-script libraries still need real validation; all focused/typecheck/native-DB/E2E gates open.

### R5e predeclared offline regression boundary

Use exact R5d test-image ID with Node24/linux-amd64, one owned network-none/no-mount/no-port container (4CPU/8GiB/1024PIDs, dropALL/no-new-privileges). Serial budget45minutes; shared build/typechecks10minutes each, Jest groups15minutes. No install/services/fixes/retries/snapshot changes. Exact selections/argv in `evidence/check-manifest.json`, results in `evidence/check-summary.json` under R; bounded logs/JSON retained. Reconstruct 34/9/4 unions, deduplicate additional MCP/2.21/task-timeline tests, select UI theme/title/timeline/saved-view/widget tests. Existing package Jest configs confirmed; browser/Storybook Vitest excluded. Uncached shared build precedes native tsgo and Jest; dependency failure means explicit skips, never fabricated passes. Not full PR55/64, native PostgreSQL, E2E or financial-workflow coverage. Results pending.

### R5e first result: PARTIAL, no correction within that pass

Exact image/config `sha256:d736e3407fee2f80bd98a1153c0d3eba16e975df1e8e0f5916ae4a675e5aa73c` inspected linux/amd64; existing Node24.18.0 dependency image unchanged. Ten serial commands took110.167s including integrity/cleanup, no timeout/OOM/runner exit. Logs853,592B. Shared uncached Nx build exit0/24.104s: generateBarrels and build both executed, no local/remote cache hits; network-none excludes remote reuse. Shared tsgo exit0/2.012s. Server tsgo exit2/9.032s:13 TS2307 missing workspace declarations (`twenty-sdk/front-component-renderer/build`, `twenty-emails`, `twenty-client-sdk/generate`). Front tsgo exit2/10.048s:3,973 diagnostics (3,564 TS2307;409 other diagnostics, not independently established source defects versus cascades).

| Selected Jest group | Suites passed/failed | Tests passed/failed | Exit | Seconds |
| --- | --- | --- | --- | --- |
| Capabilities server (34 files) | 20/14 | 197/0 | 1 | 28.120 |
| Capabilities frontend (9) | 7/2 | 83/0 | 1 | 6.024 |
| Shared (4) | 4/0 | 18/0 | 0 | 4.021 |
| Additional 2.21/task/MCP (12) | 10/2 | 35/0 | 1 | 7.034 |
| Additional frontend timeline/view/title (30) | 9/21 | 76/0 | 1 | 9.042 |
| UI theme (4) | 3/1 | 155/2 | 1 | 3.017 |

All93 exact selected files existed; no deduplicated overlap. Aggregate53 passed/40 failed suites,566 discovered assertions:564 passed/two failed, zero pending/todo/snapshot changes. Failed-to-load suites contain undiscovered assertions: zero skipped does NOT mean all intended tests executed, nor reproduce historical431. Thirty-nine suites failed before assertions: server capabilities13 SDK/one emails; MCP protocol/controller two SDK; frontend capabilities two UI; additional frontend21 UI. Dependency-image install does not build every exported workspace dist. Representative server type error `scripts/build-seed-front-components.ts:9:47`; frontend `.storybook/preview.tsx:32:31`; Jest `WorkflowEditActionUpdateRecord.test.tsx:81` cannot resolve `twenty-ui/layout`. This is missing test-image build prerequisites, not proven production failure.

**Genuine source assertion failures:** `packages/twenty-ui/src/theme-constants/__tests__/noTwentyThemeLeftovers.test.ts:58` rejects legacy `--t-*` in document-generator `generate-document-form.front-component.tsx:22` and Slack `send-message-form.front-component.tsx:23`; second assertion finds `themeCssVariables` in26 app files, including Slack definition:21. Guard intentionally scans `twenty-apps` (line11), so these are not missing-dependency failures. Contrast114/generated-theme36/getNextThemeColor3 passed; title test passed. All six selected2.21 suites and task-domain11 assertions passed. Guard/middleware/SSE passed; protocol/controller did not execute. No source/assertion/config edits or retries.

Receipts: `check-manifest.json` exact argv/path unions, per-group JSON/logs, `check-summary.json`, `check-analysis.json`, image/container metadata, source-before/after, cleanup. Runner CID `2ef04a7ac720db9244bf65405712e90add5aa333fc1fc71646b45244c028e7a1` ownership checked, exact removal exit0 and exact inspect no-such-object exit1; cleanup inventory updated. No services/networks/volumes created. All26,152 regular source members still match archive; SHA unchanged. Image/evidence retained, no commit/prune/install. Skill resolution: exact requested work-unit-commits read; pinned snapshot has no AGENTS/index, exact config/files used without index initialization; diagnostic-only verification, test-first behavior policy N/A.

Historical next proposal (not implemented during R5): prepare complete workspace build prerequisites in a separately authorized test-image phase, then reassess unresolved diagnostics; correct legacy theme consumers only with source-fix authorization, preserving the guard. Current no-retry phase is closed PARTIAL. R5f native PG/schema and seeded Apple browser/server/frontend/worker E2E remain independent pending boundaries; no runtime unit result proves a financial production workflow.

### R5e prerequisite correction: predeclared second pass

Authorized only normal build outputs inside a new owned offline test container, not source fixes. Before writes: inspect pinned package exports/project targets/Nx defaults; build `twenty-shared`, `twenty-client-sdk`, `twenty-ui`, `twenty-emails`, `twenty-sdk` through declared Nx build targets, serial/cache-disabled. SDK and emails declare `^build`; UI inherits its package build script. No source/config/shim/install/toolchain workaround. First concrete prerequisite failure stops correction; no validated built-image label for partial builds. After prerequisites pass, rerun unchanged `check-manifest.json` (same 93 files, six Jest groups, three native tsgo checks), preserving previous results. New receipts use `prereq*`/`regression2*`; 45-minute total, 15-minute command and 32-MiB logs bounds. Network-none, no mounts/ports/services, 4CPU/8GiB/1024PIDs/dropALL/no-new-privileges. Optional stopped-container local commit only after successful workspace prerequisites and generated-path audit. R5 remains PARTIAL until all independent gates pass; native PG/schema, Apple seeded E2E and financial workflows remain pending.

**Theme causality audit (no edits):** guard lines17–18 uses `/--t-[a-z]/` and `/\bthemeCssVariables\b/`, scanning all `twenty-apps`. Document-generator form:22 and Slack form:23 contain21/25 distinct old CSS tokens; none is defined by pinned light/dark Odelza CSS (spacing2 now `--odz-spacing-2`, line33). Every corresponding `--odz-*` token exists in light CSS. Candidate only: migrate these two inline maps and Slack's local accessor name under explicit source authorization. The other25 accessor offenders are imports in `public/call-recorder/src/front-components/components/*.tsx` (14) and `public/twenty-fireflies/src/front-components/components/*.tsx` (11). Pinned `twenty-ui/src/theme-constants/index.ts:12` exports only `odelzaThemeCssVariables`, but these apps are excluded from root workspaces and declare npm `twenty-ui:^1.0.0-alpha.1`, SDK2.19/^2.18, not workspace dependencies. Their guard failures are certain; actual resolved npm compatibility/runtime failure is unproven. Do not blindly rename published ABI consumers or weaken the guard. Resolve each app's ABI before proposing coordinated migration; receipt `prereq-theme-analysis.json` lists all27 offending files/lines. Contrast/generated/palette153 passing assertions are not invalidated.

**Second-pass terminal result: PARTIAL.** Sole actual pass completed220.688s, logs27,235B, no timeout/OOM, unchanged original manifest. Five-provider Nx command exited0/90.472s (six tasks including shared barrel generation); repeated shared build exited0/10.177s. However, I omitted `twenty-front-component-renderer:build` from prerequisites: this does NOT meet complete-provider acceptance. That declared target (`project.json:8–21`) depends on `sandbox:prebuild`, remote-DOM generation, SDK build:sdk and UI/shared build:individual (lines50–82). No third run/source workaround. Initial1-second shell transport timeout preceded container creation/any prerequisite execution; the corrected transport launched the sole actual pass. Native completion notification received before this terminal report.

| Same selected group | Suites passed/failed | Tests passed/failed | Exit | Seconds |
| --- | --- | --- | --- | --- |
| Capabilities server (34) | 34/0 | 304/0 | 0 | 32.017 |
| Capabilities frontend (9) | 9/0 | 91/0 | 0 | 5.093 |
| Shared (4) | 4/0 | 18/0 | 0 | 4.082 |
| Additional 2.21/task/MCP (12) | 12/0 | 61/0 | 0 | 7.628 |
| Additional frontend timeline/view/title (30) | 30/0 | 207/0 | 0 | 18.305 |
| UI theme (4) | 3/1 | 155/2 | 1 | 3.059 |

Aggregate92/1 suites,836/2 assertions, zero pending or snapshot changes; all93 files attempted and zero load-failed suites. Previous53/40 suites,564/2 assertions and39 preload failures above remain historical. Shared/server native tsgo pass with0 diagnostics (1.535s/10.689s); server13→0. Front exit2/10.176s:3,973→14 diagnostics, TS2307 3,564→3. Remaining imports: `FrontComponentRenderer.tsx:12:72`, `FrontComponentRendererProvider.tsx:2:49`, `useFrontComponentExecutionContext.ts:8:8`, all missing renderer exports. Eleven other diagnostics are in the same context hook; :227 types its callback through missing `FrontComponentHostCommunicationApi`, so :239 string-to-ButtonAccent remains potentially contextual cascade, not independently established source failure. Both existing theme guard assertions still fail; no new independent source failure established. MCP protocol/controller now execute/pass, not native-PG proof.

Receipts: `prereq-{manifest,configs,original-module-map,image,container,diff,source-before,source-after,theme-analysis}.json`, `prereq-workspace-build.log`, `regression2-{manifest,summary,analysis,cleanup}.json`, six group JSON/logs and three typecheck logs. Docker diff lists19 tracked paths touched by normal builds (15 shared barrels, shared package/project metadata, two UI dist CSS files); content equality inside the removed container was not audited, so these are touched-path evidence, not asserted byte differences or manual edits. All26,152 host-context regular files match original archive; SHA unchanged. Runner `f6111199171ab058f2563b5bd52bfa4abdc23ab58a386df3f3edf691bb7827d2` removed exit0, exact inspect no-such-object exit1; inventory updated. No built-test image committed: complete prerequisites were not met and runner is removed. Original test/production images remain unchanged. No services, network objects, volumes, source patches, installs, lock edits, snapshots, Git writes or pruning. Native PG/schema, seeded Apple E2E and financial workflows remain pending. Skill resolution: exact requested work-unit-commits loaded; cognitive-doc-design loaded; CodeGraph reported pinned context unindexed, exact pinned configs used. Closure remains parent's responsibility.

### Remaining frontend boundary (no third suite pass)

Authorized one offline prerequisite completion and frontend-only native tsgo check, 20-minute/32-MiB bound; same isolated resource/ownership limits. Restore the five providers plus `twenty-front-component-renderer:build` through Nx's declared dependency graph (`sandbox:prebuild`, remote-DOM generation, SDK build:sdk, UI/shared build:individual), serial/no cloud/no cache. No installs, source fixes or assertion edits. Exact original frontend argv/cwd retained; stop at prerequisite failure. No repeated 93-suite union. Optional local built image only after complete prerequisites; otherwise retain failure evidence and remove exact owned runner. Initial helper syntax failure occurred before Docker execution.

**Read-only published ABI classification:** call-recorder locks SDK2.19.0; twenty-fireflies locks SDK2.18.0 despite ^2.18.0 range. Both lock npm `twenty-ui@1.0.0-alpha.1` from ^1.0.0-alpha.1. Exact anonymous registry metadata/tarball (SHA-1 checked; declarations read in memory, no extraction/execution/install) proves `package/dist/theme-constants/index.d.ts:3` exports `themeCssVariables`; its declaration starts at `themeCssVariables.d.ts:1`. Thus the25 imported accessor offenders preserve a real published ABI, unlike the workspace-only Odelza export. Do not rename25 external consumers or publish/change versions. Historical pre-consent candidate fix scope (now authorized only under R6): document-generator `packages/twenty-apps/examples/document-generator/src/front-components/generate-document-form.front-component.tsx:22`; Slack `packages/twenty-apps/public/twenty-slack/src/components/send-message-form.front-component.tsx:21–23`; and `packages/twenty-ui/src/theme-constants/__tests__/noTwentyThemeLeftovers.test.ts` to distinguish verified external named-import ABI from local accessor/CSS leakage, with narrow compatibility regression cases. Preserve CSS/local-accessor enforcement; no blanket app exclusion. Existing matching Odelza CSS tokens are evidence, not permission to patch. Receipts `sdk-abi-{metadata,declarations}.json`. Both assertion failures remain unchanged; no browser/runtime compatibility claim.

**Frontend-only terminal result:** complete six-provider Nx build exit0/128.005s, including six dependency tasks; original frontend `../../node_modules/.bin/tsgo -p tsconfig.json --noEmit --incremental false` exit0/10.077s, zero diagnostics and empty log. Previous14→0 without source fixes, confirming the remaining contextual errors were prerequisite cascades. Total unit143.442s; build log11,532B, no timeout/OOM. No Jest rerun:92/1 suites and836/2 assertions remain the latest union. No optional built-test image captured; runner was removed immediately, so R5f must rebuild providers from retained immutable image rather than assume generated outputs persist. Runner `cb58cc70dca8b034cc072b37851258447b14d1a25a3862d1e7d75898cd091e05` ownership verified, removal0/inspect1(no such object), cleanup inventory updated. All26,152 context regular files match original archive SHA `6d59650e1288c724204179f3595c6eff9c812a2fce8e954ae2205a4c5423f27c`. Receipts `frontremaining-{configs,image,container-created,container-latest,source-before,source-after,summary,cleanup}.json` and provider/typecheck logs. Only normal image-internal build generation; no manual source changes, installs, services, mounts, ports, external runtime network, Git writes or production access. Native PG/schema/seeded E2E/financial workflows still pending.

### R5f native PostgreSQL and actual post-bootstrap schema

Predeclared synthetic-only native fixture and independent fresh-default-DB schema proof; no production data, worker, E2E, source fixes or repeated93-suite union. Exact requested work-unit-commits read; cognitive-doc-design loaded. CodeGraph reported pinned context unindexed; read exact atomic fixture/Jest config and core datasource/entity names directly, without index initialization in temporary context. Artifact-helper patch syntax rejection occurred before file creation or Docker execution; corrected patch only, no runtime retry.

Normal six-provider Nx command (same projects/serial/skip-cache/no-cloud argv as frontend proof) exited0/125.910s offline. Mandatory local capture preceded all DB environment/secrets: tag `opencode-consolidated:c9c7a603-vmsdjm_w-tests-built`, ID `sha256:6cff81f7b2284cf45914f74c0c6e69ebe7fee06f972870c3a112b878fb5591dc`, explicit parent `sha256:d736e3407fee2f80bd98a1153c0d3eba16e975df1e8e0f5916ae4a675e5aa73c`, linux/amd64/revision labels verified. Docker diff retained; only normal build generation, no manual exports/source patches. Image env checked free of fixture URL/APP_SECRET; local image commit, not Git commit or registry publication. Builder removed before fixtures.

**Native result: PASS.** `node node_modules/jest-cli/bin/jest.js --config packages/twenty-server/test/atomic-update/jest.config.mjs --runInBand --ci --json --outputFile /tmp/native-pg-results.json` exited0/10.071s:1/0 suites,18/0 tests, zero pending. Exact config selects the sole `conditional-update.pg-spec.ts`; no selection override/skips/snapshot updates. Actual tests cover guard rotation/CAS, real competing-connection lock waits and predicate recheck, SQL-RLS hidden/missing/stale uniform conflicts, nonsuperuser/NOBYPASSRLS, explicit/intersection application roles, latest locked-row RLS gates, UPDATE RETURNING event after-image ownership, rollback/commit failure, legacy writes, caller-owned transaction rejection and response-loss read reconciliation. Passing ABA/non-rotating-writer case demonstrates a limitation: unique guard rotation remains caller-owned. Metadata/event transport synthetic, real parser/runners/manager/repository/SQL paths. Not financial production-workflow proof.

PG16.15 used exact retained amd64 fixture ID on a new owned internal-only bridge, trust authentication confined to disposable network/no published ports. Test runner shared only that PG container's network namespace, explicit fixture-required `127.0.0.1:5432/workflow_atomic_test`; no ambient URL. Fresh catalog counts0/0 before tests; post-test nonce schemas/roles0/0. Test runner removed before independent app phase. Builder/test4CPU/8GiB/1024PIDs/dropALL/no-new-privileges; PG2CPU/2GiB/256PIDs/2GiB tmpfs. No binds, host repo/home/socket or unrelated services.

**Schema result: PASS, not merely health.** Created separate empty `default` DB in the same owned PG; exact production image866b/normal entrypoint ran once with owned Redis8.10.3, synthetic mode0600 env, migrations enabled/cron disabled/logic functions disabled, no worker. App4CPU/6GiB; Redis1CPU/512MiB/maxmemory256mb-noeviction. Start20:07:58.669716Z; pre-migration missing core tables20:08:17–18 and caught fallback/warnings precede migration success20:08:42.544775959Z; PID1 success20:08:49.304578919Z. Timestamp-sorted stdout/stderr shows no later error/warning. Same source-classified tolerated bootstrap as R5c, not original-production-cause evidence.

Docker first successful health ended20:08:54.296381456Z; combined healthy/HTTP200 observed20:08:55.541387Z (56.872s). Actual SQL completed20:08:55.998430Z, then21.171s stable: SELECT1; `to_regclass` confirms `core."keyValuePair"`, `core."appToken"`, `core."upgradeMigration"`, `core."workspace"` and datasource-declared `core._typeorm_migrations`. Counts respectively0/0/116/0; legacy ledger182. Ledger lexical min/max names retained, not chronological version claims. No post-health DDL/repair/seed. This closes SQL-readiness hole, not Apple workspace/browser coverage or existing-DB upgrade proof.

**Cleanup and retained failure:** original checker wrongly required container-style `No such` for network absence. Network rm succeeded; follow-up exact-ID inspect exited1/stdout[]/`network <exact-ID> not found`, resolving checker-only failure without service rerun. Original PARTIAL receipt preserved as `native-pg-receipt-original.json`; final receipt retains instrumentation finding and absence proof, no ignored source/core failures. All five owned containers and exact network removed/absence verified; no volumes created; PG tmpfs discarded. Original unit273.901s. Built-test, production, prior dependency and fixture images retained; no pulls/prune/publication. All26,152 context files/archive hash unchanged, zero changed/added/missing paths. Checkout remains only preexisting task modification plus `.atl/`; no staging/commits/source edits.

Receipts under R: `native-runner.py`; `evidence/native-pg-{receipt,receipt-original,built-image,tests,fixture-cleanup,network-absence}.json`; `native-pg-{providers,builder-diff,tests}.log`; stage-aware container metadata; `schema-{tables,counts,fresh-catalog,health-timeline,log-analysis}.json`; timestamp-sorted app/PG/Redis logs. Cleanup inventory updated. Latest regression union remains92/1 suites,836/2 assertions; all three typechecks passed. Two genuine theme-guard assertion failures and unimplemented three-file proposal remain; seeded Apple E2E/financial workflows still pending. R5 overall stays PARTIAL; no production-readiness claim.

## Historical recovery: objective, accepted work and unresolved evidence

Original question: why candidate `2e0e891db44cc075c26ca00f73bb6c054c4dae10` failed readiness while Fabian's `2c449260b87aef0dc90e4eb8cd6ceca0fa02149f` passed. Failed deployment `42549926656` expected config `sha256:51fccaa93ef5f9503f8faaf9ec20e9ce04e48cd840bdd74d8e16a4262eda9b42`, linux/amd64. Image transferred directly, not registry-published; anonymous lookup returned MANIFEST_UNKNOWN, no retained image artifact/local copy. Diagnostic `42831470355` found old app healthy/worker created; candidate HTTP had passed shortly before Docker unhealthy blocked worker activation. Original candidate exception and present production health are unknown.

User authorized image-only inspection/recipient-encrypted transfer through reviewed existing Actions credentials and native gates, not production services/database/volumes/configuration/migrations/deployment. Public repository means no plaintext image artifact; private recipient key stays local. No direct/ambient SSH, guard relaxation, tag-only copy, alternate image or export-first fallback. R2 remains stopped; R5 does not grant another export.

### Accepted chronology and exact publication proof

| Work unit / run | Accepted outcome |
| --- | --- |
| R1 work-unit `3b54d41`, tree `8385939975e91b51e394a063ddb87e92875fbdb7` | Original 29-test independently accepted closure, AST/YAML/actionlint 1.7.12/whitespace; corrected provenance binding and zero-size directory validation. |
| PR63 correction `5303760890d2f3787d72b69ee86a107e523fec89`, tree `0a05148b5bb497ab1567cb2c0f049c88a84dce36` | Independent 33 tests 4.061s; parent rerun 5.325s; portable TMPDIR, sparse/PAX rejection and actual EXPORT fake-shell regression sensitivity. |
| PR63 merge `b8a0ca362f8729342348d71c5f0a1298b62213cb` | 2026-11-10 16:24:18Z, reviewed head `bba66c178d6c12ad383bac5ac5980476c6d806c2`, parent c9a586b7. Four new files/1243 lines under explicit user's ONE-PR `exception-ok`; no code-golf or inherited exception for R4. CIUtils `42852126089` actual Danger PASS; Contributor `42852360613` PASS. |
| Exact two external CD cancellations | User authorized only `42843621818` and `42853344685`; both confirmed cancelled with deployment steps empty. No other cancellation/deploy authorization. |
| Sole recovery `42858552572` | Job `129978148152`, head b8; environment `22950075734` approved once. FIRST inspect returned `identity_mismatch`; zero second SSH, saves, artifacts, downloads/decryptions/archive validations/engine loads/starts. Local RSA-4096 recipient retained privately, untouched. |
| R4 source `60071656fef070a025ca30c309647d742ee272f8` | Independent 43-test/P2 closure plus parent's two focused presence cases; publication rerun 5.353s, updated actionlint 1.7.12/whitespace PASS. Four-path 375-line unit, no size exception. |
| PR65 checks | CIUtils `42864197172` attempt 1 hit five-minute cleanup timeout (301661ms), not Yarn/Danger/human cancel; authorized attempt 2 PASS, job `130004770353`, 3m56s, cleanup157346ms/cache37612ms, actual Danger no findings. Contributor `42864197564` and Copilot `42864221687` succeeded (COMMENTED, not approval). Extra Contributor `42864734515` attempt 1 action_required/zero jobs; human approved, attempt 2 PASS, job `130011413926`, 17:47:32Z. No bypass/head replacement. |
| PR65 merge c9c | 17:48:36Z, parent b8, reviewed head `dcb89bcf18f2cdf670b7179ff13017ff4d4b250d`; all merged blobs verified. No application-CD run observed. |
| Metadata `42869334170` | Attempt 1/job `130016063543`, workflow `413510117`, operation=diagnose/no certificate; exact c9c/source bound, environment approved once 17:52:34Z, query17:52:49–54Z. `recovery=metadata_only`, upload skipped/artifacts0/saves0. Not an export retry. |

| Merged path | PR63 blob | PR65 blob |
| --- | --- | --- |
| `.github/workflows/recover-odelza-candidate-image.yaml` | `1341ba79ea1c1b100bf6490f2750e292f7ee1a19` | `231625ef960631d2ef81e4cadfe9ed5e6ad0b6e9` |
| `scripts/odelza-candidate-image-recover.py` | `96b5bb8f1ed72e47b6490894a551de51408c2731` | `c4c3da089f1b9711b6889004ff9ab6c6809bbabf` |
| `scripts/ci/test_odelza_candidate_image_recover.py` | `f50e6be7b8de5dcf7d53bd67243572f6e8fe1914` | `2ea8c93d5b7d2ad9baae9fadf9e5af4aa5ac83ce` |
| Task at merge | `e09db1f1aaaa83f67c1d4abf2261224fed6b59d6` | `ca1bb7036e05d60704b485da19fcb8c5910a9c01` |

Original job128942982820 bound checkout2e0 at2026-11-09T12:57:02.5182604Z, expected image13:05:16.0159293Z/tag13:05:16.0159982Z, target twenty/linux-amd64. No secret mounts/build args/env forwarding; SSH/save material created later outside context. Public examples are neither private config nor universal secret-absence proof. Ordinary provenance suffices; no extra signed-attestation prerequisite. Fixed tuple still denies mismatches before SSH.

### Recovery safety and regression coverage retained

Manual-only reviewed-SHA workflow retains repository/main/event guards, contents-read, native production protection/shared non-cancelling concurrency. Existing producer workflows unchanged; reviewed official action pins remain in merged source.

Recovery permits fixed metadata and repeated-guard immutable-ID save only, strict isolated SSH/known-hosts, no arbitrary selectors or credential forwarding. Canonical RSA3072–8192 recipient certificate, never private key. CMS AES256 streaming is BER/confidentiality, not archive authenticity; plaintext stays in pipes, exact ciphertext-only one-day artifact. Bounds: metadata32KiB/15s, export600s, remote inspect10s/save580s+grace, archive8GiB/ciphertext+64MiB, floor10GiB/job20min. Reap owned children/delete failed ciphertext/no retry.

Read-only validation never extracts/loads: verify config/platform/layer digests, safe complete USTAR payload, zero-size directories; deny sparse/PAX/extensions/links/devices/extra/truncated content. Supported legacy/uncompressed OCI only; unsupported layouts stop. Darwin exited-leader EPERM handling still rejects live-child cleanup denial.

Meaningful RED/GREEN covered identity denial, fixed provenance, DIRTYPE512-byte unreferenced payload (3 tests/8 denial subcases), GNU-S/PAX preflight and portable TMPDIR. Actual shell/fake Docker/timeout/local OpenSSL proves save1 on match/0 on mismatch; memory-only guard removal caused3 expected failures. Independent gate fulfilled; RDD off/native high-risk assessment unavailable, not fabricated approval. These unit tests used no real production access.

Command `PYTHONDONTWRITEBYTECODE=1 python3 -B -W error::ResourceWarning scripts/ci/test_odelza_candidate_image_recover.py`: R1 final33 retains29, R4 final43 retains41/33. R4 P2 RED wrongly found malformed objects; correction requires valid SHA/platform/Size/RepoTags before found, otherwise unavailable/null. Optional descriptor cannot establish presence; different valid digest stays found/false. Privacy/limits/fixed six-command shell/protected EXPORT comparisons and updated actionlint passed historically, not rerun here.

### Why original recovery is still blocked

Metadata found the fixed tag, linux/amd64/size-bound/tag membership true, but inspect ID did not match expected config; descriptor type was OCI manifest. Full tag ID/descriptor digest was partially GitHub-masked and cannot be invented. Expected-config selector was **unavailable**, not proven absent. Client/server Docker29.5.2 and containerdSnapshotter=true explain why inspect ID semantics may differ: containerd `target.Digest.String()` is manifest/index, classic `img.ID().String()` is config. Store marker/mismatch do not prove wrong content or original app failure. Selected-manifest config identity remains unknown. Any renewed forensic path needs supported read-only config-digest evidence, reviewed workflow/native gates and explicit scope; never weaken export guards.

## Handoff, rollback and mirror

R6 supersedes the historical documentation-only authorization. Rollback boundary is the two inline theme maps, the theme guard/regressions, and this task record; no SDK ABI, backend or workflow change. Independent review is fulfilled; native HIGH assessment remains unassessable. Local work-unit commit is authorized, not remote publication. RDD is OFF; no lifecycle operation is requested.

Next: record the accepted R6 source commit, then separately assigned R7 seeded Apple E2E using the final committed HEAD (including passive documentation checkpoint), not unmerged main. Source-unit SHA identifies runtime changes; final HEAD/tree pins the build candidate. The read-only plan is complete; bookkeeping launches no services. Empty-DB SQL passed, but populated upgrade/browser/financial workflow proof remains open. No production-readiness claim, export retry, main drift or prune. Preserve old recovery checkpoint `9c3a1bb109fdce2e7d247a82dd25c4e57c76356c`.

Engram10812 (`odd/production-image-startup-reproduction/tasks`) is the single current full mirror after readback, below50k. Engram10917 is archived prior R5c continuation, not active mirror content; prior versions/history retained. Measured compile595s/startup observation83s/dependency image131s are separate outcomes, not whole-validation acceptance or measured peak usage.
