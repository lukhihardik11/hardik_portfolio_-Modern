import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SKILLS_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/skills-texture-ZqzHJgEWmrKmutCrS9bMf6.webp";

const skillCategories = [
  {
    title: "Engineering",
    skills: ["Product Design", "DfX", "GD&T", "FEA", "Prototyping", "3D Printing", "Failure Analysis", "Root Cause Analysis", "Fixture Design", "CT Scanning"],
  },
  {
    title: "Quality & Process",
    skills: ["Six Sigma", "DOE", "FMEA", "CAPA", "Cpk", "FAI", "ISO 13485", "FDA Regulations", "cGMP", "EU MDR", "8D Methodology"],
  },
  {
    title: "Software & Tools",
    skills: ["SolidWorks", "NX", "Abaqus", "Python", "Minitab", "JIRA", "Confluence", "AWS", "DAQ Systems"],
  },
  {
    title: "Manufacturing",
    skills: ["NPI", "Test Automation", "PCB Design", "BOM Management", "CM Transfer", "Factory Test Development"],
  },
  {
    title: "Project Management",
    skills: ["Agile", "Scrum", "Sprint Planning", "Workflow Automation", "Project Dashboards", "Metrics Tracking"],
  },
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${SKILLS_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-background/90" />

      <div className="container relative z-10">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">05</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Skills</span>
        </div>

        <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-12 max-w-2xl">
          Tools of the trade.
        </h2>

        <div className="space-y-10">
          {skillCategories.map((cat) => (
            <div key={cat.title} data-reveal>
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-4">
                {cat.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-xs tracking-wider px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:border-[oklch(0.55_0.08_230_/_40%)] hover:text-[oklch(0.55_0.08_230)] transition-all duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
