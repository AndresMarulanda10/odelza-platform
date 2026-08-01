const SERVICE_NAME = 'odelza-cross-workspace-bridge';

type NoopQueueMessage = {
  type: 'noop';
};

const isNoopQueueMessage = (body: unknown): body is NoopQueueMessage =>
  typeof body === 'object' &&
  body !== null &&
  'type' in body &&
  body.type === 'noop';

const worker = {
  fetch(request): Response {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: SERVICE_NAME,
      });
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
