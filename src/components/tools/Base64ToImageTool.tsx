'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { StatusState } from '@/types';

function detectFormat(base64: string): string | null {
  const dataUriMatch = base64.match(/^data:image\/([a-z0-9+]+);base64,/i);
  if (dataUriMatch) return dataUriMatch[1].toLowerCase();

  const clean = base64.replace(/^data:[^;]*;base64,/, '').replace(/\s/g, '');

  try {
    const binary = atob(clean.substring(0, 20));
    const bytes = Array.from(binary, (c) => c.charCodeAt(0));

    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes.length > 11 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
    if (bytes[0] === 0x3c) return 'svg+xml';
  } catch {
    // invalid base64
  }

  return null;
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

export default function Base64ToImageTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [input, setInput] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [format, setFormat] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!input.trim()) {
      setImageDataUrl('');
      setFormat(null);
      setFileSize(0);
      setDimensions(null);
      setError(null);
      onStatusChange('idle');
      return;
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = input.trim();
      const detected = detectFormat(trimmed);
      const rawBase64 = trimmed.replace(/^data:[^;]*;base64,/, '').replace(/\s/g, '');

      try {
        const binary = atob(rawBase64);
        setFileSize(binary.length);
      } catch {
        setError('Invalid Base64 encoding. Check your input.');
        setImageDataUrl('');
        setFormat(null);
        setFileSize(0);
        setDimensions(null);
        onStatusChange('invalid');
        return;
      }

      const fmt = detected || 'png';
      const dataUrl = trimmed.startsWith('data:') ? trimmed : `data:image/${fmt};base64,${rawBase64}`;

      setFormat(fmt);
      setImageDataUrl(dataUrl);
      setError(null);
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [input, onStatusChange]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setDimensions(w > 0 && h > 0 ? { w, h } : null);
    }
    setError(null);
    onStatusChange('valid');
  }, [onStatusChange]);

  const handleImageError = useCallback(() => {
    setError('Could not render image. The data may not be a valid image.');
    setDimensions(null);
    onStatusChange('invalid');
  }, [onStatusChange]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    onToast('Copied to clipboard');
  }, [onToast]);

  const handleDownload = useCallback(() => {
    if (!imageDataUrl || !format) return;
    const ext = format === 'jpeg' ? 'jpg' : format === 'svg+xml' ? 'svg' : format;
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `image.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(`Downloaded image.${ext}`);
  }, [imageDataUrl, format, onToast]);

  const handleClear = useCallback(() => {
    setInput('');
    setImageDataUrl('');
    setFormat(null);
    setFileSize(0);
    setDimensions(null);
    setError(null);
    onStatusChange('idle');
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleClear} className="btn-secondary text-[11px]" disabled={!input}>
          Clear
        </button>
        <button onClick={() => copy(imageDataUrl)} className="btn-secondary text-[11px]" disabled={!imageDataUrl}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Data URI
        </button>
        <button onClick={handleDownload} className="btn-primary text-[11px]" disabled={!imageDataUrl}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/[0.05]">
            <div className="w-2 h-2 rounded-full bg-pink-500/50" />
            <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Base64 Input</span>
          </div>
          <textarea
            className="editor-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste Base64 image string...\n\nWith prefix:\ndata:image/png;base64,iVBORw0KGgo...\n\nOr raw:\niVBORw0KGgoAAAANSUhEUg...'}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/[0.05]">
            <div className="w-2 h-2 rounded-full bg-purple-500/50" />
            <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Image Preview</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {imageDataUrl && !error ? (
              <img
                ref={imgRef}
                src={imageDataUrl}
                alt="Decoded"
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="max-w-full max-h-[360px] object-contain rounded-lg border border-white/[0.06]"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 select-none">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] border-dashed flex items-center justify-center animate-float">
                  <svg className="h-4.5 w-4.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[12px] text-zinc-600 font-medium">Image preview appears here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {imageDataUrl && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Format</p>
            <p className="text-[13px] font-mono text-zinc-300">{format?.toUpperCase() || '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Size</p>
            <p className="text-[13px] font-mono text-zinc-300">{formatBytes(fileSize)}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Width</p>
            <p className="text-[13px] font-mono text-zinc-300">{dimensions ? `${dimensions.w}px` : '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Height</p>
            <p className="text-[13px] font-mono text-zinc-300">{dimensions ? `${dimensions.h}px` : '—'}</p>
          </div>
        </div>
      )}

      {/* Error */}
      <div className={`error-container ${error ? 'is-visible' : ''}`}>
        <div className="flex items-start gap-2 rounded-lg bg-red-500/[0.07] border border-red-500/20 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-red-400/80">{error}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--pink">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quick Reference</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Prefix Optional</p>
            <p>Works with or without the data:image/...;base64, prefix.</p>
          </div>
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Auto-Detection</p>
            <p>PNG, JPEG, GIF, WebP, and SVG formats detected from magic bytes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
