export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ToolId = 'format' | 'convert' | 'jwt' | 'jwt-encode' | 'base64' | 'url' | 'hash' | 'uuid' | 'color' | 'regex' | 'timestamp' | 'lorem' | 'base64-image' | 'image-base64' | 'image-convert' | 'diff' | 'password' | 'qr' | 'markdown' | 'sql' | 'gradient' | 'json-ts' | 'epoch' | 'placeholder' | 'cron' | 'bg-remover' | 'image-compress' | 'screen-recorder' | 'px-converter' | 'video-compress';

export type UrlMode = 'encode' | 'decode';

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512' | 'MD5';

export type Base64Mode = 'encode' | 'decode';

export type JsonOperation = 'format' | 'minify';

export type ConvertFormat = 'json' | 'yaml' | 'csv' | 'xml';

export type StatusState = 'idle' | 'valid' | 'invalid';

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
}

export interface TextStats {
  lines: number;
  size: string;
}
