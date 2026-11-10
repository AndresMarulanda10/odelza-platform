# Saved Timeline View widget

T5 implements S2: the View widget embeds a saved Kanban or Timeline by `viewId`; it does not convert existing widgets.

## Isolation boundary

- Timeline uses the common `TimelineView` and `useFindManyTimelineViewParams`, not the Table widget provider or global native-index loader.
- Its scope is `view-timeline-widget-${widgetId}`. Context-store, view and record component contexts share this identity; selected-view changes remount initialization.
- Saved filters/groups/sorts use the existing mapping utilities. Saved search initializes separately so unrelated visual changes preserve local search. Query children wait for initialization, including metadata refresh.
- The shared controller still enforces readable mappings, permissions and configured dates. No invented view fields or second legacy query are introduced.
- Kanban retains its provider, IDs and board branch. Table and legacy Timeline widgets retain their original paths. Record conflict/error descriptions now include the Timeline instance ID while test IDs remain stable.

## Validation contract

The backend accepts only active, owned Kanban or Timeline references through its existing indexed universal-identifier lookup. It retains configuration and UUID guards, returns errors instead of throwing, and does not mutate metadata. Unsupported layouts retain `INVALID_PAGE_LAYOUT_WIDGET_DATA` with **Referenced view is not a Kanban or Timeline view**.

## Remaining acceptance

T6 owns real-browser persistence, responsive/theme/touch/contrast and final design-audit evidence. JSDOM and parser/store tests are not visual acceptance.
