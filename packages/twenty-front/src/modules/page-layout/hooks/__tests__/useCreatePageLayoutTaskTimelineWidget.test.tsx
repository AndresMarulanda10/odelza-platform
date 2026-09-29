import { act, renderHook } from '@testing-library/react';
import { useSetAtom } from 'jotai';

import { useCreatePageLayoutTaskTimelineWidget } from '@/page-layout/hooks/useCreatePageLayoutTaskTimelineWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'timeline-widget-id'),
}));

describe('useCreatePageLayoutTaskTimelineWidget', () => {
  it('inserts a timeline draft and matching layout into the active tab', () => {
    const { result } = renderHook(
      () => {
        const setPageLayoutDraft = useSetAtomComponentState(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const setActiveTabId = useSetAtom(
          activeTabIdComponentState.atomFamily({
            instanceId: getTabListInstanceIdFromPageLayoutId(
              PAGE_LAYOUT_TEST_INSTANCE_ID,
            ),
          }),
        );
        const pageLayoutDraft = useAtomComponentStateValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const pageLayoutCurrentLayouts = useAtomComponentStateValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const creator = useCreatePageLayoutTaskTimelineWidget({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: getTabListInstanceIdFromPageLayoutId(
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
        });

        return {
          setPageLayoutDraft,
          setActiveTabId,
          pageLayoutDraft,
          pageLayoutCurrentLayouts,
          creator,
        };
      },
      { wrapper: PageLayoutTestWrapper },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'layout-id',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-id',
            applicationId: '',
            title: 'Overview',
            isActive: true,
            position: 0,
            pageLayoutId: 'layout-id',
            widgets: [],
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
        ],
      });
      result.current.setActiveTabId('tab-id');
    });

    act(() => {
      result.current.creator.createPageLayoutTaskTimelineWidget('task-object');
    });

    expect(result.current.pageLayoutDraft.tabs[0].widgets).toHaveLength(1);
    expect(result.current.pageLayoutDraft.tabs[0].widgets[0]).toMatchObject({
      id: 'timeline-widget-id',
      type: WidgetType.TASK_TIMELINE,
      title: 'Task Timeline',
      objectMetadataId: 'task-object',
    });
    expect(
      result.current.pageLayoutCurrentLayouts['tab-id'].desktop,
    ).toHaveLength(1);
    expect(
      result.current.pageLayoutCurrentLayouts['tab-id'].mobile,
    ).toHaveLength(1);
  });
});
