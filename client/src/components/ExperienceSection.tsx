/*
 * Experience Section — Timeline layout
 * Design: Offset timeline with dates left, content right
 * Animation: GSAP stagger reveals on scroll
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceItem {
  company: string;
  location: string;
  via?: string;
  roles: {
    title: string;
    period: string;
    highlights: string[];
  }[];
}

const experiences: ExperienceItem[] = [
  {
    company: 'Meta Platforms',
    location: 'New York, NY',
    via: 'via Cognizant, Royal Monarch Solutions, Resource Logistics Inc.',
    roles: [
      {
        title: 'Project Manager & Senior Mechanical Engineer',
        period: 'Mar 2023 — Present',
        highlights: [
          'Led hardware sustainment program for next-gen wearable devices across full lifecycle',
          'Identified root cause affecting deployed fleet, deployed preventive solution across 1,900+ units',
          'Established CT scanning capability (Nikon XT H 225) for accelerated root cause investigations',
          'Designed 20+ custom test fixtures, increasing test throughput by 40%',
          'Automated factory test procedures using Python, reducing cycle times by 33%',
          'Directed cross-functional team across mechanical, electrical, and firmware disciplines',
        ],
      },
      {
        title: 'Sustaining Mechanical Engineer',
        period: 'Nov 2021 — Feb 2023',
        highlights: [
          'Supported 200+ device CM builds: test station development and fixture design',
          'Rapidly prototyped sensor mount for factory test automation — cutting test time by 33%',
          'Designed mechanical components for EMG wearables using SolidWorks with FEA validation',
        ],
      },
    ],
  },
  {
    company: 'Stryker',
    location: 'Arlington, TN',
    via: 'via White Collar Technologies, Inc.',
    roles: [
      {
        title: 'Manufacturing Process Analyst',
        period: 'Jun 2021 — Nov 2021',
        highlights: [
          'Conducted gap analysis post-acquisition, identifying manufacturing process discrepancies',
          'Supported ISO 9001, ISO 13485, and FDA QMS compliance through process validation',
          'Applied SPC and process capability analysis for manufacturing readiness assessment',
        ],
      },
    ],
  },
  {
    company: 'Abbott',
    location: 'Gurnee, IL',
    via: 'via Populus Group',
    roles: [
      {
        title: 'Quality Engineer',
        period: 'Feb 2021 — Jun 2021',
        highlights: [
          'Supported high-volume COVID-19 rapid test kit manufacturing operations',
          'Performed FMEA on assembly processes, reducing defect rates',
          'Supported FDA and ISO 13485 audit readiness and regulatory compliance',
        ],
      },
    ],
  },
  {
    company: 'Terumo',
    location: 'Elkton, MD',
    via: 'via Vastek Inc.',
    roles: [
      {
        title: 'Complaints Quality Engineer II',
        period: 'Jun 2019 — Feb 2021',
        highlights: [
          'Managed end-to-end complaint resolution for vascular closure devices and catheters',
          'Led root cause investigations improving product reliability and patient safety',
          'Supported EU MDR readiness and created Master Validation Plans per FDA 21 CFR Part 820',
        ],
      },
    ],
  },
  {
    company: 'J Group Robotics',
    location: 'Mumbai, India',
    roles: [
      {
        title: 'Mechanical Engineer',
        period: 'Jun 2015 — Jul 2017',
        highlights: [
          'Designed mechanical components using 3D printing and rapid prototyping',
          'Conducted FEA to ensure design integrity and optimize performance',
          'Led design reviews and mentored junior engineers',
        ],
      },
    ],
  },
];

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.exp-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.exp-heading', start: 'top 85%' },
      });

      gsap.utils.toArray<HTMLElement>('.exp-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="section-padding relative">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Experience
          </span>
        </div>

        <h2 className="exp-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-12">
          Professional Journey
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-[200px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.company} className="exp-card relative">
                {exp.roles.map((role, roleIdx) => (
                  <div
                    key={role.title}
                    className={cn(
                      'relative pl-8 md:pl-0 md:grid md:grid-cols-[200px_1fr] gap-8',
                      roleIdx > 0 && 'mt-6'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-[200px] top-1 w-2 h-2 rounded-full bg-primary -translate-x-[3.5px]" />

                    {/* Date column */}
                    <div className="hidden md:block text-right pr-8">
                      <span className="text-xs font-mono text-muted-foreground">
                        {role.period}
                      </span>
                      {roleIdx === 0 && (
                        <>
                          <div className="font-display font-semibold text-sm text-foreground mt-1">
                            {exp.company}
                          </div>
                          <div className="text-xs text-muted-foreground">{exp.location}</div>
                          {exp.via && (
                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{exp.via}</div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Content column */}
                    <div className="md:pl-8">
                      {/* Mobile: show company info */}
                      {roleIdx === 0 && (
                        <div className="md:hidden mb-2">
                          <div className="font-display font-semibold text-sm text-foreground">
                            {exp.company}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {exp.location} · {role.period}
                          </div>
                        </div>
                      )}

                      <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                        {role.title}
                      </h3>

                      <ul className="space-y-2">
                        {role.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
