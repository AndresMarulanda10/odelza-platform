import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultTaskTimelineWidget = ({
  id,
  pageLayoutTabId,
  gridPosition,
  objectMetadataId,
}: {
  id: string;
  pageLayoutTabId: string;
  gridPosition: GridPosition;
  objectMetadataId?: string;
}): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id,
  applicationId: '',
  pageLayoutTabId,
  title: 'Task Timeline',
  isActive: true,
  type: WidgetType.TASK_TIMELINE,
  configuration: {
    __typename: 'TaskTimelineConfiguration',
    configurationType: WidgetConfigurationType.TASK_TIMELINE,
    barColor: DEFAULT_TASK_TIMELINE_BAR_COLOR,
  },
  gridPosition,
  position: {
    __typename: 'PageLayoutWidgetGridPosition',
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: gridPosition.row,
    column: gridPosition.column,
    rowSpan: gridPosition.rowSpan,
    columnSpan: gridPosition.columnSpan,
  },
  objectMetadataId: objectMetadataId ?? null,
  isOverridden: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});
