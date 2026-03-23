/*
 * Contact Section — Clean CTA with social links
 * Design: Kinetic Restraint — bold teal circle accent
 * Animation: GSAP scroll reveals
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { Mail, Linkedin, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const CONTACT_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/contact-bg-VvCHFDHLdj8w7ioiGv2Tpy.webp';

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-heading', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-heading', start: 'top 85%' },
      });

      gsap.from('.contact-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-card', start: 'top 88%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-[0.03]">
        <img src={CONTACT_BG} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="container relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-widest">
            Contact
          </span>
        </div>

        <h2 className="contact-heading font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
          Let's Connect
        </h2>
        <p className="text-muted-foreground max-w-xl mb-12 leading-relaxed">
          Open to discussing hardware engineering challenges, project management opportunities,
          or collaboration on innovative product development.
        </p>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="mailto:hardiklukhi@gmail.com"
            className={cn(
              'contact-card group p-6 rounded-xl border border-border bg-card/50',
              'transition-all duration-300',
              jellyMode
                ? 'hover:scale-[1.03] hover:border-primary/30'
                : 'hover:border-primary/20'
            )}
          >
            <Mail className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-display font-semibold text-sm text-foreground mb-1">Email</div>
            <div className="text-xs text-muted-foreground break-all">hardiklukhi@gmail.com</div>
          </a>

          <a
            href="https://linkedin.com/in/hardiklukhi"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'contact-card group p-6 rounded-xl border border-border bg-card/50',
              'transition-all duration-300',
              jellyMode
                ? 'hover:scale-[1.03] hover:border-primary/30'
                : 'hover:border-primary/20'
            )}
          >
            <Linkedin className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-display font-semibold text-sm text-foreground mb-1">LinkedIn</div>
            <div className="text-xs text-muted-foreground">linkedin.com/in/hardiklukhi</div>
          </a>

          <a
            href="tel:+16823651440"
            className={cn(
              'contact-card group p-6 rounded-xl border border-border bg-card/50',
              'transition-all duration-300',
              jellyMode
                ? 'hover:scale-[1.03] hover:border-primary/30'
                : 'hover:border-primary/20'
            )}
          >
            <Phone className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-display font-semibold text-sm text-foreground mb-1">Phone</div>
            <div className="text-xs text-muted-foreground">(682) 365-1440</div>
          </a>

          <div
            className={cn(
              'contact-card p-6 rounded-xl border border-border bg-card/50',
              'transition-all duration-300'
            )}
          >
            <MapPin className="w-6 h-6 text-primary mb-3" />
            <div className="font-display font-semibold text-sm text-foreground mb-1">Location</div>
            <div className="text-xs text-muted-foreground">New York, NY</div>
          </div>
        </div>
      </div>
    </section>
  );
}
