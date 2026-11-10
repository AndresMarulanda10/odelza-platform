# Validate consolidated candidate locally; retain historical diagnosis

The current candidate is committed HEAD `8826dce7bbb156dc2c8b78b0a4f1ad252af6bbb8`, tree `e07a0032da04a5a8b15beaa6f09616b9339e1aba`, based on consolidated main `c9c7a603e0bfbbd7dae73f17888acbc4d7f0c030` plus the accepted three-file theme correction. R6 focused verification and R7 two-test smoke PASS. One broader active Chrome run is PARTIAL: 8 passed/2 return-to-path failures, retries0. Shared-storage source visibility is now proven; execution remains disabled. No populated-upgrade/financial-workflow/full-suite acceptance; original production exception UNKNOWN.

## Decision, authorization and boundaries

- User's “todo debe de estar consolidado” supersedes old-image recovery as the primary path, not as completed recovery. Parent verified ancestry: Uribe PR55 `f7f9e23383326191f3fcea476d835b0154646a9e`, PR64 `c9a586b7d3b0f5ba13ef54272faa96179bab603c`, generic PR58 `2e0e891db44cc075c26ca00f73bb6c054c4dae10`, diagnostic PR65/c9c. Do not follow newer main without reassessment.
- User answered “Si, dale” to the three-file theme correction and E2E **without production deployment**, then “Un PR con excepción”: one new UI-correction PR, `exception-ok`, originally672 lines (374 source/test +298 docs), prior checkpoint673 (466 additions/207 deletions). Current compact R7 bookkeeping yields631 changed lines across four files against c9c (425 additions/206 deletions), including the same374 source/test lines; the exception remains the original UI unit, not new auth-PR permission. This is not inherited PR63 consent. Compaction removes repetitive operator journal for the full mirror, NOT to fit a PR budget or discard evidence.
- Branch `fix/consolidated-theme-compatibility`; source unit `328378be9f4dabfd8bcfd4958afb9a80e7f3baa7`, tree `f1bdeeb3af196c489c10a33759b63c0fddaf7b5b`; parent froze all three source blobs/modes after hooks. Passive documentation checkpoint produced pinned HEAD8826 above. Local task edits after that commit do not change the archived source pin.
- Earlier actor preparation was limited to images/offline probes; current broader local authorization is recorded under R7. No source fixes, staging/commits, agents, GitHub/Actions/push/PR/merge, producer changes, SSH, production credentials, SDK publication, emulator/global install/new builder/prune. No operations beyond the explicitly assigned disposable local fixture. Parent owns publication decisions.
- Preserve `.atl/`, diagnostic checkpoint `74246e5fb5e50a41a5383ddf4e1882c0d182d148`, older recovery checkpoint `9c3a1bb109fdce2e7d247a82dd25c4e57c76356c`, baseline context/archive/source.git and private recipient material. RDD OFF; independent review fulfilled; native HIGH assessment unavailable/unassessable, not fabricated approval.
- Exact work-unit-commits and cognitive-doc-design skills loaded; English artifacts. R5 diagnostic test-first exception was historical; R6 meaningful RED/GREEN applied. CodeGraph reported pinned baseline snapshot unindexed; no index initialized. Exact pinned source/config reads are authoritative.

## Acceptance checklist

- [x] **R1 — Recovery tooling:** independent33-test acceptance, bounded PR63 findings closed, merged bytes verified.
- [ ] **R2 — Exact original image recovery:** sole export attempt stopped at identity guard; zero saves/export/decrypt/validate/load. Superseded primary path, not complete.
- [ ] **R3 — Original candidate cold start:** never executed; superseded. Isolation requirements retained, not historical image identity.
- [x] **R4 — Metadata-only diagnosis:** independent43-test acceptance, PR65 merged, one metadata-only run. Selected config identity still unknown.
- [ ] **R5 — Consolidated functional validation:** final acceptance depends on R7 and pending workflow boundaries.
  - [x] R5a exact baseline archive/tree/platform prerequisites.
  - [x] R5b production compilation; cache reuse recorded, not fresh-all compilation.
  - [x] R5c disposable process startup/HTTP200, not schema/workspace correctness.
  - [x] R5d explicit immutable test dependency image.
  - [x] R5e focused regression/typechecks: historical partials superseded by final R6 independent93 suites/853 assertions and three native typechecks, all pass/zero diagnostics.
  - [x] R5f native PostgreSQL1 suite/18 tests, mocked2.21/MCP checks; synthetic metadata/event transport, not financial E2E.
  - [x] R5f actual post-bootstrap SELECT1/core tables/ledger182/upgrade116/workspace0; fresh DB only.
  - [x] Bounded Apple seeded login/setup + Person create/update smoke, compiled combined server and worker; original Apple-undefined assertion passes in this fresh fixture, not blanket historical/production recovery.
- [x] **R6 — Theme correction:** three files, narrow published ABI preservation, final independent acceptance and local source commit.
- [ ] **R7 — PARTIAL:** bounded seeded smoke setup+chrome2/2 PASS/retries0 after offline dotenv correction; broader Chrome has two actual failures and workflow/financial/populated-upgrade gaps remain.
  - [x] Broader active Chrome project executed once:10 actual tests,8 PASS/2 FAIL,0 retries/flaky/skipped; all six seeded source keys readable/hash-equal app/worker before queues.
  - [ ] Broader Chrome acceptance: both return-to-path cases failed; workflow execution disabled, inactive specs not activated. No additional source correction or rerun authorized here.

## Ownership, local endpoint and evidence

`R` (0700): `/private/var/folders/5q/j0cmnbmd3b54y_strvlmjngw0000gn/T/opencode/consolidated-c9c7a603-vmsdjm_w`.

All Docker commands use `/usr/local/bin/docker --host unix:///Users/andresmarulanda/.orbstack/run/docker.sock --config "$R/docker-empty"`, sanitized of ambient context/TLS/auth/SSH/private proxies/cloud/npm credentials. Existing OrbStack29.8.2 linux/arm64 VM15.66GiB/12CPU; no daemon changes. Public anonymous dependencies are permitted only for build/pull; runtime offline/internal-only, no host binds/socket/home/repository, published ports, hostIPC, extra privilege or production data. Retain exact owned images and shared content-addressed cache; never globally prune. Limits are not measured peak consumption.

Original `context/`, `source.git`, `source.tar`, fetch log, harnesses and `cleanup-inventory.json` remain retained. Evidence references below are relative to `R/evidence/` unless specified. `Dockerfile.validation` and new harness Dockerfiles live outside immutable source contexts. Exact-ID cleanup receipts, not broad cleanup, establish ownership/absence. No private RSA/certificate content is read or copied.

## R5 baseline identity and retained images

| Identity | Verified value |
| --- | --- |
| Baseline commit/tree | c9c above / `1b79838710378b8c4e6b58afeb4fe920c1c68f27` |
| Archive SHA256 | `6d59650e1288c724204179f3595c6eff9c812a2fce8e954ae2205a4c5423f27c` |
| Context | 26,152 tracked regular paths;272,663,788 bytes; path/type/symlink containment checked; repeated complete pre/post hashes unchanged |
| Manifest SHA256 | `1564d908fe3d370b6465103e48cf75a54a9dce41e21e838e749bc5cceaa47860` |
| Lock SHA256 | `f15b065d7644b879d94d248a2704f0558d1d69ff4e9b62b93987f18604a4e64b` |
| Production Dockerfile SHA256 | `d29004938dc6bfbfcb30d1921f88da18bdcd323d2766e7467fce6862a99e4693` |
| Production base | `node:24.18.0-alpine3.23@sha256:595398b0081eacda8e1c4c5b97b76cd1020e4d58a8ebcb4843b9bca1e79e7436` |
| Production image | `opencode-consolidated:c9c7a603-vmsdjm_w`; `sha256:866b7849ed21f619003a390b6af03a3335433530d20bcf4b805a8e78ba53eb63`;linux/amd64;1,126,793,621 bytes |
| Immutable test image | same tag prefix `-tests`; `sha256:d736e3407fee2f80bd98a1153c0d3eba16e975df1e8e0f5916ae4a675e5aa73c`;linux/amd64;8,343,682,519 bytes |
| Complete built-test image | same tag prefix `-tests-built`; `sha256:6cff81f7b2284cf45914f74c0c6e69ebe7fee06f972870c3a112b878fb5591dc`;explicit parent d736 above;linux/amd64 |

Anonymous depth-one acquisition excluded `.git`, `.atl`, untracked env/keys; public tracked examples remain, not universal secret-absence proof. Original archive/context remained unchanged through all accepted historical runs. R5a Node24.18/x64/linux offline probe passed and exact container removed (`probe.json`); initial free VM/host113,781,243,904/119,005,552,640 bytes exceeded30GiB. This proved execution, not browser capability or a different digest.

### Compilation and focused prerequisite history

Unchanged Dockerfile front/server/final builds exited0 in595.368s (415.012/169.075/11.049); SWC6,827 files, BuildKit/Nx cache reuse recorded, not fresh-all compilation. Explicit test-dependency Yarn4.13 --immutable install exited0/131.105s;4,463 packages, scripts disabled as source requires. Complete built image6cff captured before DB secrets with all six declared providers: shared/client-sdk/UI/emails/SDK/front-component-renderer.

Original93-file six-group manifest unchanged throughout. First focused run53/40 suites,564/2 assertions: missing generated providers plus two real theme assertions; types shared0/server13/front3973. Five-provider pass92/1 suites,836/2 assertions; renderer missing, front14 diagnostics. Completing declared renderer graph gave front native tsgo0/zero diagnostics without source fixes. No third union at that stage. R6 final independent93/853 and three typechecks supersede these partials, not browser coverage.

Retain check-{summary,analysis}, prereq-*, regression2-*, frontremaining-*, native-pg-built-image/providers/builder-diff receipts and all exact-ID cleanup. Historical harness syntax/transport errors and absence-parser case sensitivity were instrumentation failures, not application failures. No source coercion, skipped assertions, snapshot updates, fake exports or broad cleanup. Complete context hashes unchanged; full journal in Engram10812 history/10917.

### Process startup and actual native PostgreSQL/SQL proof

R5c initial instrumentation rejected empty CREATED endpoint fields before app start. Authorized lifecycle-aware guard repair reproduced RED;15 unsafe network/port/privilege/mount/resource/restart variants denied; `ownobserver.py --guard-test` passed. Original/repair guard receipts remain, not app failure.

R5c startup19:00:21.865181Z: first Dockerhealthy50.643s/manualHTTP20051.676s,7 stable samples,82.771s total; no OOM/restarts. Pre-migration missing tables were caught bootstrap events, not subsequent failures. HTTP/static references and186 upgrade steps/workspace0 did not prove schema. Retain runtime2/startup2/health2/http2 and guard-repair receipts.

R5f actual native test command: `node node_modules/jest-cli/bin/jest.js --config packages/twenty-server/test/atomic-update/jest.config.mjs --runInBand --ci --json --outputFile /tmp/native-pg-results.json`. Exit0/10.071s;1 suite/18 assertions/zero failures/pending; sole conditional-update.pg-spec selection unchanged. Tests cover real competing connections/lock wait/predicate recheck/CAS/guard rotation, SQL RLS hidden/missing/stale uniform conflict, nonsuperuser/NOBYPASSRLS, role intersection, locked-row authorization, after-image/event ownership, transaction rollback/commit failures, legacy writes, caller-owned transaction rejection and response-loss reconciliation. Metadata/event transport synthetic. ABA/nonrotating writer passing documents caller-owned guard-rotation limitation, not financial production coverage.

PG16.15/Redis8.10.3 retained immutable linux/amd64 fixture IDs/digests in `fixture-images.json`; Redis latest is not producer parity. Owned internal bridge, no ports/mounts/volumes/egress; PG trust confined to disposable network. Native runner shared PG namespace at127.0.0.1:5432/workflow_atomic_test, fresh catalog0/0 and post-test nonce schemas/roles0/0. Test removed before separate schema app. Limits PG2CPU/2GiB/256PIDs/2GiB tmpfs;Redis1CPU/512MiB/128PIDs/maxmemory256mb-noeviction;app4CPU/6GiB/512PIDs/dropALL/no-new-privileges;test4CPU/8GiB/1024PIDs. No worker.

Separate empty default DB/normal production image866b entrypoint: synthetic0600 env, migrations on/cron and logic functions off. Start20:07:58.669716Z; caught pre-migration missing tables20:08:17–18; migration success20:08:42.544775959Z; PID1 success20:08:49.304578919Z; Docker first healthy20:08:54.296381456Z; combined200/healthy56.872s. SQL20:08:55.998430Z then21.171s stable:SELECT1; actual `core."keyValuePair"`, `core."appToken"`, `core."upgradeMigration"`, `core."workspace"`, `core._typeorm_migrations` exist;counts0/0/116/0 and ledger182. No post-health repair/seed. Timestamp-sorted logs show no later error/warning. Empty DB proof only, no populated upgrades or Apple/browser correctness.

R5f273.901s: all five owned containers and network removed/absence verified, no volumes; tmpfs discarded, images retained. Original checker expected container-style `No such` for network absence; removal succeeded, exact inspect1/stdout[]/`network <ID> not found` resolved instrumentation only, no service rerun. Retain `native-pg-receipt-original.json` and final receipt, fixture-cleanup/network-absence, native tests/providers/diff logs, schema-{tables,counts,fresh-catalog,health-timeline,log-analysis}; full stage metadata/IDs in inventory. R5c three containers/network and initial unstarted PG/network likewise removed; archived10917 retains detailed chronology. No global prune.

## R6 — accepted theme compatibility correction

Only source paths: document-generator `packages/twenty-apps/examples/document-generator/src/front-components/generate-document-form.front-component.tsx`; Slack `packages/twenty-apps/public/twenty-slack/src/components/send-message-form.front-component.tsx`; UI guard `packages/twenty-ui/src/theme-constants/__tests__/noTwentyThemeLeftovers.test.ts`. Two inline maps retain suffixes, migrate21/25 tokens --t-→--odz-; Slack owned accessor renamed odelzaThemeCssVariables. Light/dark property-definition tests pass; SDK extraction remains inline. No palette, UI copy, SDK/export/version/dependency/backend/workflow change.

Call-recorder14/twenty-fireflies11 external files remain byte-identical. Standalone apps are excluded from root workspaces; manifest devDependency twenty-ui:^1.0.0-alpha.1, locks1.0.0-alpha.1; SDK locks2.19/2.18 respectively. Anonymous metadata/tarball SHA1/declarations prove published themeCssVariables ABI (`dist/theme-constants/index.d.ts:3`, declaration:1); no publication/install/execution. `sdk-abi-{metadata,declarations}.json` and `prereq-theme-analysis.json` preserve27 initial offenders.

Guard admits only exact named import from twenty-ui/theme-constants bound to an import-only symbol in the two verified consumers. No whole-file exclusion. Local declarations, nested shadows, duplicate same-scope merged symbols, object keys/strings, wrong-module/default/namespace imports and unsupported re-exports still fail. Raw legacy CSS fails even beside allowed import. All25 ABI consumers unchanged, not renamed to workspace-only accessor.

| Test-first boundary | Actual result |
| --- | --- |
| Original four UI |RED155/2 assertions;3/1 suites |
| Compatibility fixture RED |164/3;meaningful named-import failure |
| First implementation |170/1;actual manifest used devDependencies, classification corrected narrowly |
| Normalized UI |GREEN171/0;4/0 suites |
| Writer original union/types |93/0 suites,852/0 assertions;three types0/zero diagnostics;1.039/11.659/10.940s |
| Duplicate-symbol safety |RED171/1;TypeScript merges invalid import/local declaration symbol |
| Final hardening |GREEN172/0 UI assertions;4/0 suites;2.941s |
| Parent independent FINAL |93 suites/853 assertions ALL PASS;server34/304,front9/91,shared4/18,additional server12/61,additional front30/207,UI4/172;all three native tsgo0/zero diagnostics |

Final853 supersedes writer852, not a browser claim. Parent diff-check PASS, all writer/verifier containers removed. Source patch SHA256 `4982e77da29c3fbda2feab64f0b74098477f203c0ca48b10c863669c4cd0dce2`; `theme-fix-source-freeze.json` records modes/blobs. Built-image Node24.18/amd64 runner received only three public reviewed files with verified hashes; original image/context unchanged. Prettier stdin only allowed files, no host install. Original baseline26,152 files unchanged (`theme-fix-original-context.json`);25 ABI bytes match c9c (`theme-fix-preserved-imports.json`). Runner `ce04962bf057926f25807d4dd3000bd919ece323b9562349d5084902127783d8` removed0; original lowercase-no-such-object checker failure retained, final inspect1/emptyarray/exact absence verified without rerun. SWC nonfatal missing typescript.js.map did not suppress actual assertions. No snapshots changed.

Source-only374 changed lines261+/113-; source-unit/final HEAD above, staged tree/frozen modes verified after hooks. Rollback boundary exactly two maps, guard/regressions and this task, no SDK ABI/backend/workflow. Mandatory independent review fulfilled; publication held for parent E2E or further decision.

## R7 preparation and prerequisite history

Receipts remain under `R/candidate-8826dce7/`; detailed journal remains in Engram10812 history. This index preserves failures without repeating wall logs.

| Attempt / directory | Terminal result / retained evidence |
| --- | --- |
| Original preparation | Shell sh_1c77a38b4001GZmjTsBB3JhHh0 timeout1000ms/SIGTERM143 during archive, zero Docker calls. Partial source.tar222,300,160 bytes invalid; never reuse. interruption.json and summary10994 retained. |
| preparation-2 | Foreground423.561s production ready; browser selector failed before Chromium. Authorized selector-only continuation155.167s passed framework-default offline dataURI and installed-image probes; no production rebuild or architecture fallback. Earlier failure retained. |
| e2e-smoke | 92.089s; PG18.6 catalog0, init exit1/84.209s: EAI_AGAIN opencode-e2e-pg at seed-init.log:68. Missing network aliases proved by guard receipts. Cache/full seed/HTTP/worker/browser NOT RUN; tests0. Exact-owned cleanup passed. |
| e2e-smoke-alias2 | 76.943s; exact aliases/IP guards/native SELECT1/Redis PONG passed. Init/cache/full seed0/20.715,7.996,24.766s; Apple/Tim/ten Person fields/physical table/HTTP200 passed. Browser failed before discovery at config:10, generic dotenv error. Tests0; no repair/rerun. Exact-owned cleanup passed. |
| e2e-smoke-dotenv3 discovery | Offline EACCES proved copied0600 UID501:GID20 versus runnerUID0/dropALL. Recreated same bytes runner-owned0600; negative guards passed. Original partial reporter/parser receipt retained. Listing `2 did not run` is discovery ONLY, not execution. |

### Frozen prepared inputs

- Candidate archive SHA256 `69a7706c5c0b59689987190b6e114ca5b0e65c6b44c5407633027a24d2aed5d0`, context26,152 paths, every hash/mode unchanged. Baseline archive6d59650 and26,152 paths unchanged. No dirty-task copy or source patch in images.
- Production `opencode-candidate:8826dce7-vmsdjm_w-stage2`, image `sha256:fca959b05d250b302346b326055329b0dc60ca28047cbfbba7ac477065a44acd`, amd64/Node24.18/revision8826/treee07a labels. Frontb02d45a0/346.285s, servera3f23c20/1.004s, final1.441s; cache reused, not fresh-all compilation. Entrypoint/app/entrypoint.sh, Cmd node/dist/main.
- Browser `opencode-e2e:8826dce7-vmsdjm_w`, image `sha256:8eafdf4dfe5325b3a976bbb0068258c7fd5a723f5bbb124fc5f3f7bb40dbbd4f`, amd64/Node24.15/PW1.60.0/Chromium148.0.7778.96/revision1223. Fresh Yarn4.13 --immutable141.109s; no runtime downloads/provider build. Actual default browser dataURI/title/close passed. CIamd64 match is not full CI parity.
- MCR index9bd26ad9, amd64 manifest83192064c7510f7ee73dd63dc5f22a5e01a92c81a2e6a9c715d9e3fe55471fd9; descriptor bytes not measured transfer. Probe absence verified; images/cache retained.
- E2EPG18.6 config `sha256:8bca9649e52d948114ccc8164b55b7ab26b64e729893e420114bb5c87bf7c7cc`, digest `postgres@sha256:e3d24f6906d0760bf4da0dae872415391ededefad23fd471c47dc53b0ddf3c42`; PGDATA18/docker covered by tmpfs /var/lib/postgresql, no anonymous volume. NativePG16 proof separate. Redis8.10.3 retained. Historical run cleanup inventories retain all exact IDs; zero OOM/restarts/leftovers.
- Production NODE_ENV serves bundled dist/front by presence (app.module.ts:94); seed has no NODE_ENV guard. Normal compiled initialize/cache/full-dev-seed only, no SQL data writes. App namespace localhost3001 frontend/backend/LINK explicit. App writable-layer assets did NOT prove separate-worker persistence.

### Current authorized broader continuation

Parent authorizes ONE fresh full active Chrome project plus setup/retries0 with owned PG/Redis and shared synthetic named volume at public compose path. No source/test/assertion changes, Git/GH/production/SDK publication or external runtime access. Full offline listing is distinct from actual JSON execution. Before queues, exact seeded source keys must have matching app/worker hashes and UID profiles. Full fixture multiworkspace/signup flags derive from pinned CI/public configuration; driver parity separately evaluated, not silently enabled for green tests. Auth/traces stay private locally. Capture exact-owned cleanup including unattached owned volume removal. R5/finance/populated-upgrade remain open regardless of browser outcome.

### R7 dotenv-only operational correction — SMOKE PASS, bounded scope

Parent authorizes one offline-first correction in exclusive `R/candidate-8826dce7/e2e-smoke-dotenv3/`, preserving receipts. Network-none dotenv errno/ownership/negative guards and real config listing precede fresh services; repeat live-browser preflight before one installed-CLI smoke. No source/test/config patch, permission broadening, network relaxation or retry.

Offline diagnosis3.052s proved `EACCES/open`: copied `.env` exists/mode0600/UID501:GID20, actual runnerUID0:GID0/dropALL, correct cwd/package path. Recreated only owned fixture file as actual runnerUID0/mode0600; same host/body SHA256 `3be01d7e407bc19d60a9f4cca7d41fed66c498b2b192c38e8b46179e14a0d913`, parser seven expected keys/errno null. Wrongcwd, missingkey/file, unreadable and production-host cases rejected. Config listing exit0/source CI github reporter says `2 did not run`; setup dependency and two source test names confirmed. Original receipt-parser false negative expected list-reporter filenames; retained original receipt, corrected metadata only, NO CLI/container rerun. Offline CID `80e5526108872fb9d492b585e5551029072e85d49c4430e604a6fd2213743c3d` removed before any DB network/services.

Fresh actual run23:00:59.725–23:02:46.710Z/106.985s retained exact alias/IP/native PG+Redis preflight. Compiled init/cache/full seed exit0/21.078s,0/7.695s,0/25.805s. PG18.6, appNode24.18/production/bundled frontend, browserNode24.15/PW1.60/Chromium148.0.7778.96/revision1223, existing images unchanged/no pulls/builds. Apple ACTIVE/apple/same20202020 ID, Tim membership1, same physical schema/person table1 and all ten required fields PASS; root200/Odelza/Dockerhealthy/client-config localhost/password+prefilltrue/multiworkspace+billingfalse PASS. Live browser repeats runner-owned0600/hash/parser/negative guards and config listing before real execution.

Actual command (cwd `/app/packages/twenty-e2e-testing`, explicitCItrue/LINKhttp://localhost:3001): `node /app/node_modules/@playwright/test/cli.js test tests/create-record.spec.ts --project=chrome --workers=1 --retries=0`. Exit0/30.285s; Playwright reports29.3s, **2 executed/2 passed/0 failed/0 retries**: setup `Login test`, chrome `Create and update record`. Unchanged login assertions prove Tim email, Apple displayName/subdomain, metadata workspace URL origin and final page origin match localhost3001. Existing FindOnePerson GraphQL assertions prove saved first/last name, random email,intro,LinkedIn URL,phone,workPreference. No skipped dependencies/assertions/snapshot updates/test or source patches; listing is not counted as execution. Auth/screenshots local0700/0600 only.

Worker processed owned synthetic event/timeline/trigger jobs, but two background workflow code-step errors occurred23:02:40.052/42.727Z: `LogicFunctionException: Source file not found`, codeLOGIC_FUNCTION_NOT_FOUND, `LogicFunctionFromSourceService.buildOneFromSource(...logic-function-from-source.service.js:213)`→CodeStepBuildService→RunWorkflowJob. Preserve `worker-runtime.log:1054–1085`; no fix/retry or broad workflow pass. App logs eight WARN lines: four two-workspace/single-workspace Apple-fallback warnings paired with undefined; full seed itself zero WARN/ERROR. Same-app seed asset persistence does not prove separate worker local-storage completeness. UI smoke PASS is not acceptance of these workflows, finance, full E2E or populated upgrades; R5 stays open.

All exact IDs absent in dotenv3 `cleanup-inventory.json` (native probe removed before app; browser/worker/app/Redis/PG/network removed). No OOM/restarts/volumes/leftovers/prune; images/cache/old evidence retained. Authoritative evidence: offline/live dotenv metadata+guards+list, native preflight, seed/SQL/HTTP/client-config, `actual-smoke-summary.json`, playwright/runtime logs, private auth/screenshots, cleanup/source/final-integrity. Candidate26152 hashes/modes/archive69a7706 and baseline26152 bytes/normalized modes/archive6d59650 unchanged; HEAD/tree/three frozen blobs unchanged, task-only dirty/.atl preserved. No Git/GH/production operations.

### R7 full active Chrome + shared storage — PARTIAL, terminal

One fresh actual run in `R/candidate-8826dce7/e2e-full-shared/`, 2026-11-10 23:25:45.750–23:31:06.486Z,320.736s before cleanup. Parent authorized normal disposable fixture configuration plus ONE full project run, not repeat-until-green. Task journal compacted below30KB BEFORE operations; this terminal evidence adds no source/Git changes. Earlier smoke/failure receipts remain untouched.

**Fixture contract:** pinned `.env.e2e-testing-server` enables multiworkspace and unrestricted workspace creation; both used here. SERVER_URL/FRONTEND_URL remain localhost3001; browser FRONTEND_BASE_URL/LINK use apple.localhost3001 so unchanged login.setup origin equals Apple's metadata URL. Backend client-config URL stays localhost3001. Chromium localhost subdomains resolve in the app's shared namespace, no host ports/proxy/host networking. EMAIL_DRIVER=LOGGER, billing/OAuth disabled, cron/migrations disabled after normal CLI initialization. Unlike CI development default LOCAL, LOGIC_FUNCTION_TYPE stays DISABLED: inspected LocalLayerManager calls copyYarnEngineAndBuildDependencies/Yarn production focus at runtime, incompatible with no runtime dependency acquisition. This explicit driver-parity limit is not full CI equivalence and was not changed midrun.

**Offline evidence:** first network-none probe0.689s stopped before listing because harness assumed nonexistent installed reporter source path; retained `offline-result-reporter-path-original.json`, exact CID510748a8 absent. Documented JSON reporter + installed CLI1.60.0 then passed3.569s; CIDfd9ad418 absent before services. Real full `--list --project=chrome --workers=1 --retries=0 --reporter=json` discovered10, executed0. Live runner repeated dotenv0600/UID0/hash049a4944/parse-seven-keys/negative guards and10-test discovery. Listing-only JSON never counted as executed tests. No source/config patch, installs, rebuilds or pulls.

**Seed/readiness:** exact owned PG/Redis aliases and endpoint-IP guards passed, native DNS→ownedIPs/PG SELECT1/default/postgres/catalog0 and Redis PONG passed. PG18.6 uses root tmpfs/no anonymous volume. Normal compiled init/cache/full seed exited0 in22.463/9.125/28.854s. Apple ACTIVE, Tim undeleted Apple membership1, physical Person table1 and all ten required field names passed; root200/Odelza/Dockerhealthy and client-config localhost/multiworkspace/password/prefilltrue/billingfalse passed. No SQL fixture writes/bypass. App24.18/browser24.15/PW1.60/Chromium148.0.7778.96/revision1223 and pinned image labels unchanged.

**Storage proof before consuming queues:** public compose server/worker both mount the same path; now ONE fresh labelled synthetic volume `opencode-e2e-vmsdjm_w-3f8e28178136-storage` mounts RW only on app/worker at `/app/packages/twenty-server/.local-storage`, explicitly STORAGE_LOCAL_PATH. CreatedAt/name/labels/driver/no options/no users captured before attach. Image copy-up yielded UID/GID1000:1000,0755,empty directory in both roles. Actual app write/worker read/remove probe hash matched; no permission relaxation or host bind. Worker initially ran only an inert gate, not queue consumer. Read-only metadata query derived ALL6 source keys (Apple3/Ycomb3) using workspaceId/applicationUniversalIdentifier/FileFolder.Source/sourceHandlerPath; both UID1000 roles read nonempty1011/336/1098-byte sources with identical per-key SHA256 before release. `seeded-source-{app,worker}.json` is the preserved pre-processing source hash manifest, not a post-run entire-volume snapshot. No source bodies exported. Previous missing-share topology is proven; exact causation of deleted earlier layers cannot be reconstructed.

**Actual execution:** cwd `/app/packages/twenty-e2e-testing`; direct installed CLI `node /app/node_modules/@playwright/test/cli.js test --project=chrome --workers=1 --retries=0 --reporter=line,json`, JSON output `/tmp/full-actual-report.json`. No spec/grep selection, dependency suppression, max-failures override, assertion edits or snapshot updates. CLI exit1/231.714s; Playwright230.705s. Setup1/1 PASS; Chrome7/9 PASS; total10 executed/8 expected/2 unexpected/0 skipped/0 flaky/0 retries, one attempt each. `playwright-actual-report.json` and `actual-full-summary.json` are authoritative; original result.json stale message “Existing smoke failed” only labels the full-run exit1 and does not describe its scope. Original summary arrays empty because custom emoji reporter was replaced; machine JSON gives actual results.

| Project / existing test | Actual status / seconds |
| --- | --- |
| setup — Login test | PASS11.059 |
| chrome — New workspace automatic onboarding | PASS30.913 |
| chrome — Return-to-path deep link | TIMED OUT60.269 |
| chrome — Return-to-path query parameters | FAIL41.372 |
| chrome — Sign up with invite link via email | PASS25.140 |
| chrome — Create Industry Select Field | PASS10.045 |
| chrome — Create Kanban View | PASS10.785 |
| chrome — Widget create/edit/duplicate/partial/denied states | PASS8.999 |
| chrome — Create and update record | PASS15.666 |
| chrome — Create workflow | PASS10.303 |

**First actual failure:** `authentication/return-to-path.spec.ts:44`, login helper:15 → `lib/pom/loginPage.ts:108`, waits for exact button Continue until60s. Protected DOM snapshot shows Apple password-stage form with Sign in, no Continue. Second case:81 fails waitForURL at:104 after30s expecting settings/accounts with original query; final DOM is authenticated Apple Companies, not target settings. Traces preserve original paths, /welcome redirect and network metadata; observed metadata200 responses are not proof every GraphQL operation succeeded. Exact source/root cause not established; no test/source change or repeat. These are actual broader test failures, not the historical dotenv/DNS prerequisite errors. Setup's Apple assertions pass only this fresh fixture; do not claim original CI/production Apple-undefined causally fixed.

**Worker:**344 processed-job log records (215 metadata-webhook dispatch,29 general-webhook dispatch,20 event-log,20 timeline,29 DB trigger,12 calendar,11 messaging,2 workflow trigger,2 enqueue,2 workflow status,2 navigation cleanup). Two RunWorkflowJob starts hit `LOGIC_FUNCTION_DISABLED` at23:30:48.251/51.860Z (`worker-runtime.log:1271–1299`, DisabledDriver.transpile). Zero missing-source mentions/codes; no warning/error-severity log lines does NOT erase these caught exceptions. Sharing established source lookup then reached disabled transpilation, not successful workflow execution. Workflow creation alone is not run/visualizer/use-as-draft coverage; those specs remain commented/inactive, other browser projects inactive. Finance/populated upgrades/full acceptance remain OPEN.

**Cleanup/integrity:** own browser→worker→app→Redis→PG removed; native probe already removed. Exact container prefixes1ff7f1dd/a94aeb25/4cd4d7d8/edd270e5/c973fc4a/9f2cb6dd, network3a699282 all absent by exact-ID inspect. Owned volume had no attached users, matching labels/name, removed0 then exact inspect absence. All runtime states zero OOM/restarts. `cleanup-inventory.json` original legacy volumesCreated[] field is stale metadata; its explicit volume removal object, volume-created.json and volume-before-remove.json establish actual creation/removal, not “no volume”. No global prune/unknown cleanup. Candidate+baseline26,152 path hashes/modes and archives69a7706/6d59650 unchanged; HEAD8826/treee07a/three frozen source blobs unchanged, only this task dirty/.atl preserved. No production/GH/Git writes/new agents/SDK/integration credentials.

Private0700/0600 artifacts include two failure trace ZIPs/screenshots/auth, `failure-trace-metadata.json`, seed/SQL/HTTP/dotenv evidence, per-role guards, shared storage/source manifests, worker-outcome-analysis, runtime-states-summary, final-owned-absence, final-integrity and evidence-manifest. No public uploads. Offline guessed-path error and audit's initial baseline-manifest-shape error were instrumentation only; no service/test rerun. Core app source changes by this actor: NONE. Next step belongs to parent: assess two failures and disabled-driver coverage, no inferred authorization for more fixes/runs.

### Read-only return-path findings and pending consent

Independent observer `ses_e382589e…` inspected retained traces and pinned source only; no new execution or source changes. Deep-link case `return-to-path.spec.ts:44`, helper:11–16 and `loginPage.ts:99–108`: trace call123 supports a UI/helper race. While Continue with email waits for stability, `SignInUpWorkspaceScopeFormEffect:81–92` advances Init to Email for the password-only workspace. The pending click then advances Password; the helper requests Continue again rather than submitting the password. Prefill alone is not the auto-advance cause. A state-step-aware helper must preserve credentials and destination assertions; no fix has been implemented.

Query case:81/:104 starts at `/settings/accounts?tab=emails&filter=unread`, redirects through `/welcome`, signs in successfully, then reaches Companies BEFORE the generic Apple-text click; that click did not cause the initial default navigation. The path/query is valid. `ReturnToPathPageChangeEffect` captures path/query/hash; `useReturnToPath` stores an in-memory atom; `usePageChangeEffectNavigateLocation` uses stored/query destination or home; `PageChangeEffect` consumes matching destinations. Trace evidence cannot show atom/effect execution: capture loss, premature consumption or later overwrite remains UNKNOWN. HTTP200 metadata alone does not rule out GraphQL errors. No application patch is justified without causal capture/resolve/consume evidence; preserve relative-path/origin validation, authentication/onboarding exclusions and no-open-redirect guarantees.

Auth application/E2E bytes are unchanged between c9c and8826; this proves byte identity, NOT a behavioral baseline, a preexisting bug, theme causation or test flakiness. Possible future helper paths are `packages/twenty-e2e-testing/tests/authentication/return-to-path.spec.ts` and `packages/twenty-e2e-testing/lib/pom/loginPage.ts`; diagnostic/security tests and application paths require explicit parent mapping after approval. **New auth/helper scope consent is PENDING.** Parent will ask to extend scope for the helper and return-path diagnosis; any application fix is conditional on causal confirmation AND explicit permission. Alternatively deliver the original three-file theme unit with both failures documented. The original one-UI-PR exception does not automatically cover a new auth unit. No R8 authorization, new fixes or production deployment is implied.

This bookkeeping unit authorizes only this task document, its full Engram mirror and a local Conventional Commit checkpoint; it supersedes the earlier actor's no-Git-write restriction only for that recoverability boundary. Runtime/tests are N/A for documentation-only changes; rollback removes only this checkpoint's task-document changes, not the frozen source unit or retained evidence. Image/test pin8826 remains the tested code; later documentation-only HEADs are not new tested application candidates. Overall feature and R7 remain PARTIAL; production readiness is not established.

### Earlier plan

Historical PR64 `login.setup.ts:46` Apple-undefined motivated full normal seeding, not SQL bypass. Explicit LINK avoids screenshot.ts localhost fallback. Compiled production NODE_ENV/bundled frontend is verified locally, not retrospective incident diagnosis; fixture env never entered retained images.

## Historical recovery — retained provenance, not current root cause

Original failure candidate2e0 (above) versus Fabian `2c449260b87aef0dc90e4eb8cd6ceca0fa02149f`; deployment `42549926656`, expected config `sha256:51fccaa93ef5f9503f8faaf9ec20e9ce04e48cd840bdd74d8e16a4262eda9b42`, linux/amd64. Direct transfer/no registry publication; anonymous MANIFEST_UNKNOWN/no retained artifact/local image. Diagnostic `42831470355`: old app healthy, worker created; candidate HTTP passed shortly before Docker unhealthy blocked worker. Original exception and present production health unknown.

Historical authorization image-only metadata/encrypted transfer via reviewed existing Actions/native production gates, not services/DB/volumes/config/migrations/deployment. Public repository: ciphertext only/private recipient local. No direct ambient SSH, alternate selectors/image/tag-only export/guard relaxation. R5/R7 authorize NO export retry.

| Unit/run | Accepted historical outcome |
| --- | --- |
| R1 `3b54d41`,tree8385939975e91b51e394a063ddb87e92875fbdb7 |29 tests,AST/YAML/actionlint1.7.12/whitespace;provenance and zero-size dirs corrected |
| PR63 correction5303760890d2f3787d72b69ee86a107e523fec89,tree0a05148b5bb497ab1567cb2c0f049c88a84dce36 |33 independent tests4.061s,parent5.325s;portable TMPDIR/sparse-PAX denial/actual fake-shell EXPORT sensitivity |
| PR63 mergeb8a0ca362f8729342348d71c5f0a1298b62213cb |2026-11-10 16:24:18Z;reviewed bba66c178d6c12ad383bac5ac5980476c6d806c2,parentc9a;four new files1243 lines under that user's ONE-PR exception. CIUtils42852126089 Danger PASS;Contributor42852360613 PASS |
| Exact cancellations42843621818/42853344685 |Only these user-authorized runs cancelled,deployment steps empty;no other deployment/cancellation consent |
| Sole recovery42858552572/job129978148152 |Headb8,environment22950075734 approved once;FIRST identity_mismatch,zero secondSSH/save/artifact/download/decrypt/validate/load/start;RSA4096 private recipient untouched |
| R4 source60071656fef070a025ca30c309647d742ee272f8 |43 independent tests/P2 plus two parent presence cases;publication5.353s/actionlint/whitespace PASS;four paths375 lines,no exception |
| PR65 CIUtils42864197172 |Attempt1 cleanup301661ms timeout,not Yarn/human cancel;authorized attempt2 PASS job130004770353,3m56s,cleanup157346/cache37612ms,Danger clean |
| Other PR65 gates |Contributor42864197564/Copilot42864221687 succeeded(COMMENTED not approval);extra Contributor42864734515 attempt1 action_required/zero jobs,human approved attempt2 PASS job130011413926 at17:47:32Z |
| PR65 mergec9c |17:48:36Z,parentb8,reviewed dcb89bcf18f2cdf670b7179ff13017ff4d4b250d;merged blobs verified,no application CD observed |
| Metadata42869334170 |Attempt1/job130016063543/workflow413510117,exactc9c,diagnose/no certificate;one environment approval17:52:34Z/query17:52:49–54Z;metadata_only,upload skipped/artifacts0/saves0;not export retry |

Original job128942982820 bound checkout2e0 at2026-11-09 12:57:02.5182604Z, config13:05:16.0159293Z/tag13:05:16.0159982Z,twenty/amd64. No secret build mounts/args/env forwarding. Reviewed manual-only workflow kept repository/main/event guards, native production protection/noncancelling concurrency, immutable-ID checks, isolated SSH/known-hosts and ciphertext-only CMS transfer. Bounds metadata32KiB/export600s/archive8GiB, no retry. Validator does not extract/load; strict complete USTAR/config/layer/platform checks deny sparse/PAX/extensions/links/devices/truncation. R1final33/R4final43 independent tests preserve fake-shell save1 match/save0 mismatch and guard-removal sensitivity. No production access in tests, not rerun here.

Metadata found fixed tag/linux-amd64/size/tag-membership true but inspectID mismatch and OCI-manifest descriptor. Masked bytes not invented. Expected-config selector UNAVAILABLE, not absent. Docker29.5.2/containerd store semantics can expose manifest/index rather than config; this proves neither wrong bytes nor original app failure. Selected config remains unknown; any renewed forensics needs separate authorization/review/native gates, never weakened export guards. Full technical provenance/limits remain in prior Engram10812 versions and retained receipts.

## Mirror and handoff

One current full mirror: Engram10812, topic `odd/production-image-startup-reproduction/tasks`, Locator `odd/tasks/production-image-startup-reproduction.md`, project odelza-platform. Read back after updates. Prior detailed versions and archived10917 preserve superseded journal; summary10994 preserves first R7 interruption. Compact current narrative retains completed proofs/failures/IDs and pending limitations; receipts remain authoritative for complete argv/logs/metadata. No unknown session ID is invented. Source8826 remains fixed despite passive document edits. Next actor receives only actual prepared-image results, never a blanket production-ready/all-tests claim.
