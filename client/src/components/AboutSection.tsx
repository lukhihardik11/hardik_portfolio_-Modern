/**
 * AboutSection — Premium GSAP-powered about section.
 * 
 * Anti-AI-made typography: Instrument Serif on heading, DM Sans on body.
 * Easing: expo.out for dramatic card reveals (Apple-level polish).
 * Layout: Asymmetric — heading left-aligned, metrics in 4-col, specs in 3-col.
 */
import { useRef, useEffect } from "react";
import { Cpu, Shield, Factory } from "lucide-react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal, Counter } from "@/components/animation/ScrollReveal";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const metrics = [
  { value: 1900, suffix: "+", label: "Fleet Units Fixed" },
  { value: 400, suffix: "+", label: "Devices Analyzed" },
  { value: 20, suffix: "+", label: "Custom Test Fixtures" },
  { value: 6, suffix: "", label: "Product Generations" },
];

const specializations = [
  {
    title: "Hardware Sustainment & Test",
    desc: "End-to-end project delivery across prototyping, test development, CT scanning, fixture design, factory test automation, and CM transfer for EMG wearables at Meta.",
    Icon: Cpu,
    color: "teal" as const,
  },
  {
    title: "NPI, DfX & Failure Analysis",
    desc: "New Product Introduction, Design for Manufacturing/Test, and comprehensive failure analysis with root cause investigation across six product generations.",
    Icon: Factory,
    color: "amber" as const,
  },
  {
    title: "Quality & Regulatory",
    desc: "FDA, ISO 13485, EU MDR, cGMP compliance, Six Sigma, SPC, and 8D methodology across medical device and consumer electronics industries.",
    Icon: Shield,
    color: "teal" as const,
  },
];

export function AboutSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const specGridRef = useRef<HTMLDivElement>(null);
  const { reducedMotion, isDesktop } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll("[data-reveal]");
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
        ScrollTrigger.batch(cards, {
          interval: 0.08,
          batchMax: 4,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, y: 0, scale: 1,
              stagger: 0.1, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
      if (specGridRef.current) {
        const cards = specGridRef.current.querySelectorAll("[data-reveal]");
        gsap.set(cards, { opacity: 0, y: 50 });
        ScrollTrigger.batch(cards, {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, y: 0,
              stagger: 0.15, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
    });
    return () => ctx.revert();
  }, [reducedMotion, isDesktop]);

  return (
    <div className="jelly-section-bg relative">
      {/* Section header — authored asymmetry */}
      <div className="mb-14 lg:mb-20">
        <ScrollReveal mode="up" distance={30} duration={0.7}>
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-5 ${
            jellyMode ? "jelly-section-label text-primary/60" : "text-muted-foreground/60"
          }`}>
            <span className="inline-block w-6 h-px bg-current mr-3 align-middle" />
            About
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Engineering with purpose
          </h2>
        </TextReveal>
        <ScrollReveal mode="up" delay={0.2} distance={25}>
          <p className="text-[0.9rem] text-muted-foreground mt-6 max-w-lg leading-[1.8]">
            Hardware Engineer and Project Manager who owns Meta's end-to-end EMG wearable
            sustainment pipeline — spanning failure investigation, CT scanning, fixture design,
            factory test automation, and CM transfer across six product generations.
          </p>
        </ScrollReveal>
      </div>

      {/* Metrics with scroll-driven counters */}
      <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-20 sm:mb-28">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            data-reveal
            className={`group relative p-5 sm:p-6 text-center transition-all duration-300 ${
              jellyMode
                ? "jelly-card jelly-stat-panel"
                : "bg-card/50 border border-border/40 hover:border-primary/15 hover:shadow-md hover:shadow-primary/5"
            }`}
            style={{ borderRadius: i === 0 ? "1.25rem 0.75rem 0.75rem 1.25rem" : i === 3 ? "0.75rem 1.25rem 1.25rem 0.75rem" : "0.75rem" }}
          >
            {jellyMode && (
              <div
                className={`jelly-caustic ${i % 2 === 0 ? "jelly-caustic-teal" : "jelly-caustic-amber"}`}
                style={{ width: "120%", height: "80%", top: "10%", left: "-10%", zIndex: 0 }}
              />
            )}
            <p className={`text-2xl sm:text-3xl font-bold relative z-10 tabular-nums ${
              jellyMode ? "jelly-stat-number" : "text-primary"
            }`} style={jellyMode ? { color: "var(--jelly-teal)" } : undefined}>
              <Counter value={m.value} suffix={m.suffix} duration={2} />
            </p>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/60 mt-2 tracking-wide relative z-10">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Specializations — varied card radii for authored feel */}
      <div ref={specGridRef} className="grid sm:grid-cols-3 gap-4 sm:gap-5">
        {specializations.map((s, i) => (
          <div
            key={s.title}
            data-reveal
            className={`group relative h-full transition-all duration-400 ${
              jellyMode
                ? "jelly-card p-7"
                : "bg-card/30 border border-border/30 p-7 hover:bg-card/60 hover:border-border/50 hover:shadow-lg hover:shadow-primary/5"
            }`}
            style={{ borderRadius: i === 0 ? "1.5rem 1rem 1rem 0.75rem" : i === 1 ? "1rem" : "0.75rem 1rem 1.5rem 1rem" }}
          >
            {jellyMode && (
              <div
                className={`jelly-caustic ${s.color === "teal" ? "jelly-caustic-teal" : "jelly-caustic-amber"}`}
                style={{ width: "100%", height: "60%", bottom: "-10%", left: "0", zIndex: 0 }}
              />
            )}
            <div className={`w-10 h-10 mb-5 flex items-center justify-center transition-colors duration-300 relative z-10 ${
              jellyMode
                ? `jelly-icon-box jelly-icon-box-${s.color}`
                : "bg-primary/6 text-primary group-hover:bg-primary/10"
            }`} style={{ borderRadius: "0.75rem" }}>
              <s.Icon size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/25 tracking-wider relative z-10">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[0.85rem] font-semibold text-foreground mt-1.5 mb-3 relative z-10 tracking-[-0.01em]">
              {s.title}
            </h3>
            <p className="text-[0.8rem] text-muted-foreground leading-[1.7] relative z-10">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
