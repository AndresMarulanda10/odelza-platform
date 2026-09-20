import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultPersonalFinanceWidget = ({
  id,
  pageLayoutTabId,
  gridPosition,
}: {
  id: string;
  pageLayoutTabId: string;
  gridPosition: GridPosition;
}): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id,
  applicationId: '',
  pageLayoutTabId,
  title: 'Personal Finance',
  isActive: true,
  type: WidgetType.PERSONAL_FINANCE,
  configuration: {
    __typename: 'PersonalFinanceConfiguration',
    configurationType: WidgetConfigurationType.PERSONAL_FINANCE,
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
  objectMetadataId: null,
  isOverridden: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});
