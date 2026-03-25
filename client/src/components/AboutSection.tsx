/**
 * AboutSection — Premium GSAP-powered about section.
 * Uses JellyMaterialCard for GPU-rendered jelly material on all cards.
 */
import { useRef, useEffect } from "react";
import { Cpu, Shield, Factory } from "lucide-react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal, Counter } from "@/components/animation/ScrollReveal";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { JellyMaterialCard } from "@/components/JellyMaterialCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const metrics = [
  { value: 1900, suffix: "+", label: "Fleet Units Fixed", hue: 200 },
  { value: 400, suffix: "+", label: "Devices Analyzed", hue: 65 },
  { value: 20, suffix: "+", label: "Custom Test Fixtures", hue: 160 },
  { value: 6, suffix: "", label: "Product Generations", hue: 280 },
];

const specializations = [
  {
    title: "Hardware Sustainment & Test",
    desc: "End-to-end project delivery across prototyping, test development, CT scanning, fixture design, factory test automation, and CM transfer for EMG wearables at Meta.",
    Icon: Cpu,
    hue: 200,
  },
  {
    title: "NPI, DfX & Failure Analysis",
    desc: "New Product Introduction, Design for Manufacturing/Test, and comprehensive failure analysis with root cause investigation across six product generations.",
    Icon: Factory,
    hue: 65,
  },
  {
    title: "Quality & Regulatory",
    desc: "FDA, ISO 13485, EU MDR, cGMP compliance, Six Sigma, SPC, and 8D methodology across medical device and consumer electronics industries.",
    Icon: Shield,
    hue: 160,
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

  const metricRadii = [
    "1.25rem 0.75rem 0.75rem 1.25rem",
    "0.75rem",
    "0.75rem",
    "0.75rem 1.25rem 1.25rem 0.75rem",
  ];

  const specRadii = [
    "1.5rem 1rem 1rem 0.75rem",
    "1rem",
    "0.75rem 1rem 1.5rem 1rem",
  ];

  return (
    <div className="jelly-section-bg relative">
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

      {/* Metrics with JellyMaterialCard */}
      <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-20 sm:mb-28">
        {metrics.map((m, i) => (
          <JellyMaterialCard
            key={m.label}
            hue={m.hue}
            intensity={0.6}
            borderRadius={metricRadii[i]}
            className="group transition-all duration-300"
          >
            <div data-reveal className="p-5 sm:p-6 text-center">
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                jellyMode ? "" : "text-primary"
              }`} style={jellyMode ? { color: `hsl(${m.hue}, 70%, 60%)` } : undefined}>
                <Counter value={m.value} suffix={m.suffix} duration={2} />
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/60 mt-2 tracking-wide">
                {m.label}
              </p>
            </div>
          </JellyMaterialCard>
        ))}
      </div>

      {/* Specializations with JellyMaterialCard */}
      <div ref={specGridRef} className="grid sm:grid-cols-3 gap-4 sm:gap-5">
        {specializations.map((s, i) => (
          <JellyMaterialCard
            key={s.title}
            hue={s.hue}
            intensity={0.65}
            borderRadius={specRadii[i]}
            className="group h-full transition-all duration-400"
          >
            <div data-reveal className="p-7">
              <div className={`w-10 h-10 mb-5 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                jellyMode
                  ? "bg-white/10 text-white/80"
                  : "bg-primary/6 text-primary group-hover:bg-primary/10"
              }`}>
                <s.Icon size={18} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/25 tracking-wider">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[0.85rem] font-semibold text-foreground mt-1.5 mb-3 tracking-[-0.01em]">
                {s.title}
              </h3>
              <p className="text-[0.8rem] text-muted-foreground leading-[1.7]">
                {s.desc}
              </p>
            </div>
          </JellyMaterialCard>
        ))}
      </div>
    </div>
  );
}
