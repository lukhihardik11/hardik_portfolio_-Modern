/*
 * HeroSection — "Quiet Authority"
 * Full-viewport hero with Spline 3D robot on right (desktop only).
 * Asymmetric 65/35 split. GSAP entrance animations.
 * Oversized serif heading + mono metrics.
 */
import { useEffect, useRef, useState } from "react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { ArrowDown, MapPin, Briefcase } from "lucide-react";
import gsap from "gsap";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/hero-abstract-oWLeR28fUuTsedYszV5nng.webp";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { jellyOn } = useJellyMode();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!textRef.current) return;
    const els = textRef.current.querySelectorAll("[data-animate]");
    gsap.set(els, { opacity: 0, y: 30 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: jellyOn ? 1.0 : 0.8,
      ease: jellyOn ? "elastic.out(1, 0.5)" : "power3.out",
      stagger: 0.12,
      delay: 0.3,
    });
  }, [jellyOn]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image — subtle, not dominant */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />

      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.55 0.08 230)"
      />

      <div className="container relative z-10 flex items-center min-h-screen pt-20 pb-16">
        {/* Left content — 65% */}
        <div ref={textRef} className="w-full lg:w-[60%] xl:w-[55%]">
          {/* Mono label */}
          <div data-animate className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[oklch(0.55_0.08_230)]" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)]">
              Engineering Leader
            </span>
          </div>

          {/* Main heading — oversized serif */}
          <h1 data-animate className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.05] tracking-tight mb-6">
            Hardik Lukhi
          </h1>

          {/* Subtitle */}
          <p data-animate className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl mb-8">
            Project Manager & Senior Mechanical Engineer owning Meta's end-to-end EMG wearable sustainment pipeline.
          </p>

          {/* Meta info row */}
          <div data-animate className="flex flex-wrap items-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase size={16} className="text-[oklch(0.55_0.08_230)]" />
              <span className="font-mono text-xs tracking-wider">META PLATFORMS</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} className="text-[oklch(0.55_0.08_230)]" />
              <span className="font-mono text-xs tracking-wider">NEW YORK, NY</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div data-animate className="flex flex-wrap gap-4 mb-12">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.55_0.08_230)] text-white font-body text-sm font-medium rounded-lg hover:bg-[oklch(0.50_0.09_230)] transition-all duration-300"
            >
              Get in Touch
            </a>
            <a
              href="#experience"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-body text-sm font-medium rounded-lg hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300"
            >
              View Experience
            </a>
          </div>

          {/* Metrics row */}
          <div data-animate className="flex flex-wrap gap-8 lg:gap-12">
            {[
              { value: "8+", label: "Years Experience" },
              { value: "6", label: "Product Generations" },
              { value: "1,900+", label: "Units Impacted" },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="font-mono text-2xl lg:text-3xl font-semibold text-foreground">
                  {metric.value}
                </div>
                <div className="font-mono text-xs tracking-wider text-muted-foreground mt-1">
                  {metric.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Spline 3D (desktop only) */}
        {!isMobile && (
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[45%] xl:w-[50%]">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "1.5s" }}>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Scroll
        </span>
        <ArrowDown size={16} className="text-muted-foreground animate-bounce" />
      </div>
    </section>
  );
}
