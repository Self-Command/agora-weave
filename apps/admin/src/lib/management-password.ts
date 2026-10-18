import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { deflateSync } from 'node:zlib';

const lifetime = 120;
const digits = ['11111100011000110001100011000111111', '00100011000010000100001000010001110',
  '11111000010000111111100001000011111', '11111000010000101111000010000111111',
  '10001100011000111111000010000100001', '11111100001000011111000010000111111',
  '11111100001000011111100011000111111', '11111000010001000100010000100001000',
  '11111100011000111111100011000111111', '11111100011000111111000010000111111'];
type Captcha = { id: string; answer: string; expires_at: number };

function encryption() {
  const environment = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT;
  const secret = process.env.AGORAWEAVE_ADMIN_SESSION_KEY;
  if (!['dev', 'test', 'production'].includes(environment ?? '') || !/^[a-f0-9]{64}$/i.test(secret ?? '')) throw new Error('SERVICE_UNAVAILABLE');
  return { key: Buffer.from(secret!, 'hex'), aad: Buffer.from(`agoraweave:admin-captcha:v1:${environment}`) };
}

export function passwordBffHeaders(path: string, body: unknown): Record<string, string> {
  const key = process.env.AGORAWEAVE_ADMIN_PASSWORD_BFF_KEY;
  if (!/^[a-f0-9]{64}$/i.test(key ?? '')) throw new Error('SERVICE_UNAVAILABLE');
  const timestamp = String(Math.floor(Date.now() / 1000)), nonce = randomUUID();
  const digest = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const signature = createHmac('sha256', Buffer.from(key!, 'hex')).update(`${timestamp}\n${nonce}\nPOST\n${path}\n${digest}`).digest('hex');
  return { 'X-Admin-Password-Time': timestamp, 'X-Admin-Password-Nonce': nonce, 'X-Admin-Password-Signature': signature };
}

function chunk(type: string, bytes: Buffer) {
  const input = Buffer.concat([Buffer.from(type), bytes]); let crc = 0xffffffff;
  for (const byte of input) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0); }
  const size = Buffer.alloc(4), checksum = Buffer.alloc(4); size.writeUInt32BE(bytes.length); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([size, input, checksum]);
}

function captchaPng(answer: string) {
  const width = 184, height = 64, stride = width * 3 + 1, pixels = Buffer.alloc(stride * height, 246);
  for (let y = 0; y < height; y++) pixels[y * stride] = 0;
  const draw = (x: number, y: number, color: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const at = y * stride + x * 3 + 1; pixels[at] = color; pixels[at + 1] = color + 8; pixels[at + 2] = color + 16;
  };
  for (let n = 0; n < 450; n++) draw(randomInt(width), randomInt(height), randomInt(100, 215));
  for (let n = 0; n < answer.length; n++) {
    const glyph = digits[Number(answer[n])], offsetX = 8 + n * 29, offsetY = randomInt(11, 25), color = randomInt(18, 65);
    for (let cell = 0; cell < 35; cell++) if (glyph[cell] === '1') {
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) draw(offsetX + cell % 5 * 4 + dx, offsetY + Math.floor(cell / 5) * 4 + dy, color);
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return 'data:image/png;base64,' + Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]).toString('base64');
}

export function passwordCaptchaCookie() {
  const secure = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT === 'production';
  return { name: secure ? '__Host-agora-admin-captcha' : 'agora-admin-captcha', options: {
    httpOnly: true, secure, sameSite: 'strict' as const, path: '/', maxAge: lifetime
  } };
}

export function issuePasswordCaptcha() {
  const captcha: Captcha = { id: randomUUID(), answer: String(randomInt(0, 1000000)).padStart(6, '0'), expires_at: Math.floor(Date.now() / 1000) + lifetime };
  const { key, aad } = encryption(), iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv); cipher.setAAD(aad);
  const bytes = Buffer.concat([cipher.update(JSON.stringify(captcha)), cipher.final()]);
  return { cookie: Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString('base64url'),
    data: { captcha_id: captcha.id, image_data_url: captchaPng(captcha.answer), expires_at: new Date(captcha.expires_at * 1000).toISOString() } };
}

export function verifyPasswordCaptcha(value: string | undefined, id: string, answer: string): boolean {
  if (!value || value.length > 1024 || !/^[\w-]+$/.test(value) || !/^\d{6}$/.test(answer)) return false;
  const { key, aad } = encryption();
  try {
    const bytes = Buffer.from(value, 'base64url'); if (bytes.length < 29 || bytes.toString('base64url') !== value) return false;
    const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12)); decipher.setAAD(aad); decipher.setAuthTag(bytes.subarray(12, 28));
    const captcha = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')) as Captcha;
    return captcha.id === id && Number.isSafeInteger(captcha.expires_at) && captcha.expires_at > Math.floor(Date.now() / 1000) &&
      captcha.expires_at <= Math.floor(Date.now() / 1000) + lifetime && /^\d{6}$/.test(captcha.answer) && timingSafeEqual(Buffer.from(answer), Buffer.from(captcha.answer));
  } catch { return false; }
}
