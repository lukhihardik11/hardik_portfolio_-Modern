/*
 * Education Section — Clean cards with certifications
 * Design: Kinetic Restraint — geometric clarity
 * Animation: GSAP scroll reveals
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { GraduationCap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const education = [
  {
    degree: 'Master of Science in Information Technology',
    school: 'Arizona State University',
    location: 'Tempe, AZ',
    period: '2024 — 2026',
    gpa: '4.0 / 4.0',
    details: 'Focus on project management, IT systems, and data-driven decision making.',
  },
  {
    degree: 'Master of Science in Mechanical Engineering',
    school: 'University of Texas at Arlington',
    location: 'Arlington, TX',
    period: '2017 — 2019',
    gpa: '3.7 / 4.0',
    details: 'Specialization in product design, FEA, and manufacturing processes.',
  },
  {
    degree: 'Bachelor of Engineering in Mechanical Engineering',
    school: 'University of Mumbai',
    location: 'Mumbai, India',
    period: '2011 — 2015',
    gpa: '',
    details: 'Foundation in mechanical design, thermodynamics, and materials science.',
  },
];

const certifications = [
  'Certified SolidWorks Associate (CSWA)',
  'Agile Certified Practitioner (in progress)',
  'Lean Six Sigma Green Belt',
];

export function EducationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.edu-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.edu-heading', start: 'top 85%' },
      });

      gsap.utils.toArray<HTMLElement>('.edu-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
        });
      });

      gsap.from('.cert-item', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cert-item', start: 'top 88%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="education" className="section-padding relative">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Education
          </span>
        </div>

        <h2 className="edu-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-12">
          Academic Background
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className={cn(
                'edu-card p-6 rounded-xl border border-border bg-card/50',
                'transition-all duration-300',
                jellyMode
                  ? 'hover:scale-[1.02] hover:border-primary/20'
                  : 'hover:border-primary/15'
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">{edu.period}</span>
              </div>

              <h3 className="font-display font-semibold text-base text-foreground mb-1 leading-snug">
                {edu.degree}
              </h3>
              <p className="text-sm text-primary font-medium mb-1">{edu.school}</p>
              <p className="text-xs text-muted-foreground mb-3">{edu.location}</p>

              {edu.gpa && (
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-xs font-mono font-medium text-primary mb-3">
                  GPA: {edu.gpa}
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed">{edu.details}</p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="p-6 rounded-xl border border-border bg-card/30">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Certifications
          </h3>
          <div className="flex flex-wrap gap-3">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="cert-item px-4 py-2 rounded-lg text-sm font-medium bg-muted/60 text-foreground/80 border border-border/50"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
