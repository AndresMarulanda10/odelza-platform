import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

// The workflow canvas vocabulary: authored inks from the tones home,
// chrome from the product-derived theme.
export const WORKFLOW_THEME = {
  canvasWidthPx: 1480,
  canvasHeightPx: 1260,
  nodeHeightPx: 48,
  canvasTopOffsetPx: 16,
  colors: {
    activeBadgeBackground:
      APP_PREVIEW_TONES.workflowCanvas.activeBadgeBackground,
    activeBadgeText: APP_PREVIEW_TONES.workflowCanvas.activeBadgeText,
    arrowStroke: APP_PREVIEW_TONES.workflowCanvas.arrowStroke,
    canvasBackground: ODELZA_THEME_LIGHT.background.primary,
    canvasDot: ODELZA_THEME_LIGHT.border.color.medium,
    nodeActionIcon: APP_PREVIEW_TONES.workflowCanvas.actionIcon,
    nodeTriggerIcon: APP_PREVIEW_TONES.workflowCanvas.triggerIcon,
    nodeIconFallback: ODELZA_THEME_LIGHT.font.color.secondary,
    nodeBorder: ODELZA_THEME_LIGHT.border.color.strong,
    nodeSurface: ODELZA_THEME_LIGHT.background.secondary,
    nodeIconSurface: ODELZA_THEME_LIGHT.background.transparent.light,
    textPrimary: ODELZA_THEME_LIGHT.font.color.primary,
    textLight: ODELZA_THEME_LIGHT.font.color.light,
    textTertiary: ODELZA_THEME_LIGHT.font.color.tertiary,
  },
};
