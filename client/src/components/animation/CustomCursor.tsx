/**
 * CustomCursor — Premium cursor with dot + lag ring.
 * 
 * Dot follows cursor tightly (0.15s), ring follows with elastic lag (0.5s).
 * Ring uses mix-blend-mode: difference for always-visible overlay.
 * 
 * Only renders on desktop with fine pointer.
 * Scales up on interactive elements (links, buttons).
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAnimation } from "./AnimationProvider";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion } = useAnimation();

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const xDot = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onEnterInteractive = () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.6, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 0.5, duration: 0.3, ease: "power2.out" });
    };

    const onLeaveInteractive = () => {
      gsap.to(ring, { scale: 1, opacity: 0.4, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove);

    // Observe interactive elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll("a, button, [role='button'], input, textarea, select, .magnetic").forEach((el) => {
        if (!(el as any).__cursorBound) {
          el.addEventListener("mouseenter", onEnterInteractive);
          el.addEventListener("mouseleave", onLeaveInteractive);
          (el as any).__cursorBound = true;
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial bind
    document.querySelectorAll("a, button, [role='button'], input, textarea, select, .magnetic").forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
      (el as any).__cursorBound = true;
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, [isDesktop, reducedMotion]);

  if (!isDesktop || reducedMotion) return null;

  return (
    <>
      {/* Dot — tight follow */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: "50%",
          backgroundColor: "var(--foreground)",
          opacity: 0.9,
          willChange: "transform",
        }}
      />
      {/* Ring — elastic lag */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          borderRadius: "50%",
          border: "1.5px solid var(--foreground)",
          opacity: 0.4,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
    </>
  );
}
