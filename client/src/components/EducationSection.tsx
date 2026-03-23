import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const education = [
  {
    degree: "Master of Science in Information Technology",
    school: "University of the Cumberlands",
    location: "Williamsburg, KY",
    year: "2023",
    gpa: "4.0 / 4.0",
  },
  {
    degree: "Master of Science in Mechanical Engineering",
    school: "Texas A&M University - Kingsville",
    location: "Kingsville, TX",
    year: "2019",
    gpa: "3.61 / 4.0",
  },
  {
    degree: "Bachelor of Engineering in Mechanical Engineering",
    school: "Gujarat Technological University",
    location: "Ahmedabad, India",
    year: "2016",
    gpa: "3.68 / 4.0",
  },
];

export default function EducationSection() {
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
    <section ref={sectionRef} id="education" className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="container">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">06</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Education</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {education.map((edu) => (
            <div
              key={edu.degree}
              data-reveal
              className="group p-8 rounded-lg bg-card border border-border hover:border-[oklch(0.55_0.08_230_/_30%)] transition-all duration-300"
            >
              <GraduationCap size={24} className="text-[oklch(0.55_0.08_230)] mb-4" />
              <h3 className="font-display text-lg lg:text-xl text-foreground mb-2">
                {edu.degree}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">{edu.school}</p>
              <p className="font-mono text-xs tracking-wider text-muted-foreground mb-4">
                {edu.location} | {edu.year}
              </p>
              <div className="pt-4 border-t border-border">
                <span className="font-mono text-xs tracking-[0.15em] uppercase text-[oklch(0.55_0.08_230)]">GPA</span>
                <span className="font-mono text-lg font-semibold text-foreground ml-3">{edu.gpa}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
