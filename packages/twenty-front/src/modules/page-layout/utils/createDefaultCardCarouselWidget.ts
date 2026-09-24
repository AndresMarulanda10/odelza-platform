import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const CARD_CAROUSEL_DEFAULT_ITEM_COUNT = 12;

export const createDefaultCardCarouselWidget = ({
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
  title: 'Card carousel',
  isActive: true,
  type: WidgetType.CARD_CAROUSEL,
  configuration: {
    __typename: 'CardCarouselConfiguration',
    configurationType: WidgetConfigurationType.CARD_CAROUSEL,
    fieldMapping: null,
    cardLayout: 'imageTop',
    imageAspect: 'square',
    cardRadius: 'rounded',
    cardSize: 'md',
    textAlign: 'left',
    hoverEffect: 'lift',
    itemCount: CARD_CAROUSEL_DEFAULT_ITEM_COUNT,
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
