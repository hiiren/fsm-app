import { useEffect, useRef, useCallback } from 'react';

interface UseOutsideClickOptions {
  onOutsideClick: () => void;
  enabled?: boolean;
}

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const eventListener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        savedHandler.current(event);
      }
    };

    document.addEventListener('mousedown', eventListener);
    document.addEventListener('touchstart', eventListener);

    return () => {
      document.removeEventListener('mousedown', eventListener);
      document.removeEventListener('touchstart', eventListener);
    };
  }, [ref, enabled]);
}

export function useClickOutside<T extends HTMLElement>(
  onOutsideClick: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);
  useOutsideClick(ref, onOutsideClick, enabled);
  return ref;
}