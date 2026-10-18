export type FeedScope = {
  scope: string; subject: string | null; session: string | null;
  environment: string; limit: number; client_release: string;
};
export type FeedCursor = FeedScope & { position: string; created_at: string; config_version: string };
const text = new TextEncoder();
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('INVALID_INPUT');
  const bytes = Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/') + '='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
  if (encode(bytes)!==value) throw new Error('INVALID_INPUT');
  return bytes;
}
async function key(secret: string) {
  if (!secret) throw new Error('SERVICE_UNAVAILABLE');
  return crypto.subtle.importKey('raw',text.encode(secret),{ name:'HMAC',hash:'SHA-256' },false,['sign','verify']);
}
export async function readFeedCursor(value: string,scope: FeedScope,secret: string): Promise<FeedCursor> {
  if (value.length>2048) throw new Error('INVALID_INPUT');
  const envelope = JSON.parse(new TextDecoder().decode(decode(value)));
  if (!envelope || typeof envelope!=='object' || Object.keys(envelope).length!==2 ||
      typeof envelope.payload!=='string' || typeof envelope.signature!=='string' ||
      !await crypto.subtle.verify('HMAC',await key(secret),decode(envelope.signature),text.encode(envelope.payload))) throw new Error('INVALID_INPUT');
  const cursor = JSON.parse(envelope.payload);
  if (!cursor || typeof cursor!=='object' || Object.keys(cursor).length!==9 ||
      typeof cursor.position!=='string' || !uuid.test(cursor.position) ||
      typeof cursor.created_at!=='string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(cursor.created_at) ||
      typeof cursor.config_version!=='string' || !cursor.config_version.length || cursor.config_version.length>256 ||
      Object.entries(scope).some(([name,value])=>cursor[name]!==value)) throw new Error('INVALID_INPUT');
  return cursor;
}
export async function writeFeedCursor(cursor: FeedCursor,secret: string): Promise<string> {
  const payload = JSON.stringify(cursor);
  const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),text.encode(payload))));
  return encode(text.encode(JSON.stringify({ payload,signature })));
}
