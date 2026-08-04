import { handleIngress } from './ingress';

const SERVICE_NAME = 'odelza-cross-workspace-bridge';
const INGRESS_PATH = '/webhooks/twenty';

type NoopQueueMessage = {
  type: 'noop';
};

const isNoopQueueMessage = (body: unknown): body is NoopQueueMessage =>
  typeof body === 'object' &&
  body !== null &&
  'type' in body &&
  body.type === 'noop';

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
  queue(batch): void {
    for (const message of batch.messages) {
      if (isNoopQueueMessage(message.body)) {
        message.ack();
      } else {
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Env>;

export default worker;
