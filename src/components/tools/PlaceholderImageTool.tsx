'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatusState } from '@/types';

type ImageFormat = 'png' | 'jpeg' | 'webp';

const FORMATS: { id: ImageFormat; label: string; mime: string; ext: string }[] = [
  { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png' },
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

const PRESETS: [number, number][] = [
  [1920, 1080], [1280, 720], [800, 600], [400, 300], [200, 200], [150, 150],
];

const INPUT_CLS = 'bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-cyan-500/30';

export default function PlaceholderImageTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [textColor, setTextColor] = useState('#e4e4e7');
  const [customText, setCustomText] = useState('');
  const [fontSizeOverride, setFontSizeOverride] = useState<number | ''>('');
  const [format, setFormat] = useState<ImageFormat>('png');
  const [dataUri, setDataUri] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = customText || `${width}\u00d7${height}`;
  const autoFontSize = Math.round(Math.min(width, height) / 6);
  const fontSize = fontSizeOverride || autoFontSize;

  /* ── Render canvas ── */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle border (slightly lighter than bg)
    ctx.strokeStyle = bgColor + '40';
    ctx.lineWidth = 1;
    // Parse bg to lighten for border
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    ctx.strokeStyle = `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 30)})`;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Centered text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);

    const fmt = FORMATS.find((f) => f.id === format)!;
    const uri = canvas.toDataURL(fmt.mime, format === 'jpeg' ? 0.92 : undefined);
    setDataUri(uri);
    onStatusChange('valid');
  }, [width, height, bgColor, textColor, fontSize, displayText, format, onStatusChange]);

  useEffect(() => {
    render();
  }, [render]);

  /* ── Actions ── */
  const download = useCallback(() => {
    if (!dataUri) return;
    const fmt = FORMATS.find((f) => f.id === format)!;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `placeholder-${width}x${height}.${fmt.ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Download started');
  }, [dataUri, format, width, height, onToast]);

  const copyDataUri = useCallback(async () => {
    if (!dataUri) return;
    try {
      await navigator.clipboard.writeText(dataUri);
      onToast('Data URI copied to clipboard');
    } catch {
      onToast('Copy failed');
    }
  }, [dataUri, onToast]);

  const copyHtmlTag = useCallback(async () => {
    if (!dataUri) return;
    const tag = `<img src="${dataUri}" width="${width}" height="${height}" alt="Placeholder">`;
    try {
      await navigator.clipboard.writeText(tag);
      onToast('HTML tag copied to clipboard');
    } catch {
      onToast('Copy failed');
    }
  }, [dataUri, width, height, onToast]);

  // Scale preview to fit
  const maxPreviewW = 480;
  const scale = Math.min(1, maxPreviewW / width, maxPreviewW / height);
  const displayW = Math.round(width * scale);
  const displayH = Math.round(height * scale);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls panel */}
        <div className="glass-panel rounded-xl p-4 space-y-4">
          {/* Dimensions */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Dimensions</span>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                min={1}
                max={4096}
                className={`${INPUT_CLS} w-24`}
              />
              <span className="text-zinc-500 text-[13px]">&times;</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                min={1}
                max={4096}
                className={`${INPUT_CLS} w-24`}
              />
              <span className="text-[11px] text-zinc-500 ml-1">px</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESETS.map(([w, h]) => (
                <button
                  key={`${w}x${h}`}
                  onClick={() => { setWidth(w); setHeight(h); }}
                  className={`pill-group__item ${width === w && height === h ? 'pill-group__item--active' : ''}`}
                >
                  {w}&times;{h}
                </button>
              ))}
            </div>
          </div>

          {/* Background color */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Background</span>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                maxLength={7}
                className={`${INPUT_CLS} w-28 font-mono`}
              />
            </div>
          </div>

          {/* Text color */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Text Color</span>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                maxLength={7}
                className={`${INPUT_CLS} w-28 font-mono`}
              />
            </div>
          </div>

          {/* Custom text */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Custom Text</span>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`${width}\u00d7${height}`}
              className={`${INPUT_CLS} w-full mt-2`}
            />
          </div>

          {/* Font size */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Font Size</span>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={fontSizeOverride}
                onChange={(e) => setFontSizeOverride(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder={String(autoFontSize)}
                min={1}
                max={999}
                className={`${INPUT_CLS} w-24`}
              />
              <span className="text-[11px] text-zinc-500">px (auto: {autoFontSize})</span>
            </div>
          </div>

          {/* Format */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Format</span>
            <div className="pill-group mt-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`pill-group__item ${format === f.id ? 'pill-group__item--active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Preview</span>
            <span className="text-[11px] text-zinc-500 font-mono ml-auto">{width}&times;{height}</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              style={{ width: displayW, height: displayH }}
              className="rounded-lg border border-white/[0.08]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-white/[0.08] bg-white/[0.03]">
            <button onClick={download} className="btn-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button onClick={copyDataUri} className="btn-secondary">
              Copy Data URI
            </button>
            <button onClick={copyHtmlTag} className="btn-secondary">
              Copy HTML Tag
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--pink">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Client-side</span> — Generated entirely in your browser using Canvas API</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Data URI</span> — Use Data URI for embedding directly in HTML or CSS</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Common sizes</span> — 1920&times;1080 (Full HD), 1280&times;720 (HD), 800&times;600 (SVGA)</p>
        </div>
      </div>
    </div>
  );
}
