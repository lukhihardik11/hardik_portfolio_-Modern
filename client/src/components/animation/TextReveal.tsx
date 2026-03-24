/**
 * TextReveal — GSAP SplitText wrapper for premium text entrance animations.
 * 
 * Supports multiple reveal modes:
 *   - "lines": lines slide up from behind a mask (Apple-style)
 *   - "words": words fade + rise with stagger
 *   - "chars": characters animate individually (hero headlines)
 *   - "fade": simple opacity cascade per line (scroll-linked)
 * 
 * Automatically respects prefers-reduced-motion and touch device tier.
 * Uses SplitText.create() with autoSplit for responsive re-splitting.
 */
import React, { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
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
  const { reducedMotion } = useAnimation();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    // Wait for fonts to load before splitting
    document.fonts.ready.then(() => {
      const splitType = mode === "fade" ? "lines" : mode;
      
      const split = SplitText.create(el, {
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
              trigger: el,
              start,
              end: "top 30%",
              scrub: typeof scrub === "number" ? scrub : 1,
            };
          } else {
            animProps.scrollTrigger = {
              trigger: el,
              start,
              once: true,
            };
          }

          if (mode === "lines") {
            // Cinematic mask reveal — lines slide up from behind overflow:hidden wrapper
            return gsap.from(targets, {
              yPercent: 110,
              opacity: 0,
              ...animProps,
            });
          } else if (mode === "fade") {
            // Apple-style partial opacity cascade
            return gsap.from(targets, {
              opacity: 0.15,
              ...animProps,
            });
          } else if (mode === "words") {
            return gsap.from(targets, {
              y: 30,
              opacity: 0,
              ...animProps,
            });
          } else {
            // chars
            return gsap.from(targets, {
              y: 50,
              opacity: 0,
              rotateX: -40,
              ...animProps,
            });
          }
        },
      });

      return () => {
        split.revert();
      };
    });
  }, [mode, delay, duration, stagger, scrub, start, reducedMotion]);

  const Component = Tag as any;
  return (
    <Component ref={containerRef} className={className} style={style}>
      {children}
    </Component>
  );
}
