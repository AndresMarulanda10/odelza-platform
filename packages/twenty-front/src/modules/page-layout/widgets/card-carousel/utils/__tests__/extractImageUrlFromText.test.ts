import { extractImageUrlFromText } from '@/page-layout/widgets/card-carousel/utils/extractImageUrlFromText';

describe('extractImageUrlFromText', () => {
  it('finds the image of a markdown body', () => {
    expect(
      extractImageUrlFromText(
        '![foto](http://127.0.0.1:8123/tarea-01.jpg)\n\nResto del texto',
      ),
    ).toBe('http://127.0.0.1:8123/tarea-01.jpg');
  });

  it('finds a bare image link', () => {
    expect(
      extractImageUrlFromText('Mira esto http://example.com/foto.png y sigue'),
    ).toBe('http://example.com/foto.png');
  });

  it('prefers the markdown image when both are present', () => {
    expect(
      extractImageUrlFromText(
        '![a](https://a.example/uno.jpg) y https://b.example/dos.png',
      ),
    ).toBe('https://a.example/uno.jpg');
  });

  it('ignores links that are not images', () => {
    expect(
      extractImageUrlFromText('Lee https://example.com/informe.pdf'),
    ).toBeUndefined();
  });

  it('returns nothing for empty text', () => {
    expect(extractImageUrlFromText('')).toBeUndefined();
  });
});
