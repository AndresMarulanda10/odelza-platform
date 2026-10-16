import { fireEvent, render, screen } from '@testing-library/react';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { IconClock } from 'twenty-ui/icon';

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({ useAtomComponentFamilyStateValue: () => true }),
);
jest.mock('@/page-layout/widgets/widget-card/components/WidgetGrip', () => ({
  WidgetGrip: () => null,
}));

describe('native widget header', () => {
  it('renders the optional overdue clock beside the existing title, without a second header', () => {
    const { container } = render(
      <WidgetCardHeader
        widgetId="saved"
        variant="dashboard"
        title="Overdue tasks"
        isInEditMode={false}
        Icon={IconClock}
      />,
    );
    expect(screen.getAllByText('Overdue tasks')).toHaveLength(1);
    expect(container.querySelector('svg')).toHaveClass('tabler-icon-clock');
  });
  it('preserves explicit native removal for a saved retired widget', () => {
    const onRemove = jest.fn();
    const { container } = render(
      <WidgetCardHeader
        widgetId="saved"
        variant="dashboard"
        title="Saved finance widget"
        isInEditMode
        onRemove={onRemove}
      />,
    );
    expect(onRemove).not.toHaveBeenCalled();
    expect(container.querySelector('.tabler-icon-clock')).toBeNull();
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
