/**
 * ScrollReveal — Wrapper for scroll-triggered entrance animations.
 * 
 * Uses ScrollTrigger.batch() for grid reveals (performance-optimal).
 * Supports individual element reveals with configurable direction.
 * 
 * Modes:
 *   - "up": slide up + fade (default)
 *   - "left": slide from left
 *   - "right": slide from right
 *   - "scale": scale up from 0.85
 *   - "none": just fade in
 */
import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimation } from "./AnimationProvider";

interface ScrollRevealProps {
  children: ReactNode;
  mode?: "up" | "left" | "right" | "scale" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  start?: string;
  className?: string;
  style?: CSSProperties;
  /** If true, uses batch mode for child elements with data-reveal */
  batch?: boolean;
  /** For batch mode: max elements per wave */
  batchMax?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  mode = "up",
  delay = 0,
  duration = 0.9,
  distance = 60,
  stagger = 0.1,
  start = "top 85%",
  className = "",
  style,
  batch = false,
  batchMax = 3,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    if (batch) {
      // Batch mode for grids
      const items = el.querySelectorAll("[data-reveal]");
      if (items.length === 0) return;

      const fromProps = getFromProps(mode, distance);
      gsap.set(items, fromProps);

      ScrollTrigger.batch(items, {
        interval: 0.1,
        batchMax,
        onEnter: (batchItems) =>
          gsap.to(batchItems, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            stagger,
            duration,
            ease: "power3.out",
            overwrite: true,
          }),
        once,
        start: `20px bottom`,
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          // Clean up batch triggers related to our items
        });
      };
    } else {
      // Single element reveal
      const fromProps = getFromProps(mode, distance);
      gsap.set(el, fromProps);

      gsap.to(el, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
      };
    }
  }, [mode, delay, duration, distance, stagger, start, batch, batchMax, once, reducedMotion]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
}

function getFromProps(mode: string, distance: number): gsap.TweenVars {
  switch (mode) {
    case "up":
      return { opacity: 0, y: distance };
    case "left":
      return { opacity: 0, x: -distance };
    case "right":
      return { opacity: 0, x: distance };
    case "scale":
      return { opacity: 0, scale: 0.85 };
    default:
      return { opacity: 0 };
  }
}

/**
 * Counter — Scroll-driven number animation.
 * Counts from 0 to target value synced with scroll position.
 */
interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  start?: string;
  duration?: number;
}

export function Counter({
  value,
  suffix = "",
  prefix = "",
  className = "",
  start = "top 80%",
  duration = 1.5,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) {
      if (el) el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      return;
    }

    const counter = { value: 0 };
    el.textContent = `${prefix}0${suffix}`;

    gsap.to(counter, {
      value,
      snap: { value: 1 },
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(counter.value).toLocaleString()}${suffix}`;
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [value, suffix, prefix, start, duration, reducedMotion]);

  return <span ref={ref} className={className} />;
}
