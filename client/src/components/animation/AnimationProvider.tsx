/**
 * AnimationProvider — Central GSAP orchestration layer.
 * 
 * Registers all premium plugins, provides gsap.matchMedia() context,
 * and exposes animation utilities to the entire app.
 * 
 * Two-tier rendering:
 *   Tier A (mobile/touch): stability-first, lighter animations
 *   Tier B (desktop/fine-pointer): full premium animation path
 * 
 * Respects prefers-reduced-motion: reduce → instant states only.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

// Register all GSAP plugins once
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, CustomEase);

// Custom eases for premium feel
CustomEase.create("premiumOut", "M0,0 C0.25,0.1 0.25,1 1,1");
CustomEase.create("premiumInOut", "M0,0 C0.76,0 0.24,1 1,1");
CustomEase.create("elasticSettle", "M0,0 C0.3,1.3 0.7,0.95 1,1");

interface AnimationContextValue {
  /** true if desktop with fine pointer */
  isDesktop: boolean;
  /** true if user prefers reduced motion */
  reducedMotion: boolean;
  /** true if touch/coarse pointer device */
  isTouch: boolean;
  /** GSAP matchMedia instance */
  mm: gsap.MatchMedia | null;
}

const AnimationContext = createContext<AnimationContextValue>({
  isDesktop: true,
  reducedMotion: false,
  isTouch: false,
  mm: null,
});

export function useAnimation() {
  return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const mmRef = useRef<gsap.MatchMedia | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mmRef.current = mm;

    mm.add(
      {
        isDesktop: "(min-width: 768px) and (pointer: fine)",
        isMobile: "(max-width: 767px), (pointer: coarse)",
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop: desk, isMobile: mob, reducedMotion: rm } = context.conditions!;
        setIsDesktop(!!desk);
        setIsTouch(!!mob);
        setReducedMotion(!!rm);
      }
    );

    // ScrollTrigger defaults
    ScrollTrigger.defaults({
      toggleActions: "play none none none",
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        isDesktop,
        reducedMotion,
        isTouch,
        mm: mmRef.current,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}
