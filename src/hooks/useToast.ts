import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast(duration = 2200) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback(
    (message: string) => {
      clearTimeout(timerRef.current);
      setToast({ message, visible: true });
      timerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, showToast };
}
  