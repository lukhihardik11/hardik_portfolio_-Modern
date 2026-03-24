/*
 * PageTransition — GSAP-powered page transition wrapper.
 * Provides a smooth overlay slide animation when navigating between routes.
 */
import { useRef, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const [displayChildren, setDisplayChildren] = useState(children);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevLocation.current = location;
      return;
    }

    if (prevLocation.current === location) return;
    prevLocation.current = location;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const tl = gsap.timeline();

    tl.to(overlay, {
      y: '0%',
      duration: 0.35,
      ease: 'power3.in',
    });

    tl.call(() => {
      setDisplayChildren(children);
      window.scrollTo(0, 0);
    });

    tl.to(overlay, {
      y: '-100%',
      duration: 0.35,
      ease: 'power3.out',
      delay: 0.05,
    });

    tl.set(overlay, { y: '100%' });

    return () => { tl.kill(); };
  }, [location, children]);

  useEffect(() => {
    if (prevLocation.current === location) {
      setDisplayChildren(children);
    }
  }, [children, location]);

  return (
    <div ref={containerRef} className="relative">
      {displayChildren}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{
          transform: 'translateY(100%)',
          background: 'var(--background, #0a0a0a)',
        }}
      />
    </div>
  );
}
