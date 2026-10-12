# Safari timezone startup

## Objective
Prevent unsupported timezone labels from aborting frontend module initialization.

## Problem and scope
Safari reports `RangeError: Invalid time zone specified: CST6CDT` and shows a blank workspace. The eager timezone option reducer formats every zone without an exception boundary. Guard each entry and preserve existing filtering and deduplication. Deployment and user preference changes are out of scope.

## Constraints
Single writer; preserve unrelated `.atl/` files. Technical artifacts in English. RDD is off by explicit global preference. Default applicable test-first policy applies; no explicit project TDD mode was found. Node 26 is installed while the project declares Node 24.

## Delivery
Strategy: ask-on-risk. Forecast: under 150 authored changed lines. One work-unit commit on `fix/safari-timezone-startup`; no push or deployment authorized.

## Tasks
- [x] T1: Skip unsupported timezone entries, format each entry once, and add deterministic regression coverage.
  - Route: delegated direct; reading prepares a write and source plus regression test require a bounded writer.
  - Allowed source: `packages/twenty-front/src/modules/settings/experience/constants/AvailableTimezoneOptionsByLabel.ts`.
  - Allowed new test: `packages/twenty-front/src/modules/settings/experience/constants/__tests__/AvailableTimezoneOptionsByLabel.test.ts`.
  - Acceptance: a throwing timezone cannot abort initialization; supported options survive; existing filters and deduplication remain effective.
  - Checks: observed Jest RED (`RangeError: Invalid time zone specified: CST6CDT`) then GREEN (2 suites, 3 tests); related timezone regression passed. Final oxfmt and scoped type-aware oxlint passed. Initial lint failure was resolved with a narrow documented suppression. Parent reran Jest; independent verifier reran all scoped final checks successfully.
  - Native risk: unassessable/high because untracked inventory requires declaration. RDD remains disabled/unmanaged; independent verification completed, no native review started.
  - Runtime scenario: Safari reload after separately authorized delivery remains pending.
  - Rollback: remove the per-entry guard and regression test together.
  - Commit: pending.

## Progress
Implementation and scoped proof complete. RangeError entries are skipped; other formatter errors are rethrown. Installed Node 26 (declared 24) did not block checks. Full build/suite and real Safari reproduction were not run. Next: separately authorize delivery to the served app, then reload Safari. Mirror synchronization pending.
