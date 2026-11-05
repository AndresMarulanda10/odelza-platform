# Use a saved Tasks Timeline

Create a Tasks view and choose **Timeline**, or change a non-default Tasks view under **Layout → Timeline**. The default index view retains its existing layout restrictions. Other objects do not offer Timeline creation.

## Configure the view

- Choose readable, active **Start date** and **End date** fields in the Timeline settings row. Task date fields are selected initially when available; missing or unavailable mappings require explicit configuration, never inferred dates.
- Use **Bar color** to choose a native palette swatch or enter a six-digit hexadecimal color. Settings are saved with the view; users without persistence permission cannot change them.
- Existing saved filters, sort order and search apply. Grouping from another layout does not constrain Timeline records or impose Kanban’s eight-record page size.
- Choose **Load more** to retrieve subsequent pages. A page failure preserves loaded records and allows another attempt. Initial loading, forbidden, empty and retry states retain the shared Timeline behavior.

## Interactions and compatibility

Timeline retains the existing calendar window, full-day inclusive dates, record titles, record opening, scrolling, drag/resize and dependency-conflict behavior. Configuration labels do not replace record titles. Switching layouts preserves saved Timeline mappings and color; creating from the current view retains its existing filter/sort copy flow.

## Embed a saved view

In the **View** widget settings, choose an active **Kanban** or **Timeline** view for the widget's object. **Search views** filters this list. Selecting a view updates the widget title. Table views remain available through the separate Table widget.

Timeline widgets share the native Timeline renderer and strict configured-date loader. Each widget has its own saved filters, filter groups, sort order and search scope, even when two widgets select the same view. Empty view-field lists are supported. Saved-query or metadata changes refresh that scope before loading; changing mappings or color does not reset local search. Missing, inactive, unsupported or mismatched references display **This view is unavailable.** without mounting a data child or showing the private view name.

Legacy Timeline widget configuration and loading remain separate. The common `TimelineView` controller accepts a saved view, object metadata, instance ID and composed query without requiring native index context. It performs one strict Timeline data load and only renders native settings when explicitly supplied. Final browser/design acceptance remains T6, not established by unit tests.
