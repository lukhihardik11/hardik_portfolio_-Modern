/**
 * PhilosophySection — Cinematic quote reveal using pure GSAP.
 * 
 * Anti-AI-made: Instrument Serif italic on the quote for authored feel,
 * expo.out easing, asymmetric dividers.
 */
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";

gsap.registerPlugin(ScrollTrigger);

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      const quote = quoteRef.current;
      if (!quote) return;
      const words = quote.querySelectorAll(".gsap-word");
      if (words.length > 0) {
        gsap.fromTo(words,
          { opacity: 0.08, y: 8 },
          {
            opacity: 1, y: 0,
            duration: 0.5, stagger: 0.04, ease: "expo.out",
            scrollTrigger: {
              trigger: quote, start: "top 80%", end: "bottom 55%", scrub: 0.4,
            },
          }
        );
      }
      if (subRef.current) {
        gsap.fromTo(subRef.current,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          {
            clipPath: "inset(0 0% 0 0)", opacity: 1,
            duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: subRef.current, start: "top 85%", once: true },
          }
        );
      }
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, ease: "expo.out",
            scrollTrigger: {
              trigger: sectionRef.current, start: "top 70%", end: "top 35%", scrub: 1,
            },
          }
        );
      }
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          y: -60, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1,
          },
        });
      }
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  const mainQuote = "Great hardware isn't just designed —";
  const subQuote = "it's validated, iterated, and perfected.";

  return (
    <section
      ref={sectionRef}
      className="relative py-28 lg:py-40 overflow-hidden jelly-section-bg"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
          style={{
            background: jellyMode
              ? "radial-gradient(ellipse, oklch(0.72 0.19 195 / 8%) 0%, oklch(0.82 0.15 85 / 4%) 40%, transparent 65%)"
              : "radial-gradient(ellipse, oklch(0.55 0.18 230 / 4%) 0%, transparent 60%)",
            borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%",
            willChange: "transform",
            filter: jellyMode ? "blur(40px)" : undefined,
          }}
        />
      </div>

      <div ref={contentRef} className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Divider above — asymmetric */}
          <div className="flex items-center justify-center gap-4 mb-14">
            <div className={`w-16 h-px ${jellyMode ? "bg-foreground/10" : "bg-border/40"}`} />
            <div className={`w-2 h-2 rounded-full ${jellyMode ? "animate-jelly-pulse" : ""}`}
              style={{ background: jellyMode ? "var(--jelly-teal)" : "oklch(from var(--primary) l c h / 30%)" }}
            />
            <div className={`w-8 h-px ${jellyMode ? "bg-foreground/10" : "bg-border/40"}`} />
          </div>

          {/* Quote — word-by-word reveal, Instrument Serif italic */}
          <h2
            ref={quoteRef}
            className={`font-display text-2xl sm:text-3xl md:text-[2.5rem] leading-[1.4] tracking-[-0.02em] cursor-default ${
              jellyMode ? "jelly-section-title" : "text-foreground"
            }`}
            style={{ fontStyle: "italic", fontWeight: 400 }}
          >
            {mainQuote.split(" ").map((word, i) => (
              <span key={i} className="gsap-word inline-block mr-[0.3em]" style={{ opacity: 0.08 }}>
                {word}
              </span>
            ))}{" "}
            <span className="text-foreground/40">
              {subQuote.split(" ").map((word, i) => (
                <span key={`sub-${i}`} className="gsap-word inline-block mr-[0.3em]" style={{ opacity: 0.08 }}>
                  {word}
                </span>
              ))}
            </span>
          </h2>

          <p
            ref={subRef}
            className="text-sm text-muted-foreground/45 mt-10 max-w-md mx-auto leading-relaxed"
          >
            Every test fixture, every failure analysis, every process optimization
            is a step toward building devices that people can trust with their lives.
          </p>

          {/* Attribution — asymmetric */}
          <div className="flex items-center justify-center gap-3 mt-14">
            <div className={`w-10 h-px ${jellyMode ? "bg-foreground/10" : "bg-border/30"}`} />
            <span className="text-[10px] font-mono text-muted-foreground/25 uppercase tracking-[0.25em]">
              Hardik Lukhi
            </span>
            <div className={`w-6 h-px ${jellyMode ? "bg-foreground/10" : "bg-border/30"}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
