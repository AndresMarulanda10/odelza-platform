/* oxlint-disable no-await-in-loop */
import { handleIngress } from './ingress';
import { processDeliveryMessage } from './delivery-state';

const SERVICE_NAME = 'odelza-cross-workspace-bridge';
const INGRESS_PATH = '/webhooks/twenty';

const worker = {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: SERVICE_NAME,
      });
    }

    if (request.method === 'POST' && url.pathname === INGRESS_PATH) {
      return handleIngress(request, env);
    }
    return Response.json({ error: 'not_found' }, { status: 404 });
  },
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      // Keep each receipt transaction isolated so one permanent message does not
      // prevent already-persisted messages from being acknowledged.
      await processDeliveryMessage(message, env.BRIDGE_DB);
    }
  },
} satisfies ExportedHandler<Env>;

export default worker;
