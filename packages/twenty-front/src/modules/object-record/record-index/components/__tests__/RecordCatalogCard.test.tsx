import { fireEvent, render, screen } from '@testing-library/react';

import { RecordCatalogCard } from '@/object-record/record-index/components/RecordCatalogCard';

describe('RecordCatalogCard', () => {
  it.each(['', '   ', '\n\t'])(
    'uses the placeholder for blank image source %p',
    (imageSrc) => {
      const { container } = render(
        <RecordCatalogCard title="Record" imageSrc={imageSrc} />,
      );
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('R')).toBeInTheDocument();
    },
  );
  it('renders native fields without nesting interactive content in a button', () => {
    render(
      <RecordCatalogCard
        title="Record"
        fields={<a href="https://example.com">Native link</a>}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Record Native link' }).tagName,
    ).toBe('DIV');
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('does not mount native fields in compact mode', () => {
    const Field = jest.fn(() => <div>Optional field</div>);
    render(<RecordCatalogCard title="Record" isCompact fields={<Field />} />);
    expect(Field).not.toHaveBeenCalled();
    expect(screen.queryByText('Optional field')).not.toBeInTheDocument();
  });

  it.each(['Enter', ' '])(
    'opens the card with %s but not from a nested field keyboard event',
    (key) => {
      const onClick = jest.fn();
      render(
        <RecordCatalogCard
          title="Record"
          onClick={onClick}
          fields={<a href="https://example.com">Native link</a>}
        />,
      );
      fireEvent.keyDown(screen.getByRole('link'), { key });
      expect(onClick).not.toHaveBeenCalled();
      fireEvent.keyDown(screen.getByRole('button'), { key });
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );
  it('shows the image, the title, the subtitle and the extra field', () => {
    render(
      <RecordCatalogCard
        imageSrc="https://example.com/foto.jpg"
        imageAlt="Foto de la tarea"
        title="Revisar propuesta de seguros"
        subtitle="TODO"
        detail="2026-09-30"
      />,
    );

    const image = screen.getByAltText('Foto de la tarea');

    expect(image).toHaveAttribute('src', 'https://example.com/foto.jpg');
    expect(
      screen.getByText('Revisar propuesta de seguros'),
    ).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('2026-09-30')).toBeInTheDocument();
  });

  it('keeps the title and hides optional content in compact mode', () => {
    render(
      <RecordCatalogCard
        imageSrc="https://example.com/photo.jpg"
        imageAlt="Record photo"
        isCompact
        title="Record title"
        subtitle="Record subtitle"
        detail="Record detail"
      />,
    );

    expect(screen.getByText('Record title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Record title');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText('Record subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Record detail')).not.toBeInTheDocument();
  });

  it('falls back to the first letter of the title when there is no image', () => {
    const { container } = render(
      <RecordCatalogCard
        title="Revisar propuesta de seguros"
        subtitle="TODO"
      />,
    );

    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('shows the placeholder icon when there is neither image nor title', () => {
    const { container } = render(<RecordCatalogCard title="   " />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
