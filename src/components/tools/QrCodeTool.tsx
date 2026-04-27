'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatusState } from '@/types';

export default function QrCodeTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [mode, setMode] = useState<'generate' | 'read'>('generate');

  // Generate state
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [size, setSize] = useState(256);
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Read state
  const [readResult, setReadResult] = useState('');
  const [readFile, setReadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── Generate ── */
  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      onStatusChange('invalid');
      onToast('Enter text or URL to encode');
      return;
    }
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 4,
        errorCorrectionLevel: ecl,
        color: { dark: '#000000ff', light: '#ffffffff' },
      });
      setQrUrl(url);
      onStatusChange('valid');
      onToast('QR code generated');
    } catch {
      onStatusChange('invalid');
      onToast('Failed to generate QR code');
    }
  }, [text, size, ecl, onStatusChange, onToast]);

  const downloadQr = useCallback(() => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Download started');
  }, [qrUrl, onToast]);

  const copyQr = useCallback(async () => {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      onToast('QR code copied to clipboard');
    } catch {
      onToast('Copy failed — try downloading instead');
    }
  }, [qrUrl, onToast]);

  /* ── Read ── */
  const readQrFromFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        onToast('Please select an image file');
        return;
      }
      setReadFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        const jsQR = (await import('jsqr')).default;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setReadResult(code.data);
            onStatusChange('valid');
            onToast('QR code decoded successfully');
          } else {
            setReadResult('');
            onStatusChange('invalid');
            onToast('No QR code found in image');
          }
        };
        img.onerror = () => {
          onToast('Failed to load image');
          onStatusChange('invalid');
        };
        img.src = URL.createObjectURL(file);
      } catch {
        onToast('Failed to decode QR code');
        onStatusChange('invalid');
      }
    },
    [previewUrl, onStatusChange, onToast],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) readQrFromFile(f);
    },
    [readQrFromFile],
  );

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
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) readQrFromFile(f);
    },
    [readQrFromFile],
  );

  const clearAll = useCallback(() => {
    setText('');
    setQrUrl('');
    setReadResult('');
    setReadFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileRef.current) fileRef.current.value = '';
    onStatusChange('idle');
  }, [previewUrl, onStatusChange]);

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex items-center gap-2.5">
        <div className="pill-group">
          <button onClick={() => setMode('generate')} className={`pill-group__item ${mode === 'generate' ? 'pill-group__item--active' : ''}`}>
            Generate
          </button>
          <button onClick={() => setMode('read')} className={`pill-group__item ${mode === 'read' ? 'pill-group__item--active' : ''}`}>
            Read
          </button>
        </div>
      </div>

      {mode === 'generate' ? (
        <>
          {/* Generate action bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={handleGenerate} className="btn-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 4v16m8-8H4" />
              </svg>
              Generate QR
            </button>
            <button onClick={downloadQr} disabled={!qrUrl} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button onClick={copyQr} disabled={!qrUrl} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
              Copy
            </button>
            <button onClick={clearAll} className="btn-ghost">Clear</button>
          </div>

          {/* Settings row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Size</span>
              <div className="pill-group">
                {[128, 256, 512, 1024].map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`pill-group__item ${size === s ? 'pill-group__item--active' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Error Level</span>
              <div className="pill-group">
                {(['L', 'M', 'Q', 'H'] as const).map((e) => (
                  <button key={e} onClick={() => setEcl(e)} className={`pill-group__item ${ecl === e ? 'pill-group__item--active' : ''}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400/70" />
                <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Input</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text, URL, or any data to encode..."
                spellCheck={false}
                className="editor-textarea flex-1 min-h-[260px] p-4 resize-none"
              />
            </div>

            <div className="flex flex-col min-h-[320px] rounded-xl glass-panel overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
                <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">QR Code</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="rounded-lg" style={{ width: Math.min(size, 320), height: Math.min(size, 320) }} />
                ) : (
                  <div className="flex flex-col items-center gap-3 select-none">
                    <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center">
                      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-zinc-500 font-medium">QR code appears here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Read action bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => fileRef.current?.click()} className="btn-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </button>
            {readResult && (
              <button
                onClick={() => { navigator.clipboard.writeText(readResult); onToast('Copied decoded text'); }}
                className="btn-secondary"
              >
                Copy Result
              </button>
            )}
            <button onClick={clearAll} disabled={!readFile} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">
              Clear
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Read panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="flex flex-col min-h-[320px] rounded-xl glass-panel overflow-hidden"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400/70" />
                <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Source Image</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="QR source" className="max-w-full max-h-[280px] object-contain rounded-lg border border-white/[0.08]" />
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`flex flex-col items-center gap-3 select-none p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                      isDragOver ? 'border-pink-500/40 bg-pink-500/[0.06]' : 'border-white/[0.1] hover:border-white/[0.18] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center animate-float">
                      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] text-zinc-400 font-medium">{isDragOver ? 'Drop image' : 'Click or drag QR code image'}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">PNG, JPEG, WebP, etc.</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col min-h-[320px] rounded-xl glass-panel overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Decoded Text</span>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                {readResult ? (
                  <code className="text-[13px] font-mono text-zinc-200 whitespace-pre-wrap break-all">{readResult}</code>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[13px] text-zinc-500 font-medium">Decoded content appears here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
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
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Error level L</span> — 7% recovery, smallest QR</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Error level H</span> — 30% recovery, largest QR</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Size 512+</span> — Best for print media</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Reader</span> — Supports any image with a QR code</p>
        </div>
      </div>
    </div>
  );
}
