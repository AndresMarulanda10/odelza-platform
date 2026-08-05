import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

// @ts-expect-error Vite provides raw imports during test bundling.
import wranglerConfig from '../wrangler.jsonc?raw';

describe('cross-workspace bridge', () => {
  it('returns public service health', async () => {
    const response = await exports.default.fetch('https://bridge.test/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      service: 'odelza-cross-workspace-bridge',
    });
  });

  it('returns 404 for other routes', async () => {
    const response = await exports.default.fetch('https://bridge.test/missing');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  });

  it('configures a consumer for every environment', () => {
    expect(wranglerConfig.match(/"producers"/g)).toHaveLength(3);
    expect(wranglerConfig.match(/"consumers"/g)).toHaveLength(3);
    expect(wranglerConfig).toContain('migrations_dir');
  });
});
