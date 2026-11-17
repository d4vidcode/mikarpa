import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.PAYMENT_TOKEN_KEY;
  if (!raw) {
    throw new Error('Falta PAYMENT_TOKEN_KEY (32 bytes en base64 o hex).');
  }

  // Acepta base64 o hex; si es texto plano, se rellena con sha256.
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    try {
      const decoded = Buffer.from(raw, 'base64');
      key = decoded.length === 32 ? decoded : crypto.createHash('sha256').update(raw).digest();
    } catch {
      key = crypto.createHash('sha256').update(raw).digest();
    }
  }

  if (key.length !== 32) {
    key = crypto.createHash('sha256').update(raw).digest();
  }

  return key;
}

/** Cifra un secreto con AES-256-GCM. Devuelve `iv:tag:ciphertext` en base64. */
export function encryptSecret(value: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

/** Descifra un secreto cifrado con `encryptSecret`. */
export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Secreto cifrado inválido.');
  }

  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}