import crypto from 'crypto';

import { validate } from 'src/engine/core-modules/twenty-config/config-variables';
import {
  buildWebhookRequest,
  CallWebhookJob,
} from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';

const BRIDGE_URL = 'https://bridge.example.com/webhooks/twenty';
const ACCESS_CLIENT_ID = 'access-client-id';
const ACCESS_CLIENT_SECRET = 'access-client-secret';
const WEBHOOK_SECRET = 'webhook-secret';
const TIMESTAMP = '1754053200000';
const NONCE = '0123456789abcdef';
const payload = { eventName: 'task.updated', record: { id: 'record-id' } };
const bridgeConfig = {
  webhookUrl: BRIDGE_URL,
  accessClientId: ACCESS_CLIENT_ID,
  accessClientSecret: ACCESS_CLIENT_SECRET,
};
const requestArgs = {
  targetUrl: BRIDGE_URL,
  payload,
  secret: WEBHOOK_SECRET,
  timestamp: TIMESTAMP,
  nonce: NONCE,
  bridgeConfig,
};
const requiredConfig = {
  PG_DATABASE_URL: 'postgres://user:password@localhost:5432/database',
  REDIS_URL: 'redis://localhost:6379',
  APP_SECRET: 'app-secret',
};

describe('bridge configuration', () => {
  it('accepts disabled bridge configuration when values are absent or blank', () => {
    validate(requiredConfig);
    validate({
      ...requiredConfig,
      CROSS_WORKSPACE_BRIDGE_WEBHOOK_URL: '',
      CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_ID: '',
      CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_SECRET: '',
    });
  });

  it('rejects a partially configured bridge at configuration validation', () => {
    expect(() =>
      validate({
        CROSS_WORKSPACE_BRIDGE_WEBHOOK_URL: BRIDGE_URL,
      }),
    ).toThrow('Cross-workspace bridge configuration is incomplete');
  });

  it('rejects a fully configured bridge using HTTP', () => {
    expect(() =>
      validate({
        ...requiredConfig,
        CROSS_WORKSPACE_BRIDGE_WEBHOOK_URL:
          'http://bridge.example.com/webhooks/twenty',
        CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_ID: ACCESS_CLIENT_ID,
        CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_SECRET: ACCESS_CLIENT_SECRET,
      }),
    ).toThrow('Config variables validation failed');
  });
});

describe('buildWebhookRequest', () => {
  it.each([
    `${BRIDGE_URL}/suffix`,
    `${BRIDGE_URL}?delivery=test`,
    'https://bridge.example.com/webhooks',
    'https://bridge.example.net/webhooks/twenty',
  ])('does not attach Access credentials to near-match URL %s', (targetUrl) => {
    const request = buildWebhookRequest({ ...requestArgs, targetUrl });
    expect(request.headers).not.toHaveProperty('CF-Access-Client-Id');
    expect(request.headers).not.toHaveProperty('CF-Access-Client-Secret');
  });

  it('retains the legacy timestamp and raw-body signature for ordinary webhooks', () => {
    const request = buildWebhookRequest({
      ...requestArgs,
      targetUrl: 'https://hooks.example.com/events',
    });
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(`${TIMESTAMP}:${request.rawBody}`)
      .digest('hex');

    expect(request.headers['X-Twenty-Webhook-Signature']).toBe(
      expectedSignature,
    );
    expect(request.headers['X-Twenty-Webhook-Nonce']).toBe(NONCE);
  });

  it.each(['webhookUrl', 'accessClientId', 'accessClientSecret'] as const)(
    'rejects partial bridge configuration missing %s without exposing values',
    (missingKey) => {
      const partialConfig = { ...bridgeConfig, [missingKey]: undefined };
      expect(() =>
        buildWebhookRequest({
          ...requestArgs,
          bridgeConfig: partialConfig,
        }),
      ).toThrow('Cross-workspace bridge configuration is incomplete');
    },
  );
});

describe('CallWebhookJob', () => {
  const buildJob = ({
    targetUrl = BRIDGE_URL,
    post = jest.fn().mockResolvedValue({ status: 202 }),
  }: { targetUrl?: string; post?: jest.Mock } = {}) => {
    const insertWorkspaceEvent = jest.fn();
    const incrementCounterForEvent = jest.fn();
    const configValues = [BRIDGE_URL, ACCESS_CLIENT_ID, ACCESS_CLIENT_SECRET];
    const job = new CallWebhookJob(
      { createContext: () => ({ insertWorkspaceEvent }) } as never,
      { incrementCounterForEvent } as never,
      { getHttpClient: () => ({ post }) } as never,
      { get: () => configValues.shift() } as never,
    );
    const event = {
      targetUrl,
      webhookId: 'webhook-id',
      workspaceId: 'workspace-id',
      eventName: 'task.updated',
      secret: WEBHOOK_SECRET,
      event: { type: 'task.updated' },
    } as never;
    return { event, incrementCounterForEvent, insertWorkspaceEvent, job, post };
  };

  it('posts the exact signed raw body and keeps secrets out of payloads and events', async () => {
    const { event, insertWorkspaceEvent, job, post } = buildJob();
    await job.handle([event]);
    const [targetUrl, rawBody, options] = post.mock.calls[0];
    const parsedBody = JSON.parse(rawBody);

    expect(targetUrl).toBe(BRIDGE_URL);
    expect(typeof rawBody).toBe('string');
    expect(options.maxRedirects).toBe(0);
    expect(options.headers).toMatchObject({
      'CF-Access-Client-Id': ACCESS_CLIENT_ID,
      'CF-Access-Client-Secret': ACCESS_CLIENT_SECRET,
    });
    expect(options.headers['X-Twenty-Webhook-Signature']).toBe(
      crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(
          `${options.headers['X-Twenty-Webhook-Timestamp']}:${options.headers['X-Twenty-Webhook-Nonce']}:${rawBody}`,
        )
        .digest('hex'),
    );
    expect(parsedBody).not.toHaveProperty('secret');
    expect(rawBody).not.toContain(ACCESS_CLIENT_ID);
    expect(rawBody).not.toContain(ACCESS_CLIENT_SECRET);
    expect(JSON.stringify(insertWorkspaceEvent.mock.calls)).not.toContain(
      ACCESS_CLIENT_SECRET,
    );
  });

  it('logs and rethrows exact bridge request failures for queue retry', async () => {
    const requestError = new Error('request timed out');
    const { event, incrementCounterForEvent, insertWorkspaceEvent, job } =
      buildJob({ post: jest.fn().mockRejectedValue(requestError) });
    await expect(job.handle([event])).rejects.toBe(requestError);
    expect(insertWorkspaceEvent).toHaveBeenCalled();
    expect(incrementCounterForEvent).not.toHaveBeenCalled();
  });

  it('preserves ordinary webhook redirects and swallowed failures', async () => {
    const requestError = new Error('ordinary webhook failed');
    const { event, insertWorkspaceEvent, job, post } = buildJob({
      targetUrl: 'https://hooks.example.com/events',
      post: jest.fn().mockRejectedValue(requestError),
    });
    await expect(job.handle([event])).resolves.toBeUndefined();
    expect(post.mock.calls[0][2]).not.toHaveProperty('maxRedirects');
    expect(insertWorkspaceEvent).toHaveBeenCalled();
  });
});
