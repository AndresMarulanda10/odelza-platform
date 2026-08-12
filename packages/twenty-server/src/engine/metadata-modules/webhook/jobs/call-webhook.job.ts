import crypto from 'crypto';

import { ensureAbsoluteUrl } from 'twenty-shared/utils';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { WEBHOOK_RESPONSE_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/webhook/webhook-response';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';

type BridgeWebhookConfig = {
  webhookUrl?: string;
  accessClientId?: string;
  accessClientSecret?: string;
};

export const computeBridgeDeliveryId = (data: WebhookJobData): string => {
  const recordId =
    'record' in data &&
    typeof data.record === 'object' &&
    data.record !== null &&
    'id' in data.record &&
    typeof data.record.id === 'string'
      ? data.record.id
      : 'event' in data
        ? data.event.recordId
        : '';
  const eventDate = new Date(data.eventDate);

  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify([
        data.workspaceId,
        data.webhookId,
        data.eventName,
        recordId,
        eventDate.toISOString(),
        'updatedFields' in data ? (data.updatedFields ?? []) : [],
      ]),
    )
    .digest('hex');
};

export const buildWebhookRequest = ({
  targetUrl,
  payload,
  deliveryId,
  secret,
  timestamp,
  nonce,
  bridgeConfig,
}: {
  targetUrl: string;
  payload: Record<string, unknown>;
  deliveryId: string;
  secret?: string;
  timestamp: string;
  nonce: string;
  bridgeConfig: BridgeWebhookConfig;
}) => {
  const bridgeConfigValues = Object.values(bridgeConfig);
  const hasBridgeConfig = bridgeConfigValues.some(Boolean);
  const hasCompleteBridgeConfig = bridgeConfigValues.every(Boolean);

  if (hasBridgeConfig && !hasCompleteBridgeConfig) {
    throw new Error('Cross-workspace bridge configuration is incomplete');
  }

  const isBridgeTarget =
    hasCompleteBridgeConfig && targetUrl === bridgeConfig.webhookUrl;

  if (isBridgeTarget && !secret) {
    throw new Error('Cross-workspace bridge webhook secret is missing');
  }

  const rawBody = JSON.stringify(
    isBridgeTarget ? { ...payload, deliveryId } : payload,
  );
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    headers['X-Twenty-Webhook-Timestamp'] = timestamp;
    headers['X-Twenty-Webhook-Nonce'] = nonce;
    headers['X-Twenty-Webhook-Signature'] = crypto
      .createHmac('sha256', secret)
      .update(
        isBridgeTarget
          ? `${timestamp}:${nonce}:${rawBody}`
          : `${timestamp}:${rawBody}`,
      )
      .digest('hex');
  }

  if (isBridgeTarget) {
    headers['CF-Access-Client-Id'] = bridgeConfig.accessClientId!;
    headers['CF-Access-Client-Secret'] = bridgeConfig.accessClientSecret!;
  }

  return { rawBody, headers };
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly metricsService: MetricsService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(CallWebhookJob.name)
  async handle(webhookJobEvents: WebhookJobData[]): Promise<void> {
    await Promise.all(
      webhookJobEvents.map(
        async (webhookJobEvent) => await this.callWebhook(webhookJobEvent),
      ),
    );
  }

  private async callWebhook(data: WebhookJobData): Promise<void> {
    const commonPayload = {
      url: data.targetUrl,
      webhookId: data.webhookId,
      eventName: data.eventName,
    };
    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId: data.workspaceId,
    });
    let shouldRetryBridgeFailure = false;

    try {
      const { secret, ...payloadWithoutSecret } = data;
      const targetUrl = ensureAbsoluteUrl(data.targetUrl);
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const { rawBody, headers } = buildWebhookRequest({
        targetUrl,
        payload: payloadWithoutSecret,
        deliveryId: computeBridgeDeliveryId(data),
        secret,
        timestamp,
        nonce,
        bridgeConfig: {
          webhookUrl: this.twentyConfigService.get(
            'CROSS_WORKSPACE_BRIDGE_WEBHOOK_URL',
          ),
          accessClientId: this.twentyConfigService.get(
            'CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_ID',
          ),
          accessClientSecret: this.twentyConfigService.get(
            'CROSS_WORKSPACE_BRIDGE_ACCESS_CLIENT_SECRET',
          ),
        },
      });
      shouldRetryBridgeFailure = 'CF-Access-Client-Id' in headers;

      const axiosClient = this.secureHttpClientService.getHttpClient(
        undefined,
        {
          workspaceId: data.workspaceId,
          userId: data.userId,
          source: 'webhook',
        },
      );

      const response = await axiosClient.post(targetUrl, rawBody, {
        headers,
        timeout: 5_000,
        ...(shouldRetryBridgeFailure && { maxRedirects: 0 }),
      });

      const success = response.status >= 200 && response.status < 300;

      void eventLogContext.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        status: response.status,
        success,
        ...commonPayload,
      });

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobWebhookCallCompleted,
        shouldStoreInCache: false,
      });
    } catch (err) {
      const isSSRFBlocked =
        err instanceof Error &&
        err.message.includes('internal IP address') &&
        err.message.includes('is not allowed');

      void eventLogContext.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        success: false,
        ...commonPayload,
        ...(err.response && { status: err.response.status }),
        ...(isSSRFBlocked && {
          error: 'Webhook URL resolves to a private/internal IP address',
        }),
      });

      if (shouldRetryBridgeFailure) {
        throw err;
      }
    }
  }
}
