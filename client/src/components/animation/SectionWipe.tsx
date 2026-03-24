/**
 * SectionWipe — Cinematic section transition using clipPath animations.
 * 
 * Modes:
 *   - "inset": wipe from center outward (default)
 *   - "circle": circular reveal from center
 *   - "diagonal": diagonal wipe from left
 * 
 * Uses GPU-accelerated clipPath (inset is most performant).
 */
import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimation } from "./AnimationProvider";

interface SectionWipeProps {
  children: ReactNode;
  mode?: "inset" | "circle" | "diagonal";
  className?: string;
  style?: CSSProperties;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

export function SectionWipe({
  children,
  mode = "inset",
  className = "",
  style,
  start = "top 70%",
  end = "top 20%",
  scrub = 1,
}: SectionWipeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const clipFrom = getClipFrom(mode);

    gsap.from(el, {
      clipPath: clipFrom,
      scrollTrigger: {
        trigger: el,
        start,
        end,
        scrub: typeof scrub === "number" ? scrub : scrub ? 1 : false,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [mode, start, end, scrub, reducedMotion]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

function getClipFrom(mode: string): string {
  switch (mode) {
    case "circle":
      return "circle(0% at 50% 50%)";
    case "diagonal":
      return "polygon(0 0, 0 0, 0 100%, 0 100%)";
    default:
      return "inset(8% 8% 8% 8%)";
  }
}
