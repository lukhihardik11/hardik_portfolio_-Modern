/*
 * HERO — Full-viewport immersive hero with Spline 3D robot
 * Design: Kinetic Restraint — Bauhaus meets motion design
 * Performance: Spline lazy-loaded, only on desktop (≥768px), with timeout fallback
 * Mobile: Clean fallback visual, no WebGL overhead
 * The hero is BIG — full viewport height, Spline takes up significant real estate
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { ArrowDown, Linkedin, Mail, Briefcase } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/hero-bg-WcGmuygzNkPyebfdwUSjhT.webp';

/* Fallback visual for mobile / WebGL failure */
function HeroFallbackVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute w-80 h-80 md:w-[500px] md:h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.50 0.14 180 / 25%) 0%, oklch(0.45 0.10 200 / 10%) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 5s ease-in-out infinite',
        }}
      />
      <div
        className="w-40 h-40 md:w-56 md:h-56 rounded-full border border-primary/20"
        style={{
          background: 'radial-gradient(circle at 40% 35%, oklch(0.55 0.14 180 / 20%) 0%, transparent 60%)',
          animation: 'pulse 3s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { jellyMode } = useJellyMode();
  const [isDesktop, setIsDesktop] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);

  // Detect desktop for Spline gating
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Spline timeout fallback — 15s for larger scene
  useEffect(() => {
    if (!isDesktop) return;
    const timeout = setTimeout(() => {
      if (!splineLoaded) setSplineFailed(true);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [isDesktop, splineLoaded]);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      if (badgesRef.current) {
        tl.from(badgesRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }

      if (titleRef.current) {
        tl.from(titleRef.current.querySelectorAll('.hero-title-line'), {
          opacity: 0,
          y: 60,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }, '-=0.2');
      }

      if (subtitleRef.current) {
        tl.from(subtitleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.4');
      }

      if (ctaRef.current) {
        tl.from(ctaRef.current.children, {
          opacity: 0,
          y: 20,
          scale: 0.95,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        }, '-=0.3');
      }

      if (statsRef.current) {
        tl.from(statsRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        }, '-=0.2');
      }

      // Parallax on scroll — subtle
      if (sectionRef.current) {
        gsap.to('.hero-content', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSplineLoad = useCallback(() => {
    setSplineLoaded(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background image — very subtle */}
      <div className="absolute inset-0 opacity-20">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.50 0.14 180 / 35%)"
      />

      {/* Main content — full viewport flex layout */}
      <div className="container relative z-10 min-h-screen flex flex-col justify-center">
        <div className="hero-content flex flex-col md:flex-row items-center gap-4 md:gap-0 pt-20 md:pt-0">
          
          {/* Left: Text content — 50% on desktop */}
          <div className="w-full md:w-1/2 py-8 md:py-0 md:pr-8">
            {/* Role badges */}
            <div ref={badgesRef} className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                <Briefcase className="w-3 h-3" />
                Project Manager
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                Senior Mechanical Engineer
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                Hardware Sustainment
              </span>
            </div>

            {/* Title — BIG */}
            <h1
              ref={titleRef}
              className="font-display font-bold tracking-tight leading-[1.05] mb-8"
            >
              <span className="hero-title-line block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground">
                Hardik
              </span>
              <span className="hero-title-line block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gradient">
                Lukhi
              </span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-10"
            >
              Hardware Engineer and Project Manager who owns Meta's end-to-end EMG
              wearable sustainment pipeline. Eight years spanning six product generations
              across consumer electronics and regulated medical devices.
            </p>

            {/* CTA buttons */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-3 mb-12">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-medium text-sm',
                  'bg-primary text-primary-foreground shadow-lg shadow-primary/20',
                  'transition-all duration-300',
                  jellyMode
                    ? 'hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/30'
                    : 'hover:opacity-90 hover:shadow-xl hover:shadow-primary/25'
                )}
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
              <a
                href="https://linkedin.com/in/hardiklukhi"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-medium text-sm',
                  'border border-border text-foreground bg-card/50 backdrop-blur-sm',
                  'transition-all duration-300',
                  jellyMode
                    ? 'hover:scale-105 active:scale-95'
                    : 'hover:bg-accent hover:border-primary/20'
                )}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>

            {/* Quick stats row */}
            <div ref={statsRef} className="flex flex-wrap gap-8 pt-8 border-t border-border/40">
              {[
                { value: '8+', label: 'Years Experience' },
                { value: '6', label: 'Product Generations' },
                { value: '1,900+', label: 'Units Fleet-Wide Fix' },
                { value: '4.0', label: 'GPA (M.S. IT)' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display font-bold text-2xl md:text-3xl text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Spline 3D scene — 50% on desktop, BIG */}
          <div className="w-full md:w-1/2 relative h-[350px] sm:h-[400px] md:h-[650px] lg:h-[750px]">
            {isDesktop && !splineFailed ? (
              <div className="w-full h-full" onLoad={handleSplineLoad}>
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <HeroFallbackVisual />
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group"
          aria-label="Scroll down"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            Scroll
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
