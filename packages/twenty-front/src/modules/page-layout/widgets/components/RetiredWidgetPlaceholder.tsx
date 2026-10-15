import { t } from '@lingui/core/macro';

// Saved widgets remain readable; removal is an explicit dashboard-edit action.
export const RetiredWidgetPlaceholder = () => (
  <p role="status">{t`This widget is no longer available. Remove it from the dashboard.`}</p>
);
