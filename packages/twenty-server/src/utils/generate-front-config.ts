import * as fs from 'fs';
import * as path from 'path';

import { config } from 'dotenv';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const SOCIAL_IMAGE_PATH = '/images/odelza/social-card.png';

const SOCIAL_IMAGE_META_PATTERN =
  /(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")[^"]*(")/g;

export function generateFrontConfig(): void {
  // When FRONT_AUTO_BASE_URL=true (or SERVER_URL is unset), inject an empty
  // _env_ so the frontend's getDefaultUrl() fallback resolves the API origin
  // from the page's own hostname at request time. This lets the same deploy
  // be reached at both http://<external-ip> and http://localhost without a
  // hairpin through the public interface.
  const serverUrl =
    process.env.FRONT_AUTO_BASE_URL === 'true'
      ? undefined
      : process.env.SERVER_URL;

  const envForFront = serverUrl ? { REACT_APP_SERVER_BASE_URL: serverUrl } : {};

  // Link preview crawlers ignore relative og:image URLs.
  const socialImageUrl = serverUrl
    ? `${serverUrl.replace(/\/+$/, '')}${SOCIAL_IMAGE_PATH}`
    : SOCIAL_IMAGE_PATH;

  const configString = `<!-- BEGIN: Odelza Config -->
    <script id="odelza-env-config">
      window._env_ = ${JSON.stringify(envForFront, null, 2)};
    </script>
    <!-- END: Odelza Config -->`;

  const distPath = path.join(__dirname, '..', 'front');
  const indexPath = path.join(distPath, 'index.html');

  try {
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    indexContent = indexContent
      .replace(
        /<!-- BEGIN: Odelza Config -->[\s\S]*?<!-- END: Odelza Config -->/,
        configString,
      )
      .replace(
        SOCIAL_IMAGE_META_PATTERN,
        (_match, prefix: string, suffix: string) =>
          `${prefix}${socialImageUrl}${suffix}`,
      );

    fs.writeFileSync(indexPath, indexContent, 'utf8');
  } catch {
    // oxlint-disable-next-line no-console
    console.log(
      'Frontend build not found or not writable, assuming it is served independently',
    );
  }
}
