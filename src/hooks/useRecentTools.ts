'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ToolId } from '@/types';

const STORAGE_KEY = 'raw-recent-tools';
const MAX_RECENT = 3;

export function useRecentTools() {
  const [recent, setRecent] = useState<ToolId[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ToolId[];
        if (Array.isArray(parsed)) setRecent(parsed.slice(0, MAX_RECENT));
      }
    } catch {}
  }, []);

  const recordUsage = useCallback((tool: ToolId) => {
    setRecent((prev) => {
      const next = [tool, ...prev.filter((t) => t !== tool)].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { recent, recordUsage };
}
