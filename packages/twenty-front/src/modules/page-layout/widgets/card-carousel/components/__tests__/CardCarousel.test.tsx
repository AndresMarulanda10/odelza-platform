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

  describe('navegacion con las flechas', () => {
    const CARD_WIDTH = 200;
    const VIEWPORT_WIDTH = 800;
    const TOTAL_WIDTH = 1000;

    const fourItems: CardCarouselItem[] = ['Uno', 'Dos', 'Tres', 'Cuatro'].map(
      (title, index) => ({ id: `card-${index}`, title }),
    );

    const rect = (left: number, width: number) =>
      ({
        bottom: 300,
        height: 300,
        left,
        right: left + width,
        top: 0,
        width,
        x: left,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const mountLayout = () => {
      const viewport = screen.getByRole('list') as HTMLElement;
      const cards = Array.from(viewport.children) as HTMLElement[];

      jest
        .spyOn(viewport, 'getBoundingClientRect')
        .mockImplementation(() => rect(0, VIEWPORT_WIDTH));

      Object.defineProperty(viewport, 'clientWidth', {
        configurable: true,
        value: VIEWPORT_WIDTH,
      });
      Object.defineProperty(viewport, 'scrollWidth', {
        configurable: true,
        value: TOTAL_WIDTH,
      });

      cards.forEach((card, index) => {
        jest
          .spyOn(card, 'getBoundingClientRect')
          .mockImplementation(() =>
            rect(index * CARD_WIDTH - viewport.scrollLeft, CARD_WIDTH),
          );
      });

      const scrollTo = jest.fn();

      Object.defineProperty(viewport, 'scrollTo', {
        configurable: true,
        value: scrollTo,
      });

      return { viewport, scrollTo };
    };

    const scrollToOffset = (viewport: HTMLElement, left: number) => {
      viewport.scrollLeft = left;
      fireEvent.scroll(viewport);
    };

    it('marks as active the card stuck to the left edge', () => {
      render(<CardCarousel items={fourItems} showArrows />);

      const { viewport } = mountLayout();

      scrollToOffset(viewport, 400);

      const cards = Array.from(viewport.children) as HTMLElement[];

      expect(cards[2].getAttribute('data-active')).toBe('on');
      expect(cards[0].getAttribute('data-active')).toBe('off');
    });

    it('goes back one card when pressing the previous arrow', () => {
      render(<CardCarousel items={fourItems} showArrows />);

      const { viewport, scrollTo } = mountLayout();

      scrollToOffset(viewport, 400);

      fireEvent.click(screen.getByLabelText('Anterior'));

      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(scrollTo.mock.calls[0][0].left).toBe(200);
      expect(scrollTo.mock.calls[0][0].left).toBeLessThan(400);
    });

    it('goes forward one card when pressing the next arrow', () => {
      render(<CardCarousel items={fourItems} showArrows />);

      const { viewport, scrollTo } = mountLayout();

      scrollToOffset(viewport, 0);

      fireEvent.click(screen.getByLabelText('Siguiente'));

      expect(scrollTo.mock.calls[0][0].left).toBe(CARD_WIDTH);
    });
  });
});
