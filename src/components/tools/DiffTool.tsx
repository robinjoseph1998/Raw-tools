'use client';

import { useState, useCallback, useRef } from 'react';
import type { StatusState } from '@/types';

type DiffLine = { type: 'equal' | 'add' | 'remove'; content: string; leftNum?: number; rightNum?: number };

function computeDiff(left: string, right: string): DiffLine[] {
  const a = left.split('\n');
  const b = right.split('\n');
  const m = a.length, n = b.length;

  // LCS dynamic programming table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  // Backtrack to build diff
  const result: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', content: a[i - 1], leftNum: i, rightNum: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', content: b[j - 1], rightNum: j });
      j--;
    } else {
      result.unshift({ type: 'remove', content: a[i - 1], leftNum: i });
      i--;
    }
  }
  return result;
}

export default function DiffTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [stats, setStats] = useState({ added: 0, removed: 0, unchanged: 0 });
  const leftRef = useRef<HTMLTextAreaElement>(null);

  const compare = useCallback(() => {
    if (!left.trim() && !right.trim()) {
      onStatusChange('invalid');
      onToast('Enter text in both panels');
      return;
    }
    const d = computeDiff(left, right);
    setDiff(d);
    const added = d.filter((l) => l.type === 'add').length;
    const removed = d.filter((l) => l.type === 'remove').length;
    const unchanged = d.filter((l) => l.type === 'equal').length;
    setStats({ added, removed, unchanged });
    onStatusChange('valid');
    if (added === 0 && removed === 0) onToast('Texts are identical');
    else onToast(`${added} added, ${removed} removed`);
  }, [left, right, onStatusChange, onToast]);

  const swap = useCallback(() => {
    setLeft(right);
    setRight(left);
    setDiff(null);
  }, [left, right]);

  const clear = useCallback(() => {
    setLeft('');
    setRight('');
    setDiff(null);
    setStats({ added: 0, removed: 0, unchanged: 0 });
    onStatusChange('idle');
  }, [onStatusChange]);

  const LINE_STYLES: Record<string, string> = {
    equal: '',
    add: 'bg-emerald-500/[0.08] border-l-2 border-emerald-500/40',
    remove: 'bg-red-500/[0.08] border-l-2 border-red-500/40',
  };

  const LINE_PREFIX: Record<string, { char: string; color: string }> = {
    equal: { char: ' ', color: 'text-zinc-600' },
    add: { char: '+', color: 'text-emerald-400' },
    remove: { char: '-', color: 'text-red-400' },
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={compare} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" />
          </svg>
          Compare
        </button>
        <button onClick={swap} disabled={!left && !right} className="btn-secondary disabled:opacity-30 disabled:pointer-events-none">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swap
        </button>
        <button onClick={clear} disabled={!left && !right} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">
          Clear
        </button>
      </div>

      {/* Input panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Original</span>
          </div>
          <textarea
            ref={leftRef}
            value={left}
            onChange={(e) => { setLeft(e.target.value); setDiff(null); }}
            placeholder="Paste original text here..."
            spellCheck={false}
            className="editor-textarea flex-1 min-h-[200px] lg:min-h-[260px] p-4 resize-none"
          />
        </div>

        <div className="flex flex-col rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Modified</span>
          </div>
          <textarea
            value={right}
            onChange={(e) => { setRight(e.target.value); setDiff(null); }}
            placeholder="Paste modified text here..."
            spellCheck={false}
            className="editor-textarea flex-1 min-h-[200px] lg:min-h-[260px] p-4 resize-none"
          />
        </div>
      </div>

      {/* Diff output */}
      {diff && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
              <span className="text-[12px] text-zinc-400"><span className="text-emerald-400 font-semibold">{stats.added}</span> added</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/30 border border-red-500/40" />
              <span className="text-[12px] text-zinc-400"><span className="text-red-400 font-semibold">{stats.removed}</span> removed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-white/[0.06] border border-white/[0.1]" />
              <span className="text-[12px] text-zinc-400"><span className="text-zinc-300 font-semibold">{stats.unchanged}</span> unchanged</span>
            </div>
          </div>

          {/* Diff lines */}
          <div className="rounded-xl glass-panel overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Diff Output</span>
              <span className="text-[11px] text-zinc-500 ml-auto">{diff.length} lines</span>
            </div>
            <div className="max-h-[500px] overflow-auto">
              {diff.length === 0 ? (
                <p className="p-4 text-[13px] text-zinc-500">Both texts are empty.</p>
              ) : (
                <div className="font-mono text-[13px]">
                  {diff.map((line, i) => (
                    <div key={i} className={`flex items-stretch hover:bg-white/[0.02] ${LINE_STYLES[line.type]}`}>
                      <span className="w-10 flex-shrink-0 text-right pr-2 py-0.5 text-[11px] text-zinc-600 select-none border-r border-white/[0.04]">
                        {line.leftNum ?? ''}
                      </span>
                      <span className="w-10 flex-shrink-0 text-right pr-2 py-0.5 text-[11px] text-zinc-600 select-none border-r border-white/[0.04]">
                        {line.rightNum ?? ''}
                      </span>
                      <span className={`w-6 flex-shrink-0 text-center py-0.5 font-bold select-none ${LINE_PREFIX[line.type].color}`}>
                        {LINE_PREFIX[line.type].char}
                      </span>
                      <span className={`flex-1 py-0.5 pr-4 whitespace-pre-wrap break-all ${line.type === 'add' ? 'text-emerald-300/80' : line.type === 'remove' ? 'text-red-300/80' : 'text-zinc-400'}`}>
                        {line.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--cyan">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Privacy</span> — Your data never leaves the browser</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Line-based</span> — Compares line by line using LCS</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Swap</span> — Reverse original and modified</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Use case</span> — Config files, API responses, code</p>
        </div>
      </div>
    </div>
  );
}
