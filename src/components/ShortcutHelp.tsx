'use client';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: 'Open command palette' },
  { keys: ['0-9'], desc: 'Jump to tool by number' },
  { keys: ['E','C','L','B','I'], desc: 'B64, Color, Lorem, B64↔Img' },
  { keys: ['ESC'], desc: 'Go back to landing page' },
  { keys: ['?'], desc: 'Toggle this help overlay' },
];

export default function ShortcutHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-sm mx-4 rounded-xl border border-white/[0.08] bg-[#0c1120]/95 backdrop-blur-xl shadow-2xl shadow-black/50 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-[13px] font-semibold text-zinc-200">Keyboard Shortcuts</h2>
        </div>
        <div className="p-4 space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between">
              <span className="text-[12px] text-zinc-400">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-semibold text-zinc-300 bg-white/[0.06] border border-white/[0.1] rounded"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-[10px] text-zinc-600 text-center">Press <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded">?</kbd> or <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded">ESC</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}
