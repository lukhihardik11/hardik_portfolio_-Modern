/*
 * Projects Section — Card grid with hover effects
 * Design: Kinetic Restraint — staggered grid, jelly hover
 * Animation: GSAP ScrollTrigger batch reveals
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { ExternalLink, Award, TrendingUp, Wrench, Cpu, Shield, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const PROJECTS_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/projects-bg-oWzVJXeMU6ceusVuTWVfNu.webp';

interface Project {
  title: string;
  category: string;
  description: string;
  impact: string;
  tags: string[];
  icon: React.ReactNode;
}

const projects: Project[] = [
  {
    title: 'EMG Wearable Sustainment Pipeline',
    category: 'Hardware Program',
    description: 'End-to-end sustainment program for next-gen EMG wearable devices at Meta. Owned full lifecycle from failure investigation through CT scanning, fixture design, factory test automation, and CM transfer.',
    impact: '1,900+ units fleet-wide fix deployed',
    tags: ['SolidWorks', 'Python', 'CT Scanning', 'DfX'],
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    title: 'Factory Test Automation System',
    category: 'Test Engineering',
    description: 'Designed and automated factory test procedures using Python scripting, dramatically reducing manual intervention and cycle times across multiple test stations.',
    impact: '33% cycle time reduction',
    tags: ['Python', 'Automation', 'Test Fixtures', 'SPC'],
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    title: 'Custom Test Fixture Design',
    category: 'Mechanical Design',
    description: 'Designed 20+ custom test fixtures for wearable device testing, increasing throughput and enabling consistent, repeatable measurements across production lines.',
    impact: '40% throughput increase',
    tags: ['SolidWorks', 'FEA', '3D Printing', 'GD&T'],
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    title: 'CT Scanning Capability Establishment',
    category: 'Failure Analysis',
    description: 'Established CT scanning capability using Nikon XT H 225 for non-destructive inspection, enabling accelerated root cause investigations on complex wearable assemblies.',
    impact: 'Accelerated RCA timelines',
    tags: ['Nikon XT H 225', 'NDT', 'Root Cause Analysis'],
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: 'COVID-19 Rapid Test Manufacturing',
    category: 'Quality Engineering',
    description: 'Supported high-volume manufacturing operations for COVID-19 rapid test kits at Abbott. Performed FMEA on assembly processes and supported FDA audit readiness.',
    impact: 'Reduced defect rates via FMEA',
    tags: ['FMEA', 'FDA', 'ISO 13485', 'SPC'],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: 'EU MDR Compliance Program',
    category: 'Regulatory',
    description: 'Led EU MDR readiness initiatives for vascular closure devices at Terumo. Created Master Validation Plans per FDA 21 CFR Part 820 and managed end-to-end complaint resolution.',
    impact: 'Full regulatory compliance achieved',
    tags: ['EU MDR', 'FDA 21 CFR 820', 'CAPA', 'Validation'],
    icon: <Award className="w-5 h-5" />,
  },
];

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.proj-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.proj-heading', start: 'top 85%' },
      });

      ScrollTrigger.batch('.proj-card', {
        onEnter: (batch) => {
          gsap.from(batch, {
            opacity: 0,
            y: 50,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        start: 'top 88%',
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-5">
        <img
          src={PROJECTS_BG}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="container relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Projects
          </span>
        </div>

        <h2 className="proj-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
          Key Projects & Impact
        </h2>
        <p className="text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Selected projects demonstrating end-to-end ownership across hardware engineering,
          test automation, and quality systems.
        </p>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className={cn(
                'proj-card group relative p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm',
                'transition-all duration-300',
                jellyMode
                  ? 'hover:scale-[1.02] hover:shadow-xl hover:border-primary/30'
                  : 'hover:shadow-lg hover:border-primary/20'
              )}
            >
              {/* Icon + category */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {project.icon}
                </div>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {project.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-semibold text-lg text-foreground mb-2 leading-snug">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {project.description}
              </p>

              {/* Impact metric */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono font-medium text-primary">
                  {project.impact}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-muted text-muted-foreground"
                  >
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
