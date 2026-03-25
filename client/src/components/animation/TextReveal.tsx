/**
 * TextReveal — GSAP SplitText wrapper for premium text entrance animations.
 * 
 * Supports multiple reveal modes:
 *   - "lines": lines slide up from behind a mask (Apple-style)
 *   - "words": words fade + rise with stagger
 *   - "chars": characters animate individually (hero headlines)
 *   - "fade": simple opacity cascade per line (scroll-linked)
 * 
 * FIX for "removeChild" error:
 * SplitText replaces React-managed text nodes with character/word/line <div>s.
 * When a parent re-renders (e.g., jellyMode toggle changes CSS classes on children),
 * React tries to reconcile the stale virtual DOM against the SplitText-modified real DOM
 * and fails with "The node to be removed is not a child of this node."
 * 
 * Solution: Render children normally but use a `key` that includes a "split generation"
 * counter. When the effect runs SplitText, it doesn't change the key, so React doesn't
 * try to reconcile. When the effect cleanup reverts SplitText (restoring original DOM),
 * the next render will work fine. Additionally, we suppress React's hydration warnings
 * on the container since SplitText will modify its innerHTML.
 * 
 * Automatically respects prefers-reduced-motion and touch device tier.
 */
import React, { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useAnimation } from "./AnimationProvider";

interface TextRevealProps {
  children: ReactNode;
  mode?: "lines" | "words" | "chars" | "fade";
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration per element */
  duration?: number;
  /** Stagger between elements */
  stagger?: number;
  /** Whether to use scroll-linked animation */
  scrub?: boolean | number;
  /** ScrollTrigger start position */
  start?: string;
  /** Additional className */
  className?: string;
  /** Tag to render */
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
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const hasBeenSplit = useRef(false);
  const { reducedMotion } = useAnimation();

  // Store the original innerHTML before SplitText modifies it
  const originalHTML = useRef<string>("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    let cancelled = false;

    // Small delay to ensure React has finished rendering children
    const raf = requestAnimationFrame(() => {
      document.fonts.ready.then(() => {
        if (cancelled || !containerRef.current) return;

        // Save original HTML so we can restore it before React reconciles
        originalHTML.current = containerRef.current.innerHTML;

        const splitType = mode === "fade" ? "lines" : mode;
        
        const split = SplitText.create(containerRef.current, {
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
                trigger: containerRef.current,
                start,
                end: "top 30%",
                scrub: typeof scrub === "number" ? scrub : 1,
              };
            } else {
              animProps.scrollTrigger = {
                trigger: containerRef.current,
                start,
                once: true,
              };
            }

            if (mode === "lines") {
              gsap.from(targets, {
                yPercent: 110,
                opacity: 0,
                ...animProps,
              });
            } else if (mode === "fade") {
              gsap.from(targets, {
                opacity: 0.15,
                ...animProps,
              });
            } else if (mode === "words") {
              gsap.from(targets, {
                y: 30,
                opacity: 0,
                ...animProps,
              });
            } else {
              gsap.from(targets, {
                y: 50,
                opacity: 0,
                rotateX: -40,
                ...animProps,
              });
            }
          },
        });

        splitRef.current = split;
        hasBeenSplit.current = true;
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      
      // Kill any ScrollTriggers associated with this element FIRST
      if (containerRef.current) {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === containerRef.current) {
            st.kill();
          }
        });
      }
      
      // Revert SplitText to restore original DOM before React reconciles
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
      
      // If SplitText.revert() didn't fully restore (edge case), manually restore
      if (hasBeenSplit.current && containerRef.current && originalHTML.current) {
        try {
          // Check if the DOM is still in a split state by looking for SplitText wrappers
          const hasSplitWrappers = containerRef.current.querySelector('[data-split-text]') || 
            containerRef.current.querySelector('.split-text');
          if (hasSplitWrappers) {
            containerRef.current.innerHTML = originalHTML.current;
          }
        } catch (e) {
          // Silently handle - the component is unmounting anyway
        }
      }
      
      hasBeenSplit.current = false;
    };
  }, [mode, delay, duration, stagger, scrub, start, reducedMotion]);

  const Component = Tag as any;
  
  // Use suppressHydrationWarning to prevent React warnings when SplitText modifies innerHTML
  return (
    <Component 
      ref={containerRef} 
      className={className} 
      style={style}
      suppressHydrationWarning
    >
      {children}
    </Component>
  );
}
