import { createDefaultViewWidget } from '@/page-layout/utils/createDefaultViewWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('createDefaultViewWidget', () => {
  it('should create a VIEW widget with a view configuration', () => {
    const widget = createDefaultViewWidget({
      id: 'widget-id-1',
      pageLayoutTabId: 'tab-id-1',
      title: 'Kanban View',
      gridPosition: { row: 1, column: 2, rowSpan: 3, columnSpan: 4 },
    });

    expect(widget.type).toBe(WidgetType.VIEW);
    expect(widget.configuration).toEqual({
      configurationType: WidgetConfigurationType.VIEW,
      viewId: '',
    });
    expect(widget.position).toEqual({
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 1,
      column: 2,
      rowSpan: 3,
      columnSpan: 4,
    });
  });
});
