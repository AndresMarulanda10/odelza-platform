import {
  normalizeCardCarouselHover,
  normalizeCardCarouselImageAspect,
  normalizeCardCarouselLayout,
  normalizeCardCarouselRadius,
  normalizeCardCarouselSize,
  normalizeCardCarouselTextAlign,
} from '@/page-layout/widgets/card-carousel/utils/normalizeCardCarouselConfiguration';

describe('normalizeCardCarouselConfiguration', () => {
  it('keeps the values stored by the server', () => {
    expect(normalizeCardCarouselLayout('imageOverlay')).toBe('imageOverlay');
    expect(normalizeCardCarouselImageAspect('portrait')).toBe('portrait');
    expect(normalizeCardCarouselRadius('pill')).toBe('pill');
    expect(normalizeCardCarouselSize('lg')).toBe('lg');
    expect(normalizeCardCarouselTextAlign('center')).toBe('center');
    expect(normalizeCardCarouselHover('glow')).toBe('glow');
  });

  it('falls back when the value is missing', () => {
    expect(normalizeCardCarouselLayout(undefined)).toBe('imageTop');
    expect(normalizeCardCarouselLayout(null)).toBe('imageTop');
    expect(normalizeCardCarouselImageAspect(undefined)).toBe('square');
    expect(normalizeCardCarouselRadius(undefined)).toBe('rounded');
    expect(normalizeCardCarouselSize(undefined)).toBe('md');
    expect(normalizeCardCarouselTextAlign(undefined)).toBe('left');
    expect(normalizeCardCarouselHover(undefined)).toBe('lift');
  });

  it('falls back when the value is not one of the allowed ones', () => {
    expect(normalizeCardCarouselLayout('sideways')).toBe('imageTop');
    expect(normalizeCardCarouselImageAspect('ultraWide')).toBe('square');
    expect(normalizeCardCarouselRadius('blobby')).toBe('rounded');
    expect(normalizeCardCarouselSize('xl')).toBe('md');
    expect(normalizeCardCarouselTextAlign('justify')).toBe('left');
    expect(normalizeCardCarouselHover('explode')).toBe('lift');
  });
});
