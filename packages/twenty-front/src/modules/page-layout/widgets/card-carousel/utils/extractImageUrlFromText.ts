import { isDefined } from 'twenty-shared/utils';

/*
 * Muchos registros no guardan la imagen en un campo propio, sino dentro de un
 * texto (el cuerpo del registro, por ejemplo). Estas dos formas son las que
 * aparecen en la practica.
 */
const MARKDOWN_IMAGE_URL = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i;
const PLAIN_IMAGE_URL =
  /https?:\/\/[^\s")]+\.(?:png|jpe?g|gif|webp|avif|svg|bmp)/i;

export const extractImageUrlFromText = (
  text: string,
): string | undefined => {
  const markdownMatch = text.match(MARKDOWN_IMAGE_URL);

  if (isDefined(markdownMatch?.[1])) {
    return markdownMatch[1];
  }

  return text.match(PLAIN_IMAGE_URL)?.[0];
};
