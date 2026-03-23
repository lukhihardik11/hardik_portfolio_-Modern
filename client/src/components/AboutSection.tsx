/*
 * About Section — Professional positioning
 * Design: Asymmetric layout with image and text
 * Animation: GSAP scroll-triggered reveals
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/about-visual-aGfEDjFtTGX4aJNUwkTiAx.webp';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-heading',
          start: 'top 85%',
        },
      });

      gsap.from('.about-text', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-text',
          start: 'top 85%',
        },
      });

      gsap.from('.about-image', {
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-image',
          start: 'top 85%',
        },
      });

      gsap.from('.about-highlight', {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-highlight',
          start: 'top 85%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-padding relative">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            About
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Image column */}
          <div className="lg:col-span-5">
            <div className="about-image relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={ABOUT_IMAGE}
                alt="Precision engineering surface"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>

          {/* Text column */}
          <div className="lg:col-span-7">
            <h2 className="about-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight mb-6">
              Engineering precision,{' '}
              <span className="text-gradient">delivered at scale</span>
            </h2>

            <div className="space-y-4 mb-8">
              <p className="about-text text-muted-foreground leading-relaxed">
                I'm a Hardware Engineer and Project Manager at Meta, where I own the end-to-end
                EMG wearable sustainment pipeline — from failure investigation and CT scanning
                through fixture design, factory test automation, and CM transfer.
              </p>
              <p className="about-text text-muted-foreground leading-relaxed">
                With eight years spanning six product generations across consumer electronics
                and regulated medical devices (FDA, ISO 13485, EU MDR), I bring dual Master's
                degrees and deep expertise in NPI, DfX, SPC, and cross-functional program leadership.
              </p>
              <p className="about-text text-muted-foreground leading-relaxed">
                My work sits at the intersection of mechanical engineering, quality systems,
                and project execution — turning complex hardware challenges into scalable,
                production-ready solutions.
              </p>
            </div>

            {/* Key highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'End-to-end hardware sustainment',
                'Cross-functional program leadership',
                'Factory test automation (Python)',
                'CT scanning & failure analysis',
                'FDA / ISO 13485 / EU MDR',
                'Agile / Sprint methodology',
              ].map((item) => (
                <div
                  key={item}
                  className="about-highlight flex items-center gap-2 text-sm text-foreground/80"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
