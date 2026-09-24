import {
  type CardCarouselHover,
  type CardCarouselImageAspect,
  type CardCarouselLayout,
  type CardCarouselRadius,
  type CardCarouselSize,
  type CardCarouselTextAlign,
} from '@/page-layout/widgets/card-carousel/components/CardCarousel';
import { isDefined } from 'twenty-shared/utils';

/*
 * El servidor guarda estos ajustes como texto libre, así que el componente
 * recibe cadenas que hay que estrechar a sus valores válidos antes de usarlas.
 * Un valor raro nunca rompe el render: cae al predeterminado.
 */
const pickValue = <T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T =>
  isDefined(value) && (allowedValues as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

const LAYOUTS = ['imageTop', 'imageCenter', 'imageOverlay', 'textOnly'] as const;
const IMAGE_ASPECTS = ['square', 'portrait', 'wide', 'circle'] as const;
const RADII = ['square', 'soft', 'rounded', 'pill'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const TEXT_ALIGNS = ['left', 'center', 'right'] as const;
const HOVER_EFFECTS = ['lift', 'scale', 'glow', 'none'] as const;

export const normalizeCardCarouselLayout = (
  value: string | null | undefined,
): CardCarouselLayout => pickValue(value, LAYOUTS, 'imageTop');

export const normalizeCardCarouselImageAspect = (
  value: string | null | undefined,
): CardCarouselImageAspect => pickValue(value, IMAGE_ASPECTS, 'square');

export const normalizeCardCarouselRadius = (
  value: string | null | undefined,
): CardCarouselRadius => pickValue(value, RADII, 'rounded');

export const normalizeCardCarouselSize = (
  value: string | null | undefined,
): CardCarouselSize => pickValue(value, SIZES, 'md');

export const normalizeCardCarouselTextAlign = (
  value: string | null | undefined,
): CardCarouselTextAlign => pickValue(value, TEXT_ALIGNS, 'left');

export const normalizeCardCarouselHover = (
  value: string | null | undefined,
): CardCarouselHover => pickValue(value, HOVER_EFFECTS, 'lift');
