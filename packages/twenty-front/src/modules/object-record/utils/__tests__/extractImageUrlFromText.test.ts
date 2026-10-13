import { extractImageUrlFromText } from '@/object-record/utils/extractImageUrlFromText';

describe('extractImageUrlFromText', () => {
  it.each([
    'png',
    'JPG',
    'jpeg',
    'gif',
    'webp',
    'avif',
    'svg',
    'heif',
    'tif',
    'tiff',
    'bmp',
    'ico',
  ])('preserves query and hash for %s images', (extension) => {
    const url = `https://example.com/photo.${extension}?token=value#preview`;
    expect(extractImageUrlFromText(`Image: ${url}`)).toBe(url);
    expect(extractImageUrlFromText(`<img src="${url}">`)).toBe(url);
  });
  it.each([
    'https://example.com/photo.png.html',
    'https://example.com/page',
    'https://example.com/page?next=photo.png',
    'https://example.com/page#photo.png',
    'https://example.png',
    ['javascript', 'alert(1)'].join(':'),
    'data:image/png;base64,AAAA',
    '   ',
  ])('rejects non-image text %s', (text) => {
    expect(extractImageUrlFromText(text)).toBeUndefined();
  });
  it('finds the image of a markdown body', () => {
    expect(
      extractImageUrlFromText(
        '![foto](http://127.0.0.1:8123/tarea-01.jpg)\n\nResto del texto',
      ),
    ).toBe('http://127.0.0.1:8123/tarea-01.jpg');
  });

  it('preserves explicitly marked extensionless Markdown images', () => {
    const url = 'https://example.com/image?token=value#preview';
    expect(extractImageUrlFromText(`![image](${url})`)).toBe(url);
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
