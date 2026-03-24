/**
 * ExperienceSection — Premium timeline with GSAP-powered animations.
 * 
 * Anti-AI-made: Instrument Serif italic heading, expo.out easing,
 * varied card border-radius, authored spacing.
 */
import { useRef, useEffect } from "react";
import { MapPin, Briefcase } from "lucide-react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

const experiences = [
  {
    role: "Project Manager — Hardware Sustainment",
    company: "Meta Platforms",
    location: "Redmond, WA",
    period: "Oct 2024 — Present",
    current: true,
    highlights: [
      "Leading end-to-end project delivery for EMG wearable sustainment program across prototyping, test development, failure analysis, and CM transfer",
      "Managing cross-functional teams spanning mechanical, electrical, firmware, and quality engineering",
      "Driving sprint planning, JIRA workflow automation, and program metrics dashboards",
    ],
  },
  {
    role: "Senior Mechanical Engineer — Hardware Sustainment",
    company: "Meta Platforms",
    location: "Redmond, WA",
    period: "Jun 2022 — Oct 2024",
    current: false,
    highlights: [
      "Owned failure analysis pipeline for 400+ EMG wearable devices using CT scanning, cross-sectioning, and root cause investigation",
      "Designed 20+ custom test fixtures including bed-of-nails, flatbed modular, and cylindrical verification stations",
      "Developed Python-based test automation frameworks reducing manual test time by 60%",
    ],
  },
  {
    role: "Senior Quality Engineer",
    company: "Stryker (Vocera)",
    location: "San Jose, CA",
    period: "Jul 2021 — Jun 2022",
    current: false,
    highlights: [
      "Led quality engineering for wearable communication devices in healthcare environments",
      "Implemented CAPA processes and drove FMEA/risk management activities under ISO 13485",
      "Managed supplier quality and incoming inspection programs for critical components",
    ],
  },
  {
    role: "Quality Engineer II",
    company: "Abbott (St. Jude Medical)",
    location: "Plano, TX",
    period: "Feb 2020 — Jul 2021",
    current: false,
    highlights: [
      "Supported quality systems for cardiac rhythm management devices under FDA QMS and EU MDR",
      "Conducted process validation (IQ/OQ/PQ) and statistical analysis using Minitab and SPC tools",
      "Drove 8D corrective actions and nonconformance investigations for Class III medical devices",
    ],
  },
  {
    role: "Quality Engineer",
    company: "Terumo BCT",
    location: "Lakewood, CO",
    period: "Jun 2019 — Feb 2020",
    current: false,
    highlights: [
      "Managed quality engineering activities for blood component technology manufacturing",
      "Performed process capability studies (Cpk) and first article inspections (FAI)",
      "Supported cGMP compliance and internal/external audit readiness",
    ],
  },
];

export function ExperienceSection() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const svgLineRef = useRef<SVGPathElement>(null);
  const { reducedMotion, isDesktop } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (svgLineRef.current && isDesktop) {
        gsap.from(svgLineRef.current, {
          drawSVG: "0%",
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        });
      }
      if (timelineRef.current) {
        const cards = timelineRef.current.querySelectorAll("[data-exp-card]");
        gsap.set(cards, { opacity: 0, x: isDesktop ? -40 : 0, y: isDesktop ? 0 : 40 });
        ScrollTrigger.batch(cards, {
          interval: 0.15,
          batchMax: 2,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, x: 0, y: 0,
              stagger: 0.18, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
        const dots = timelineRef.current.querySelectorAll("[data-dot]");
        gsap.set(dots, { scale: 0, opacity: 0 });
        ScrollTrigger.batch(dots, {
          interval: 0.1,
          onEnter: (batch) =>
            gsap.to(batch, {
              scale: 1, opacity: 1,
              stagger: 0.12, duration: 0.6, ease: "back.out(2.5)", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
    });
    return () => ctx.revert();
  }, [reducedMotion, isDesktop]);

  const lineHeight = experiences.length * 160;

  return (
    <div className="jelly-section-bg relative">
      {/* Section header — authored asymmetry */}
      <div className="mb-14 lg:mb-20">
        <ScrollReveal mode="up" distance={30} duration={0.7}>
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-5 ${
            jellyMode ? "jelly-section-label text-primary/60" : "text-muted-foreground/60"
          }`}>
            <span className="inline-block w-6 h-px bg-current mr-3 align-middle" />
            Experience
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Professional journey
          </h2>
        </TextReveal>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative">
        <svg
          className="absolute left-[14px] top-0 bottom-0 w-[2px] hidden sm:block"
          style={{ height: "100%", overflow: "visible" }}
          viewBox={`0 0 2 ${lineHeight}`}
          preserveAspectRatio="none"
        >
          <path
            ref={svgLineRef}
            d={`M1,0 L1,${lineHeight}`}
            stroke="var(--primary)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>

        <div className="flex flex-col gap-4 sm:gap-5">
          {experiences.map((exp, i) => (
            <div key={i} className="relative sm:pl-12">
              {/* Timeline dot */}
              <div
                data-dot
                className={`absolute left-0 top-7 rounded-full hidden sm:flex items-center justify-center w-[30px] h-[30px] ${
                  jellyMode
                    ? exp.current
                      ? "jelly-dot jelly-dot-teal"
                      : "jelly-dot jelly-dot-amber"
                    : exp.current
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-background border-2 border-border"
                }`}
                style={
                  !jellyMode && exp.current
                    ? { boxShadow: "0 0 12px oklch(from var(--primary) l c h / 25%)" }
                    : undefined
                }
              >
                <div
                  className={`rounded-full ${
                    exp.current ? "w-2.5 h-2.5 bg-primary" : "w-2 h-2 bg-muted-foreground/30"
                  }`}
                  style={jellyMode ? { background: exp.current ? "oklch(1 0 0 / 80%)" : "oklch(1 0 0 / 40%)" } : undefined}
                />
              </div>

              {/* Card — varied border-radius for authored feel */}
              <div
                data-exp-card
                className={`group transition-all duration-400 ${
                  jellyMode
                    ? `jelly-card p-6 sm:p-7 ${exp.current ? "border-l-2" : ""}`
                    : `bg-card/40 backdrop-blur-sm border border-border/40 p-6 sm:p-7 hover:bg-card/70 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 ${
                        exp.current ? "border-l-2 border-l-primary" : ""
                      }`
                }`}
                style={{
                  borderRadius: i === 0 ? "1.25rem 1rem 1rem 0.5rem" : i === experiences.length - 1 ? "0.5rem 1rem 1.25rem 1rem" : "0.75rem",
                  ...(jellyMode && exp.current ? { borderLeftColor: "var(--jelly-teal)" } : {}),
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">{exp.role}</h3>
                    <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1.5">
                      <Briefcase size={11} />
                      {exp.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                    <span className="font-mono tracking-tight">{exp.period}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                      <MapPin size={10} />
                      {exp.location}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-[0.8rem] text-muted-foreground leading-relaxed flex gap-2.5">
                      <span className="text-primary/30 mt-0.5 shrink-0 text-[8px]">●</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
