/**
 * HeroSection — Premium hero with GSAP-powered animations + jelly material integration.
 * 
 * GSAP Techniques applied (per Appendix I mapping):
 *   - SplitText character reveal on name
 *   - Parallax depth layers (3 layers at different speeds)
 *   - Scale/zoom on 3D visual
 *   - Magnetic hover on CTAs
 * 
 * Jelly integration:
 *   - HeroCrossSection anchor component (WebGPU/Canvas2D SDF material)
 *   - Jelly CSS classes on cards, buttons, pills
 * 
 * Two-tier: Desktop gets full parallax. Mobile gets simpler reveals.
 * Respects prefers-reduced-motion.
 */
import { useRef, useEffect, Suspense, lazy, useCallback, useMemo } from "react";
import React from "react";
import { Download, ArrowDown, Mail } from "lucide-react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useSplineGating } from "@/hooks/useSplineGating";
import { Magnetic } from "@/components/animation/Magnetic";
import { useAnimation } from "@/components/animation/AnimationProvider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Spline = lazy(() => import("@splinetool/react-spline"));
// HeroCrossSection removed — Spline robot shows in both modes

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

function HeroFallbackVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.55 0.18 230 / 20%) 0%, oklch(0.65 0.12 200 / 8%) 40%, transparent 70%)",
          filter: "blur(40px)",
          animation: "pulse 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const { jellyMode } = useJellyMode();
  const { shouldRender: shouldRenderSpline, hasTimedOut, onSplineReady } = useSplineGating();
  const { isDesktop, reducedMotion, isTouch } = useAnimation();

  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const splineWrapRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const statusPillRef = useRef<HTMLDivElement>(null);

  // Parallax layers
  const bgLayer1 = useRef<HTMLDivElement>(null);
  const bgLayer2 = useRef<HTMLDivElement>(null);
  const bgLayer3 = useRef<HTMLDivElement>(null);

  // Store SplitText instance so we can revert before React reconciles
  const nameSplitRef = useRef<SplitText | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // ENTRANCE ANIMATIONS — CSS-based for content, GSAP only for SplitText.
  // CSS animations are declarative and survive React re-renders.
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;

    // SplitText character reveal on name (only GSAP animation we keep)
    if (nameRef.current) {
      document.fonts.ready.then(() => {
        if (cancelled || !nameRef.current) return;
        const split = SplitText.create(nameRef.current, {
          type: "chars",
          autoSplit: true,
          onSplit(self) {
            gsap.from(self.chars, {
              yPercent: 120,
              opacity: 0,
              rotateX: -60,
              stagger: 0.03,
              duration: 1.2,
              ease: "expo.out",
              delay: 0.15,
            });
          },
        });
        nameSplitRef.current = split;
      });
    }

    return () => { cancelled = true; };
  }, [reducedMotion]);

  // ═══════════════════════════════════════════════════════════════
  // SCROLL-DRIVEN ANIMATIONS — depends on isDesktop for parallax.
  // Separated so ctx.revert() only kills scroll animations, not entrance.
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      if (isDesktop) {
        [
          { ref: bgLayer1.current, yEnd: -120 },
          { ref: bgLayer2.current, yEnd: -60 },
          { ref: bgLayer3.current, yEnd: -30 },
        ].forEach(({ ref: el, yEnd }) => {
          if (!el) return;
          gsap.to(el, {
            y: yEnd,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        });

        // Scroll-driven fade out of hero content
        gsap.to(sectionRef.current, {
          opacity: 0,
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "60% top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Scroll indicator fade
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "15% top",
            end: "30% top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [isDesktop, reducedMotion]);

  // Cleanup SplitText on unmount
  useEffect(() => {
    return () => {
      if (nameSplitRef.current) {
        nameSplitRef.current.revert();
        nameSplitRef.current = null;
      }
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
        sectionRef.current?.querySelectorAll("canvas")?.forEach((c) => {
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
              <div className="w-20 h-20" style={{
                background: "radial-gradient(circle, oklch(0.55 0.18 230 / 20%) 0%, transparent 70%)",
                filter: "blur(20px)",
              }} />
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
      className="relative flex items-center overflow-hidden min-h-[100svh]"
    >
      {/* ═══ Parallax background layers ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1 — deepest, moves fastest */}
        <div
          ref={bgLayer1}
          className="absolute w-[500px] h-[500px] -top-32 -left-32"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.18 230 / 6%) 0%, transparent 70%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            willChange: "transform",
          }}
        />
        {/* Layer 2 — mid depth */}
        <div
          ref={bgLayer2}
          className="absolute w-[400px] h-[400px] -bottom-20 -right-20"
          style={{
            background: "radial-gradient(ellipse, oklch(0.75 0.15 65 / 4%) 0%, transparent 70%)",
            borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%",
            willChange: "transform",
          }}
        />
        {/* Layer 3 — shallowest, moves slowest */}
        <div
          ref={bgLayer3}
          className="absolute w-[300px] h-[300px] top-1/3 left-1/4"
          style={{
            background: "radial-gradient(ellipse, oklch(0.60 0.14 200 / 3%) 0%, transparent 70%)",
            borderRadius: "50% 60% 30% 60% / 30% 60% 70% 40%",
            willChange: "transform",
          }}
        />
      </div>

      <div className="container relative z-10 pt-20 sm:pt-24 md:pt-28 xl:pt-32 pb-28 sm:pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 md:gap-12 xl:gap-10 items-center">
          {/* ═══ Left column: text content ═══ */}
          <div className="xl:col-span-3 flex flex-col gap-5 sm:gap-6 md:gap-7 xl:gap-8">
            {/* Status pill */}
            <div ref={statusPillRef} className="hero-reveal" style={{ animationDelay: '0.1s' }}>
              <span className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-muted-foreground ${
                jellyMode
                  ? "glass-pill"
                  : "bg-card/60 backdrop-blur-sm border border-border/50"
              }`}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, oklch(0.80 0.16 155), oklch(0.60 0.20 155))",
                    boxShadow: "0 0 8px oklch(0.65 0.20 155 / 35%)",
                    animation: "pulse 3s ease-in-out infinite",
                  }}
                />
                <span className="text-[11px] font-medium tracking-wide">
                  Open to opportunities
                </span>
              </span>
            </div>

            {/* Name — SplitText character reveal.
                Uses dangerouslySetInnerHTML so React doesn't track the inner DOM nodes.
                This prevents the "removeChild" error when SplitText replaces text nodes
                with character <div>s and a later re-render (e.g., from GPU tier detection
                in HeroCrossSection) causes React to try reconciling stale children. */}
            <h1
              ref={nameRef}
              className="font-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] tracking-[-0.035em] leading-[1.02]"
              style={{ fontWeight: 700, clipPath: "inset(0 0 0 0)" }}
              dangerouslySetInnerHTML={{
                __html: `<span class="text-foreground block">Hardik</span><span class="bg-clip-text text-transparent block" style="background-image: linear-gradient(135deg, var(--jelly-teal) 0%, oklch(0.65 0.16 200) 40%, var(--jelly-amber) 100%)">Lukhi</span>`
              }}
            />

            {/* Role */}
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl font-semibold text-foreground/85 leading-relaxed tracking-[-0.01em] hero-reveal"
              style={{ animationDelay: '0.5s' }}
            >
              Project Manager | Senior Mechanical Engineer
            </p>

            {/* Tagline */}
            <p
              ref={taglineRef}
              className="text-[11px] sm:text-xs font-medium text-primary/70 tracking-[0.15em] font-mono uppercase hero-reveal"
              style={{ animationDelay: '0.65s' }}
            >
              Hardware Sustainment &amp; Test Engineering
            </p>

            {/* Bio */}
            <p
              ref={bioRef}
              className="text-sm sm:text-[0.9rem] text-muted-foreground leading-[1.7] max-w-xl hero-reveal"
              style={{ animationDelay: '0.8s' }}
            >
              Hardware Engineer and Project Manager who owns Meta's end-to-end EMG wearable
              sustainment pipeline — from failure investigation and CT scanning through fixture
              design, factory test automation, and CM transfer. Eight years spanning six product
              generations across consumer electronics and regulated medical devices (FDA, ISO 13485,
              EU MDR), with dual Master's degrees and expertise in NPI, DfX, SPC, and
              cross-functional program leadership.
            </p>

            {/* CTAs with Magnetic hover + jelly button classes */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-3 pt-1 hero-reveal" style={{ animationDelay: '0.95s' }}>
              <Magnetic strength={0.25}>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300 active:scale-[0.98] ${
                    jellyMode
                      ? "jelly-btn jelly-btn-teal"
                      : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]"
                  }`}
                >
                  <Mail size={15} />
                  Say Hello
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                    jellyMode
                      ? "jelly-btn jelly-btn-ghost"
                      : "border border-border text-foreground hover:bg-muted/50 hover:border-foreground/20"
                  }`}
                >
                  <ArrowDown size={14} />
                  View Work
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a
                  href="https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/Hardik_Lukhi_Resume_ATS_d0f48f17.pdf"
                  download="Hardik_Lukhi_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                    jellyMode
                      ? "jelly-btn jelly-btn-ghost"
                      : "border border-border text-foreground hover:bg-muted/50 hover:border-foreground/20"
                  }`}
                >
                  <Download size={14} />
                  Resume
                </a>
              </Magnetic>
            </div>

            {/* Company pills with jelly classes */}
            <div ref={pillsRef} className="flex items-center gap-2 sm:gap-3 pt-2 flex-wrap hero-reveal" style={{ animationDelay: '1.1s' }}>
              {companies.map((c) => (
                <span
                  key={c.name}
                  className={`text-[10px] sm:text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-default transition-all duration-300 ${
                    jellyMode
                      ? c.active
                        ? "jelly-badge-teal"
                        : "glass-pill text-foreground/50 hover:text-foreground/70"
                      : c.active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-card/50 border border-border/50 text-foreground/50 hover:text-foreground/70"
                  }`}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* ═══ Right column: Spline 3D or HeroCrossSection ═══ */}
          <div
            ref={splineWrapRef}
            className="xl:col-span-2 relative h-[340px] md:h-[400px] xl:h-[540px] hidden md:flex items-center justify-center hero-reveal-scale"
            style={{ animationDelay: '0.4s' }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(ellipse 70% 55% at 50% 50%, oklch(0.55 0.18 230 / 8%) 0%, transparent 70%),
                  radial-gradient(ellipse 50% 45% at 60% 70%, oklch(0.75 0.15 65 / 5%) 0%, transparent 60%)
                `,
              }}
            />
            
            {/* Spline robot in both modes */}
            {splineContent}
            
            {/* Edge fades */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background via-background/40 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background via-background/40 to-transparent pointer-events-none z-20" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="mt-10 xl:mt-0 xl:absolute xl:bottom-10 left-1/2 xl:-translate-x-1/2 flex flex-col items-center gap-2 mx-auto"
        >
          <span className="text-[10px] font-mono text-muted-foreground/25 uppercase tracking-[0.25em]">
            Scroll
          </span>
          <div
            className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: "1.5px solid oklch(0.50 0.005 80 / 15%)" }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{
                background: "var(--primary)",
                animation: "scrollBounce 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.4; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes heroRevealUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heroRevealScale {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .hero-reveal {
          opacity: 0;
          animation: heroRevealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-reveal-scale {
          opacity: 0;
          animation: heroRevealScale 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-reveal, .hero-reveal-scale {
            opacity: 1;
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
