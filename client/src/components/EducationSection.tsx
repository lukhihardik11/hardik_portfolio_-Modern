/**
 * EducationSection — Premium GSAP-powered education display.
 * Uses JellyMaterialCard for GPU-rendered jelly material on all cards.
 */
import { useRef, useEffect } from "react";
import { GraduationCap, Award, Briefcase, MapPin } from "lucide-react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { JellyMaterialCard } from "@/components/JellyMaterialCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const education = [
  { degree: "M.S. Information Technology", school: "University of the Cumberlands", location: "Williamsburg, KY", year: "2023", gpa: "4.0 / 4.0", highlight: "Perfect GPA", hue: 200 },
  { degree: "M.S. Mechanical Engineering", school: "Texas A&M University — Kingsville", location: "Kingsville, TX", year: "2019", gpa: "3.61 / 4.0", highlight: null, hue: 65 },
  { degree: "B.E. Mechanical Engineering", school: "Gujarat Technological University", location: "Ahmedabad, India", year: "2016", gpa: "3.68 / 4.0", highlight: null, hue: 160 },
];

const internships = [
  {
    role: "Graduate Intern — Manufacturing Engineer",
    company: "Precision Technology Inc.",
    location: "Plano, TX",
    period: "May 2018 — Aug 2018",
    hue: 230,
    highlights: [
      "Supported PCBA manufacturing process design and development, contributing to production efficiency improvements",
      "Assisted in implementing new manufacturing techniques to enhance production workflow",
    ],
  },
  {
    role: "Undergraduate Intern — Mechanical Engineer",
    company: "Goyani Machines Private Limited",
    location: "Vadodara, India",
    period: "Apr 2015 — Jun 2015",
    hue: 340,
    highlights: [
      "Assisted in mechanical design, prototyping, and design validation activities",
      "Gained hands-on experience in engineering processes and manufacturing operations",
    ],
  },
];

export function EducationSection() {
  const degreeGridRef = useRef<HTMLDivElement>(null);
  const internGridRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (degreeGridRef.current) {
        const cards = degreeGridRef.current.querySelectorAll("[data-reveal]");
        gsap.set(cards, { opacity: 0, y: 45, scale: 0.96 });
        ScrollTrigger.batch(cards, {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, y: 0, scale: 1,
              stagger: 0.15, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
      if (internGridRef.current) {
        const cards = internGridRef.current.querySelectorAll("[data-reveal]");
        gsap.set(cards, { opacity: 0, y: 40 });
        ScrollTrigger.batch(cards, {
          interval: 0.1,
          batchMax: 2,
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
  }, [reducedMotion]);

  const degreeRadii = [
    "1.5rem 1rem 0.75rem 1rem",
    "1rem 1.25rem 1rem 0.75rem",
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
            Education
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Academic foundation
          </h2>
        </TextReveal>
      </div>

      {/* Degrees */}
      <div ref={degreeGridRef} className="grid sm:grid-cols-3 gap-4 sm:gap-5 mb-20 sm:mb-28">
        {education.map((edu, i) => (
          <JellyMaterialCard
            key={edu.degree}
            hue={edu.hue}
            intensity={0.65}
            borderRadius={degreeRadii[i]}
            className="group h-full transition-all duration-400"
            style={{ borderTop: "2px solid var(--primary)" }}
          >
            <div data-reveal className="p-7">
              <div className={`w-11 h-11 mb-5 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                jellyMode
                  ? "bg-white/10 text-white/80"
                  : "bg-primary/6 text-primary group-hover:bg-primary/10"
              }`}>
                <GraduationCap size={19} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5 tracking-[-0.01em]">{edu.degree}</h3>
              <p className="text-xs text-primary font-medium mb-3">{edu.school}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {edu.location}
                </span>
                <span className="font-mono">{edu.year}</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="text-xs font-medium text-foreground/75">{edu.gpa}</span>
                {edu.highlight && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Award size={10} />
                    {edu.highlight}
                  </span>
                )}
              </div>
            </div>
          </JellyMaterialCard>
        ))}
      </div>

      {/* Internships */}
      <ScrollReveal mode="up" distance={25} className="mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2.5 tracking-[-0.01em]">
          <Briefcase size={16} className="text-primary" />
          Internships
        </h3>
      </ScrollReveal>

      <div ref={internGridRef} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {internships.map((intern, i) => (
          <JellyMaterialCard
            key={intern.role}
            hue={intern.hue}
            intensity={0.55}
            borderRadius={i === 0 ? "1rem 0.75rem 0.75rem 1.25rem" : "0.75rem 1rem 1.25rem 0.75rem"}
            className="group transition-all duration-400"
          >
            <div data-reveal className="p-6">
              <h4 className="text-sm font-semibold text-foreground mb-1.5 tracking-[-0.01em]">{intern.role}</h4>
              <p className="text-xs text-primary font-medium mb-1">{intern.company}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
                <span className="font-mono tracking-tight">{intern.period}</span>
                <span className="flex items-center gap-1 text-muted-foreground/60">
                  <MapPin size={10} />
                  {intern.location}
                </span>
              </div>
              <ul className="space-y-2.5">
                {intern.highlights.map((h, j) => (
                  <li key={j} className="text-[0.8rem] text-muted-foreground leading-relaxed flex gap-2.5">
                    <span className="text-primary/30 mt-0.5 shrink-0 text-[8px]">●</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </JellyMaterialCard>
        ))}
      </div>
    </div>
  );
}
