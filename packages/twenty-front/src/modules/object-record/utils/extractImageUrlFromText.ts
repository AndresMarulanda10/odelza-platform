import { isDefined } from 'twenty-shared/utils';

/*
 * Muchos registros no guardan la imagen en un campo propio, sino dentro de un
 * texto (el cuerpo del registro, por ejemplo). Estas dos formas son las
 * habituales y son las que se reconocen aqui.
 */
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i;
const PLAIN_IMAGE_URL_PATTERN =
  /https?:\/\/[^\s")]+\.(?:png|jpe?g|gif|webp|avif|svg)/i;

export const extractImageUrlFromText = (text: string): string | undefined => {
  const markdownMatch = text.match(MARKDOWN_IMAGE_PATTERN);

  if (isDefined(markdownMatch?.[1])) {
    return markdownMatch[1];
  }

  const plainMatch = text.match(PLAIN_IMAGE_URL_PATTERN);

  return plainMatch?.[0];
};
