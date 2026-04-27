import type { Result } from '@/types';

const ok = <T,>(data: T): Result<T> => ({ success: true, data });
const err = (error: string): Result<never> => ({ success: false, error });

/**
 * Encode a UTF-8 string to Base64.
 * Uses TextEncoder to handle Unicode correctly.
 */
export function encodeBase64(input: string): Result<string> {
  if (!input) return err('Input is empty.');
  try {
    const bytes = new TextEncoder().encode(input);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
    return ok(btoa(binString));
  } catch (e) {
    return err('Encoding failed: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}

/**
 * Decode a Base64 string back to UTF-8 text.
 * Whitespace is stripped before decoding.
 */
export function decodeBase64(input: string): Result<string> {
  if (!input) return err('Input is empty.');
  try {
    const cleaned = input.replace(/\s/g, '');
    const binString = atob(cleaned);
    const bytes = Uint8Array.from(binString, (ch) => ch.charCodeAt(0));
    return ok(new TextDecoder().decode(bytes));
  } catch (e) {
    return err('Invalid Base64: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}
