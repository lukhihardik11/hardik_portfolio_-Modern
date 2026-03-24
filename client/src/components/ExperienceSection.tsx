/**
 * ExperienceSection — Timeline layout with jelly-card on timeline cards.
 * GSAP: staggered card reveal on scroll.
 */
import { MapPin } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const experiences = [
  {
    role: "Project Manager \u2014 Hardware Sustainment",
    company: "Meta Platforms",
    location: "Redmond, WA",
    period: "Oct 2024 \u2014 Present",
    current: true,
    highlights: [
      "Leading end-to-end project delivery for EMG wearable sustainment program across prototyping, test development, failure analysis, and CM transfer",
      "Managing cross-functional teams spanning mechanical, electrical, firmware, and quality engineering",
      "Driving sprint planning, JIRA workflow automation, and program metrics dashboards",
    ],
  },
  {
    role: "Senior Mechanical Engineer \u2014 Hardware Sustainment",
    company: "Meta Platforms",
    location: "Redmond, WA",
    period: "Jun 2022 \u2014 Oct 2024",
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
    period: "Jul 2021 \u2014 Jun 2022",
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
    period: "Feb 2020 \u2014 Jul 2021",
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
    period: "Jun 2019 \u2014 Feb 2020",
    current: false,
    highlights: [
      "Managed quality engineering activities for blood component technology manufacturing",
      "Performed process capability studies (Cpk) and first article inspections (FAI)",
      "Supported cGMP compliance and internal/external audit readiness",
    ],
  },
];

export function ExperienceSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>({ stagger: 0.12 });

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="mb-14" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Experience</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-xl">Professional journey</h2>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border hidden sm:block" />

        <div className="flex flex-col gap-3 sm:gap-4">
          {experiences.map((exp, i) => (
            <div key={i} className="relative sm:pl-10" data-reveal>
              {/* Timeline dot */}
              <div
                className={`absolute left-1.5 top-7 rounded-full border-2 hidden sm:block ${
                  exp.current
                    ? "w-3.5 h-3.5 bg-primary border-primary shadow-sm"
                    : "w-3 h-3 bg-background border-border"
                }`}
                style={exp.current ? { left: "0.3125rem", boxShadow: "0 0 6px oklch(from var(--primary) l c h / 30%)" } : undefined}
              />

              <div className={`jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 card-polished ${exp.current ? "card-current" : ""}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4 relative z-[2]">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{exp.role}</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                    <span className="font-mono">{exp.period}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} />
                      {exp.location}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 relative z-[2]">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary/40 mt-1 shrink-0">&bull;</span>
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
