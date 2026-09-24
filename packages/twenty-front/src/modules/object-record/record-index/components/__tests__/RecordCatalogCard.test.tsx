import { render, screen } from '@testing-library/react';

import { RecordCatalogCard } from '@/object-record/record-index/components/RecordCatalogCard';

describe('RecordCatalogCard', () => {
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
    expect(screen.getByText('Revisar propuesta de seguros')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('2026-09-30')).toBeInTheDocument();
  });

  it('leaves out the empty parts of the card', () => {
    render(<RecordCatalogCard title="Solo el título" />);

    expect(screen.getByText('Solo el título')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
