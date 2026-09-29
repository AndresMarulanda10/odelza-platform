import { fireEvent, render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { CardCarouselWidget } from '@/page-layout/widgets/card-carousel/components/CardCarouselWidget';
import { AppPath } from 'twenty-shared/types';

const openRecordInSidePanel = jest.fn();
const navigate = jest.fn();

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigate,
}));

const mockObjectMetadataItems = [
  {
    id: 'object-1',
    nameSingular: 'task',
    labelSingular: 'Tarea',
    icon: 'IconCheckbox',
  },
];

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockObjectMetadataItems,
}));

jest.mock(
  '@/page-layout/widgets/card-carousel/hooks/useCardCarouselData',
  () => ({
    useCardCarouselData: () => ({
      status: 'ready',
      hasConfigurationGap: false,
      items: [{ id: 'record-1', title: 'Llamar al cliente' }],
    }),
  }),
);

const widget = {
  id: 'widget-1',
  objectMetadataId: 'object-1',
  configuration: null,
} as unknown as PageLayoutWidget;

describe('CardCarouselWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectMetadataItems[0].nameSingular = 'task';
  });

  it('opens the record of the card that was clicked', () => {
    render(<CardCarouselWidget widget={widget} />);

    fireEvent.click(screen.getByRole('button', { name: /Llamar al cliente/ }));

    expect(openRecordInSidePanel).toHaveBeenCalledWith({
      recordId: 'record-1',
      objectNameSingular: 'task',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to the record page when the object cannot use the side panel', () => {
    mockObjectMetadataItems[0].nameSingular = 'dashboard';

    render(<CardCarouselWidget widget={widget} />);

    fireEvent.click(screen.getByRole('button', { name: /Llamar al cliente/ }));

    expect(openRecordInSidePanel).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: 'dashboard',
      objectRecordId: 'record-1',
    });
  });

  it('warns when the widget has no object to read from', () => {
    mockObjectMetadataItems.length = 0;

    render(<CardCarouselWidget widget={widget} />);

    expect(
      screen.getByText('This widget needs an object to read from.'),
    ).toBeInTheDocument();
  });
});
