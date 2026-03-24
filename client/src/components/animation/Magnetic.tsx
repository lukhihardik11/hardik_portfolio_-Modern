/**
 * Magnetic — Premium hover effect using gsap.quickTo().
 * 
 * Elements subtly follow the cursor within their bounds,
 * snapping back with elastic easing on mouse leave.
 * 
 * Disabled on touch devices (ScrollTrigger.isTouch).
 * Strength controls pull intensity (0.1 = subtle, 0.5 = strong).
 */
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimation } from "./AnimationProvider";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { isTouch, reducedMotion } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch || reducedMotion) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });

    const move = (e: MouseEvent) => {
      const { height, width, left, top } = el.getBoundingClientRect();
      xTo((e.clientX - (left + width / 2)) * strength);
      yTo((e.clientY - (top + height / 2)) * strength);
    };

    const leave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, isTouch, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
