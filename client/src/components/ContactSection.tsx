/**
 * ContactSection + Footer — Premium GSAP-powered contact section.
 * Uses JellyMaterialCard for GPU-rendered jelly material on all cards.
 */
import { useRef, useEffect } from "react";
import { Mail, Linkedin, Phone, ArrowUpRight, ChevronUp } from "lucide-react";
import { TextReveal } from "@/components/animation/TextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { Magnetic } from "@/components/animation/Magnetic";
import { useAnimation } from "@/components/animation/AnimationProvider";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { JellyMaterialCard } from "@/components/JellyMaterialCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const contactLinks = [
  { label: "Email", value: "lukhihardik11@gmail.com", href: "mailto:lukhihardik11@gmail.com", Icon: Mail, hue: 200 },
  { label: "LinkedIn", value: "linkedin.com/in/hardiklukhi", href: "https://linkedin.com/in/hardiklukhi", Icon: Linkedin, hue: 220 },
  { label: "Phone", value: "361-228-5831", href: "tel:+13612285831", Icon: Phone, hue: 160 },
];

export function ContactSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAnimation();
  const { jellyMode } = useJellyMode();

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll("[data-reveal]");
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.96 });
        ScrollTrigger.batch(cards, {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1, y: 0, scale: 1,
              stagger: 0.12, duration: 1, ease: "expo.out", overwrite: true,
            }),
          once: true,
          start: "20px bottom",
        });
      }
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  const cardRadii = [
    "1.25rem 0.75rem 0.75rem 1rem",
    "0.75rem 1rem 1rem 0.75rem",
    "0.75rem 1.25rem 1rem 1.25rem",
  ];

  return (
    <div className="jelly-section-bg relative">
      <div className="mb-14 lg:mb-20">
        <ScrollReveal mode="up" distance={30} duration={0.7}>
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-5 ${
            jellyMode ? "jelly-section-label text-primary/60" : "text-muted-foreground/60"
          }`}>
            <span className="inline-block w-6 h-px bg-current mr-3 align-middle" />
            Contact
          </p>
        </ScrollReveal>
        <TextReveal mode="lines" duration={1} stagger={0.1}>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.5rem] tracking-[-0.03em] leading-[1.05] max-w-2xl ${
            jellyMode ? "jelly-section-title" : "text-foreground"
          }`} style={{ fontStyle: "italic", fontWeight: 400 }}>
            Let's build something extraordinary
          </h2>
        </TextReveal>
        <ScrollReveal mode="up" delay={0.15} distance={20}>
          <p className="text-[0.9rem] text-muted-foreground mt-6 max-w-lg leading-[1.8]">
            Open to discussing hardware engineering roles, project management opportunities,
            and collaborative work in wearable technology and medical devices.
          </p>
        </ScrollReveal>
      </div>

      {/* Primary CTA with Magnetic hover + JellyMaterialCard */}
      <ScrollReveal mode="scale" className="mb-14">
        <Magnetic strength={0.3}>
          <JellyMaterialCard hue={200} intensity={0.8} borderRadius="1rem 0.75rem 1rem 0.75rem" className="inline-block">
            <a
              href="mailto:lukhihardik11@gmail.com"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold no-underline text-foreground transition-all duration-300 active:scale-[0.98]"
            >
              <Mail size={16} />
              Say Hello
              <ArrowUpRight size={14} />
            </a>
          </JellyMaterialCard>
        </Magnetic>
      </ScrollReveal>

      {/* Contact cards */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {contactLinks.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="no-underline block"
            data-reveal
          >
            <JellyMaterialCard
              hue={link.hue}
              intensity={0.6}
              borderRadius={cardRadii[i]}
              className="group h-full transition-all duration-400"
            >
              <div className="p-6 text-center cursor-pointer">
                <div className={`w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                  jellyMode
                    ? "bg-white/10 text-white/80"
                    : "bg-primary/6 text-primary group-hover:bg-primary/10"
                }`}>
                  <link.Icon size={17} strokeWidth={1.5} />
                </div>
                <div className="text-xs font-semibold text-foreground mb-1">{link.label}</div>
                <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-1">
                  {link.value}
                  <ArrowUpRight size={9} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            </JellyMaterialCard>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const { jellyMode } = useJellyMode();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-8 relative">
      <div className={jellyMode ? "jelly-divider mb-8" : "footer-separator mb-8"} />
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground/30">
            &copy; {new Date().getFullYear()} Hardik Lukhi
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/18 tracking-wider">
            Designed &amp; engineered with precision
          </span>
          <div className="flex items-center gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`w-7 h-7 flex items-center justify-center transition-colors duration-200 no-underline ${
                  jellyMode
                    ? "jelly-social-icon text-muted-foreground/40 hover:text-foreground/60"
                    : "text-muted-foreground/25 hover:text-foreground/50"
                }`}
                style={{ borderRadius: "0.5rem" }}
                aria-label={link.label}
              >
                <link.Icon size={13} />
              </a>
            ))}
            <button
              onClick={scrollToTop}
              className={`w-7 h-7 flex items-center justify-center transition-colors duration-200 bg-transparent border-none ml-1 no-jelly ${
                jellyMode
                  ? "jelly-social-icon text-muted-foreground/40 hover:text-foreground/60"
                  : "text-muted-foreground/25 hover:text-foreground/50"
              }`}
              style={{ borderRadius: "0.5rem" }}
              aria-label="Back to top"
            >
              <ChevronUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
