/* oxlint-disable no-await-in-loop */
export const MAX_SHARED_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_SHARED_FILE_MEDIA_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
]);
export type SharedFileDescriptor = {
  fileId: string;
  name: string;
  mediaType: string;
  sizeBytes: number;
  downloadUrl: string;
};
export type SharedFile = SharedFileDescriptor & { digest: string };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const validateSharedFileDescriptor = (
  value: unknown,
): value is SharedFileDescriptor => {
  if (!isRecord(value) || typeof value.downloadUrl !== 'string') return false;
  let https = false;
  try {
    https = new URL(value.downloadUrl).protocol === 'https:';
  } catch {
    return false;
  }
  return (
    typeof value.mediaType === 'string' &&
    ALLOWED_SHARED_FILE_MEDIA_TYPES.has(value.mediaType) &&
    typeof value.sizeBytes === 'number' &&
    Number.isSafeInteger(value.sizeBytes) &&
    value.sizeBytes >= 0 &&
    value.sizeBytes <= MAX_SHARED_FILE_BYTES &&
    https
  );
};
export const readSharedFile = async (
  descriptor: SharedFileDescriptor,
  fetcher: typeof fetch = fetch,
): Promise<SharedFile> => {
  if (!validateSharedFileDescriptor(descriptor))
    throw new Error('shared_file_descriptor_invalid');
  const response = await fetcher(descriptor.downloadUrl);
  const mediaType = response.headers.get('content-type')?.split(';')[0].trim();
  if (!response.ok || !response.body)
    throw new Error('shared_file_fetch_failed');
  if (mediaType && mediaType !== descriptor.mediaType)
    throw new Error('shared_file_media_type_mismatch');
  const body = await readBounded(response.body);
  // @ts-expect-error Cloudflare's runtime accepts Uint8Array bodies.
  const arrayBuffer = await new Response(body).arrayBuffer();
  const digest = [
    ...new Uint8Array(await crypto.subtle.digest('SHA-256', arrayBuffer)),
  ]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return { ...descriptor, digest };
};
const readBounded = async (
  body: ReadableStream<Uint8Array>,
): Promise<Uint8Array> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SHARED_FILE_BYTES)
        throw new Error('shared_file_too_large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
};
