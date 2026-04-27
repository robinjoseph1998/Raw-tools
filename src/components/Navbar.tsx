import type { StatusState } from '@/types';
import Logo from './Logo';

const STATUS_CONFIG: Record<StatusState, { label: string; color: string; dot: string }> = {
  idle:    { label: 'Ready',  color: 'text-zinc-500', dot: 'bg-zinc-500' },
  valid:   { label: 'Valid',  color: 'text-emerald-400', dot: 'bg-emerald-400' },
  invalid: { label: 'Error',  color: 'text-red-400', dot: 'bg-red-400' },
};

export default function Navbar({
  status,
  onHomeClick,
  onCommandPalette,
  onSidebarToggle,
}: {
  status: StatusState;
  onHomeClick?: () => void;
  onCommandPalette?: () => void;
  onSidebarToggle?: () => void;
}) {
  const cfg = STATUS_CONFIG[status];

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="px-4 sm:px-6">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <button
              onClick={onHomeClick}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              aria-label="Home"
            >
              <Logo size={30} />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] text-zinc-100 tracking-tight">RAW</span>
                <span className="text-[10px] font-medium text-zinc-600 hidden sm:inline">v1.0</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command palette — desktop */}
            {onCommandPalette && (
              <button
                onClick={onCommandPalette}
                className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group"
                aria-label="Search tools"
              >
                <svg className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[11px] text-zinc-600 group-hover:text-zinc-400 transition-colors">Search</span>
                <kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium text-zinc-700 bg-white/[0.04] border border-white/[0.06] rounded ml-1">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Command palette — mobile */}
            {onCommandPalette && (
              <button
                onClick={onCommandPalette}
                className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-200"
                aria-label="Search tools"
              >
                <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            <span className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-wide uppercase ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-status-pulse`} />
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
      <div className="gradient-line--subtle" />
    </nav>
  );
}
