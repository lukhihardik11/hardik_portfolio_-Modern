/**
 * useSplineGating — Controls whether the Spline 3D scene should be rendered.
 *
 * Two independent gates:
 * 1. **Viewport gate:** Only render Spline on screens >= 768px (md breakpoint).
 *    Prevents mobile devices from downloading ~5.6 MB of Spline JS + scene assets
 *    for a 3D model they never see (the container is `hidden md:block`).
 *
 * 2. **Timeout gate:** If the Spline scene hasn't called `onLoad` within
 *    `LOAD_TIMEOUT_MS`, we abandon the load and show the static fallback.
 *    Prevents infinite loading spinners on slow connections or CDN outages.
 *
 * Usage:
 *   const { shouldRender, hasTimedOut, isLoaded, onSplineReady } = useSplineGating();
 *   - `shouldRender`: true if viewport is >= 768px (mount the Suspense tree)
 *   - `hasTimedOut`: true if the load timer expired before `onSplineReady` was called
 *   - `isLoaded`: true if Spline has successfully loaded
 *   - `onSplineReady`: call this inside the Spline `onLoad` callback to cancel the timer
 *
 * Risk mitigation:
 *   - Resize-during-timeout: timer only starts when isDesktop && !isLoaded.
 *     If user resizes below 768px during load, cleanup clears the timer.
 *   - Timer ref properly cleared in all paths (success, timeout, unmount).
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const MD_BREAKPOINT = '(min-width: 768px)';
const LOAD_TIMEOUT_MS = 8000;

export function useSplineGating() {
  /* ── Viewport gate ── */
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MD_BREAKPOINT).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MD_BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  /* ── Timeout gate ── */
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start the timeout when we should render but haven't loaded yet
  useEffect(() => {
    if (!isDesktop || isLoaded) return;

    timerRef.current = setTimeout(() => {
      setHasTimedOut(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isDesktop, isLoaded]);

  // Called by the Spline onLoad callback to cancel the timeout
  const onSplineReady = useCallback(() => {
    setIsLoaded(true);
    setHasTimedOut(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    /** True if the viewport is >= 768px — mount the Spline tree */
    shouldRender: isDesktop,
    /** True if the load timer expired before Spline finished loading */
    hasTimedOut,
    /** True if Spline has successfully loaded */
    isLoaded,
    /** Call inside Spline's onLoad to cancel the timeout */
    onSplineReady,
  };
}
