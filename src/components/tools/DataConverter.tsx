'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState, ConvertFormat } from '@/types';
import { calcStats } from '@/lib/json';
import { parseFormat, serializeFormat, detectFormat } from '@/lib/converter';
import EditorPanel from '@/components/EditorPanel';

const FORMATS: { id: ConvertFormat; label: string }[] = [
  { id: 'json', label: 'JSON' },
  { id: 'yaml', label: 'YAML' },
  { id: 'csv', label: 'CSV' },
  { id: 'xml', label: 'XML' },
];

interface Props {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}

export default function DataConverter({ onStatusChange, onToast }: Props) {
  const [sourceFormat, setSourceFormat] = useState<ConvertFormat>('json');
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>('yaml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      onStatusChange('idle');
      return;
    }
    if (sourceFormat === targetFormat) {
      setOutput(input);
      setError(null);
      onStatusChange('valid');
      return;
    }
    try {
      const data = parseFormat(input, sourceFormat);
      const result = serializeFormat(data, targetFormat);
      setOutput(result);
      setError(null);
      onStatusChange('valid');
    } catch (e) {
      setOutput('');
      setError('Conversion failed: ' + (e instanceof Error ? e.message : 'unknown error'));
      onStatusChange('invalid');
    }
  }, [input, sourceFormat, targetFormat, onStatusChange]);

  // Auto-convert on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        onStatusChange('idle');
        return;
      }
      convert();
    }, 300);
    return () => clearTimeout(timer);
  }, [input, convert, onStatusChange]);

  // Re-convert when formats change
  useEffect(() => {
    if (input.trim()) convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFormat, targetFormat]);

  // Auto-detect source format on paste
  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    if (!autoDetected && val.trim().length > 10) {
      const detected = detectFormat(val);
      if (detected) {
        setSourceFormat(detected);
        // Auto-pick a different target
        if (detected === targetFormat) {
          setTargetFormat(detected === 'json' ? 'yaml' : 'json');
        }
        setAutoDetected(true);
      }
    }
  }, [autoDetected, targetFormat]);

  // Swap source ↔ target (and use output as new input)
  const handleSwap = useCallback(() => {
    const newSource = targetFormat;
    const newTarget = sourceFormat;
    setSourceFormat(newSource);
    setTargetFormat(newTarget);
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
      setAutoDetected(true);
    }
  }, [sourceFormat, targetFormat, output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    onToast('Copied to clipboard');
  }, [output, onToast]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setAutoDetected(false);
    onStatusChange('idle');
  }, [onStatusChange]);

  const inputStats = calcStats(input);
  const outputStats = calcStats(output);

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Source format */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">From</span>
          <div className="pill-group">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSourceFormat(f.id); setAutoDetected(true); }}
                className={`pill-group__item ${sourceFormat === f.id ? 'pill-group__item--active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="btn-secondary !px-2.5"
          title="Swap source and target"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* Target format */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">To</span>
          <div className="pill-group">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTargetFormat(f.id)}
                className={`pill-group__item ${targetFormat === f.id ? 'pill-group__item--active' : ''} ${sourceFormat === f.id ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={convert} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Convert
        </button>
      </div>

      {/* Conversion label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] font-semibold text-cyan-400">{sourceFormat.toUpperCase()}</span>
        <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-[12px] font-semibold text-purple-400">{targetFormat.toUpperCase()}</span>
        {sourceFormat === targetFormat && (
          <span className="text-[11px] text-zinc-500 ml-2">(same format &mdash; passthrough)</span>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EditorPanel
          title={`${sourceFormat.toUpperCase()} Input`}
          mode="input"
          value={input}
          onChange={handleInputChange}
          stats={inputStats}
          placeholder={`Paste ${sourceFormat.toUpperCase()} here — or any format, we'll auto-detect...`}
          actions={
            <button onClick={handleClear} className="btn-ghost">
              Clear
            </button>
          }
        />
        <EditorPanel
          title={`${targetFormat.toUpperCase()} Output`}
          mode="output"
          value={output}
          stats={outputStats}
          emptyMessage={`Convert ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}`}
          actions={
            <button
              onClick={handleCopy}
              disabled={!output}
              className="btn-ghost inline-flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </button>
          }
        />
      </div>

      {/* Error */}
      <div className={`error-container mt-4 ${error ? 'is-visible' : ''}`} aria-live="polite">
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
          <div className="h-6 w-6 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-red-400">Error</p>
            <p className="text-[12px] text-zinc-400 font-mono mt-1 break-words leading-relaxed">{error}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section tips-section--cyan">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Conversion Matrix</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Any &rarr; Any</span> &mdash; All 12 conversions supported</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Auto-detect</span> &mdash; Paste anything, format is detected</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Swap</span> &mdash; Click arrows to reverse direction</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Live</span> &mdash; Output updates as you type</p>
        </div>
      </div>
    </div>
  );
}
