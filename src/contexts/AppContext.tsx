'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { StatusState } from '@/types';

interface ToastState {
  message: string;
  visible: boolean;
}

interface AppContextType {
  status: StatusState;
  setStatus: (s: StatusState) => void;
  toast: ToastState;
  showToast: (msg: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean | ((v: boolean) => boolean)) => void;
  shortcutHelpOpen: boolean;
  setShortcutHelpOpen: (open: boolean | ((v: boolean) => boolean)) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StatusState>('idle');
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string) => {
    clearTimeout(timerRef.current);
    setToast({ message, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <AppContext.Provider value={{
      status, setStatus,
      toast, showToast,
      sidebarOpen, setSidebarOpen,
      paletteOpen, setPaletteOpen: setPaletteOpen as AppContextType['setPaletteOpen'],
      shortcutHelpOpen, setShortcutHelpOpen: setShortcutHelpOpen as AppContextType['setShortcutHelpOpen'],
    }}>
      {children}
    </AppContext.Provider>
  );
}
