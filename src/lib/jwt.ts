import type { Result, DecodedJwt } from '@/types';

const ok = <T,>(data: T): Result<T> => ({ success: true, data });
const err = (error: string): Result<never> => ({ success: false, error });

export function decodeJwt(token: string): Result<DecodedJwt> {
  const trimmed = token.trim();
  if (!trimmed) return err('Input is empty.');

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return err(`Invalid JWT: expected 3 parts (header.payload.signature), got ${parts.length}.`);
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    const exp = typeof payload.exp === 'number' ? payload.exp : null;
    const expiresAt = exp ? new Date(exp * 1000) : null;
    const isExpired = exp ? Date.now() / 1000 > exp : false;

    return ok({ header, payload, signature, isExpired, expiresAt });
  } catch (e) {
    return err('Failed to decode JWT: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}

function base64UrlEncode(data: string): string {
  const bytes = new TextEncoder().encode(data);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function encodeJwt(
  headerJson: string,
  payloadJson: string,
  secret: string,
): Promise<Result<string>> {
  if (!headerJson.trim()) return err('Header JSON is empty.');
  if (!payloadJson.trim()) return err('Payload JSON is empty.');

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = JSON.parse(headerJson);
  } catch {
    return err('Invalid header JSON.');
  }
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return err('Invalid payload JSON.');
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (!secret) {
    return ok(`${signingInput}.`);
  }

  try {
    const keyData = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signingInput));
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return ok(`${signingInput}.${signatureBase64}`);
  } catch (e) {
    return err('Signing failed: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding) base64 += '='.repeat(4 - padding);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function formatExpiry(expiresAt: Date | null, isExpired: boolean): string {
  if (!expiresAt) return 'No expiry claim';
  if (isExpired) {
    const ago = timeDiff(expiresAt, new Date());
    return `Expired ${ago} ago`;
  }
  const remaining = timeDiff(new Date(), expiresAt);
  return `Expires in ${remaining}`;
}

function timeDiff(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}
