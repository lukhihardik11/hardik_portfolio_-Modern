/*
 * SIGNAL DIVIDER — GSAP line-draw animation
 * Horizontal divider with animated line drawing on scroll.
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SignalDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          },
        }
      );
    }

    if (dotRef.current) {
      gsap.fromTo(
        dotRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          delay: 0.3,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container) st.kill();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-8 overflow-hidden flex items-center justify-center">
      <div
        ref={lineRef}
        className="w-full max-w-[240px] jelly-divider"
        style={{ transform: 'scaleX(0)' }}
      />
      <div
        ref={dotRef}
        className="absolute jelly-dot jelly-dot-teal"
        style={{ width: 8, height: 8, transform: 'scale(0)' }}
      />
    </div>
  );
}
