'use client';

import { useState, useCallback } from 'react';
import type { StatusState } from '@/types';
import { generateWords, generateSentences, generateParagraphs } from '@/lib/lorem';

type LoremUnit = 'paragraphs' | 'sentences' | 'words';

export default function LoremTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    let text = '';
    switch (unit) {
      case 'paragraphs': text = generateParagraphs(count); break;
      case 'sentences': text = generateSentences(count); break;
      case 'words': text = generateWords(count); break;
    }
    setOutput(text);
    onStatusChange('valid');
  }, [unit, count, onStatusChange]);

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    onToast('Copied to clipboard');
  };

  const presets: { label: string; unit: LoremUnit; count: number }[] = [
    { label: '1 Paragraph', unit: 'paragraphs', count: 1 },
    { label: '3 Paragraphs', unit: 'paragraphs', count: 3 },
    { label: '5 Sentences', unit: 'sentences', count: 5 },
    { label: '50 Words', unit: 'words', count: 50 },
    { label: '150 Words', unit: 'words', count: 150 },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass-panel rounded-xl p-4 space-y-4">
        <div className="flex items-end gap-4 flex-wrap">
          {/* Unit toggle */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Unit</label>
            <div className="pill-group">
              {(['paragraphs', 'sentences', 'words'] as LoremUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`pill-group__item ${unit === u ? 'pill-group__item--active' : ''}`}
                >
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-[7px] text-[13px] font-mono text-zinc-200 outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>

          {/* Generate */}
          <button onClick={generate} className="btn-primary">
            Generate
          </button>
        </div>

        {/* Quick presets */}
        <div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Quick Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => { setUnit(p.unit); setCount(p.count); }}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1] transition-all duration-200"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Output</span>
          <div className="flex items-center gap-2">
            {output && (
              <span className="text-[11px] text-zinc-600">
                {output.split(/\s+/).length} words
              </span>
            )}
            <button onClick={copy} disabled={!output} className="btn-ghost text-[11px] disabled:opacity-30">
              Copy
            </button>
          </div>
        </div>
        {output ? (
          <div className="p-4 text-[13px] text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {output}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[13px] text-zinc-600">Click Generate to create Lorem Ipsum text</p>
          </div>
        )}
      </div>
    </div>
  );
}
