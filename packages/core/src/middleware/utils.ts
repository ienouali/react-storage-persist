const ENVELOPE_TAG = '__rsp';

export type EnvelopeKind = 'enc' | 'cmp';

export type Envelope<K extends EnvelopeKind, A extends string> = {
  [ENVELOPE_TAG]: K;
  v: 1;
  alg: A;
  data: string;
  iv?: string;
};

export function createEnvelope<K extends EnvelopeKind, A extends string>(
  kind: K,
  alg: A,
  data: string,
  iv?: string
): Envelope<K, A> {
  const envelope: Envelope<K, A> = { [ENVELOPE_TAG]: kind, v: 1, alg, data };
  if (iv !== undefined) envelope.iv = iv;
  return envelope;
}

export function isEnvelope<K extends EnvelopeKind>(
  value: unknown,
  kind: K
): value is Envelope<K, string> {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate[ENVELOPE_TAG] === kind &&
    candidate.v === 1 &&
    typeof candidate.alg === 'string' &&
    typeof candidate.data === 'string'
  );
}

export function utf8Encode(text: string) {
  return new TextEncoder().encode(text);
}

export function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return globalThis.btoa(binary);
}

export function base64ToBytes(base64: string) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function pipeBytes(
  bytes: Uint8Array,
  transform: { writable: WritableStream<BufferSource>; readable: ReadableStream<Uint8Array> }
): Promise<Uint8Array> {
  const writer = transform.writable.getWriter();
  // Write and read concurrently; awaiting the write first would deadlock on backpressure.
  const writing = writer.write(bytes as BufferSource).then(() => writer.close());
  writing.catch(() => {});

  const reader = transform.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await writing;

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
