/**
 * useScrollReveal — Scroll-triggered reveal animations.
 * 
 * Strategy: Elements start visible in HTML/CSS (no flash of invisible content).
 * JS adds a `.sr-hidden` class immediately, then removes it with GSAP animation
 * when the element enters the viewport (IntersectionObserver) or after a safety timeout.
 * 
 * The safety timeout is per-element and resets on each scroll event to ensure
 * elements that are scrolled into view always become visible.
 * 
 * Reduced-motion: skips all animations, elements stay visible.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ScrollRevealOptions {
  stagger?: number;
  y?: number;
  duration?: number;
  threshold?: number;
  animateSkillBars?: boolean;
  animateCounters?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // elements stay visible by default

    const el = ref.current;
    const {
      stagger = 0.08,
      y = 28,
      duration = 0.55,
      threshold = 0.05,
      animateSkillBars = false,
      animateCounters = false,
    } = options;

    const children = Array.from(el.querySelectorAll("[data-reveal]")) as HTMLElement[];
    if (children.length === 0) return;

    // Set initial hidden state
    children.forEach((child) => {
      child.style.opacity = "0";
      child.style.transform = `translateY(${y}px)`;
    });

    let hasRevealed = false;

    const doReveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;

      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration,
        ease: "power2.out",
        stagger,
        onComplete: () => {
          // Clean up inline styles after animation
          children.forEach((child) => {
            child.style.opacity = "";
            child.style.transform = "";
          });
        },
      });

      // Trigger skill bars and counters alongside reveal
      if (animateSkillBars) animateBars();
      if (animateCounters) animateCounterElements();
    };

    // --- Skill bar animation ---
    let barTargets: string[] = [];
    const bars = animateSkillBars
      ? (Array.from(el.querySelectorAll(".skill-bar-fill")) as HTMLElement[])
      : [];

    if (animateSkillBars && bars.length > 0) {
      bars.forEach((bar) => {
        barTargets.push(bar.style.width || bar.getAttribute("data-width") || "0%");
        bar.style.width = "0%";
      });
    }

    const animateBars = () => {
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          width: barTargets[i],
          duration: 0.9,
          ease: "power2.out",
          delay: i * 0.03,
        });
      });
    };

    // --- Counter animation ---
    const counters = animateCounters
      ? (Array.from(el.querySelectorAll("[data-counter]")) as HTMLElement[])
      : [];

    const animateCounterElements = () => {
      counters.forEach((counter) => {
        const target = counter.dataset.counter || "";
        const numericMatch = target.match(/^([\d,]+)/);
        if (!numericMatch) return;

        const finalNum = parseInt(numericMatch[1].replace(/,/g, ""), 10);
        const suffix = target.replace(numericMatch[1], "");
        const hasComma = numericMatch[1].includes(",");

        counter.textContent = "0" + suffix;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: finalNum,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            const rounded = Math.round(obj.val);
            const formatted = hasComma ? rounded.toLocaleString() : String(rounded);
            counter.textContent = formatted + suffix;
          },
        });
      });
    };

    // Initialize counters to "0"
    if (animateCounters) {
      counters.forEach((counter) => {
        const target = counter.dataset.counter || "";
        const numericMatch = target.match(/^([\d,]+)/);
        if (numericMatch) {
          const suffix = target.replace(numericMatch[1], "");
          counter.textContent = "0" + suffix;
        }
      });
    }

    // --- IntersectionObserver ---
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            doReveal();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(el);

    // --- Safety: reveal after 2s regardless ---
    const safetyTimer = setTimeout(doReveal, 2000);

    // --- Extra safety: check on scroll if element is in viewport ---
    const checkVisibility = () => {
      if (hasRevealed) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      // If any part of the element is visible
      if (rect.top < windowHeight && rect.bottom > 0) {
        doReveal();
      }
    };

    window.addEventListener("scroll", checkVisibility, { passive: true });

    // Also check immediately in case element is already in viewport
    requestAnimationFrame(checkVisibility);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);

  return ref;
}
