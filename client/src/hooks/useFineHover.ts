/**
 * useFineHover — Shared capability-based pointer detection hook.
 *
 * Returns `true` only when the primary input device supports hover AND
 * has fine-grained pointing (i.e., a mouse or high-precision stylus).
 *
 * Gating condition: `(hover: hover) and (pointer: fine)`
 *
 * Behavior by device:
 *   Desktop + mouse          → true  (full jelly physics)
 *   iPad (touch or trackpad) → false (lighter path — iPadOS reports pointer: coarse)
 *   iPhone                   → false (lighter path)
 *   Android phone            → false (lighter path)
 *
 * Listens for dynamic changes (e.g., user plugs in a mouse) via the
 * MediaQueryList `change` event.
 */
import { useState, useEffect } from 'react';

const MQL = '(hover: hover) and (pointer: fine)';

/**
 * Module-level cached value so the first render on the client is correct
 * and all hook consumers share the same initial state.
 */
let cachedValue: boolean | null = null;

function query(): boolean {
  if (typeof window === 'undefined') return true; // SSR fallback: assume desktop
  return window.matchMedia(MQL).matches;
}

export function useFineHover(): boolean {
  if (cachedValue === null) {
    cachedValue = query();
  }

  const [fineHover, setFineHover] = useState(cachedValue);

  useEffect(() => {
    const mql = window.matchMedia(MQL);

    // Sync in case the cached value is stale
    const current = mql.matches;
    if (current !== fineHover) {
      setFineHover(current);
      cachedValue = current;
    }

    const handler = (e: MediaQueryListEvent) => {
      setFineHover(e.matches);
      cachedValue = e.matches;
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return fineHover;
}
