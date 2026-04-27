'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatusState } from '@/types';

type OutputFormat = 'jpeg' | 'webp' | 'png';

const FORMATS: { id: OutputFormat; label: string; mime: string; ext: string; hasQuality: boolean }[] = [
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg', hasQuality: true },
  { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp', hasQuality: true },
  { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png', hasQuality: false },
];

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

export default function ImageCompressTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(80);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressing, setCompressing] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragCounter = useRef(0);

  const cleanup = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  }, [previewUrl, compressedUrl]);

  const processFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      onToast('Please select an image file');
      onStatusChange('invalid');
      return;
    }
    cleanup();
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);
    setOriginalSize(f.size);
    setCompressedUrl('');
    setCompressedBlob(null);
    setCompressedSize(0);
  }, [cleanup, onToast, onStatusChange]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setDimensions(w > 0 && h > 0 ? { w, h } : null);
    }
  }, []);

  const compress = useCallback(() => {
    if (!previewUrl) return;
    setCompressing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setCompressing(false); onToast('Canvas not supported'); return; }

      if (outputFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const fmt = FORMATS.find(f => f.id === outputFormat)!;
      const q = fmt.hasQuality ? quality / 100 : undefined;

      canvas.toBlob(
        (blob) => {
          setCompressing(false);
          if (!blob) { onToast('Compression failed'); return; }
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
          setCompressedBlob(blob);
          setCompressedSize(blob.size);
          onStatusChange('valid');
        },
        fmt.mime,
        q,
      );
    };
    img.onerror = () => { setCompressing(false); onToast('Failed to load image'); };
    img.src = previewUrl;
  }, [previewUrl, outputFormat, quality, compressedUrl, onStatusChange, onToast]);

  // Auto-compress when file, format, or quality changes
  useEffect(() => {
    if (!previewUrl) return;
    const timer = setTimeout(() => compress(), 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl, outputFormat, quality]);

  const download = useCallback(() => {
    if (!compressedBlob || !file) return;
    const fmt = FORMATS.find(f => f.id === outputFormat)!;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `${baseName}-compressed.${fmt.ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Download started');
  }, [compressedBlob, compressedUrl, file, outputFormat, onToast]);

  const handleClear = useCallback(() => {
    cleanup();
    setFile(null);
    setPreviewUrl('');
    setCompressedUrl('');
    setCompressedBlob(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setDimensions(null);
    if (fileRef.current) fileRef.current.value = '';
    onStatusChange('idle');
  }, [cleanup, onStatusChange]);

  // Drag-drop handlers
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

  const savings = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : null;

  const currentFmt = FORMATS.find(f => f.id === outputFormat)!;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }}
        />
        <button onClick={() => fileRef.current?.click()} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose Image
        </button>
        {compressedBlob && (
          <button onClick={download} className="btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        )}
        {file && (
          <button onClick={handleClear} className="btn-ghost text-[12px] px-3 py-2 text-zinc-600 hover:text-red-400">
            Clear
          </button>
        )}

        <div className="flex-1" />

        {/* Format selector */}
        <div className="pill-group">
          {FORMATS.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setOutputFormat(fmt.id)}
              className={`pill-group__item ${outputFormat === fmt.id ? 'pill-group__item--active' : ''}`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Quality slider */}
        {currentFmt.hasQuality && (
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

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original panel */}
        <div
          className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Original</span>
            </div>
            {originalSize > 0 && (
              <span className="text-[11px] font-mono text-zinc-500">{formatBytes(originalSize)}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {previewUrl ? (
              <img
                ref={imgRef}
                src={previewUrl}
                onLoad={handleImageLoad}
                className="max-w-full max-h-[340px] object-contain rounded-lg border border-white/[0.08]"
                alt="Original"
                draggable={false}
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-3 p-8 rounded-xl border border-dashed transition-all duration-200 w-full max-w-sm ${
                  isDragOver
                    ? 'border-pink-500/40 bg-pink-500/[0.06]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]'
                }`}
              >
                <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[13px] text-zinc-400">Drop image here or click to upload</p>
                <p className="text-[11px] text-zinc-600">PNG, JPG, WebP, GIF supported</p>
              </button>
            )}
          </div>
        </div>

        {/* Compressed panel */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Compressed</span>
            </div>
            {compressedSize > 0 && (
              <span className="text-[11px] font-mono text-zinc-500">{formatBytes(compressedSize)}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {compressedUrl ? (
              <img
                src={compressedUrl}
                className="max-w-full max-h-[340px] object-contain rounded-lg border border-white/[0.08]"
                alt="Compressed"
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                {compressing ? (
                  <svg className="h-8 w-8 text-pink-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                <p className="text-[12px] text-zinc-600">
                  {compressing ? 'Compressing...' : 'Upload an image to start'}
                </p>
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
            <p className="text-[13px] font-mono text-zinc-300">{formatBytes(originalSize)}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Dimensions</p>
            <p className="text-[13px] font-mono text-zinc-300">{dimensions ? `${dimensions.w} x ${dimensions.h}` : '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Compressed</p>
            <p className="text-[13px] font-mono text-zinc-300">{compressedSize > 0 ? `${formatBytes(compressedSize)} (${currentFmt.label})` : '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Savings</p>
            <p className={`text-[13px] font-mono ${
              savings !== null && savings > 0 ? 'text-emerald-400' :
              savings !== null && savings < 0 ? 'text-amber-400' :
              'text-zinc-300'
            }`}>
              {savings !== null ? (savings > 0 ? `${savings}% smaller` : `${Math.abs(savings)}% larger`) : '—'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">JPEG</span> — Best for photos, smaller files, no transparency</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">WebP</span> — Modern format, better compression than JPEG</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">PNG</span> — Lossless, no quality slider effect, best for graphics</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Quality</span> — Lower = smaller file but more artifacts</p>
        </div>
      </div>
    </div>
  );
}
