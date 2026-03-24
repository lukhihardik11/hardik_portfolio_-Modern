/**
 * ProjectsSection — Premium horizontal scroll gallery with GSAP.
 * 
 * Anti-AI-made: Instrument Serif italic heading, expo.out easing,
 * varied card border-radius, authored spacing.
 */
import { useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { Magnetic } from "@/components/animation/Magnetic";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const projects = [
  {
    id: "fpc",
    title: "EMG Failure Analysis — FPC Design",
    category: "Failure Analysis",
    description: "Root cause failure analysis of Flexible Printed Circuit interconnects in EMG wearable units. Identified design weaknesses and recommended Vectra LCP material.",
    tags: ["Failure Analysis", "FPC", "Vectra LCP", "Root Cause"],
    stats: [
      { label: "Devices Analyzed", value: "400+" },
      { label: "Life Extension", value: "25%" },
    ],
    color: "oklch(0.55 0.18 230)",
    accentColor: "#3b82f6",
  },
  {
    id: "ct-scan",
    title: "CT Scanning & Inspection Pipeline",
    category: "Test Engineering",
    description: "Built end-to-end CT scanning pipeline for non-destructive inspection of EMG wearable assemblies, enabling rapid failure localization.",
    tags: ["CT Scanning", "NDT", "Inspection", "Automation"],
    stats: [
      { label: "Scan Throughput", value: "3x" },
      { label: "Defect Detection", value: "98%" },
    ],
    color: "oklch(0.60 0.16 200)",
    accentColor: "#06b6d4",
  },
  {
    id: "fixtures",
    title: "Custom Test Fixture Design",
    category: "Fixture Design",
    description: "Designed 20+ custom test fixtures including bed-of-nails, flatbed modular, and cylindrical verification stations for EMG wearable testing.",
    tags: ["Fixture Design", "Bed-of-Nails", "Modular", "DfT"],
    stats: [
      { label: "Fixtures Built", value: "20+" },
      { label: "Test Time Reduction", value: "60%" },
    ],
    color: "oklch(0.65 0.14 160)",
    accentColor: "#10b981",
  },
  {
    id: "automation",
    title: "Factory Test Automation",
    category: "Automation",
    description: "Developed Python-based test automation frameworks for EMG wearable production lines, integrating with NI hardware and custom fixture interfaces.",
    tags: ["Python", "NI DAQ", "Automation", "Production"],
    stats: [
      { label: "Manual Time Saved", value: "60%" },
      { label: "Test Coverage", value: "95%" },
    ],
    color: "oklch(0.70 0.12 80)",
    accentColor: "#f59e0b",
  },
  {
    id: "cm-transfer",
    title: "CM Transfer & NPI",
    category: "Program Management",
    description: "Led contract manufacturer transfer for EMG wearable product line, managing build documentation, process validation, and quality system alignment.",
    tags: ["CM Transfer", "NPI", "Process Validation", "Quality"],
    stats: [
      { label: "Product Lines", value: "3" },
      { label: "On-time Delivery", value: "100%" },
    ],
    color: "oklch(0.55 0.16 280)",
    accentColor: "#8b5cf6",
  },
  {
    id: "spc",
    title: "SPC & Process Capability",
    category: "Quality Engineering",
    description: "Implemented Statistical Process Control systems and process capability studies across medical device and consumer electronics manufacturing.",
    tags: ["SPC", "Cpk", "Six Sigma", "Minitab"],
    stats: [
      { label: "Processes Monitored", value: "50+" },
      { label: "Yield Improvement", value: "15%" },
    ],
    color: "oklch(0.60 0.18 340)",
    accentColor: "#ec4899",
  },
];

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mobileGridRef = useRef<HTMLDivElement>(null);
  const { isDesktop, reducedMotion } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (isDesktop && trackRef.current && sectionRef.current) {
        const track = trackRef.current;
        const totalWidth = track.scrollWidth - window.innerWidth + 200;
        gsap.to(track, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      } else if (mobileGridRef.current) {
        const cards = mobileGridRef.current.querySelectorAll("[data-project-card]");
        gsap.set(cards, { opacity: 0, y: 50 });
        ScrollTrigger.batch(cards, {
          interval: 0.1,
          batchMax: 2,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, y: 0,
              stagger: 0.12, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
    });
    return () => ctx.revert();
  }, [isDesktop, reducedMotion]);

  const cardRadii = [
    "1.5rem 1rem 1rem 0.75rem",
    "1rem 1.25rem 0.75rem 1rem",
    "0.75rem 1rem 1.25rem 1rem",
    "1rem 0.75rem 1rem 1.5rem",
    "1.25rem 1rem 0.75rem 1rem",
    "0.75rem 1.25rem 1rem 1.25rem",
  ];

  const renderCard = (project: typeof projects[0], i: number, isHorizontal: boolean) => (
    <Link
      key={project.id}
      href={`/project/${project.id}`}
      className="no-underline"
    >
      <Magnetic strength={isHorizontal ? 0.15 : 0.08}>
        <div
          data-project-card
          className={`group flex flex-col cursor-pointer transition-all duration-400 ${
            isHorizontal ? "w-[380px] flex-shrink-0" : ""
          } ${
            jellyMode
              ? "jelly-card p-7"
              : "bg-card/40 backdrop-blur-sm border border-border/40 p-7 hover:bg-card/70 hover:border-border/60 hover:shadow-xl hover:shadow-primary/5"
          }`}
          style={{
            minHeight: isHorizontal ? 420 : undefined,
            borderRadius: jellyMode ? undefined : cardRadii[i % cardRadii.length],
          }}
        >
          {/* Caustic glow */}
          {jellyMode && (
            <div
              className={`jelly-caustic ${i % 2 === 0 ? "jelly-caustic-teal" : "jelly-caustic-amber"}`}
              style={{ width: "120%", height: "60%", bottom: "-10%", left: "-10%", zIndex: 0 }}
            />
          )}

          {/* Accent bar */}
          <div
            className="w-10 h-1 rounded-full mb-5 relative z-10"
            style={{ backgroundColor: project.accentColor }}
          />

          {/* Category */}
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40 mb-3 relative z-10">
            {project.category}
          </span>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-3 leading-snug relative z-10 tracking-[-0.01em]">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[0.8rem] text-muted-foreground leading-[1.7] mb-5 flex-1 relative z-10">
            {project.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-5 py-3 border-t border-border/40 relative z-10">
            {project.stats.map((stat, j) => (
              <div key={stat.label} className={`text-center flex-1 ${j > 0 ? "border-l border-border/30 pl-4" : ""}`}>
                <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[9px] font-medium px-2.5 py-1 rounded-md ${
                  jellyMode
                    ? "jelly-badge-teal"
                    : "bg-primary/5 text-primary/60 border border-primary/8"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all duration-300 relative z-10">
            <span>Explore</span>
            <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Magnetic>
    </Link>
  );

  return (
    <div className="jelly-section-bg relative">
      {/* Section header */}
      <div className="mb-14 lg:mb-20 container">
        <ScrollReveal mode="up" distance={30} duration={0.7}>
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-5 ${
            jellyMode ? "jelly-section-label text-primary/60" : "text-muted-foreground/60"
          }`}>
            <span className="inline-block w-6 h-px bg-current mr-3 align-middle" />
            Projects
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Engineering that pushes boundaries
          </h2>
        </TextReveal>
        <ScrollReveal mode="up" delay={0.15} distance={20}>
          <p className="text-[0.9rem] text-muted-foreground mt-6 max-w-md leading-[1.8]">
            A selection of hardware engineering, test fixture, and research projects.
          </p>
        </ScrollReveal>
      </div>

      {/* Desktop: Horizontal scroll gallery */}
      {isDesktop ? (
        <section ref={sectionRef} className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-8 pl-[max(2rem,calc((100vw-1280px)/2+3rem))] pr-[30vw] py-4"
            style={{ width: "max-content" }}
          >
            {projects.map((project, i) => renderCard(project, i, true))}
          </div>
        </section>
      ) : (
        /* Mobile: Vertical grid */
        <div ref={mobileGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 container">
          {projects.map((project, i) => renderCard(project, i, false))}
        </div>
      )}
    </div>
  );
}
