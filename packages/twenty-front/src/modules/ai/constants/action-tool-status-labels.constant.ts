import { msg } from '@lingui/core/macro';

import { type ToolStatusLabels } from '@/ai/types/tool-status-labels.type';

export const ACTION_TOOL_STATUS_LABELS: Record<string, ToolStatusLabels> = {
  send_email: {
    loading: msg`Sending email`,
    completed: msg`Sent email`,
  },
  draft_email: {
    loading: msg`Drafting email`,
    completed: msg`Drafted email`,
  },
  navigate_app: {
    loading: msg`Navigating in the app`,
    completed: msg`Navigated in the app`,
  },
};
