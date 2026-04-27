'use client';

import { useState, useCallback, useRef } from 'react';
import type { StatusState } from '@/types';

type TargetFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp' | 'tiff' | 'ico';

const FORMATS: { id: TargetFormat; label: string; mime: string; ext: string; lossy: boolean; note?: string }[] = [
  { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png', lossy: false },
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg', lossy: true },
  { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp', lossy: true },
  { id: 'avif', label: 'AVIF', mime: 'image/avif', ext: 'avif', lossy: true, note: 'Modern browsers' },
  { id: 'bmp', label: 'BMP', mime: 'image/bmp', ext: 'bmp', lossy: false },
  { id: 'tiff', label: 'TIFF', mime: 'image/tiff', ext: 'tiff', lossy: false },
  { id: 'ico', label: 'ICO', mime: 'image/x-icon', ext: 'ico', lossy: false, note: 'Max 256px' },
];

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

function detectFormat(file: File): string {
  const t = file.type.toLowerCase();
  const map: Record<string, string> = {
    'image/png': 'PNG', 'image/jpeg': 'JPEG', 'image/webp': 'WebP',
    'image/gif': 'GIF', 'image/bmp': 'BMP', 'image/avif': 'AVIF',
    'image/tiff': 'TIFF', 'image/svg+xml': 'SVG',
    'image/x-icon': 'ICO', 'image/vnd.microsoft.icon': 'ICO',
  };
  return map[t] || t.replace('image/', '').toUpperCase();
}

/* ── Manual binary encoders (pure JS, no dependencies) ── */

function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  const bytesPerRow = width * 3;
  const padding = (4 - (bytesPerRow % 4)) % 4;
  const rowSize = bytesPerRow + padding;
  const pixelSize = rowSize * height;
  const fileSize = 54 + pixelSize;

  const buf = new ArrayBuffer(fileSize);
  const v = new DataView(buf);

  // BMP file header (14 bytes)
  v.setUint8(0, 0x42); v.setUint8(1, 0x4d); // "BM"
  v.setUint32(2, fileSize, true);
  v.setUint32(10, 54, true);

  // DIB header — BITMAPINFOHEADER (40 bytes)
  v.setUint32(14, 40, true);
  v.setInt32(18, width, true);
  v.setInt32(22, -height, true); // negative = top-down row order
  v.setUint16(26, 1, true);     // color planes
  v.setUint16(28, 24, true);    // 24-bit RGB
  v.setUint32(34, pixelSize, true);
  v.setInt32(38, 2835, true);   // 72 DPI horizontal
  v.setInt32(42, 2835, true);   // 72 DPI vertical

  let off = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      v.setUint8(off++, data[i + 2]); // B
      v.setUint8(off++, data[i + 1]); // G
      v.setUint8(off++, data[i]);     // R
    }
    for (let p = 0; p < padding; p++) v.setUint8(off++, 0);
  }

  return new Blob([buf], { type: 'image/bmp' });
}

function encodeTiff(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  // RGBA → RGB
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgb[j] = data[i]; rgb[j + 1] = data[i + 1]; rgb[j + 2] = data[i + 2];
  }

  const numTags = 9;
  const ifdOffset = 8;
  const ifdSize = 2 + numTags * 12 + 4; // count + entries + next-IFD pointer
  const bpsOffset = ifdOffset + ifdSize; // BitsPerSample (3 × SHORT = 6 bytes)
  const stripOffset = bpsOffset + 6;
  const fileSize = stripOffset + rgb.length;

  const buf = new ArrayBuffer(fileSize);
  const v = new DataView(buf);
  const u8 = new Uint8Array(buf);

  // TIFF header — little-endian
  v.setUint8(0, 0x49); v.setUint8(1, 0x49); // "II"
  v.setUint16(2, 42, true);
  v.setUint32(4, ifdOffset, true);

  // IFD entries
  let off = ifdOffset;
  v.setUint16(off, numTags, true); off += 2;

  const tag = (t: number, type: number, count: number, val: number) => {
    v.setUint16(off, t, true); off += 2;
    v.setUint16(off, type, true); off += 2;
    v.setUint32(off, count, true); off += 4;
    v.setUint32(off, val, true); off += 4;
  };

  tag(256, 4, 1, width);        // ImageWidth (LONG)
  tag(257, 4, 1, height);       // ImageLength (LONG)
  tag(258, 3, 3, bpsOffset);    // BitsPerSample → offset to 3 SHORTs
  tag(259, 3, 1, 1);            // Compression = None
  tag(262, 3, 1, 2);            // PhotometricInterpretation = RGB
  tag(273, 4, 1, stripOffset);  // StripOffsets
  tag(277, 3, 1, 3);            // SamplesPerPixel
  tag(278, 4, 1, height);       // RowsPerStrip = all rows
  tag(279, 4, 1, rgb.length);   // StripByteCounts

  v.setUint32(off, 0, true);    // next IFD = none

  // BitsPerSample data: [8, 8, 8]
  v.setUint16(bpsOffset, 8, true);
  v.setUint16(bpsOffset + 2, 8, true);
  v.setUint16(bpsOffset + 4, 8, true);

  // Pixel data
  u8.set(rgb, stripOffset);

  return new Blob([buf], { type: 'image/tiff' });
}

async function encodeIco(canvas: HTMLCanvasElement): Promise<Blob> {
  // ICO max dimension is 256×256
  const max = 256;
  let w = canvas.width, h = canvas.height;
  if (w > max || h > max) {
    const s = Math.min(max / w, max / h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }

  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(canvas, 0, 0, w, h);

  // Encode inner image as PNG
  const pngBlob = await new Promise<Blob>((res, rej) => {
    c.toBlob((b) => (b ? res(b) : rej(new Error('PNG encoding failed'))), 'image/png');
  });
  const png = new Uint8Array(await pngBlob.arrayBuffer());

  // ICO = 6-byte header + 16-byte directory entry + PNG data
  const size = 6 + 16 + png.length;
  const buf = new ArrayBuffer(size);
  const v = new DataView(buf);
  const u8 = new Uint8Array(buf);

  // Header
  v.setUint16(0, 0, true);   // reserved
  v.setUint16(2, 1, true);   // type = ICO
  v.setUint16(4, 1, true);   // 1 image

  // Directory entry
  v.setUint8(6, w >= 256 ? 0 : w);  // width  (0 means 256)
  v.setUint8(7, h >= 256 ? 0 : h);  // height (0 means 256)
  v.setUint8(8, 0);                   // palette colors
  v.setUint8(9, 0);                   // reserved
  v.setUint16(10, 1, true);          // color planes
  v.setUint16(12, 32, true);         // bits per pixel
  v.setUint32(14, png.length, true); // image data size
  v.setUint32(18, 22, true);         // offset to data (6 + 16)

  u8.set(png, 22);

  return new Blob([buf], { type: 'image/x-icon' });
}

/* ── Component ── */

export default function ImageFormatConverter({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [originalFormat, setOriginalFormat] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  const [targetFormat, setTargetFormat] = useState<TargetFormat>('jpeg');
  const [quality, setQuality] = useState(85);
  const [convertedUrl, setConvertedUrl] = useState('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedSize, setConvertedSize] = useState(0);
  const [converting, setConverting] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragCounter = useRef(0);

  const cleanup = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
  }, [previewUrl, convertedUrl]);

  const processFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      onStatusChange('invalid');
      onToast('Please select an image file');
      return;
    }
    cleanup();
    setFile(f);
    setOriginalFormat(detectFormat(f));
    setOriginalSize(f.size);
    setConvertedUrl('');
    setConvertedBlob(null);
    setConvertedSize(0);
    setPreviewUrl(URL.createObjectURL(f));
    onStatusChange('valid');
  }, [onStatusChange, onToast, cleanup]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setDimensions(w > 0 && h > 0 ? { w, h } : null);
    }
  }, []);

  const convert = useCallback(() => {
    if (!previewUrl) return;
    setConverting(true);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setConverting(false); onToast('Canvas not supported'); return; }

      // Fill white background for formats that don't support transparency
      if (targetFormat === 'jpeg' || targetFormat === 'bmp' || targetFormat === 'tiff') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      let blob: Blob | null = null;

      try {
        if (targetFormat === 'bmp') {
          blob = encodeBmp(canvas);
        } else if (targetFormat === 'tiff') {
          blob = encodeTiff(canvas);
        } else if (targetFormat === 'ico') {
          blob = await encodeIco(canvas);
        } else {
          // Canvas API: png, jpeg, webp, avif
          const fmt = FORMATS.find((f) => f.id === targetFormat)!;
          const q = fmt.lossy ? quality / 100 : undefined;
          blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), fmt.mime, q);
          });
        }
      } catch {
        blob = null;
      }

      setConverting(false);
      if (!blob || blob.size === 0) {
        onToast(
          targetFormat === 'avif'
            ? 'AVIF encoding not supported in this browser'
            : 'Conversion failed',
        );
        return;
      }

      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
      setConvertedBlob(blob);
      setConvertedSize(blob.size);
      onStatusChange('valid');
      onToast(`Converted to ${FORMATS.find((f) => f.id === targetFormat)!.label}`);
    };
    img.onerror = () => { setConverting(false); onToast('Failed to load image'); };
    img.src = previewUrl;
  }, [previewUrl, targetFormat, quality, convertedUrl, onStatusChange, onToast]);

  const download = useCallback(() => {
    if (!convertedBlob || !file) return;
    const fmt = FORMATS.find((f) => f.id === targetFormat)!;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `${baseName}.${fmt.ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Download started');
  }, [convertedBlob, convertedUrl, file, targetFormat, onToast]);

  const handleClear = useCallback(() => {
    cleanup();
    setFile(null);
    setPreviewUrl('');
    setOriginalFormat('');
    setOriginalSize(0);
    setDimensions(null);
    setConvertedUrl('');
    setConvertedBlob(null);
    setConvertedSize(0);
    if (fileRef.current) fileRef.current.value = '';
    onStatusChange('idle');
  }, [cleanup, onStatusChange]);

  const currentFmt = FORMATS.find((f) => f.id === targetFormat)!;
  const ratio = originalSize > 0 && convertedSize > 0
    ? ((convertedSize / originalSize) * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={() => fileRef.current?.click()} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose Image
        </button>
        <button
          onClick={convert}
          disabled={!file || converting}
          className="btn-secondary disabled:opacity-30 disabled:pointer-events-none"
        >
          {converting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Converting...
            </span>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Convert
            </>
          )}
        </button>
        <button
          onClick={download}
          disabled={!convertedBlob}
          className="btn-secondary disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleClear}
          disabled={!file}
          className="btn-ghost disabled:opacity-30 disabled:pointer-events-none"
        >
          Clear
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Format + Quality controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">To</span>
          <div className="pill-group flex-wrap">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTargetFormat(f.id)}
                className={`pill-group__item ${targetFormat === f.id ? 'pill-group__item--active' : ''}`}
                title={f.note || undefined}
              >
                {f.label}
                {f.note && targetFormat === f.id && (
                  <span className="text-[9px] text-zinc-500 ml-1">({f.note})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentFmt.lossy && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Quality</span>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-28 h-1 accent-pink-400 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:shadow-md"
            />
            <span className="text-[12px] font-mono text-zinc-300 min-w-[2.5rem] text-right">{quality}%</span>
          </div>
        )}
      </div>

      {/* Two-panel layout: original + converted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original image panel */}
        <div
          className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Original</span>
            </div>
            {file && (
              <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">{file.name}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {previewUrl ? (
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Original"
                onLoad={handleImageLoad}
                className="max-w-full max-h-[340px] object-contain rounded-lg border border-white/[0.08]"
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-3 select-none p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-pink-500/40 bg-pink-500/[0.06]'
                    : 'border-white/[0.1] hover:border-white/[0.18] hover:bg-white/[0.03]'
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center animate-float">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[13px] text-zinc-400 font-medium">
                    {isDragOver ? 'Drop image here' : 'Click or drag image here'}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">PNG, JPEG, WebP, GIF, BMP, SVG, AVIF, TIFF &amp; more</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Converted image panel */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">
                Converted ({currentFmt.label})
              </span>
            </div>
            {convertedSize > 0 && (
              <span className="text-[11px] text-zinc-500 font-mono">{formatBytes(convertedSize)}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {convertedUrl ? (
              <img
                src={convertedUrl}
                alt="Converted"
                className="max-w-full max-h-[340px] object-contain rounded-lg border border-white/[0.08]"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 select-none">
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center animate-float">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[13px] text-zinc-500 font-medium">Converted image appears here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata row */}
      {file && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Original</p>
            <p className="text-[13px] font-mono text-zinc-300">{originalFormat} &middot; {formatBytes(originalSize)}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Dimensions</p>
            <p className="text-[13px] font-mono text-zinc-300">{dimensions ? `${dimensions.w} × ${dimensions.h}` : '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Converted</p>
            <p className="text-[13px] font-mono text-zinc-300">
              {convertedSize > 0 ? `${currentFmt.label} · ${formatBytes(convertedSize)}` : '—'}
            </p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Size Ratio</p>
            <p className={`text-[13px] font-mono ${ratio && Number(ratio) < 100 ? 'text-emerald-400' : ratio && Number(ratio) > 100 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {ratio ? `${ratio}% of original` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--pink">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">PNG</span> — Lossless, best for graphics &amp; screenshots</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">JPEG</span> — Lossy, smallest for photos</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">WebP</span> — Modern, great compression for web</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">AVIF</span> — Next-gen, best compression (Chrome/Firefox)</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">BMP</span> — Uncompressed, legacy compatibility</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">TIFF</span> — Uncompressed RGB, print &amp; archival</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">ICO</span> — Favicons, auto-resized to ≤256px</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Quality</span> — Applies to JPEG, WebP &amp; AVIF only</p>
        </div>
      </div>
    </div>
  );
}
