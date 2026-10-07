import { render, screen } from '@testing-library/react';

import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { type ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown',
  () => ({
    useObjectOptionsDropdown: jest.fn(),
  }),
);

jest.mock(
  '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuContent',
  () => ({
    ObjectOptionsDropdownMenuContent: () => <div>Main options menu</div>,
  }),
);
jest.mock(
  '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownFieldsContent',
  () => ({
    ObjectOptionsDropdownFieldsContent: () => <div>Fields editor</div>,
  }),
);

describe('ObjectOptionsDropdownContent', () => {
  it('does not expose the removed Catalog fields editor route', () => {
    (useObjectOptionsDropdown as jest.Mock).mockReturnValue({
      currentContentId: 'catalogFields' as ObjectOptionsContentId,
    });

    render(<ObjectOptionsDropdownContent />);

    expect(screen.getByText('Main options menu')).toBeInTheDocument();
    expect(screen.queryByText('Catalog fields')).not.toBeInTheDocument();
  });

  it('routes field configuration through the shared Fields editor', () => {
    (useObjectOptionsDropdown as jest.Mock).mockReturnValue({
      currentContentId: 'fields',
    });

    render(<ObjectOptionsDropdownContent />);

    expect(screen.getByText('Fields editor')).toBeInTheDocument();
    expect(screen.queryByText('Catalog fields')).not.toBeInTheDocument();
  });
});
