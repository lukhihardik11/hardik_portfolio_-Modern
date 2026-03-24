/**
 * JellyBackground — SVG Gooey Metaball Background + Jelly Cursor
 * 3 blobs, reduced opacity, softened gooey filter.
 * Cursor blob only on desktop with mouse (not touch).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { useTheme } from '@/contexts/ThemeContext';

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
  const hasNoHover = window.matchMedia?.('(hover: none)')?.matches;
  const isIPad = /iPad/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIPad || (hasTouch && (hasCoarsePointer || hasNoHover));
}

/* ─── Jelly Cursor ─── */
function JellyCursor() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springX  = useSpring(mouseX, { stiffness: 100, damping: 14, mass: 1.0 });
  const springY  = useSpring(mouseY, { stiffness: 100, damping: 14, mass: 1.0 });
  const trailX   = useSpring(mouseX, { stiffness: 50,  damping: 20, mass: 1.5 });
  const trailY   = useSpring(mouseY, { stiffness: 50,  damping: 20, mass: 1.5 });
  const trail3X  = useSpring(mouseX, { stiffness: 30,  damping: 24, mass: 2.0 });
  const trail3Y  = useSpring(mouseY, { stiffness: 30,  damping: 24, mass: 2.0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  const colors = isDark
    ? { main: 'oklch(0.62 0.18 230 / 45%)', trail: 'oklch(0.78 0.15 65 / 30%)', tail: 'oklch(0.55 0.16 230 / 20%)' }
    : { main: 'oklch(0.72 0.16 65 / 35%)',  trail: 'oklch(0.55 0.18 230 / 25%)', tail: 'oklch(0.75 0.12 65 / 15%)' };

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 40, filter: 'url(#gooey-cursor)', opacity: 0.35 }}
    >
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          x: springX, y: springY,
          width: 32, height: 32, marginLeft: -16, marginTop: -16,
          background: colors.main, willChange: 'transform',
        }}
      />
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          x: trailX, y: trailY,
          width: 44, height: 44, marginLeft: -22, marginTop: -22,
          background: colors.trail, willChange: 'transform',
        }}
      />
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          x: trail3X, y: trail3Y,
          width: 24, height: 24, marginLeft: -12, marginTop: -12,
          background: colors.tail, willChange: 'transform',
        }}
      />
    </div>
  );
}

/* ─── Metaball Blobs ─── */
function MetaballBlobs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = isDark ? {
    blob1: '#1e40af',
    blob2: '#0f766e',
    blob3: '#6d28d9',
  } : {
    blob1: '#93c5fd',
    blob2: '#5eead4',
    blob3: '#c4b5fd',
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        filter: 'url(#gooey-bg)',
        opacity: isDark ? 0.10 : 0.07,
        willChange: 'contents',
      }}
    >
      <div className="absolute rounded-full jelly-metaball-1"
        style={{
          width: '22vw', height: '22vw',
          minWidth: 160, minHeight: 160, maxWidth: 400, maxHeight: 400,
          background: `radial-gradient(circle at 40% 40%, ${colors.blob1}, ${colors.blob1}cc)`,
        }} />
      <div className="absolute rounded-full jelly-metaball-2"
        style={{
          width: '18vw', height: '18vw',
          minWidth: 140, minHeight: 140, maxWidth: 350, maxHeight: 350,
          background: `radial-gradient(circle at 60% 30%, ${colors.blob2}, ${colors.blob2}cc)`,
        }} />
      <div className="absolute rounded-full jelly-metaball-3"
        style={{
          width: '15vw', height: '15vw',
          minWidth: 120, minHeight: 120, maxWidth: 300, maxHeight: 300,
          background: `radial-gradient(circle at 50% 50%, ${colors.blob3}, ${colors.blob3}cc)`,
        }} />
    </div>
  );
}

export function JellyBackground() {
  const { jellyMode } = useJellyMode();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
    const onResize = () => setIsTouch(isTouchDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="gooey-bg">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 10 -4" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="gooey-cursor">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <AnimatePresence>
        {jellyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <MetaballBlobs />
            {!isTouch && <JellyCursor />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
