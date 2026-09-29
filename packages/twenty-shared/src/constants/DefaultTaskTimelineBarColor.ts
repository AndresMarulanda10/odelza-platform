// Widget bar colors are persisted as plain hex values: the frontend color
// picker (<input type="color">) and the metadata DTO validator
// (^#[0-9a-fA-F]{6}$) only accept #rrggbb, so this default cannot be a theme
// CSS variable.
export const DEFAULT_TASK_TIMELINE_BAR_COLOR = '#3b82f6';
