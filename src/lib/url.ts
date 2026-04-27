import type { Result } from '@/types';

const ok = <T,>(data: T): Result<T> => ({ success: true, data });
const err = (error: string): Result<never> => ({ success: false, error });

export function encodeUrl(input: string): Result<string> {
  if (!input) return err('Input is empty.');
  try {
    return ok(encodeURIComponent(input));
  } catch (e) {
    return err('Encoding failed: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}

export function decodeUrl(input: string): Result<string> {
  if (!input) return err('Input is empty.');
  try {
    return ok(decodeURIComponent(input));
  } catch (e) {
    return err('Invalid encoded string: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}
