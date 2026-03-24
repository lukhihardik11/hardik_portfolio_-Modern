/**
 * EducationSection — Degree cards and internship cards with jelly-card.
 * GSAP: staggered card reveal on scroll.
 */
import { GraduationCap, Award, Briefcase } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const education = [
  { degree: "M.S. Information Technology", school: "University of the Cumberlands", location: "Williamsburg, KY", year: "2023", gpa: "4.0 / 4.0", highlight: "Perfect GPA" },
  { degree: "M.S. Mechanical Engineering", school: "Texas A&M University \u2014 Kingsville", location: "Kingsville, TX", year: "2019", gpa: "3.61 / 4.0", highlight: null },
  { degree: "B.E. Mechanical Engineering", school: "Gujarat Technological University", location: "Ahmedabad, India", year: "2016", gpa: "3.68 / 4.0", highlight: null },
];

const internships = [
  {
    role: "Graduate Intern \u2014 Manufacturing Engineer",
    company: "Precision Technology Inc.",
    location: "Plano, TX",
    period: "May 2018 \u2014 Aug 2018",
    highlights: [
      "Supported PCBA manufacturing process design and development, contributing to production efficiency improvements",
      "Assisted in implementing new manufacturing techniques to enhance production workflow",
    ],
  },
  {
    role: "Undergraduate Intern \u2014 Mechanical Engineer",
    company: "Goyani Machines Private Limited",
    location: "Vadodara, India",
    period: "Apr 2015 \u2014 Jun 2015",
    highlights: [
      "Assisted in mechanical design, prototyping, and design validation activities",
      "Gained hands-on experience in engineering processes and manufacturing operations",
    ],
  },
];

export function EducationSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1 });

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="mb-14" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Education</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-xl">Academic foundation</h2>
      </div>

      {/* Degrees */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-5 mb-16">
        {education.map((edu) => (
          <div key={edu.degree} data-reveal className="jelly-card card-metric bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 card-polished">
            <div className="w-10 h-10 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative z-[2]">
              <GraduationCap size={18} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1 relative z-[2]">{edu.degree}</h3>
            <p className="text-xs text-primary font-medium mb-3 relative z-[2]">{edu.school}</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground relative z-[2]">
              <span>{edu.location}</span>
              <span className="font-mono">{edu.year}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 relative z-[2]">
              <span className="text-xs font-medium text-foreground/80">{edu.gpa}</span>
              {edu.highlight && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Award size={10} />
                  {edu.highlight}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Internships */}
      <div className="mb-4" data-reveal>
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Briefcase size={16} className="text-primary" />
          Internships
        </h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
        {internships.map((intern) => (
          <div key={intern.role} data-reveal className="jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 card-polished">
            <h4 className="text-sm font-semibold text-foreground mb-1 relative z-[2]">{intern.role}</h4>
            <p className="text-xs text-primary font-medium mb-1 relative z-[2]">{intern.company}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4 relative z-[2]">
              <span className="font-mono">{intern.period}</span>
              <span>{intern.location}</span>
            </div>
            <ul className="space-y-2 relative z-[2]">
              {intern.highlights.map((h, j) => (
                <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-primary/40 mt-1 shrink-0">&bull;</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
