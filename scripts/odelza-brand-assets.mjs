// Generates the Odelza icons and logos served by the app from the master
// SVGs in docs/brand. Run from the repo root: node scripts/odelza-brand-assets.mjs
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND_DIRECTORY = path.join(ROOT, 'docs/brand');
const OUTPUT_DIRECTORY = path.join(
  ROOT,
  'packages/twenty-front/public/images/odelza',
);

const COFFEE_BEAN = '#2D120D';
const BUTTER = '#FEEFB8';
const TILE_SIZE = 512;
const ROUNDED_TILE_RADIUS = 112;

const readMaster = async (fileName) => {
  const source = await readFile(path.join(BRAND_DIRECTORY, fileName), 'utf8');
  const withoutMetadata = source
    .replace(/<metadata>[\s\S]*?<\/metadata>/, '')
    .replace(/\s+xmlns:c2pa="[^"]*"/, '');
  const body = withoutMetadata
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '');

  return { cleanSvg: withoutMetadata, body };
};

// The three diagonal dots turn into noise at favicon sizes, so small icons
// use the cat alone.
const removeDots = (body) => body.replace(/<polygon[^>]*\/>/g, '');

const getContentBox = async (body) => {
  const probeSize = 2000;
  const probe = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${probeSize} ${probeSize}" width="${probeSize}" height="${probeSize}">${body}</svg>`,
  );
  const { info } = await sharp(probe)
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });

  return {
    x: -info.trimOffsetLeft,
    y: -info.trimOffsetTop,
    width: info.width,
    height: info.height,
  };
};

const buildTileSvg = async ({ body, background, radius, contentRatio }) => {
  const box = await getContentBox(body);
  const contentSize = TILE_SIZE * contentRatio;
  const offset = (TILE_SIZE - contentSize) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}"><rect width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${radius}" fill="${background}"/><svg x="${offset}" y="${offset}" width="${contentSize}" height="${contentSize}" viewBox="${box.x} ${box.y} ${box.width} ${box.height}">${body}</svg></svg>`;
};

const renderPng = (svg, width, height = width) =>
  sharp(Buffer.from(svg), { density: 300 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toBuffer();

// ICO files can embed PNG images directly, so the container is only a
// header plus a directory entry per size.
const buildIco = (images) => {
  const headerSize = 6;
  const entrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = headerSize + entrySize * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;

    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
};

const write = async (fileName, content) => {
  await writeFile(path.join(OUTPUT_DIRECTORY, fileName), content);
  console.log(`images/odelza/${fileName}`);
};

const main = async () => {
  await rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  for (const name of ['isotipo', 'imagotipo', 'logotipo']) {
    for (const variant of ['claro', 'oscuro']) {
      const { cleanSvg } = await readMaster(`odelza-${name}-${variant}.svg`);
      await write(`${name}-${variant}.svg`, cleanSvg);
    }
  }

  const isotipoOnDark = (await readMaster('odelza-isotipo-oscuro.svg')).body;

  const appIconSvg = await buildTileSvg({
    body: isotipoOnDark,
    background: COFFEE_BEAN,
    radius: ROUNDED_TILE_RADIUS,
    contentRatio: 0.68,
  });
  const faviconSvg = await buildTileSvg({
    body: removeDots(isotipoOnDark),
    background: COFFEE_BEAN,
    radius: ROUNDED_TILE_RADIUS,
    contentRatio: 0.78,
  });
  // iOS and Android apply their own mask, so these tiles are full squares.
  // Maskable icons keep the content inside the 80% safe zone.
  const appleTouchSvg = await buildTileSvg({
    body: isotipoOnDark,
    background: COFFEE_BEAN,
    radius: 0,
    contentRatio: 0.64,
  });
  const maskableSvg = await buildTileSvg({
    body: isotipoOnDark,
    background: COFFEE_BEAN,
    radius: 0,
    contentRatio: 0.56,
  });

  await write('icon.svg', appIconSvg);
  await write('favicon.svg', faviconSvg);
  await write('favicon-16.png', await renderPng(faviconSvg, 16));
  await write('favicon-32.png', await renderPng(faviconSvg, 32));
  await write(
    'favicon.ico',
    buildIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({
          size,
          data: await renderPng(faviconSvg, size),
        })),
      ),
    ),
  );
  await write('icon-192.png', await renderPng(appIconSvg, 192));
  await write('icon-512.png', await renderPng(appIconSvg, 512));
  await write('icon-maskable-512.png', await renderPng(maskableSvg, 512));
  await write('apple-touch-icon.png', await renderPng(appleTouchSvg, 180));
  await write('workspace-logo.png', await renderPng(appleTouchSvg, 256));

  const imagotipoOnLight = (await readMaster('odelza-imagotipo-claro.svg'))
    .cleanSvg;
  const imagotipo = await sharp(Buffer.from(imagotipoOnLight), { density: 300 })
    .resize({ width: 760 })
    .png()
    .toBuffer();
  const socialCard = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BUTTER },
  })
    .composite([{ input: imagotipo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await write('social-card.png', socialCard);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
