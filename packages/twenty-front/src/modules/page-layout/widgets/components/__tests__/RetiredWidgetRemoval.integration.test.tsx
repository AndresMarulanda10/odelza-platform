import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

// Unrelated branches import an editor dependency outside the Jest ESM policy.
jest.mock(
  '@/page-layout/widgets/email-thread/components/EmailThreadWidget',
  () => ({ EmailThreadWidget: () => null }),
);
jest.mock('@/page-layout/widgets/field/components/FieldWidget', () => ({
  FieldWidget: () => null,
}));
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer',
  () => ({ RecordTableWidgetRenderer: () => null }),
);

it('binds the real retired renderer and native header remove action without automatically mutating a saved widget', () => {
  const store = createStore();
  const layoutId = 'retired-layout';
  const widget = {
    id: 'saved-finance-widget',
    title: 'Saved finance widget',
    type: WidgetType.PERSONAL_FINANCE,
    configuration: {
      configurationType: WidgetConfigurationType.PERSONAL_FINANCE,
    },
  } as PageLayoutWidget;
  store.set(
    widgetCardHoveredComponentFamilyState.atomFamily({
      instanceId: layoutId,
      familyKey: widget.id,
    }),
    true,
  );
  const onRemove = jest.fn();
  const onCardClick = jest.fn();
  render(
    <Provider store={store}>
      <PageLayoutComponentInstanceContext.Provider
        value={{ instanceId: layoutId }}
      >
        <WidgetCardShell
          widget={widget}
          variant="dashboard"
          isEditable
          isEditing={false}
          isDragging={false}
          isResizing={false}
          isLastWidget={false}
          showHeader
          hasAccess
          restriction={{ type: null }}
          actions={[]}
          isInVerticalListTab={false}
          isMobile={false}
          isReorderEnabled={false}
          isDeletingWidgetEnabled
          onClick={onCardClick}
          onRemove={(event) => {
            event?.stopPropagation();
            onRemove(widget.id);
          }}
        />
      </PageLayoutComponentInstanceContext.Provider>
    </Provider>,
  );

  expect(screen.getByRole('status')).toHaveTextContent(
    'This widget is no longer available. Remove it from the dashboard.',
  );
  expect(onRemove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button'));
  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(onRemove).toHaveBeenCalledWith(widget.id);
  expect(onCardClick).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toBeInTheDocument();
});
