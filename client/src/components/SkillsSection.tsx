/*
 * Skills Section — Categorized grid with animated counters
 * Design: Kinetic Restraint — geometric clarity, functional layout
 * Animation: GSAP batch reveals with wave stagger
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface SkillCategory {
  title: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Mechanical Engineering',
    skills: [
      'SolidWorks (CSWA)',
      'FEA / Stress Analysis',
      'GD&T (ASME Y14.5)',
      'Tolerance Stack-Up',
      'DfM / DfA / DfX',
      '3D Printing / Rapid Prototyping',
      'Injection Molding',
      'Sheet Metal Design',
    ],
  },
  {
    title: 'Test & Automation',
    skills: [
      'Python Scripting',
      'Factory Test Automation',
      'CT Scanning (Nikon XT H 225)',
      'SPC / Process Capability',
      'Custom Fixture Design',
      'Test Station Development',
      'Data Analysis',
      'Root Cause Analysis',
    ],
  },
  {
    title: 'Quality & Regulatory',
    skills: [
      'FDA 21 CFR Part 820',
      'ISO 13485',
      'ISO 9001',
      'EU MDR',
      'FMEA (Design & Process)',
      'CAPA Management',
      'Risk Management (ISO 14971)',
      'Validation (IQ/OQ/PQ)',
    ],
  },
  {
    title: 'Project Management',
    skills: [
      'Agile / Scrum',
      'Sprint Planning',
      'Cross-Functional Leadership',
      'Stakeholder Management',
      'JIRA / Confluence',
      'Program Roadmapping',
      'Vendor Management',
      'CM Transfer',
    ],
  },
  {
    title: 'Software & Tools',
    skills: [
      'Python',
      'MATLAB',
      'Minitab',
      'SAP',
      'Arena PLM',
      'Microsoft Office Suite',
      'SQL (Basic)',
      'Power BI',
    ],
  },
  {
    title: 'Soft Skills',
    skills: [
      'Technical Communication',
      'Team Leadership',
      'Problem Solving',
      'Mentoring',
      'Presentation Skills',
      'Cross-Cultural Collaboration',
    ],
  },
];

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.skills-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.skills-heading', start: 'top 85%' },
      });

      ScrollTrigger.batch('.skill-category', {
        onEnter: (batch) => {
          gsap.from(batch, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        start: 'top 90%',
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="section-padding relative">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Skills
          </span>
        </div>

        <h2 className="skills-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
          Technical Expertise
        </h2>
        <p className="text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          A comprehensive toolkit spanning mechanical design, test engineering, quality systems,
          and project leadership.
        </p>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className={cn(
                'skill-category p-6 rounded-xl border border-border bg-card/50',
                'transition-all duration-300',
                jellyMode
                  ? 'hover:scale-[1.01] hover:border-primary/20'
                  : 'hover:border-primary/15'
              )}
            >
              <h3 className="font-display font-semibold text-base text-foreground mb-4 pb-3 border-b border-border/50">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md',
                      'bg-muted/80 text-foreground/70',
                      'transition-all duration-200',
                      'hover:bg-primary/10 hover:text-primary'
                    )}
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
