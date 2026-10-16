import { InMemoryCache } from '@apollo/client';
import { PAGE_LAYOUT_WIDGET_FRAGMENT } from '@/page-layout/graphql/fragments/pageLayoutWidgetFragment';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { createDefaultRecordTableWidget } from '@/page-layout/utils/createDefaultRecordTableWidget';
import {
  PageLayoutWidgetFragmentFragmentDoc,
  PageLayoutType,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
  type PageLayoutWidgetFragmentFragment,
  type PageLayout,
} from '~/generated-metadata/graphql';
import { print } from 'graphql';

describe('fragment-backed attention persistence (offline cache/server-response simulation)', () => {
  it('preserves the retired finance envelope through the existing fragment, save and cache export contracts', () => {
    const cache = new InMemoryCache();
    cache.writeFragment({
      id: 'PageLayoutWidget:legacy-finance',
      fragment: PageLayoutWidgetFragmentFragmentDoc,
      fragmentName: 'PageLayoutWidgetFragment',
      data: {
        ...createDefaultRecordTableWidget({
          id: 'legacy-finance',
          title: 'Saved finance',
          pageLayoutTabId: 'tab',
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        }),
        type: WidgetType.PERSONAL_FINANCE,
        objectMetadataId: null,
        __typename: 'PageLayoutWidget',
        applicationId: 'app',
        isActive: true,
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
        conditionalDisplay: null,
        conditionalAvailabilityExpression: null,
        position: null,
        configuration: {
          __typename: 'PersonalFinanceConfiguration',
          configurationType: WidgetConfigurationType.PERSONAL_FINANCE,
        },
      },
    });
    const read = () =>
      cache.readFragment<PageLayoutWidgetFragmentFragment>({
        id: 'PageLayoutWidget:legacy-finance',
        fragment: PageLayoutWidgetFragmentFragmentDoc,
        fragmentName: 'PageLayoutWidgetFragment',
      })!;
    const saved = read();
    expect(saved.type).toBe(WidgetType.PERSONAL_FINANCE);
    const layout = transformPageLayout({
      id: 'layout',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      tabs: [
        {
          id: 'tab',
          position: 0,
          isActive: true,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: [saved],
        },
      ],
    } as PageLayout);
    expect(
      convertPageLayoutDraftToUpdateInput(layout).tabs![0].widgets![0],
    ).toMatchObject({
      id: 'legacy-finance',
      type: WidgetType.PERSONAL_FINANCE,
      configuration: {
        configurationType: WidgetConfigurationType.PERSONAL_FINANCE,
      },
    });
    cache.restore(JSON.parse(JSON.stringify(cache.extract())));
    expect(read()).toEqual(saved);
  });
  it('both source and offline generated fragment select recordLimit and presentationMode', () => {
    for (const document of [
      PAGE_LAYOUT_WIDGET_FRAGMENT,
      PageLayoutWidgetFragmentFragmentDoc,
    ]) {
      expect(print(document)).toMatch(
        /on RecordTableConfiguration\s*\{\s*configurationType\s*viewId\s*recordLimit\s*presentationMode/,
      );
    }
  });
  it.each([undefined, null, 'TABLE', 'OVERDUE_ATTENTION'])(
    'survives cache → transform → real save serialization → reopen for %s',
    (presentationMode) => {
      const cache = new InMemoryCache();
      const data = {
        ...createDefaultRecordTableWidget({
          id: 'widget',
          title: 'Overdue tasks',
          pageLayoutTabId: 'tab',
          objectMetadataId: 'task',
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        }),
        __typename: 'PageLayoutWidget' as const,
        applicationId: 'app',
        isActive: true,
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
        conditionalDisplay: null,
        conditionalAvailabilityExpression: null,
        position: null,
        configuration: {
          __typename: 'RecordTableConfiguration' as const,
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId: 'view',
          recordLimit: 5,
          presentationMode: presentationMode ?? null,
        },
      };
      cache.writeFragment({
        id: 'PageLayoutWidget:widget',
        fragment: PageLayoutWidgetFragmentFragmentDoc,
        fragmentName: 'PageLayoutWidgetFragment',
        data,
      });
      const reopened = cache.readFragment<PageLayoutWidgetFragmentFragment>({
        id: 'PageLayoutWidget:widget',
        fragment: PageLayoutWidgetFragmentFragmentDoc,
        fragmentName: 'PageLayoutWidgetFragment',
      })!;
      expect(reopened.configuration).toMatchObject({
        recordLimit: 5,
        presentationMode: presentationMode ?? null,
      });
      const layout = transformPageLayout({
        id: 'layout',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        tabs: [
          {
            id: 'tab',
            position: 0,
            isActive: true,
            layoutMode: PageLayoutTabLayoutMode.GRID,
            widgets: [reopened],
          },
        ],
      } as PageLayout);
      const serialized = convertPageLayoutDraftToUpdateInput(layout);
      expect(serialized.tabs![0].widgets![0].configuration).toMatchObject({
        recordLimit: 5,
        presentationMode: presentationMode ?? null,
        viewId: 'view',
      });
      const secondCache = new InMemoryCache();
      secondCache.restore(JSON.parse(JSON.stringify(cache.extract())));
      expect(
        secondCache.readFragment({
          id: 'PageLayoutWidget:widget',
          fragment: PageLayoutWidgetFragmentFragmentDoc,
          fragmentName: 'PageLayoutWidgetFragment',
        }),
      ).toEqual(reopened);
    },
  );
});
