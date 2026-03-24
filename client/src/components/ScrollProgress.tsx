/*
 * SCROLL PROGRESS — GSAP ScrollTrigger driven
 * Smooth progress bar at the top of the page with jelly dot at leading edge.
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;

    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === document.documentElement) st.kill();
      });
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60]"
      style={{
        height: 4,
        background: 'oklch(0.50 0.005 80 / 15%)',
      }}
    >
      <div
        ref={barRef}
        className="h-full origin-left relative"
        style={{
          transform: 'scaleX(0)',
          background: `linear-gradient(90deg, 
            oklch(0.55 0.18 230 / 70%) 0%, 
            oklch(0.60 0.18 230 / 90%) 60%, 
            oklch(0.70 0.15 230 / 100%) 100%)`,
          boxShadow: '0 0 12px oklch(0.55 0.18 230 / 40%), 0 0 4px oklch(0.55 0.18 230 / 60%)',
        }}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 jelly-pulse"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, oklch(0.85 0.10 230), oklch(0.55 0.18 230))',
            boxShadow: '0 0 12px oklch(0.55 0.18 230 / 70%)',
          }}
        />
      </div>
    </div>
  );
}
