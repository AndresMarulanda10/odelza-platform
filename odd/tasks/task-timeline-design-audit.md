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
