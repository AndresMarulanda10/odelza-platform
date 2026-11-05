# Use a saved Tasks Timeline

Create a native Tasks view and choose **Timeline**, or change a non-default Tasks view under **Layout → Timeline**. The default index view retains its existing layout restrictions. Other objects do not offer native Timeline creation; the dashboard View widget supports its selected readable object, including Companies.

## Configure the view

- Choose readable, active **Start date** and **End date** fields in the Timeline settings row. Task date fields are selected initially when available; missing or unavailable mappings require explicit configuration, never inferred dates.
- Use **Bar color** to choose a native palette swatch or enter a six-digit hexadecimal color. Settings are saved with the view; users without persistence permission cannot change them.
- Existing saved filters, sort order and search apply. Grouping from another layout does not constrain Timeline records or impose Kanban’s eight-record page size.
- Choose **Load more** to retrieve subsequent pages. A page failure preserves loaded records and allows another attempt. Initial loading, forbidden, empty and retry states retain the shared Timeline behavior.

## Interactions and compatibility

Timeline retains the existing calendar window, full-day inclusive dates, record titles, record opening, scrolling, drag/resize and dependency-conflict behavior. Configuration labels do not replace record titles. Switching layouts preserves saved Timeline mappings and color; creating from the current view retains its existing filter/sort copy flow.

## Choose a dashboard View layout

1. Add or edit the widget labeled **View** and choose its **Source**.
2. Open **Layout** and choose **Table** or **Timeline**. This keeps the same widget and private view; fields, filters, sorts and record limit are retained when switching back.
3. In Timeline mode, open the native **Start date** and **End date** rows to search and select readable active date fields. **Not configured** clears a mapping; selecting a value closes the dropdown. **Bar color** remains in the same panel. Unavailable mappings are labeled explicitly; no date values are invented or written to records. Saved private Timeline settings also initialize when the view has no table columns, without replacing matching unsaved changes.
4. Use the dashboard **Save** action to persist the layout and private settings. **Cancel** discards draft changes. Configuration is not written immediately to a native saved view.

The existing Limit caps total Timeline records; a limited widget does not offer Load more beyond the cap. The Overdue tasks preset retains its existing locked presentation and is not converted by this selector.

Timeline bars keep long labels on one line with an ellipsis; the full record label remains available as a tooltip and accessible name. Error, conflict and drag-preview messages are not clipped with the label. Existing exclusion of ended records is unchanged by this refinement.

Standalone **Task Timeline** is no longer offered when creating widgets. Already-saved legacy Timeline widgets continue to render and use their existing settings; no automatic conversion or deletion occurs.

## Existing Kanban View compatibility

The separate **Kanban View** entry can still select an active saved **Kanban** or **Timeline** view for its object. **Search views** filters that list. This compatibility path is distinct from the main **View → Layout** control above.

Timeline widgets share the native Timeline renderer and strict configured-date loader. Each widget has its own saved filters, filter groups, sort order and search scope, even when two widgets select the same view. Empty view-field lists are supported. Saved-query or metadata changes refresh that scope before loading; changing mappings or color does not reset local search. Missing, inactive, unsupported or mismatched references display **This view is unavailable.** without mounting a data child or showing the private view name.

Legacy Timeline widget configuration and loading remain separate. The common `TimelineView` controller accepts a saved view, object metadata, instance ID and composed query without requiring native index context. It performs one strict Timeline data load and only renders native settings when explicitly supplied. Final browser/design acceptance remains T6, not established by unit tests.
## Reload compatibility

Saved Timeline views participate in initial metadata hydration alongside Table, Kanban and Calendar. Metadata response cache keys include canonical GraphQL variables, so changing the requested view types cannot reuse an older response for another filter. Existing workspace, member, metadata-version and locale isolation remains unchanged.
