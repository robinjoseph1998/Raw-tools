'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ToolId } from '@/types';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { TOOL_META, TOOL_SLUGS, SLUG_TO_TOOL, TOOL_ORDER, LETTER_SHORTCUTS, detectContent } from '@/lib/tools';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import ShortcutHelp from './ShortcutHelp';
import Toast from './Toast';
import Logo from './Logo';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, toast, sidebarOpen, setSidebarOpen, paletteOpen, setPaletteOpen, shortcutHelpOpen, setShortcutHelpOpen } = useAppContext();
  const dragCounter = useRef(0);

  // Derive active tool from pathname
  const activeTool: ToolId | null = pathname.startsWith('/tools/')
    ? SLUG_TO_TOOL[pathname.split('/')[2]] ?? null
    : null;

  const isHome = pathname === '/';

  const navigateToTool = useCallback((tool: ToolId) => {
    router.push(`/tools/${TOOL_SLUGS[tool]}`);
  }, [router]);

  const navigateHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v: boolean) => !v);
        return;
      }

      if (!isInput && isHome && e.key >= '0' && e.key <= '9') {
        const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
        if (index < TOOL_ORDER.length) {
          e.preventDefault();
          navigateToTool(TOOL_ORDER[index]);
        }
        return;
      }

      if (!isInput && isHome && e.key in LETTER_SHORTCUTS) {
        e.preventDefault();
        navigateToTool(LETTER_SHORTCUTS[e.key]);
        return;
      }

      if (e.key === 'Escape' && activeTool !== null && !paletteOpen && !shortcutHelpOpen) {
        navigateHome();
      }

      if (!isInput && e.key === '?' && !paletteOpen) {
        e.preventDefault();
        setShortcutHelpOpen((v: boolean) => !v);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHome, activeTool, paletteOpen, shortcutHelpOpen, navigateToTool, navigateHome, setPaletteOpen, setShortcutHelpOpen]);

  // Drag & drop — home only
  useEffect(() => {
    if (!isHome) return;

    const enter = (e: DragEvent) => { e.preventDefault(); dragCounter.current++; };
    const leave = (e: DragEvent) => { e.preventDefault(); dragCounter.current--; };
    const over = (e: DragEvent) => { e.preventDefault(); };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const d = detectContent(text);
          navigateToTool(d ? d.tool : 'format');
        };
        reader.readAsText(file);
        return;
      }
      const text = e.dataTransfer?.getData('text') ?? '';
      if (text) {
        const d = detectContent(text);
        if (d) navigateToTool(d.tool);
      }
    };

    window.addEventListener('dragenter', enter);
    window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', over);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('dragover', over);
      window.removeEventListener('drop', drop);
    };
  }, [isHome, navigateToTool]);

  return (
    <>
      <Navbar
        status={status}
        onHomeClick={navigateHome}
        onCommandPalette={() => setPaletteOpen(true)}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutHelp open={shortcutHelpOpen} onClose={() => setShortcutHelpOpen(false)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {children}
        </main>
      </div>

      {/* Footer — full width below sidebar + content */}
      <footer>
        <div className="gradient-line--subtle" />
        <div className="py-4 sm:py-5 bg-[#0a0a0a]">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Logo size={18} className="opacity-50" />
                  <span className="text-[11px] font-semibold text-zinc-500">RAW</span>
                </div>
                <span className="text-zinc-800">|</span>
                <span className="text-[10px] sm:text-[11px] text-zinc-600">30 tools &middot; 100% client-side</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-600">
                <span>&copy; {new Date().getFullYear()} RAW</span>
                <span className="text-zinc-800">&middot;</span>
                <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
                <span className="text-zinc-800">&middot;</span>
                <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
                <span className="text-zinc-800">&middot;</span>
                <a
                  href="https://discord.gg/DwchbZU7F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-zinc-400 transition-colors"
                  aria-label="Join our Discord community"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppProvider>
  );
}
