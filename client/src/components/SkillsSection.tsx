/**
 * SkillsSection — CSS progress bars with jelly-card and jelly-skill-bar.
 * GSAP: skill bar fill animation on scroll, staggered card reveal.
 */
import { useScrollReveal } from "@/hooks/useScrollReveal";

const skillCategories = [
  {
    category: "Engineering & Design",
    number: "01",
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
    skills: [
      { name: "NPI (EVT \u2192 PVT)", level: 93 },
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
  const sectionRef = useScrollReveal<HTMLDivElement>({ animateSkillBars: true });

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="mb-14" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Skills</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-xl">Technical proficiency</h2>
      </div>

      {/* Category cards — 2-column grid */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
        {skillCategories.map((cat) => (
          <div key={cat.number} data-reveal className="jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 card-polished">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-5 relative z-[2]">
              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0">
                {cat.number}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{cat.category}</h3>
            </div>

            {/* Skill bars */}
            <div className="space-y-3 relative z-[2]">
              {cat.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-foreground/80">{skill.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground/50">{skill.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full skill-bar-fill jelly-skill-bar"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
