# Task Timeline design audit

Scope: the existing task timeline, its planned native saved view, and its embedding in the View widget. Preserve the application's existing visual system; marketing-site PRODUCT.md/DESIGN.md are not visual authority for this surface.

## Baseline evidence

Baseline commit: `be0c339f45928957843ab9abf161b5b4020fcc9d`.
The existing component/data/cache suites passed: 3 suites, 95 tests. Evidence is code and JSDOM behavior, not rendered-browser geometry or measured contrast.

| Dimension | Observed baseline | Follow-up evidence required |
| --- | --- | --- |
| Visual consistency | Component uses application theme tokens for type, spacing, borders and notices. Bar color is configurable with a validated fallback. | Compare full-page and embedded renders in light/dark themes. |
| Readability and sizing | Sticky labels/header, shrinkable height chain, two-axis overflow, and a short-container header fallback are present and tested. | Inspect long labels and dense dated records at desktop and narrow dashboard sizes. |
| States | Loading, forbidden, error/retry, empty, partial and invalid date-mapping states are implemented. | Verify these states remain meaningful in a native view, not only a widget. |
| Keyboard | Record opening supports Enter/Space; focused calendar supports arrow-key scrolling. | Test visible focus and an effective keyboard alternative for date editing. |
| Touch | Drag/resize/pan handlers use mouse events. Task chips set `touch-action: none`. | Exercise synthesized touch; do not infer touch support from a narrow viewport. |
| Accessibility | Error/conflict notices use record-based IDs without a per-instance namespace. Resize handles contain nested buttons inside a button-role bar. | Verify duplicate mounts, accessible descriptions, keyboard actions and target sizes. |
| Motion | Calendar uses smooth scrolling without a local reduced-motion override. | Check computed reduced-motion behavior before assigning severity. |
| Performance | Calendar materializes a cell for every visible record/date pair. | Measure a stated dataset and pagination behavior; no performance score assigned from source alone. |

## Initial findings

- **P1 candidate, inherited:** duplicate DOM IDs when the same record's conflict/error appears in multiple timeline mounts (`TaskTimelineWidget.tsx`, record-row conflict/error identifiers). This becomes especially relevant when embedding the same saved view more than once. Reproduce with two mounted instances before fixing.
- **P1 candidate, inherited:** editable date resize handles respond only to mouse-down; focusable buttons do not establish keyboard date editing. Confirm the intended accessible edit alternative in the record side panel and native view.
- **P2 candidate, inherited:** mouse-only drag handlers combined with suppressed touch defaults may impair touch navigation. Requires actual touch-event exercise, not just responsive screenshots.
- **Unscored, inherited:** 12px-wide resize handles and nested interactive controls need contextual keyboard/target review; do not claim a WCAG violation without exercising alternatives and exceptions.

These are bounded follow-up findings, not proof of new regressions or permission for an unrelated redesign. No contrast ratio, frame-rate, responsive or theme pass is claimed yet.

## Acceptance matrix

After native-view and widget integration, capture both surfaces with real local test data at desktop and narrow sizes; evaluate light/dark, long labels, valid/missing dates, conflicts, loading/empty/error and forbidden editing. Test keyboard, mouse and synthesized touch separately. Record environment, screenshots, reproducible steps, severity and whether each issue exists on the baseline. Preserve the user's local workspace and do not reset or copy production data.

## Implementation checkpoint

The first refactor exposes a controlled `TaskTimeline` renderer receiving data, instance ID and color. It does not perform the legacy widget query. The existing widget retains its loader and delegates presentation to this renderer. New tests observed RED before implementation; the component suite then passed 38/38, and all three existing timeline suites passed 97/97 including the two new tests. An independent verifier compared baseline/current in isolated scratch copies and added six compatibility probes (legacy markup across five states and retry replacement). Those probes are now durable regression tests; the parent reran all three suites: **103/103 passed**. One test-order dependency in a mock call counter was corrected by explicitly clearing that counter before asserting it. Existing Apollo fragment/React act warnings remain present; they do not represent an error-free console audit.

Browser captures, computed styles/contrast, touch execution, native-view validation and the final audit remain pending.

## Runtime acceptance checkpoint

The native slice passed155 tests and frontend typechecking; the embedded slice passed142 tests, backend validator9 tests, both typechecks and independent query-isolation/permission probes. Mechanical detection returned no findings; this is not visual or accessibility approval.

Chromium148.0.7778.96 at1440×1000 reached the public welcome/login page on localhost3001. No authorized test authentication state was identified, so native/embedded surfaces were not inspected. No account or data changes occurred. Evidence: `/tmp/opencode/timeline-browser.8cwnGQ/`. Historical baseline screenshots were not captured and cannot be retroactively claimed. Saved persistence, runtime legacy-widget compatibility, narrow/theme captures, focus/keyboard/touch, measured contrast and performance remain pending authenticated local acceptance.

## Authenticated runtime evidence

The authorized local QA Member account accessed native Tasks. Actual Timeline creation persisted, but reload initially omitted the saved view. Two corroborated causes were corrected: initial view-type hydration excluded TIMELINE, and metadata cache keys ignored variables. Independent24-check source probes, focused frontend13/server12 tests, both typechecks and backend build passed. Subsequent original-operation readback returned32 views including both QA Timelines, and fresh-session reload kept the chosen Timeline.

Actual controls saved both date mappings to the available Due Date field and a custom `#173B57` bar color; readback/reload confirmed retention. This same-field mapping is only a QA fixture. One QA task rendered. A visible1px focus outline and Enter-to-open record behavior were observed. The390×844 capture had a record panel open and is not full responsive acceptance. No measured contrast, touch, dark-mode or load-performance verdict is claimed.

The existing QA dashboard's VIEW configuration selected the saved Timeline and rendered it in preview. Saving the layout failed the existing LAYOUTS permission guard for the Member account; reload showed no saved widget. This is evidence of an authorization boundary, not a Timeline persistence pass. Screenshots and sanitized operations: `/tmp/opencode/timeline-live.AqutLmoa/` (`embedded-selected.png`, `embedded-saved.png`, `complete.json`, `audit.json`). Successful embedded persistence/two-instance reload and the remaining visual matrix require authorized layout-edit access. No shared role or human record was altered.

## Final bounded audit result

**Native and embedded persistence verified; overall runtime acceptance remains partial.** After explicit authorization, a dedicated QA-only role temporarily added LAYOUTS. Two VIEW widgets saved successfully and rendered after reload. The account was subsequently restored to Member, all temporary grants removed, and normal Member read access rechecked. The shared Member role and human accounts were unchanged. The dedicated role remains unassigned without flags.

On2026-11-05, the user explicitly selected **"Aceptar entrega local parcial"**. This accepts the bounded local delivery, not a full runtime/accessibility/performance approval. All limitations below remain open follow-up evidence; publication and deployment are not authorized.

| Check | Observed result | Limit |
| --- | --- | --- |
| Native save/reload | PASS: selected Timeline, both date mappings and custom color survive reload. | Both mappings intentionally use Due Date in this fixture. |
| Embedded save/reload | PASS: two VIEW widgets referencing the same saved Timeline persist and render. | Editing requires the existing LAYOUTS grant; normal Member read succeeds. |
| Instance isolation | No duplicate DOM IDs; touch scroll moved first calendar585px while second stayed0 (Dark886px/0). | Browser proves scroll isolation; independent real-Jotai tests cover query isolation. |
| Light/Dark readability | Desktop1440×1000 and narrow390×844 captures reviewed; contained horizontal calendar overflow. | Sidebar must be collapsed on narrow; no blanket responsive pass. |
| Text contrast | Label/bar text, Light native13.39/11.55:1 and embedded13.39/11.22:1; Dark native14.45/11.61:1 and embedded14.45/10.33:1. | Measured13px samples meet4.5:1; other controls, borders, states and user-selected colors are not comprehensively measured. |
| Keyboard/touch | Visible focus; Enter and real touch tap open QA record. A real swipe moved one calendar independently. | Full Tab order, keyboard/touch date editing and universal touch scrolling not proven; one narrow Light swipe stayed0. |
| States | Empty/unconfigured mapping and a dated QA task rendered. | Error recovery, conflicts and loading transitions not comprehensively exercised in browser. |
| Filters/search/order | Real filter/sort controls opened; independent parser/state/controller tests passed. | Browser results and saved query-state persistence not demonstrated; failed selectors are not product defects. |
| Pagination/performance | Controller pagination regression coverage exists. | Dataset has one task; no browser pagination or load benchmark. |
| Legacy compatibility | Native Table rendered the existing QA task; component/query/backend suites preserve previous routes. | Full Kanban/Table/legacy Timeline widget browser acceptance remains unexercised. |

### Advisories, not automatic scope expansion

- VIEW selection still uses “Kanban View” / “Kanban view selected” copy although it now accepts Timeline. This can confuse discovery; no copy redesign was silently applied.
- Member still sees an enabled Edit control even though the existing backend guard denied layout Save. No authorization bypass was demonstrated, and causality against the baseline is unconfirmed.
- The blank QA task title renders its ID and creates a tall wrapped bar in screenshots. This is fixture quality, not evidence that meaningful titles are broken. The QA dashboard is also untitled.
- Initial mouse-only editing, narrow resize controls, nested interaction and reduced-motion concerns remain inherited/unscored unless separately reproduced. Historical baseline screenshots were never obtained.

### Security and evidence handling

An audit logger accidentally included QA authentication tokens in a delegated tool output. Local operation JSON was sanitized; historical tool output remains sensitive. No human-account tokens were involved. Four active QA refresh tokens were revoked and unrelated active refresh tokens preserved. Revocation respects the native1minute grace period; access JWTs expire normally. The final Member-only browser check used a new legitimate login and did not log authentication responses. Credentials/storage files remain private0600 outside the repository.

Evidence roots: `/tmp/opencode/timeline-live.AqutLmoa/` (theme captures and sanitized mutation/readback reports), `/tmp/opencode/timeline-member-final.aZQk3TMO/` (normal Member readback), and the external baseline-evidence locator in the feature log. Do not publish private storage, credentials or raw authentication output. No global accessibility, performance or full-feature PASS is claimed.

## Corrected main View acceptance (S2/S5)

The user's screenshots identified that the prior integration extended the separate Kanban View, not the main widget labeled View. The affected tasks were reopened; prior partial acceptance does not approve this correction.

Actual Chromium desktop1440×1000 preview now confirms **View → Layout → Table/Timeline** on Companies. The same draft widget retains its source label, six table fields, explicit readable Creation date mappings, color `#246A73` and limit2 across the layout roundtrip. Timeline uses the shared isolated renderer, not a second table data provider. Past-only Company dates show the ended-record empty state; no dates are fabricated. Cancel/reload preserves the old saved widgets and discards the draft. The new-widget selector no longer lists Task Timeline; existing legacy renderers/settings remain available.

Independent70-assertion source probes and focused frontend171/server59 tests with both typechecks passed; three further binding regressions were retained and their8-case upsert suite passed. The server writes only the active widget-bound private TABLE_WIDGET view; explicit clearing and attempted unrelated view IDs were checked. Private settings stay in draft until dashboard Save, and duplication preserves mappings/color alongside table state.

**Pending browser proof:** saving/reloading the corrected private View configuration requires a new explicit temporary QA LAYOUTS grant, since the previous grant was retired. The preview did not save or elevate permissions. A390×844 capture with sidebar open is not responsive acceptance. Full nonempty filter/sort browser roundtrip, keyboard menu activation and a stored legacy Timeline instance were not re-exercised. Source switching retains the existing behavior of resetting layout to Table; no unrequested change was made to that path.

Safe preview artifacts: `/tmp/opencode/view-browser.VZIZ9ctj/` (`menu.png`, `default-table.png`, `timeline-unconfigured.png`, `roundtrip-table.png`, `roundtrip-timeline.png`, `canvas-desktop.png`, `cancel-reload.png`). Do not publish private state.json. The initial plural dashboard URL error was a harness mistake, not a demonstrated product defect.

### Corrected private Save/reload result

After the user explicitly selected **Autorizar prueba temporal**, QA-only LAYOUTS was granted through the previously owned dedicated role with fresh guarded receipts. The real **View** saved as RECORD_TABLE/TIMELINE and loaded in new authenticated contexts with the same widget/private TABLE_WIDGET view IDs, Companies source, both Creation date mappings, color `#246A73`, record limit2 and six visible fields. Public save operations returned no GraphQL errors and public readback corroborated persistence. Parent inspected `persist-before-save.png` and `inspect-persisted.png`.

The one normal dashboard Save created widget `c72cf629-1044-41b1-b21f-c9e402ae8bf5`, private view `106fcfb3-a35e-4326-a593-7f41a84a483d` and12 private ViewField entries (six visible). Existing QA widget IDs/configuration/title/positions were preserved; bulk-save updatedAt timestamps changed. No Company/Task records or metadata fields were created.

QA was restored to Member immediately afterward and the temporary role was left unassigned with no flags; eleven selected-state preservation checks passed. No shared Member/human account changes occurred. There was no authentication logging incident in this corrected run.

**Remaining limit:** browser harness reopening failed after the successful persisted reload, so additional saved Timeline→Table→Timeline cycles were not attempted. The Table/Timeline preview roundtrip, state preservation, Cancel, private-save contract, baseline Table render path and independent ownership tests passed; these do not replace that unexecuted browser cycle. Nonempty filter/sort browser roundtrip, full pagination/load and stored legacy widget runtime checks remain unapproved. No additional permission grant is active.

Sanitized evidence: `persist-report.json`; private authentication artifact `persist-state.json` must not be published. Broader prior acceptance limits remain unchanged.
