import { fireEvent, render, screen } from '@testing-library/react';

import {
  CardCarousel,
  type CardCarouselItem,
} from '@/page-layout/widgets/card-carousel/components/CardCarousel';

const items: CardCarouselItem[] = [
  {
    id: 'card-1',
    imageSrc: 'https://example.com/one.png',
    title: 'Auriculares',
    subtitle: 'Cancelación de ruido',
    price: '$ 120.000',
    badge: 'Nuevo',
  },
  {
    id: 'card-2',
    title: 'Reloj',
    subtitle: 'Titanio',
    price: '$ 240.000',
  },
];

describe('CardCarousel', () => {
  it('shows each card with its title, subtitle, price and badge', () => {
    render(<CardCarousel items={items} />);

    expect(screen.getByText('Auriculares')).toBeInTheDocument();
    expect(screen.getByText('Cancelación de ruido')).toBeInTheDocument();
    expect(screen.getByText('$ 120.000')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByText('Reloj')).toBeInTheDocument();
  });

  it('renders the image with its alternative text when the layout has one', () => {
    render(
      <CardCarousel
        items={[{ ...items[0], imageAlt: 'Portada' }]}
        layout="imageTop"
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Portada');
  });

  it('hides the image on the text only layout', () => {
    render(<CardCarousel items={items} layout="textOnly" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('hides the elements turned off through visibility', () => {
    render(
      <CardCarousel
        items={items}
        visibility={{ subtitle: false, badge: false, price: false }}
      />,
    );

    expect(screen.queryByText('Cancelación de ruido')).not.toBeInTheDocument();
    expect(screen.queryByText('Nuevo')).not.toBeInTheDocument();
    expect(screen.queryByText('$ 120.000')).not.toBeInTheDocument();
    expect(screen.getByText('Auriculares')).toBeInTheDocument();
  });

  it('exposes the chosen structure through data attributes', () => {
    const { container } = render(
      <CardCarousel items={items} layout="imageOverlay" />,
    );

    expect(
      container.querySelector('[data-layout="imageOverlay"]'),
    ).toBeInTheDocument();
  });

  it('calls the handler with the clicked card', () => {
    const onCardClick = jest.fn();

    render(<CardCarousel items={items} onCardClick={onCardClick} />);

    fireEvent.click(screen.getByLabelText('Reloj'));

    expect(onCardClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'card-2' }),
    );
  });

  it('activates a card from the keyboard', () => {
    const onCardClick = jest.fn();

    render(<CardCarousel items={items} onCardClick={onCardClick} />);

    fireEvent.keyDown(screen.getByLabelText('Auriculares'), { key: 'Enter' });

    expect(onCardClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'card-1' }),
    );
  });

  it('ignores clicks on a disabled card', () => {
    const onCardClick = jest.fn();

    render(
      <CardCarousel
        items={[{ ...items[0], disabled: true }]}
        onCardClick={onCardClick}
      />,
    );

    fireEvent.click(screen.getByLabelText('Auriculares'));

    expect(onCardClick).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Auriculares')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('shows the empty message when there is nothing to list', () => {
    render(<CardCarousel items={[]} emptyLabel="Sin tarjetas" />);

    expect(screen.getByText('Sin tarjetas')).toBeInTheDocument();
  });

  it('does not render the arrows or dots when they are turned off', () => {
    render(<CardCarousel items={items} showArrows={false} showDots={false} />);

    expect(screen.queryByLabelText('Siguiente')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Ir a la tarjeta 1')).not.toBeInTheDocument();
  });
});
