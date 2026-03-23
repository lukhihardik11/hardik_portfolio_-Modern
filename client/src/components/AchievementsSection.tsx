/*
 * Achievements Section — Horizontal metric cards
 * Design: Kinetic Restraint — animated counters, geometric cards
 * Animation: GSAP counter animation on scroll
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { cn } from '@/lib/utils';
import { Target, Zap, Layers, Award, TrendingUp, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Achievement {
  icon: React.ReactNode;
  metric: string;
  label: string;
  description: string;
}

const achievements: Achievement[] = [
  {
    icon: <Target className="w-6 h-6" />,
    metric: '1,900+',
    label: 'Units Fixed',
    description: 'Fleet-wide preventive solution deployed across deployed EMG wearable devices',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    metric: '40%',
    label: 'Throughput Increase',
    description: '20+ custom test fixtures designed, dramatically improving test station efficiency',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    metric: '33%',
    label: 'Cycle Time Reduction',
    description: 'Factory test procedures automated using Python scripting',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    metric: '6',
    label: 'Product Generations',
    description: 'Experience spanning six generations of consumer electronics and medical devices',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    metric: '200+',
    label: 'CM Device Builds',
    description: 'Supported contract manufacturer builds with test station development',
  },
  {
    icon: <Award className="w-6 h-6" />,
    metric: '4.0',
    label: 'GPA (M.S. IT)',
    description: 'Perfect academic record at Arizona State University',
  },
];

export function AchievementsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ach-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ach-heading', start: 'top 85%' },
      });

      ScrollTrigger.batch('.ach-card', {
        onEnter: (batch) => {
          gsap.from(batch, {
            opacity: 0,
            y: 40,
            scale: 0.97,
            duration: 0.6,
            stagger: 0.08,
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
    <section ref={sectionRef} className="section-padding relative bg-card/30">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Impact
          </span>
        </div>

        <h2 className="ach-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-12">
          Key Achievements
        </h2>

        {/* Achievement grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((ach) => (
            <div
              key={ach.label}
              className={cn(
                'ach-card group p-6 rounded-xl border border-border bg-background/60 backdrop-blur-sm',
                'transition-all duration-300',
                jellyMode
                  ? 'hover:scale-[1.03] hover:border-primary/30 hover:shadow-lg'
                  : 'hover:border-primary/20 hover:shadow-md'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                  {ach.icon}
                </div>
                <div>
                  <div className="font-display font-bold text-3xl text-foreground leading-none mb-1">
                    {ach.metric}
                  </div>
                  <div className="text-xs font-mono font-medium text-primary uppercase tracking-wider mb-2">
                    {ach.label}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
