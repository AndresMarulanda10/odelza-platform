# Saved Timeline view contract

The additive `TIMELINE` view type stores optional settings in the nullable `core.view.timelineConfiguration` JSONB column. Existing views default to `null` and keep their current behavior. This contract slice does not yet expose Timeline creation in the application UI.

## Configuration

`CreateViewInput` and `UpdateViewInput` accept a typed `ViewTimelineConfigurationInput`; `View` exposes `ViewTimelineConfiguration`.

| Property | Meaning |
| --- | --- |
| `startDateFieldMetadataUniversalIdentifier` | Optional universal identifier of an active DATE/DATE_TIME field on the view's object. |
| `endDateFieldMetadataUniversalIdentifier` | Optional universal identifier of an active DATE/DATE_TIME field on the view's object. |
| `barColor` | Optional six-digit hexadecimal color; the renderer retains its existing default when unset. |

Mappings contain **universal identifiers**, not workspace-local field IDs. They remain stable during metadata transfer and do not require local-ID serialization/remapping. Field reference ownership and availability are validated against optimistic metadata maps on view creation/update, including effective overrides. These JSON references are not database foreign keys: consumers must tolerate mappings whose fields become unavailable later.

A null configuration or null mappings represent an unconfigured timeline; consumers must show a configuration state instead of inventing dates. The native/embedded adapters will resolve mappings to the current object's readable fields.

## Upgrade and rollback

`2.21.0_AddTimelineViewFastInstanceCommand_1793750400000` adds the enum value and nullable column with `IF NOT EXISTS`. It does not backfill, rewrite or delete existing view records. The command is registered through the repository's existing registry generator helper.

`down()` intentionally retains the additive enum and configuration column so an application rollback cannot discard saved settings. This is not a promise that older clients can render a Timeline view; application rollback compatibility and data recovery remain distinct concerns.

## Observed checks

- Validation tests observed RED before the new rule; upgrade registration test observed RED before registry generation.
- Server typecheck and build passed; shared contracts built offline.
- Fresh isolated full initialization executed the new upgrade successfully.
- A separate real PostgreSQL probe upgraded an older minimal view table twice, preserved its existing row, accepted TIMELINE/configuration, and retained both rows/settings after `down()`.
- Frontend and SDK contracts were generated from the isolated loopback server, not production. SDK numeric reference renumbering is generated output, not handwritten formatting.

Independent verification reproduced 17 contract boundary probes and existing baseline behavior, and its isolated server typecheck passed after completing the scratch dependency copies. The parent retained the probes as regression coverage and reran five related server suites: **34/34 passed**. Frontend identity checks passed2/2. These checks do not establish native/embedded UI acceptance or full public end-to-end persistence; those remain later feature tasks. No production migration was run.
