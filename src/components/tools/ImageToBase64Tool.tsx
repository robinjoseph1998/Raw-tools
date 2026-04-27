'use client';

import { useState, useCallback, useRef } from 'react';
import type { StatusState } from '@/types';

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

export default function ImageToBase64Tool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [rawBase64, setRawBase64] = useState('');
  const [preview, setPreview] = useState('');
  const [format, setFormat] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileName, setFileName] = useState('');
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragCounter = useRef(0);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      onStatusChange('invalid');
      onToast('Please select an image file');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const ext = file.type.replace('image/', '').toUpperCase();
    setFormat(ext === 'SVG+XML' ? 'SVG' : ext);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      setPreview(result);
      setRawBase64(result.replace(/^data:[^;]*;base64,/, ''));
      onStatusChange('valid');
    };
    reader.readAsDataURL(file);
  }, [onStatusChange, onToast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
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
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setDimensions(w > 0 && h > 0 ? { w, h } : null);
    }
  }, []);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onToast(`${label} copied`);
  }, [onToast]);

  const handleClear = useCallback(() => {
    setDataUrl('');
    setRawBase64('');
    setPreview('');
    setFormat('');
    setFileSize(0);
    setFileName('');
    setDimensions(null);
    if (fileRef.current) fileRef.current.value = '';
    onStatusChange('idle');
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn-primary text-[11px]">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose Image
        </button>
        <button onClick={handleClear} className="btn-secondary text-[11px]" disabled={!dataUrl}>
          Clear
        </button>
        <button onClick={() => copy(dataUrl, 'Data URI')} className="btn-secondary text-[11px]" disabled={!dataUrl}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Data URI
        </button>
        <button onClick={() => copy(rawBase64, 'Base64')} className="btn-secondary text-[11px]" disabled={!rawBase64}>
          Copy Raw Base64
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drop zone / preview */}
        <div
          className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500/50" />
              <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Image Input</span>
            </div>
            {fileName && <span className="text-[11px] text-zinc-600 font-mono truncate max-w-[180px]">{fileName}</span>}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {preview ? (
              <img
                ref={imgRef}
                src={preview}
                alt="Source"
                onLoad={handleImageLoad}
                className="max-w-full max-h-[360px] object-contain rounded-lg border border-white/[0.06]"
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-3 select-none p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-pink-500/40 bg-pink-500/[0.06]'
                    : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center animate-float">
                  <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[13px] text-zinc-400 font-medium">
                    {isDragOver ? 'Drop image here' : 'Click or drag image here'}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1">PNG, JPEG, GIF, WebP, SVG</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Base64 output */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500/50" />
              <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Base64 Output</span>
            </div>
            {rawBase64 && (
              <span className="text-[11px] text-zinc-600 font-mono">{rawBase64.length.toLocaleString()} chars</span>
            )}
          </div>
          {dataUrl ? (
            <textarea
              className="editor-textarea"
              value={dataUrl}
              readOnly
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 select-none">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] border-dashed flex items-center justify-center animate-float">
                  <svg className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <p className="text-[12px] text-zinc-600 font-medium">Base64 output appears here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      {dataUrl && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Format</p>
            <p className="text-[13px] font-mono text-zinc-300">{format || '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">File Size</p>
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

      {/* Tips */}
      <div className="tips-section tips-section--pink">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quick Reference</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Drag & Drop</p>
            <p>Drop any image file directly onto the input area.</p>
          </div>
          <div>
            <p className="text-zinc-400 font-semibold mb-0.5">Output Formats</p>
            <p>Copy as full Data URI or raw Base64 string without prefix.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
