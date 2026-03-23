import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/about-portrait-bg-GfVVUwReCHr7y2VG566wDx.webp";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative py-24 lg:py-32">
      <div className="container">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">01</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">About</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-8">
              Building the bridge between engineering precision and program leadership.
            </h2>
            <div data-reveal className="space-y-5 text-muted-foreground leading-relaxed">
              <p>Hardware Engineer and Project Manager who owns Meta’s end-to-end EMG wearable sustainment pipeline — from failure investigation and CT scanning through fixture design, factory test automation, and CM transfer.</p>
              <p>Eight years spanning six product generations across consumer electronics and regulated medical devices (FDA, ISO 13485, EU MDR), with dual Master’s degrees and expertise in NPI, DfX, SPC, and cross-functional program leadership.</p>
              <p>I approach every problem with the same philosophy: understand the root cause before proposing solutions, build systems that scale, and lead teams that deliver on schedule without compromising quality.</p>
            </div>
            <div data-reveal className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-border">
              <div><div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-1">Location</div><div className="text-sm text-foreground font-medium">Ridgefield Park, NJ</div></div>
              <div><div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-1">Current Role</div><div className="text-sm text-foreground font-medium">PM & Sr. Mech. Engineer</div></div>
              <div><div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-1">Company</div><div className="text-sm text-foreground font-medium">Meta Platforms</div></div>
              <div><div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[oklch(0.55_0.08_230)] mb-1">Education</div><div className="text-sm text-foreground font-medium">Dual M.S. Degrees</div></div>
            </div>
          </div>
          <div className="lg:col-span-5 flex items-center">
            <div data-reveal className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
              <img src={ABOUT_BG} alt="Abstract geometric composition" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="font-mono text-5xl font-bold text-white">4.0</div>
                <div className="font-mono text-xs tracking-[0.2em] uppercase text-white/70 mt-1">Perfect GPA — M.S. Information Technology</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
