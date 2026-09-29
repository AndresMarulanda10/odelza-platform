import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultCardCarouselWidget } from '@/page-layout/utils/createDefaultCardCarouselWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

export const useCreatePageLayoutCardCarouselWidget = ({
  pageLayoutId: pageLayoutIdFromProps,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListInstanceId,
  );
  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );
  const pageLayoutDraggedAreaState = useAtomComponentStateCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const store = useStore();

  const createPageLayoutCardCarouselWidget = useCallback(
    (objectMetadataId?: string): PageLayoutWidget => {
      if (!isDefined(activeTabId)) {
        throw new Error(
          'A tab must be selected to create a card carousel widget',
        );
      }

      const widgetId = uuidv4();
      const sizes = WIDGET_SIZES[WidgetType.CARD_CAROUSEL]!;
      const position = getDefaultWidgetPosition(
        store.get(pageLayoutDraggedAreaState),
        sizes.default,
        sizes.minimum,
      );
      const newWidget = createDefaultCardCarouselWidget({
        id: widgetId,
        pageLayoutTabId: activeTabId,
        gridPosition: {
          row: position.y,
          column: position.x,
          rowSpan: position.h,
          columnSpan: position.w,
        },
        objectMetadataId:
          objectMetadataId ??
          store.get(pageLayoutDraftState).objectMetadataId ??
          undefined,
      });
      const newLayout = {
        i: widgetId,
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        minW: sizes.minimum.w,
        minH: sizes.minimum.h,
      };

      store.set(
        pageLayoutCurrentLayoutsState,
        getUpdatedTabLayouts(
          store.get(pageLayoutCurrentLayoutsState),
          activeTabId,
          newLayout,
        ),
      );
      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
      }));
      store.set(pageLayoutDraggedAreaState, null);

      return newWidget;
    },
    [
      activeTabId,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      store,
    ],
  );

  return { createPageLayoutCardCarouselWidget };
};
