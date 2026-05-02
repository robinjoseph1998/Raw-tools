'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatusState } from '@/types';

type QualityPreset = 'high' | 'medium' | 'low';
type Resolution = 'original' | '720' | '480' | '360';

const PRESETS: { id: QualityPreset; label: string; crf: number }[] = [
  { id: 'high', label: 'High', crf: 23 },
  { id: 'medium', label: 'Medium', crf: 28 },
  { id: 'low', label: 'Low', crf: 33 },
];

const RESOLUTIONS: { id: Resolution; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: '720', label: '720p' },
  { id: '480', label: '480p' },
  { id: '360', label: '360p' },
];

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoCompressTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [duration, setDuration] = useState(0);

  const [preset, setPreset] = useState<QualityPreset>('medium');
  const [resolution, setResolution] = useState<Resolution>('original');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragCounter = useRef(0);
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null);

  const cleanup = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  }, [previewUrl, compressedUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFile = useCallback((f: File) => {
    if (!f.type.startsWith('video/')) {
      onToast('Please select a video file');
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
    setProgress(0);
  }, [cleanup, onToast, onStatusChange]);

  const handleMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  }, []);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } finally {
      setFfmpegLoading(false);
    }
  }, []);

  const compress = useCallback(async () => {
    if (!file) return;
    setCompressing(true);
    setProgress(0);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.max(0, Math.min(100, Math.round(p * 100))));
      });

      const ext = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const crf = PRESETS.find(p => p.id === preset)!.crf;
      const args = ['-i', inputName, '-c:v', 'libx264', '-crf', String(crf)];

      if (resolution !== 'original') {
        const h = parseInt(resolution);
        args.push('-vf', `scale=-2:${h}`);
      }

      args.push('-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([data as any], { type: 'video/mp4' });

      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setProgress(100);
      onStatusChange('valid');
      onToast('Compression complete');

      // Clean up virtual FS
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err) {
      onToast('Compression failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      onStatusChange('invalid');
    } finally {
      setCompressing(false);
    }
  }, [file, preset, resolution, compressedUrl, loadFFmpeg, onStatusChange, onToast]);

  const download = useCallback(() => {
    if (!compressedBlob || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `${baseName}-compressed.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Download started');
  }, [compressedBlob, compressedUrl, file, onToast]);

  const handleClear = useCallback(() => {
    cleanup();
    setFile(null);
    setPreviewUrl('');
    setCompressedUrl('');
    setCompressedBlob(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setDuration(0);
    setProgress(0);
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

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }}
        />
        <button onClick={() => fileRef.current?.click()} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose Video
        </button>
        {file && !compressing && (
          <button onClick={compress} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {ffmpegLoading ? 'Loading FFmpeg...' : 'Compress'}
          </button>
        )}
        {compressedBlob && (
          <button onClick={download} className="btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        )}
        {file && !compressing && (
          <button onClick={handleClear} className="btn-ghost text-[12px] px-3 py-2 text-zinc-600 hover:text-red-400">
            Clear
          </button>
        )}

        <div className="flex-1" />

        {/* Quality preset */}
        <div className="pill-group">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              disabled={compressing}
              className={`pill-group__item ${preset === p.id ? 'pill-group__item--active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Resolution */}
        <select
          value={resolution}
          onChange={e => setResolution(e.target.value as Resolution)}
          disabled={compressing}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-zinc-300 outline-none focus:border-violet-400/40 cursor-pointer"
        >
          {RESOLUTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Progress bar */}
      {compressing && (
        <div className="rounded-lg glass-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {ffmpegLoading ? 'Loading FFmpeg engine...' : 'Compressing...'}
            </span>
            <span className="text-[12px] font-mono text-violet-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

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
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Original</span>
            </div>
            {originalSize > 0 && (
              <span className="text-[11px] font-mono text-zinc-500">{formatBytes(originalSize)}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {previewUrl ? (
              <video
                ref={videoRef}
                src={previewUrl}
                onLoadedMetadata={handleMetadata}
                controls
                className="max-w-full max-h-[340px] rounded-lg border border-white/[0.08]"
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-3 p-8 rounded-xl border border-dashed transition-all duration-200 w-full max-w-sm ${
                  isDragOver
                    ? 'border-violet-500/40 bg-violet-500/[0.06]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]'
                }`}
              >
                <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-[13px] text-zinc-400">Drop video here or click to upload</p>
                <p className="text-[11px] text-zinc-600">MP4, WebM, MOV, AVI supported</p>
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
              <video
                src={compressedUrl}
                controls
                className="max-w-full max-h-[340px] rounded-lg border border-white/[0.08]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                {compressing ? (
                  <svg className="h-8 w-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                <p className="text-[12px] text-zinc-600">
                  {compressing ? 'Compressing video...' : 'Upload a video and click Compress'}
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
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Duration</p>
            <p className="text-[13px] font-mono text-zinc-300">{duration > 0 ? formatDuration(duration) : '—'}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Compressed</p>
            <p className="text-[13px] font-mono text-zinc-300">{compressedSize > 0 ? formatBytes(compressedSize) : '—'}</p>
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
      <div className="tips-section tips-section--violet">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">High</span> — Best quality, moderate compression (CRF 23)</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Medium</span> — Good balance of quality and file size (CRF 28)</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Low</span> — Smallest file, more visible artifacts (CRF 33)</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Resolution</span> — Lowering resolution dramatically reduces file size</p>
        </div>
      </div>
    </div>
  );
}
