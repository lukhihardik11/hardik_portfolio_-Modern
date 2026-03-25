/**
 * TextReveal — GSAP SplitText wrapper for premium text entrance animations.
 * 
 * CRITICAL FIX for "removeChild" error:
 * ─────────────────────────────────────
 * SplitText replaces React-managed text nodes with character/word/line <div>s.
 * When jellyMode toggles, React re-renders the parent section, which re-renders
 * the <h2> child inside TextReveal. React tries to reconcile the new virtual DOM
 * against the SplitText-modified real DOM and fails with:
 *   "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 * 
 * Solution: Use a two-container approach:
 *   1. A hidden container renders React children normally (for className updates)
 *   2. A visible container uses ref-managed innerHTML that SplitText can safely modify
 *   When React re-renders (e.g., jellyMode toggle), the hidden container updates,
 *   and we sync className changes to the visible container via DOM manipulation —
 *   but only if SplitText hasn't run yet. Once SplitText has split the text,
 *   className changes are applied directly to the visible element without touching innerHTML.
 * 
 * Supports modes: "lines", "words", "chars", "fade"
 * Respects prefers-reduced-motion and touch device tier.
 */
import React, { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useAnimation } from "./AnimationProvider";

interface TextRevealProps {
  children: ReactNode;
  mode?: "lines" | "words" | "chars" | "fade";
  delay?: number;
  duration?: number;
  stagger?: number;
  scrub?: boolean | number;
  start?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  style?: CSSProperties;
}

export function TextReveal({
  children,
  mode = "lines",
  delay = 0,
  duration = 1.2,
  stagger = 0.08,
  scrub = false,
  start = "top 85%",
  className = "",
  as: Tag = "div",
  style,
}: TextRevealProps) {
  const visibleRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const isSplit = useRef(false);
  const initialHTMLSet = useRef(false);
  const { reducedMotion } = useAnimation();

  // We use a hidden render target to capture React's rendered HTML
  const hiddenRef = useRef<HTMLDivElement>(null);

  // After first mount, capture the rendered HTML from the hidden container
  // and inject it into the visible container via innerHTML (opaque to React)
  useEffect(() => {
    if (!hiddenRef.current || !visibleRef.current) return;
    if (!initialHTMLSet.current) {
      visibleRef.current.innerHTML = hiddenRef.current.innerHTML;
      initialHTMLSet.current = true;
    } else if (!isSplit.current) {
      // If not yet split, we can safely update innerHTML
      visibleRef.current.innerHTML = hiddenRef.current.innerHTML;
    } else {
      // Already split — only sync className changes on the first child element
      const hiddenChild = hiddenRef.current.querySelector('*');
      const visibleChild = visibleRef.current.querySelector(':scope > *');
      if (hiddenChild && visibleChild) {
        visibleChild.className = hiddenChild.className;
      }
    }
  });

  // SplitText effect — runs once on mount, operates on the visible container
  useEffect(() => {
    const el = visibleRef.current;
    if (!el || reducedMotion) return;

    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      document.fonts.ready.then(() => {
        if (cancelled || !visibleRef.current) return;

        const splitType = mode === "fade" ? "lines" : mode;
        
        const split = SplitText.create(visibleRef.current, {
          type: splitType,
          mask: mode === "lines" ? "lines" : undefined,
          autoSplit: true,
          onSplit(self) {
            const targets = mode === "chars" ? self.chars : mode === "words" ? self.words : self.lines;
            if (!targets || targets.length === 0) return;

            const animProps: gsap.TweenVars = {
              duration,
              stagger,
              delay: scrub ? 0 : delay,
              ease: mode === "chars" ? "power4.out" : "expo.out",
              overwrite: true,
            };

            if (scrub) {
              animProps.scrollTrigger = {
                trigger: visibleRef.current,
                start,
                end: "top 30%",
                scrub: typeof scrub === "number" ? scrub : 1,
              };
            } else {
              animProps.scrollTrigger = {
                trigger: visibleRef.current,
                start,
                once: true,
              };
            }

            if (mode === "lines") {
              gsap.from(targets, { yPercent: 110, opacity: 0, ...animProps });
            } else if (mode === "fade") {
              gsap.from(targets, { opacity: 0.15, ...animProps });
            } else if (mode === "words") {
              gsap.from(targets, { y: 30, opacity: 0, ...animProps });
            } else {
              gsap.from(targets, { y: 50, opacity: 0, rotateX: -40, ...animProps });
            }
          },
        });

        splitRef.current = split;
        isSplit.current = true;
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      
      // Kill ScrollTriggers associated with this element
      if (visibleRef.current) {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === visibleRef.current) {
            st.kill();
          }
        });
      }
      
      // Revert SplitText to restore original DOM
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
      isSplit.current = false;
      initialHTMLSet.current = false;
    };
  }, [mode, delay, duration, stagger, scrub, start, reducedMotion]);

  const Component = Tag as any;
  
  return (
    <>
      {/* Hidden container: React renders children here normally.
          This allows React to reconcile freely without touching the SplitText DOM. */}
      <div
        ref={hiddenRef}
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0 }}
        aria-hidden="true"
      >
        {children}
      </div>
      {/* Visible container: innerHTML is set via ref, opaque to React's reconciler.
          SplitText safely modifies this DOM without conflicting with React. */}
      <Component 
        ref={visibleRef} 
        className={className} 
        style={style}
      />
    </>
  );
}
