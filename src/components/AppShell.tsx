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
        <div className="py-4 sm:py-5 bg-[#070b14]">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Logo size={18} className="opacity-50" />
                  <span className="text-[11px] font-semibold text-zinc-500">RAW</span>
                </div>
                <span className="text-zinc-800">|</span>
                <span className="text-[10px] sm:text-[11px] text-zinc-600">28 tools &middot; 100% client-side</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-600">
                <span>&copy; {new Date().getFullYear()} RAW</span>
                <span className="text-zinc-800">&middot;</span>
                <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
                <span className="text-zinc-800">&middot;</span>
                <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
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
