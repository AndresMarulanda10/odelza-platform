import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

/*
 * Carrusel / librería de tarjetas con acabado de vidrio.
 *
 * Todo lo visual entra por props: estructura (dónde va la imagen), visibilidad
 * de cada elemento, bordes, tamaño, separación, alineación y énfasis. Los
 * colores salen siempre del tema, nunca de literales, para respetar el tema del
 * producto y la regla de colores del lint.
 */

export type CardCarouselLayout =
  | 'imageTop'
  | 'imageCenter'
  | 'imageOverlay'
  | 'textOnly';

export type CardCarouselImageAspect = 'square' | 'portrait' | 'wide' | 'circle';

export type CardCarouselRadius = 'square' | 'soft' | 'rounded' | 'pill';

export type CardCarouselSize = 'sm' | 'md' | 'lg';

export type CardCarouselHover = 'lift' | 'scale' | 'glow' | 'none';

export type CardCarouselTextAlign = 'left' | 'center' | 'right';

export type CardCarouselShadow = 'none' | 'soft' | 'strong';

export type CardCarouselVisibility = {
  image?: boolean;
  title?: boolean;
  subtitle?: boolean;
  price?: boolean;
  badge?: boolean;
};

export type CardCarouselAppearance = {
  radius?: CardCarouselRadius;
  size?: CardCarouselSize;
  cardWidth?: string;
  cardHeight?: string;
  gap?: string;
  padding?: string;
  textAlign?: CardCarouselTextAlign;
  hover?: CardCarouselHover;
  blur?: string;
  shadow?: CardCarouselShadow;
  overlayGradient?: boolean;
  emphasisColor?: string;
};

export type CardCarouselItem = {
  id: string;
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  price?: string;
  badge?: string;
  disabled?: boolean;
};

export type CardCarouselProps = {
  items: CardCarouselItem[];
  layout?: CardCarouselLayout;
  visibility?: CardCarouselVisibility;
  imageAspect?: CardCarouselImageAspect;
  imageFit?: 'cover' | 'contain';
  appearance?: CardCarouselAppearance;
  showArrows?: boolean;
  showDots?: boolean;
  emptyLabel?: string;
  ariaLabel?: string;
  onCardClick?: (item: CardCarouselItem) => void;
};

const RADII: Record<CardCarouselRadius, [string, string]> = {
  square: [
    themeCssVariables.border.radius.xs,
    themeCssVariables.border.radius.xs,
  ],
  soft: [
    themeCssVariables.border.radius.sm,
    themeCssVariables.border.radius.xs,
  ],
  rounded: [
    themeCssVariables.border.radius.md,
    themeCssVariables.border.radius.sm,
  ],
  pill: [
    themeCssVariables.border.radius.xl,
    themeCssVariables.border.radius.lg,
  ],
};

const SIZES: Record<CardCarouselSize, string> = {
  sm: '11rem',
  md: '15rem',
  lg: '19rem',
};

const StyledRoot = styled.section<{
  $gap: string;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap};
  min-width: 0;
  position: relative;
  width: 100%;
`;

const StyledViewport = styled.div<{
  $snap: boolean;
}>`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: ${themeCssVariables.spacing[2]};
  scroll-behavior: smooth;
  scroll-snap-type: ${({ $snap }) => ($snap ? 'x mandatory' : 'none')};
  scrollbar-width: thin;

  &:focus-visible {
    border-radius: ${themeCssVariables.border.radius.sm};
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledCard = styled.li<{
  $width: string;
  $height: string;
  $padding: string;
  $radius: string;
  $blur: string;
  $shadow: string;
  $hoverShadow: string;
  $hoverLift: string;
  $hoverScale: string;
  $textAlign: CardCarouselTextAlign;
  $active: boolean;
  $disabled: boolean;
}>`
  backdrop-filter: blur(${({ $blur }) => $blur}) saturate(150%);
  background: ${themeCssVariables.background.transparent.medium};
  border: 1px solid ${themeCssVariables.border.color.transparentStrong};
  border-radius: ${({ $radius }) => $radius};
  box-shadow: ${({ $shadow }) => $shadow};
  box-sizing: border-box;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  height: ${({ $height }) => $height};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  overflow: hidden;
  padding: ${({ $padding }) => $padding};
  position: relative;
  scroll-snap-align: start;
  text-align: ${({ $textAlign }) => $textAlign};
  transition:
    transform ${themeCssVariables.animation.duration.fast} ease,
    box-shadow ${themeCssVariables.animation.duration.fast} ease,
    border-color ${themeCssVariables.animation.duration.fast} ease;
  width: ${({ $width }) => $width};

  &:hover,
  &:focus-visible {
    border-color: ${({ $active }) =>
      $active
        ? themeCssVariables.border.color.blue
        : themeCssVariables.border.color.strong};
    box-shadow: ${({ $hoverShadow, $disabled }) =>
      $disabled ? 'none' : $hoverShadow};
    transform: ${({ $hoverLift, $hoverScale, $disabled }) =>
      $disabled ? 'none' : `translateY(${$hoverLift}) scale(${$hoverScale})`};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover,
    &:focus-visible {
      transform: none;
    }
  }
`;

const StyledMedia = styled.div<{
  $radius: string;
  $aspect: CardCarouselImageAspect;
}>`
  aspect-ratio: ${({ $aspect }) =>
    $aspect === 'square'
      ? '1 / 1'
      : $aspect === 'portrait'
        ? '4 / 5'
        : $aspect === 'wide'
          ? '16 / 9'
          : '1 / 1'};
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${({ $radius }) => $radius};
  flex: 0 0 auto;
  overflow: hidden;
  position: relative;

  ${({ $aspect }) =>
    $aspect === 'circle'
      ? `align-self: center; border-radius: 50%; width: 72%;`
      : ''}
`;

const StyledImage = styled.img<{
  $fit: 'cover' | 'contain';
}>`
  display: block;
  height: 100%;
  object-fit: ${({ $fit }) => $fit};
  width: 100%;
`;

const StyledBody = styled.div<{
  $align: CardCarouselTextAlign;
}>`
  align-items: ${({ $align }) =>
    $align === 'center' ? 'center' : $align === 'right' ? 'flex-end' : 'stretch'};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.span`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${themeCssVariables.font.color.primary};
  display: -webkit-box;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSubtitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPrice = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

const StyledBadge = styled.span`
  background: ${themeCssVariables.background.transparent.strong};
  border: 1px solid ${themeCssVariables.border.color.transparentStrong};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  left: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  position: absolute;
  top: ${themeCssVariables.spacing[2]};
  z-index: 1;
`;

const StyledArrow = styled.button`
  align-items: center;
  backdrop-filter: blur(0.5rem);
  background: ${themeCssVariables.background.transparent.medium};
  border: 1px solid ${themeCssVariables.border.color.transparentStrong};
  border-radius: 50%;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: 2rem;
  justify-content: center;
  padding: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  z-index: 2;

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
`;

const StyledArrowLeft = styled(StyledArrow)`
  left: 0;
`;

const StyledArrowRight = styled(StyledArrow)`
  right: 0;
`;

const StyledDots = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

const StyledDot = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active
      ? themeCssVariables.font.color.primary
      : themeCssVariables.background.transparent.strong};
  border: none;
  border-radius: ${themeCssVariables.border.radius.pill};
  cursor: pointer;
  height: 0.4rem;
  padding: 0;
  transition: width ${themeCssVariables.animation.duration.fast} ease;
  width: ${({ $active }) => ($active ? '1.25rem' : '0.4rem')};
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

export const CardCarousel = ({
  items,
  layout = 'imageTop',
  visibility,
  imageAspect = 'square',
  imageFit = 'cover',
  appearance = {},
  showArrows = true,
  showDots = true,
  emptyLabel,
  ariaLabel,
  onCardClick,
}: CardCarouselProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const show = {
    image: visibility?.image ?? layout !== 'textOnly',
    title: visibility?.title ?? true,
    subtitle: visibility?.subtitle ?? true,
    price: visibility?.price ?? true,
    badge: visibility?.badge ?? true,
  };

  const {
    radius = 'rounded',
    size = 'md',
    cardWidth,
    cardHeight,
    gap = themeCssVariables.spacing[4],
    padding = themeCssVariables.spacing[3],
    textAlign = 'left',
    hover = 'lift',
    blur = '1rem',
    shadow = 'soft',
    overlayGradient = true,
    emphasisColor,
  } = appearance;

  const [cardRadius, mediaRadius] = RADII[radius];

  const cardShadow =
    shadow === 'none'
      ? 'none'
      : shadow === 'soft'
        ? themeCssVariables.boxShadow.light
        : themeCssVariables.boxShadow.strong;

  const hoverShadow =
    shadow === 'none' ? 'none' : themeCssVariables.boxShadow.strong;

  const rootStyle = useMemo(() => {
    if (!emphasisColor) {
      return undefined;
    }

    return { '--card-carousel-emphasis': emphasisColor } as React.CSSProperties;
  }, [emphasisColor]);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const target = viewportRef.current?.children[clamped];

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setActiveIndex(clamped);
  };

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const sync = () => {
      const middle = viewport.scrollLeft + viewport.clientWidth / 2;
      const cards = Array.from(viewport.children);

      let closest = 0;
      let smallest = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const center = element.offsetLeft + element.offsetWidth / 2;
        const distance = Math.abs(center - middle);

        if (distance < smallest) {
          smallest = distance;
          closest = index;
        }
      });

      setActiveIndex(closest);
      setAtStart(viewport.scrollLeft <= 2);
      setAtEnd(
        viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2,
      );
    };

    sync();
    viewport.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      viewport.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [items.length]);

  const onViewportKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      scrollToIndex(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      scrollToIndex(items.length - 1);
    }
  };

  const activate = (
    item: CardCarouselItem,
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>,
  ) => {
    if (item.disabled) {
      return;
    }

    if ('key' in event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
    }

    onCardClick?.(item);
  };

  if (items.length === 0) {
    return (
      <StyledRoot $gap={gap}>
        <StyledEmpty>{emptyLabel ?? t`No hay elementos para mostrar`}</StyledEmpty>
      </StyledRoot>
    );
  }

  return (
    <StyledRoot
      $gap={gap}
      style={rootStyle}
      aria-label={ariaLabel ?? t`Librería de tarjetas`}
      aria-roledescription={t`carrusel`}
      data-layout={layout}
      data-hover={hover}
      data-overlay-gradient={overlayGradient ? 'on' : 'off'}
    >
      {showArrows && (
        <StyledArrowLeft
          type="button"
          aria-label={t`Anterior`}
          disabled={atStart}
          onClick={() => scrollToIndex(activeIndex - 1)}
        >
          ‹
        </StyledArrowLeft>
      )}

      <StyledViewport
        ref={viewportRef}
        $snap
        tabIndex={0}
        role="list"
        onKeyDown={onViewportKeyDown}
      >
        {items.map((item, index) => (
          <StyledCard
            key={item.id}
            $width={cardWidth ?? SIZES[size]}
            $height={cardHeight ?? 'auto'}
            $padding={
              layout === 'imageOverlay' ? themeCssVariables.spacing[0] : padding
            }
            $radius={cardRadius}
            $blur={blur}
            $shadow={cardShadow}
            $hoverShadow={hoverShadow}
            $hoverLift={hover === 'lift' ? '-0.375rem' : '0'}
            $hoverScale={hover === 'scale' ? '1.03' : '1'}
            $textAlign={textAlign}
            $active={index === activeIndex}
            $disabled={item.disabled ?? false}
            role="button"
            tabIndex={item.disabled ? -1 : 0}
            aria-disabled={item.disabled ?? false}
            aria-label={item.title}
            data-active={index === activeIndex ? 'on' : 'off'}
            onClick={(event) => activate(item, event)}
            onKeyDown={(event) => activate(item, event)}
          >
            {show.image && (
              <StyledMedia $radius={mediaRadius} $aspect={imageAspect}>
                {item.imageSrc && (
                  <StyledImage
                    src={item.imageSrc}
                    alt={item.imageAlt ?? ''}
                    $fit={imageFit}
                    draggable={false}
                  />
                )}
              </StyledMedia>
            )}

            {show.badge && item.badge && <StyledBadge>{item.badge}</StyledBadge>}

            <StyledBody $align={textAlign}>
              {show.title && <StyledTitle>{item.title}</StyledTitle>}
              {show.subtitle && item.subtitle && (
                <StyledSubtitle>{item.subtitle}</StyledSubtitle>
              )}
              {show.price && item.price && (
                <StyledPrice>{item.price}</StyledPrice>
              )}
            </StyledBody>
          </StyledCard>
        ))}
      </StyledViewport>

      {showArrows && (
        <StyledArrowRight
          type="button"
          aria-label={t`Siguiente`}
          disabled={atEnd}
          onClick={() => scrollToIndex(activeIndex + 1)}
        >
          ›
        </StyledArrowRight>
      )}

      {showDots && (
        <StyledDots>
          {items.map((item, index) => (
            <StyledDot
              key={`dot-${item.id}`}
              type="button"
              $active={index === activeIndex}
              aria-label={t`Ir a la tarjeta ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </StyledDots>
      )}
    </StyledRoot>
  );
};
