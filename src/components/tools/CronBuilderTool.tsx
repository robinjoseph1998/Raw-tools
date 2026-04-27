'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StatusState } from '@/types';

/* ── Cron field definitions ── */
const FIELDS = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'] as const;
type CronField = typeof FIELDS[number];

const FIELD_META: Record<CronField, { label: string; min: number; max: number; names?: string[] }> = {
  minute:     { label: 'Minute',       min: 0,  max: 59 },
  hour:       { label: 'Hour',         min: 0,  max: 23 },
  dayOfMonth: { label: 'Day of Month', min: 1,  max: 31 },
  month:      { label: 'Month',        min: 1,  max: 12, names: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  dayOfWeek:  { label: 'Day of Week',  min: 0,  max: 6,  names: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] },
};

type FieldMode = 'every' | 'specific' | 'range' | 'step';

interface FieldState {
  mode: FieldMode;
  specific: number[];
  rangeStart: number;
  rangeEnd: number;
  stepBase: number;
  stepValue: number;
}

function defaultFieldState(field: CronField): FieldState {
  const meta = FIELD_META[field];
  return {
    mode: 'every',
    specific: [],
    rangeStart: meta.min,
    rangeEnd: meta.max,
    stepBase: meta.min,
    stepValue: 1,
  };
}

function fieldToExpression(field: CronField, state: FieldState): string {
  switch (state.mode) {
    case 'every': return '*';
    case 'specific': return state.specific.length > 0 ? state.specific.sort((a, b) => a - b).join(',') : '*';
    case 'range': return `${state.rangeStart}-${state.rangeEnd}`;
    case 'step': return state.stepBase === FIELD_META[field].min ? `*/${state.stepValue}` : `${state.stepBase}/${state.stepValue}`;
  }
}

/* ── Human-readable description ── */
function describeExpression(expr: string): string {
  const parts = expr.split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression';

  const [min, hr, dom, mon, dow] = parts;

  const segments: string[] = [];

  // Frequency
  if (min === '*' && hr === '*') {
    segments.push('Every minute');
  } else if (min.startsWith('*/')) {
    segments.push(`Every ${min.slice(2)} minute(s)`);
  } else if (hr === '*' && !min.includes(',') && !min.includes('-') && !min.includes('/')) {
    segments.push(`At minute ${min} of every hour`);
  } else if (hr.startsWith('*/')) {
    segments.push(`Every ${hr.slice(2)} hour(s) at minute ${min}`);
  } else if (!hr.includes(',') && !hr.includes('-') && !hr.includes('/') && !min.includes(',') && !min.includes('-') && !min.includes('/')) {
    const h = parseInt(hr);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    segments.push(`At ${h12}:${min.padStart(2, '0')} ${ampm}`);
  } else {
    segments.push(`At minute ${min}, hour ${hr}`);
  }

  // Day of month
  if (dom !== '*') {
    if (dom.includes(',')) segments.push(`on day ${dom} of the month`);
    else if (dom.includes('-')) segments.push(`on days ${dom} of the month`);
    else if (dom.includes('/')) segments.push(`every ${dom.split('/')[1]} day(s)`);
    else segments.push(`on day ${dom} of the month`);
  }

  // Month
  if (mon !== '*') {
    const names = FIELD_META.month.names!;
    const resolved = mon.replace(/\d+/g, (m) => { const i = parseInt(m); return i >= 1 && i <= 12 ? names[i - 1] : m; });
    segments.push(`in ${resolved}`);
  }

  // Day of week
  if (dow !== '*') {
    const names = FIELD_META.dayOfWeek.names!;
    const resolved = dow.replace(/\d+/g, (m) => { const i = parseInt(m); return i >= 0 && i <= 6 ? names[i] : m; });
    segments.push(`on ${resolved}`);
  }

  return segments.join(', ');
}

/* ── Compute next N run times ── */
function getNextRuns(expr: string, count: number): Date[] {
  const parts = expr.split(/\s+/);
  if (parts.length !== 5) return [];

  const runs: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const matchField = (value: number, pattern: string): boolean => {
    if (pattern === '*') return true;
    return pattern.split(',').some((p) => {
      if (p.includes('/')) {
        const [base, step] = p.split('/').map(Number);
        const b = isNaN(base) ? 0 : base;
        return step > 0 && (value - b) % step === 0 && value >= b;
      }
      if (p.includes('-')) {
        const [s, e] = p.split('-').map(Number);
        return value >= s && value <= e;
      }
      return value === parseInt(p);
    });
  };

  let iterations = 0;
  while (runs.length < count && iterations < 525960) {
    iterations++;
    const min = check.getMinutes();
    const hr = check.getHours();
    const dom = check.getDate();
    const mon = check.getMonth() + 1;
    const dow = check.getDay();

    if (
      matchField(min, parts[0]) &&
      matchField(hr, parts[1]) &&
      matchField(dom, parts[2]) &&
      matchField(mon, parts[3]) &&
      matchField(dow, parts[4])
    ) {
      runs.push(new Date(check));
    }
    check.setMinutes(check.getMinutes() + 1);
  }

  return runs;
}

/* ── Presets ── */
const PRESETS: { label: string; expr: string }[] = [
  { label: 'Every minute',      expr: '* * * * *' },
  { label: 'Every 5 minutes',   expr: '*/5 * * * *' },
  { label: 'Every 15 minutes',  expr: '*/15 * * * *' },
  { label: 'Every hour',        expr: '0 * * * *' },
  { label: 'Every day at midnight', expr: '0 0 * * *' },
  { label: 'Every day at noon', expr: '0 12 * * *' },
  { label: 'Every Monday at 9 AM', expr: '0 9 * * 1' },
  { label: 'Weekdays at 9 AM', expr: '0 9 * * 1-5' },
  { label: '1st of every month', expr: '0 0 1 * *' },
  { label: 'Every Sunday at 3 AM', expr: '0 3 * * 0' },
];

/* ── Main component ── */
export default function CronBuilderTool({ onStatusChange, onToast }: { onStatusChange: (s: StatusState) => void; onToast: (msg: string) => void }) {
  const [fields, setFields] = useState<Record<CronField, FieldState>>(() => ({
    minute: defaultFieldState('minute'),
    hour: defaultFieldState('hour'),
    dayOfMonth: defaultFieldState('dayOfMonth'),
    month: defaultFieldState('month'),
    dayOfWeek: defaultFieldState('dayOfWeek'),
  }));
  const [manualInput, setManualInput] = useState('');
  const [isManual, setIsManual] = useState(false);

  const expression = isManual
    ? manualInput.trim()
    : FIELDS.map((f) => fieldToExpression(f, fields[f])).join(' ');

  const description = describeExpression(expression);
  const nextRuns = getNextRuns(expression, 5);
  const isValid = expression.split(/\s+/).length === 5;

  useEffect(() => {
    onStatusChange(isValid ? 'valid' : 'idle');
  }, [isValid, onStatusChange]);

  const updateField = useCallback((field: CronField, update: Partial<FieldState>) => {
    setFields((prev) => ({ ...prev, [field]: { ...prev[field], ...update } }));
    setIsManual(false);
  }, []);

  const toggleSpecific = useCallback((field: CronField, value: number) => {
    setFields((prev) => {
      const current = prev[field].specific;
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: { ...prev[field], specific: next, mode: 'specific' } };
    });
    setIsManual(false);
  }, []);

  const applyPreset = (expr: string) => {
    setManualInput(expr);
    setIsManual(true);
    // Also parse into fields
    const parts = expr.split(/\s+/);
    if (parts.length === 5) {
      const newFields = { ...fields };
      FIELDS.forEach((f, i) => {
        const p = parts[i];
        const meta = FIELD_META[f];
        if (p === '*') {
          newFields[f] = { ...defaultFieldState(f), mode: 'every' };
        } else if (p.includes('/')) {
          const [base, step] = p.split('/');
          newFields[f] = { ...defaultFieldState(f), mode: 'step', stepBase: base === '*' ? meta.min : parseInt(base), stepValue: parseInt(step) };
        } else if (p.includes('-') && !p.includes(',')) {
          const [s, e] = p.split('-').map(Number);
          newFields[f] = { ...defaultFieldState(f), mode: 'range', rangeStart: s, rangeEnd: e };
        } else if (p.includes(',') || /^\d+$/.test(p)) {
          const values = p.split(',').map(Number);
          newFields[f] = { ...defaultFieldState(f), mode: 'specific', specific: values };
        }
      });
      setFields(newFields);
      setIsManual(false);
    }
  };

  const copyExpression = () => {
    navigator.clipboard.writeText(expression);
    onToast('Cron expression copied');
  };

  return (
    <div className="space-y-6">
      {/* Expression display */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Expression</label>
          <button onClick={copyExpression} className="btn-secondary text-[12px] px-3 py-1.5">
            Copy
          </button>
        </div>
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-4 font-mono">
          {isManual ? (
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="* * * * *"
              className="flex-1 bg-transparent text-[22px] font-bold text-cyan-300 tracking-[0.25em] outline-none placeholder:text-zinc-700"
              spellCheck={false}
            />
          ) : (
            <span className="flex-1 text-[22px] font-bold text-cyan-300 tracking-[0.25em] select-all">
              {expression}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start gap-2">
          <svg className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[13px] text-zinc-300 leading-relaxed">{description}</p>
        </div>
        {/* Field labels under expression */}
        <div className="flex mt-2 font-mono text-[10px] text-zinc-600 tracking-[0.15em]">
          <span className="flex-1 text-center">MIN</span>
          <span className="flex-1 text-center">HOUR</span>
          <span className="flex-1 text-center">DOM</span>
          <span className="flex-1 text-center">MON</span>
          <span className="flex-1 text-center">DOW</span>
        </div>
      </div>

      {/* Toggle manual mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setIsManual(false); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${!isManual ? 'bg-white/[0.08] text-zinc-200 border border-white/[0.1]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Visual Builder
        </button>
        <button
          onClick={() => { setIsManual(true); setManualInput(expression); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${isManual ? 'bg-white/[0.08] text-zinc-200 border border-white/[0.1]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Manual Input
        </button>
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Quick Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              onClick={() => applyPreset(p.expr)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                expression === p.expr
                  ? 'bg-cyan-500/[0.12] border-cyan-500/30 text-cyan-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual builder — field editors */}
      {!isManual && (
        <div className="space-y-4">
          {FIELDS.map((field) => {
            const meta = FIELD_META[field];
            const state = fields[field];

            return (
              <div key={field} className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-semibold text-zinc-200">{meta.label}</h3>
                  <span className="font-mono text-[12px] text-cyan-400">{fieldToExpression(field, state)}</span>
                </div>

                {/* Mode selector */}
                <div className="pill-group mb-3">
                  {(['every', 'specific', 'range', 'step'] as FieldMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateField(field, { mode })}
                      className={state.mode === mode ? 'active' : ''}
                    >
                      {mode === 'every' ? 'Every' : mode === 'specific' ? 'Specific' : mode === 'range' ? 'Range' : 'Step'}
                    </button>
                  ))}
                </div>

                {/* Mode-specific controls */}
                {state.mode === 'specific' && (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: meta.max - meta.min + 1 }, (_, i) => meta.min + i).map((v) => (
                      <button
                        key={v}
                        onClick={() => toggleSpecific(field, v)}
                        className={`w-9 h-8 rounded-md text-[11px] font-medium border transition-all duration-150 ${
                          state.specific.includes(v)
                            ? 'bg-cyan-500/[0.2] border-cyan-500/40 text-cyan-300'
                            : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                        }`}
                        title={meta.names?.[v - meta.min] || String(v)}
                      >
                        {meta.names ? meta.names[v - meta.min]?.slice(0, 3) : v}
                      </button>
                    ))}
                  </div>
                )}

                {state.mode === 'range' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-zinc-500">From</label>
                      <select
                        value={state.rangeStart}
                        onChange={(e) => updateField(field, { rangeStart: parseInt(e.target.value) })}
                        className="bg-[#0d1221] border border-white/[0.1] rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 outline-none [color-scheme:dark]"
                      >
                        {Array.from({ length: meta.max - meta.min + 1 }, (_, i) => meta.min + i).map((v) => (
                          <option key={v} value={v} className="bg-[#0d1221] text-zinc-200">{meta.names ? meta.names[v - meta.min] : v}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-zinc-600">—</span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-zinc-500">To</label>
                      <select
                        value={state.rangeEnd}
                        onChange={(e) => updateField(field, { rangeEnd: parseInt(e.target.value) })}
                        className="bg-[#0d1221] border border-white/[0.1] rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 outline-none [color-scheme:dark]"
                      >
                        {Array.from({ length: meta.max - meta.min + 1 }, (_, i) => meta.min + i).map((v) => (
                          <option key={v} value={v} className="bg-[#0d1221] text-zinc-200">{meta.names ? meta.names[v - meta.min] : v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {state.mode === 'step' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-zinc-500">Starting at</label>
                      <select
                        value={state.stepBase}
                        onChange={(e) => updateField(field, { stepBase: parseInt(e.target.value) })}
                        className="bg-[#0d1221] border border-white/[0.1] rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 outline-none [color-scheme:dark]"
                      >
                        {Array.from({ length: meta.max - meta.min + 1 }, (_, i) => meta.min + i).map((v) => (
                          <option key={v} value={v} className="bg-[#0d1221] text-zinc-200">{meta.names ? meta.names[v - meta.min] : v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-zinc-500">every</label>
                      <input
                        type="number"
                        min={1}
                        max={meta.max}
                        value={state.stepValue}
                        onChange={(e) => updateField(field, { stepValue: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Next runs */}
      {isValid && nextRuns.length > 0 && (
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Next 5 Runs
          </h3>
          <div className="space-y-1.5">
            {nextRuns.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-[12px]">
                <span className="text-zinc-600 w-4">{i + 1}.</span>
                <span className="font-mono text-zinc-300">
                  {d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="font-mono text-cyan-400">
                  {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section--purple">
        <h3 className="text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-2">Cron Syntax</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[12px] text-zinc-400">
          <span><code className="text-purple-300">*</code> — any value</span>
          <span><code className="text-purple-300">5,10,15</code> — specific values</span>
          <span><code className="text-purple-300">1-5</code> — range</span>
          <span><code className="text-purple-300">*/15</code> — every 15 units</span>
          <span><code className="text-purple-300">0 9 * * 1-5</code> — weekdays at 9 AM</span>
          <span><code className="text-purple-300">0 0 1 * *</code> — 1st of month</span>
        </div>
      </div>
    </div>
  );
}
