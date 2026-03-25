/**
 * SkillsSection — Premium GSAP-powered skills display.
 * Uses JellyMaterialCard for GPU-rendered jelly material on all cards.
 */
import { useRef, useEffect } from "react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { JellyMaterialCard } from "@/components/JellyMaterialCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const skillCategories = [
  {
    category: "Engineering & Design",
    number: "01",
    hue: 200,
    skills: [
      { name: "Product Design & DfX", level: 95 },
      { name: "SolidWorks / NX CAD", level: 92 },
      { name: "GD&T", level: 90 },
      { name: "FEA (Abaqus)", level: 88 },
      { name: "Fixture Design", level: 94 },
      { name: "CT Scanning (Nikon XT H 225)", level: 88 },
      { name: "3D Printing & Prototyping", level: 90 },
    ],
  },
  {
    category: "Quality & Compliance",
    number: "02",
    hue: 65,
    skills: [
      { name: "Failure Analysis / Root Cause", level: 96 },
      { name: "Six Sigma / DOE", level: 88 },
      { name: "FMEA / CAPA", level: 92 },
      { name: "ISO 13485 / FDA QMS", level: 90 },
      { name: "SPC (Cpk, FAI)", level: 87 },
      { name: "EU MDR / cGMP", level: 85 },
    ],
  },
  {
    category: "Manufacturing & Test",
    number: "03",
    hue: 160,
    skills: [
      { name: "NPI (EVT → PVT)", level: 93 },
      { name: "Test Automation", level: 90 },
      { name: "PCB Design", level: 85 },
      { name: "CM Transfer & BOM Mgmt", level: 88 },
      { name: "DAQ Systems & EMG Sensors", level: 91 },
      { name: "Factory Test Development", level: 90 },
    ],
  },
  {
    category: "Software & Project Mgmt",
    number: "04",
    hue: 280,
    skills: [
      { name: "Python Scripting", level: 88 },
      { name: "Minitab / MATLAB", level: 85 },
      { name: "JIRA / Confluence", level: 92 },
      { name: "Agile / Scrum", level: 90 },
      { name: "Sprint Planning & Metrics", level: 88 },
      { name: "Workflow Automation / Dashboards", level: 86 },
      { name: "AWS", level: 82 },
    ],
  },
];

export function SkillsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { reducedMotion, isDesktop } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (!gridRef.current) return;

      const cards = gridRef.current.querySelectorAll("[data-skill-card]");
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.96 });
      ScrollTrigger.batch(cards, {
        interval: 0.1,
        batchMax: 2,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0, scale: 1,
            stagger: { each: 0.15, from: "start" },
            duration: 1, ease: "expo.out", overwrite: true,
          }),
        once: true,
        start: "20px bottom",
      });

      const bars = gridRef.current.querySelectorAll("[data-skill-bar]");
      bars.forEach((bar) => {
        const targetWidth = (bar as HTMLElement).dataset.skillBar || "0";
        gsap.set(bar, { width: "0%" });
        gsap.to(bar, {
          width: `${targetWidth}%`,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: bar, start: "top 90%", once: true },
        });
      });

      const counters = gridRef.current.querySelectorAll("[data-skill-counter]");
      counters.forEach((counter) => {
        const target = parseInt((counter as HTMLElement).dataset.skillCounter || "0", 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          snap: { val: 1 },
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: counter, start: "top 90%", once: true },
          onUpdate: () => {
            (counter as HTMLElement).textContent = `${Math.round(obj.val)}%`;
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reducedMotion, isDesktop]);

  const cardRadii = [
    "1.25rem 0.75rem 0.75rem 1rem",
    "0.75rem 1.25rem 1rem 0.75rem",
    "1rem 0.75rem 1.25rem 0.75rem",
    "0.75rem 1rem 0.75rem 1.25rem",
  ];

  return (
    <div className="jelly-section-bg relative">
      <div className="mb-14 lg:mb-20">
        <ScrollReveal mode="up" distance={30} duration={0.7}>
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-5 ${
            jellyMode ? "jelly-section-label text-primary/60" : "text-muted-foreground/60"
          }`}>
            <span className="inline-block w-6 h-px bg-current mr-3 align-middle" />
            Skills
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Technical proficiency
          </h2>
        </TextReveal>
      </div>

      <div ref={gridRef} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {skillCategories.map((cat, i) => (
          <JellyMaterialCard
            key={cat.number}
            hue={cat.hue}
            intensity={0.65}
            borderRadius={cardRadii[i % cardRadii.length]}
            className="group transition-all duration-400"
          >
            <div data-skill-card className="p-7">
              {/* Category header */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`w-10 h-10 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 rounded-xl ${
                  jellyMode
                    ? "bg-white/10 text-white/80"
                    : "bg-primary/6 text-primary group-hover:bg-primary/10"
                } transition-colors duration-300`}>
                  {cat.number}
                </span>
                <h3 className="text-sm font-semibold text-foreground tracking-[-0.01em]">{cat.category}</h3>
              </div>

              {/* Skill bars */}
              <div className="space-y-3.5">
                {cat.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-foreground/75">{skill.name}</span>
                      <span
                        className="text-[10px] font-mono text-muted-foreground/40 tabular-nums"
                        data-skill-counter={skill.level}
                      >
                        {reducedMotion ? `${skill.level}%` : "0%"}
                      </span>
                    </div>
                    <div className={`h-[5px] rounded-full overflow-hidden ${
                      jellyMode ? "bg-foreground/5" : "bg-muted/50"
                    }`}>
                      <div
                        className={`h-full rounded-full ${jellyMode ? "jelly-skill-bar" : ""}`}
                        data-skill-bar={skill.level}
                        style={{
                          background: jellyMode
                            ? undefined
                            : `linear-gradient(90deg, oklch(from var(--primary) l c h / 40%) 0%, oklch(from var(--primary) l c h / 75%) 100%)`,
                          width: reducedMotion ? `${skill.level}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </JellyMaterialCard>
        ))}
      </div>
    </div>
  );
}
