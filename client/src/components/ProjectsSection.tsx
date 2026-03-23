import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "EMG Wearable Sustainment Pipeline",
    company: "Meta Platforms",
    description: "End-to-end hardware sustainment system for next-generation EMG wearable devices. Covers failure investigation, CT scanning, fixture design, factory test automation, and contract manufacturer transfer.",
    tags: ["Hardware", "Test Automation", "Python", "CT Scanning"],
    featured: true,
  },
  {
    title: "Factory Test Automation System",
    company: "Meta Platforms",
    description: "Automated factory test procedures using Python scripting and DAQ hardware APIs for power and signal testing. Reduced test cycle times by 33% across multiple test stations.",
    tags: ["Python", "DAQ", "Automation", "PCB Design"],
    featured: true,
  },
  {
    title: "CT Scanning Lab Capability",
    company: "Meta Platforms",
    description: "Established CT scanning capability at lab facility using Nikon XT H 225, enabling 2D radiography and 3D analysis for accelerated root cause investigations.",
    tags: ["CT Scanning", "Failure Analysis", "3D Analysis"],
    featured: false,
  },
  {
    title: "Cloud MFG Test Data Pipeline",
    company: "Meta Platforms",
    description: "Built cloud-based manufacturing test data pipeline connecting CM workstations to centralized research data platform for real-time quality monitoring.",
    tags: ["Cloud", "AWS", "Data Pipeline", "Manufacturing"],
    featured: false,
  },
  {
    title: "Hardware Verification Stations",
    company: "Meta Platforms",
    description: "Designed and deployed hardware verification stations at multiple sites for decentralized device health checks, enabling distributed quality assurance.",
    tags: ["Hardware Design", "Multi-site", "Quality"],
    featured: false,
  },
  {
    title: "Quality Gap Analysis System",
    company: "Stryker",
    description: "Comprehensive gap analysis framework following corporate acquisition, identifying discrepancies between manufacturing processes and Stryker quality policies.",
    tags: ["ISO 13485", "FDA QMS", "SPC", "Gap Analysis"],
    featured: false,
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll("[data-reveal]");
    els.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="container">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">04</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Projects</span>
        </div>

        <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-12 max-w-2xl">
          Selected work that moved the needle.
        </h2>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {projects.filter(p => p.featured).map((project) => (
            <div
              key={project.title}
              data-reveal
              className="group p-8 lg:p-10 rounded-lg bg-card border border-border hover:border-[oklch(0.55_0.08_230_/_30%)] transition-all duration-300"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-3">
                {project.company}
              </div>
              <h3 className="font-display text-xl lg:text-2xl text-foreground mb-4">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded bg-secondary text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.filter(p => !p.featured).map((project) => (
            <div
              key={project.title}
              data-reveal
              className="group p-6 rounded-lg bg-card border border-border hover:border-[oklch(0.55_0.08_230_/_30%)] transition-all duration-300"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-2">
                {project.company}
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {project.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {tag}
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
