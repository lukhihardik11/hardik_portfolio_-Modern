/**
 * AboutSection — Metric cards and specialization cards.
 * GSAP: counter animation on metrics, staggered card reveal.
 * Jelly-card classes are inert in standard mode, additive in jelly mode.
 */
import { Cpu, Shield, Factory } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const metrics = [
  { value: "1,900+", label: "Fleet Units Fixed" },
  { value: "400+", label: "Devices Analyzed" },
  { value: "20+", label: "Custom Test Fixtures" },
  { value: "6", label: "Product Generations" },
];

const specializations = [
  {
    title: "Hardware Sustainment & Test",
    desc: "End-to-end project delivery across prototyping, test development, CT scanning, fixture design, factory test automation, and CM transfer for EMG wearables at Meta.",
    Icon: Cpu,
  },
  {
    title: "NPI, DfX & Failure Analysis",
    desc: "New Product Introduction, Design for Manufacturing/Test, and comprehensive failure analysis with root cause investigation across six product generations.",
    Icon: Factory,
  },
  {
    title: "Quality & Regulatory",
    desc: "FDA, ISO 13485, EU MDR, cGMP compliance, Six Sigma, SPC, and 8D methodology across medical device and consumer electronics industries.",
    Icon: Shield,
  },
];

export function AboutSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>({ animateCounters: true });

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="mb-14" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-xl">Engineering with purpose</h2>
        <p className="text-base text-muted-foreground mt-4 max-w-lg leading-relaxed">
          {"Hardware Engineer and Project Manager who owns Meta\u2019s end-to-end EMG wearable sustainment pipeline \u2014 spanning failure investigation, CT scanning, fixture design, factory test automation, and CM transfer across six product generations."}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-20 sm:mb-28">
        {metrics.map((m) => (
          <div key={m.label} data-reveal className="jelly-card card-metric bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 text-center card-polished">
            <p className="text-2xl sm:text-3xl font-bold text-primary relative z-[2]" data-counter={m.value}>{m.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-2 tracking-wide relative z-[2]">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Specializations */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-5">
        {specializations.map((s, i) => (
          <div key={s.title} data-reveal className="jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 h-full card-polished">
            <div className="w-10 h-10 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative z-[2]">
              <s.Icon size={18} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/35 tracking-wider relative z-[2]">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-sm font-semibold text-foreground mt-1.5 mb-2.5 relative z-[2]">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed relative z-[2]">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
