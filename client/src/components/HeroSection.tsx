/**
 * HeroSection — Spline 3D robot as primary visual, text/CTAs as primary communication.
 *
 * Layout:
 *   Desktop ≥1280px: 5-column grid (text 3 cols + Spline 2 cols)
 *   Tablet 768-1279px: stacked, Spline below text
 *   Mobile <768px: text only, no Spline (saves ~5.6MB)
 *
 * Motion: GSAP for text mask reveal + blob parallax. CSS for transitions.
 * Spline gating: useSplineGating controls mount/timeout/fallback.
 * Cross-section: removed from hero per approved plan.
 */
import React, { useRef, useEffect, Suspense, lazy, useCallback, useMemo } from "react";
import { Download, ArrowDown } from "lucide-react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useSplineGating } from "@/hooks/useSplineGating";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Spline = lazy(() => import("@splinetool/react-spline"));

const companies = [
  { name: "Meta", active: true },
  { name: "Stryker", active: false },
  { name: "Abbott", active: false },
  { name: "Terumo", active: false },
];

/* Error boundary for Spline WebGL failures */
class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn("Spline 3D scene failed to load:", error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* Stylized fallback — shown on timeout or WebGL error */
function HeroFallbackVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="absolute w-80 h-80 rounded-full animate-pulse"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.55 0.18 230 / 25%) 0%, oklch(0.65 0.12 200 / 12%) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="w-52 h-52"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, oklch(0.60 0.18 200 / 40%) 0%, oklch(0.50 0.15 230 / 20%) 50%, transparent 75%)",
          borderRadius: "60% 40% 50% 50% / 50% 60% 40% 60%",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const { jellyMode } = useJellyMode();
  const { shouldRender: shouldRenderSpline, hasTimedOut, onSplineReady } = useSplineGating();

  const sectionRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* GSAP: text mask reveal + blob parallax */
  useEffect(() => {
    if (!nameRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Ensure everything is visible even if reduced-motion
      if (contentRef.current) {
        Array.from(contentRef.current.children).forEach((child) => {
          (child as HTMLElement).style.opacity = "1";
          (child as HTMLElement).style.transform = "none";
        });
      }
      return;
    }

    // Name clip-path reveal — fast, no delay
    gsap.fromTo(
      nameRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.8,
        ease: "power3.out",
        delay: 0,
      }
    );

    // Blob parallax on scroll
    [blob1Ref.current, blob2Ref.current].forEach((blob, i) => {
      if (!blob) return;
      gsap.to(blob, {
        y: i === 0 ? -80 : -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    // Content children use CSS transitions instead of GSAP
    // to prevent invisible-text-on-load issues.
    // The name clip-path reveal above is the only GSAP entrance effect.

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  const onSplineLoad = useCallback(
    (splineApp: any) => {
      onSplineReady();
      try {
        if (typeof splineApp?.setBackgroundColor === "function") {
          splineApp.setBackgroundColor("rgba(0,0,0,0)");
        }
        if (splineApp?._scene?.background) splineApp._scene.background = null;
        if (splineApp?._renderer) {
          const r = splineApp._renderer;
          if (typeof r.setClearColor === "function") r.setClearColor(0x000000, 0);
          if (typeof r.setClearAlpha === "function") r.setClearAlpha(0);
        }
        document.querySelectorAll("#hero canvas").forEach((c) => {
          (c as HTMLCanvasElement).style.background = "transparent";
        });
        if (splineApp?._renderer?.pipeline?.logoOverlayPass) {
          splineApp._renderer.pipeline.logoOverlayPass.enabled = false;
        }
      } catch (e) {
        console.warn("Could not set Spline transparent bg:", e);
      }
    },
    [onSplineReady]
  );

  const splineContent = useMemo(() => {
    if (!shouldRenderSpline) return null;

    if (hasTimedOut) return <HeroFallbackVisual />;

    return (
      <SplineErrorBoundary fallback={<HeroFallbackVisual />}>
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-24 h-24 animate-pulse"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.55 0.18 230 / 25%) 0%, transparent 70%)",
                }}
              />
            </div>
          }
        >
          <div className="spline-container w-full h-full relative z-10">
            <Spline
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
              onLoad={onSplineLoad}
              style={{ background: "transparent" }}
            />
          </div>
        </Suspense>
      </SplineErrorBoundary>
    );
  }, [shouldRenderSpline, hasTimedOut, onSplineLoad]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex items-center md:items-start xl:items-center overflow-hidden min-h-[100svh] md:min-h-0 xl:min-h-screen"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          ref={blob1Ref}
          className="absolute w-[320px] h-[320px] -top-24 -left-24 opacity-10 dark:opacity-25"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.55 0.18 230 / 8%) 0%, transparent 70%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
        />
        <div
          ref={blob2Ref}
          className="absolute w-[280px] h-[280px] -bottom-16 -right-16 opacity-8 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.75 0.15 65 / 6%) 0%, transparent 70%)",
            borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%",
          }}
        />
        <div
          className="absolute w-[200px] h-[200px] top-1/3 left-1/3 opacity-5 dark:opacity-[0.12]"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.60 0.14 200 / 5%) 0%, transparent 70%)",
            borderRadius: "50% 60% 30% 60% / 30% 60% 70% 40%",
          }}
        />
      </div>

      <div className="container relative z-10 pt-16 sm:pt-18 md:pt-20 xl:pt-24 pb-24 sm:pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 md:gap-10 xl:gap-8 items-center">
          {/* Left column: text content */}
          <div ref={contentRef} className="xl:col-span-3 flex flex-col gap-5 sm:gap-6 md:gap-7 xl:gap-8">
            {/* Status pill */}
            <div>
              <span className="glass-pill inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, oklch(0.80 0.16 155), oklch(0.60 0.20 155))",
                    boxShadow: "0 0 10px oklch(0.65 0.20 155 / 40%)",
                  }}
                />
                <span className="text-[11px] font-medium tracking-wide">
                  Open to opportunities
                </span>
              </span>
            </div>

            {/* Name with GSAP clip-path reveal */}
            <h1
              ref={nameRef}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-[5.5rem] font-bold tracking-[-0.03em] leading-[1.02]"
            >
              <span className="text-foreground">Hardik</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--jelly-teal) 0%, oklch(0.65 0.16 200) 40%, var(--jelly-amber) 100%)",
                }}
              >
                Lukhi
              </span>
            </h1>

            {/* Role + bio */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <p className="text-lg sm:text-xl font-semibold text-foreground/80 leading-relaxed tracking-[-0.01em]">
                Project Manager | Senior Mechanical Engineer
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-foreground/70 tracking-wide mb-1 font-mono uppercase">
                Hardware Sustainment &amp; Test Engineering
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
                {
                  "Hardware Engineer and Project Manager who owns Meta\u2019s end-to-end EMG wearable sustainment pipeline \u2014 from failure investigation and CT scanning through fixture design, factory test automation, and CM transfer. Eight years spanning six product generations across consumer electronics and regulated medical devices (FDA, ISO 13485, EU MDR), with dual Master\u2019s degrees and expertise in NPI, DfX, SPC, and cross-functional program leadership."
                }
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="#contact"
                  onClick={scrollTo("#contact")}
                  className="jelly-btn jelly-btn-teal btn-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                >
                  Say Hello
                </a>
                <div className="flex items-center gap-3">
                  <a
                    href="#projects"
                    onClick={scrollTo("#projects")}
                    className="jelly-btn jelly-btn-ghost inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground text-sm font-medium no-underline hover:bg-muted/50 hover:border-foreground/20 transition-all duration-200"
                  >
                    <Download size={13} />
                    View Work
                  </a>
                  <button
                    onClick={() => alert("Resume download coming soon.")}
                    className="jelly-btn jelly-btn-ghost inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 hover:border-foreground/20 transition-all duration-200 bg-transparent"
                  >
                    <Download size={13} />
                    Resume
                  </button>
                </div>
              </div>
            </div>

            {/* Company pills */}
            <div className="flex items-center gap-2 sm:gap-2.5 pt-1 flex-wrap">
              {companies.map((c) => (
                <span
                  key={c.name}
                  className={`jelly-tag text-[10px] sm:text-xs font-medium px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl cursor-default transition-colors duration-200 ${
                    c.active
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "bg-card border border-border text-foreground/60 hover:text-foreground/80 hover:border-border"
                  }`}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right column: Spline 3D robot (desktop/tablet only) */}
          <div
            className="xl:col-span-2 relative h-[340px] md:h-[380px] xl:h-[520px] hidden md:block"
            style={{
              opacity: 0,
              animation: "fadeInScale 0.8s ease-out 0.3s forwards",
            }}
          >
            {/* Ambient glow behind Spline */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.55 0.18 230 / 10%) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 50% at 60% 70%, oklch(0.75 0.15 65 / 7%) 0%, transparent 60%)
                `,
              }}
            />
            {splineContent}
            {/* Edge fade gradients */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background via-background/50 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 bottom-0 left-0 w-28 bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 bottom-0 right-0 w-28 bg-gradient-to-l from-background via-background/50 to-transparent pointer-events-none z-20" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-8 sm:mt-10 xl:mt-0 xl:absolute xl:bottom-8 left-1/2 xl:-translate-x-1/2 flex flex-col items-center gap-3 mx-auto">
          <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
            Scroll
          </span>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
              style={{ border: "1.5px solid oklch(0.50 0.005 80 / 20%)" }}
            >
              <div
                className="w-1.5 h-2 rounded-full animate-bounce"
                style={{ background: "var(--jelly-teal)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
