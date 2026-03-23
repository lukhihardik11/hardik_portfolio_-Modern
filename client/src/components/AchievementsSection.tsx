import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const achievements = [
  { metric: "1,900+", label: "Units", desc: "Root cause fix deployed fleet-wide" },
  { metric: "400+", label: "Devices", desc: "Failure analysis across product generations at Meta" },
  { metric: "200+", label: "Builds", desc: "CM engineering support" },
  { metric: "40%", label: "Throughput", desc: "Gain from 20+ custom test fixtures" },
  { metric: "33%", label: "Cycle Time", desc: "Reduction via Python test automation" },
  { metric: "25%", label: "Service Life", desc: "Extension through iterative FPC testing" },
  { metric: "9", label: "Test Stations", desc: "Developed for proto program" },
  { metric: "4.0", label: "GPA", desc: "Perfect score — M.S. Information Technology" },
];

export default function AchievementsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll("[data-card]");
    cards.forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 40, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="container">
        <div className="flex items-center gap-4 mb-16">
          <span className="section-number">03</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Impact</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-12 max-w-2xl">
          Numbers that tell the story.
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {achievements.map((a) => (
            <div
              key={a.label}
              data-card
              className="group p-6 lg:p-8 rounded-lg bg-card border border-border hover:border-[oklch(0.55_0.08_230_/_30%)] transition-all duration-300"
            >
              <div className="font-mono text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {a.metric}
              </div>
              <div className="font-mono text-xs tracking-[0.15em] uppercase text-[oklch(0.55_0.08_230)] mb-3">
                {a.label}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
