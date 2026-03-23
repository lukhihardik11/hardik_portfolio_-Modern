import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useJellyMode } from "@/contexts/JellyModeContext";

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    company: "Meta Platforms",
    location: "New York, NY",
    via: "via Cognizant, Royal Monarch Solutions, Resource Logistics Inc.",
    roles: [
      {
        title: "Project Manager & Senior Mechanical Engineer",
        period: "Mar 2023 \u2014 Present",
        highlights: [
          "Promoted to lead hardware sustainment program for next-generation wearable devices across full lifecycle",
          "Led critical hardware failure investigation \u2014 identified root cause affecting deployed fleet, deployed preventive solution across 1,900+ units",
          "Established CT scanning capability (Nikon XT H 225) enabling 2D radiography and 3D analysis",
          "Designed 20+ custom test fixtures, increasing test throughput by 40%",
          "Automated factory test procedures using Python scripting, reducing test cycle times by 33%",
          "Directed cross-functional team across mechanical, electrical, and firmware disciplines",
        ],
      },
      {
        title: "Sustaining Mechanical Engineer",
        period: "Nov 2021 \u2014 Feb 2023",
        highlights: [
          "Supported 200+ device CM builds: test station development, fixture design, test scripts",
          "Rapidly prototyped sensor mount for factory test automation \u2014 cutting test time by 33%",
          "Designed mechanical components for EMG wearables using SolidWorks with FEA validation",
        ],
      },
    ],
  },
  {
    company: "Stryker",
    location: "Arlington, TN",
    via: "via White Collar Technologies, Inc.",
    roles: [
      {
        title: "Manufacturing Process Analyst",
        period: "Jun 2021 \u2014 Nov 2021",
        highlights: [
          "Conducted comprehensive gap analysis following corporate acquisition",
          "Supported ISO 9001, ISO 13485, and FDA QMS compliance through process validation",
          "Applied SPC and process capability analysis to assess manufacturing readiness",
        ],
      },
    ],
  },
  {
    company: "Abbott",
    location: "Gurnee, IL",
    via: "via Populus Group",
    roles: [
      {
        title: "Quality Engineer",
        period: "Feb 2021 \u2014 Jun 2021",
        highlights: [
          "Supported high-volume COVID-19 AG rapid test kit manufacturing operations",
          "Performed FMEA on test kit assembly processes, reducing defect rates",
          "Supported FDA and ISO 13485 audit readiness",
        ],
      },
    ],
  },
  {
    company: "Terumo",
    location: "Elkton, MD",
    via: "via Vastek Inc.",
    roles: [
      {
        title: "Complaints Quality Engineer II",
        period: "Jun 2019 \u2014 Feb 2021",
        highlights: [
          "Managed end-to-end customer complaint resolution for vascular closure devices and catheter lines",
          "Supported EU MDR readiness initiatives for European regulatory requirements",
          "Created Master Validation Plans and DHF per FDA 21 CFR Part 820 and ISO 13485",
        ],
      },
    ],
  },
  {
    company: "J Group Robotics",
    location: "Mumbai, India",
    via: null,
    roles: [
      {
        title: "Mechanical Engineer",
        period: "Jun 2015 \u2014 Jul 2017",
        highlights: [
          "Designed mechanical components using 3D printing and rapid prototyping",
          "Conducted FEA to ensure design integrity and optimize performance",
          "Led design reviews and mentored junior engineers",
        ],
      },
    ],
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyOn } = useJellyMode();

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8,
        ease: jellyOn ? "elastic.out(1, 0.6)" : "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [jellyOn]);

  return (
    <section ref={sectionRef} id="experience" className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="container">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">02</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Experience</span>
        </div>

        <div className="space-y-16">
          {experiences.map((exp, i) => (
            <div key={exp.company} data-reveal className="group">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-display text-2xl lg:text-3xl text-foreground">{exp.company}</h3>
                  {exp.via && (
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground mt-1">{exp.via}</p>
                  )}
                </div>
                <span className="font-mono text-xs tracking-wider text-muted-foreground">{exp.location}</span>
              </div>

              <div className="space-y-8 pl-4 lg:pl-8 border-l border-border">
                {exp.roles.map((role) => (
                  <div key={role.title} className="relative">
                    <div className="absolute -left-[calc(1rem+4.5px)] lg:-left-[calc(2rem+4.5px)] top-1.5 w-2 h-2 rounded-full bg-[oklch(0.55_0.08_230)]" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                      <h4 className="text-base lg:text-lg font-medium text-foreground">{role.title}</h4>
                      <span className="font-mono text-xs tracking-wider text-[oklch(0.55_0.08_230)]">{role.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {role.highlights.map((h, j) => (
                        <li key={j} className="text-sm text-muted-foreground leading-relaxed pl-4 relative">
                          <span className="absolute left-0 top-[9px] w-1.5 h-px bg-muted-foreground/40" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {i < experiences.length - 1 && <div className="h-px bg-border mt-12" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
