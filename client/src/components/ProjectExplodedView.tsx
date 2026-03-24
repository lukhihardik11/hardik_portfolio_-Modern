/*
 * ProjectExplodedView — GSAP ScrollTrigger-Driven Reusable Canvas Flipbook
 * 
 * Uses GSAP ScrollTrigger for:
 * - Smooth scrub (0.5s) linking scroll to frame index
 * - Timeline-driven staggered label reveals with connector animations
 * - Text mask reveals (clip-path) on the title
 * - Progress bar driven by ScrollTrigger onUpdate
 * - Glassmorphism label cards with depth shadows
 */

import { useRef, useEffect, useState, useCallback } from "react";
import type { ProjectLabel } from "@/data/projects";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ProjectExplodedViewProps {
  frameUrls: readonly string[];
  labels: ProjectLabel[];
  accentColor: string;
  title: string;
  subtitle: string;
  disclaimer?: string;
  contentCropX?: number;
  animBgColor?: string;
  fitMode?: "cover" | "contain";
}

function sampleEdgeColor(img: HTMLImageElement, hasBlackBorders = false): string {
  try {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "#1e2430";
    ctx.drawImage(img, 0, 0, size, size);

    let r = 0, g = 0, b = 0, count = 0;

    if (hasBlackBorders) {
      const inset = Math.round(size * 0.25);
      const innerW = size - 2 * inset;
      for (let x = inset; x < inset + innerW; x++) {
        for (const y of [0, 1, size - 2, size - 1]) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        }
      }
      for (let y = 2; y < size - 2; y++) {
        for (const x of [inset, inset + 1, inset + innerW - 2, inset + innerW - 1]) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        }
      }
    } else {
      for (let x = 0; x < size; x++) {
        for (const y of [0, 1, size - 2, size - 1]) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        }
      }
      for (let y = 2; y < size - 2; y++) {
        for (const x of [0, 1, size - 2, size - 1]) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        }
      }
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return "#1e2430";
  }
}

export default function ProjectExplodedView({
  frameUrls,
  labels,
  accentColor,
  title,
  subtitle,
  disclaimer,
  contentCropX,
  animBgColor,
  fitMode = "cover",
}: ProjectExplodedViewProps) {
  const cropX = contentCropX ?? 0;
  const totalFrames = frameUrls.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [bgColor, setBgColor] = useState(animBgColor ?? "#000000");
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const statusBadgeRef = useRef<HTMLDivElement>(null);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const images = imagesRef.current;
      const idx = Math.max(0, Math.min(frameIndex, totalFrames - 1));
      const img = images[idx];

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;

      if (
        canvas.width !== Math.round(w * dpr) ||
        canvas.height !== Math.round(h * dpr)
      ) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);

      let drawW: number, drawH: number, drawX: number, drawY: number;

      if (cropX > 0) {
        const srcX = Math.round(img.naturalWidth * cropX);
        const srcW = img.naturalWidth - 2 * srcX;
        const srcY = 0;
        const srcH = img.naturalHeight;
        const croppedAspect = srcW / srcH;
        const canvasAspect = w / h;

        if (croppedAspect > canvasAspect) {
          drawW = w;
          drawH = w / croppedAspect;
          drawX = 0;
          drawY = (h - drawH) / 2;
        } else {
          drawH = h;
          drawW = h * croppedAspect;
          drawX = (w - drawW) / 2;
          drawY = 0;
        }
        const bgC = animBgColor ?? bgColor;
        ctx.fillStyle = bgC;
        ctx.fillRect(0, 0, w, h);

        ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);

        const fadeW = Math.max(60, w * 0.12);

        const leftGrad = ctx.createLinearGradient(drawX, 0, drawX + fadeW, 0);
        leftGrad.addColorStop(0, bgC);
        leftGrad.addColorStop(0.5, bgC + "aa");
        leftGrad.addColorStop(1, "transparent");
        ctx.fillStyle = leftGrad;
        ctx.fillRect(drawX, drawY, fadeW, drawH);

        const rightEdge = drawX + drawW;
        const rightGrad = ctx.createLinearGradient(rightEdge - fadeW, 0, rightEdge, 0);
        rightGrad.addColorStop(0, "transparent");
        rightGrad.addColorStop(0.5, bgC + "aa");
        rightGrad.addColorStop(1, bgC);
        ctx.fillStyle = rightGrad;
        ctx.fillRect(rightEdge - fadeW, drawY, fadeW, drawH);
      } else {
        const bgC = animBgColor ?? bgColor;
        ctx.fillStyle = bgC;
        ctx.fillRect(0, 0, w, h);

        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = w / h;

        if (fitMode === "contain") {
          if (imgAspect > canvasAspect) {
            drawW = w;
            drawH = w / imgAspect;
            drawX = 0;
            drawY = (h - drawH) / 2;
          } else {
            drawH = h;
            drawW = h * imgAspect;
            drawX = (w - drawW) / 2;
            drawY = 0;
          }
        } else {
          if (imgAspect > canvasAspect) {
            drawH = h;
            drawW = h * imgAspect;
            drawX = (w - drawW) / 2;
            drawY = 0;
          } else {
            drawW = w;
            drawH = w / imgAspect;
            drawX = 0;
            drawY = (h - drawH) / 2;
          }
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
      currentFrameRef.current = idx;
    },
    [totalFrames, cropX, animBgColor, bgColor, fitMode]
  );

  // Preload all frames
  useEffect(() => {
    if (frameUrls.length === 0) return;

    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(totalFrames);
    let edgeSampled = false;

    const onLoad = (i: number) => () => {
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / totalFrames) * 100));

      if (!animBgColor && i === 0 && !edgeSampled && images[0]?.complete && images[0].naturalWidth > 0) {
        edgeSampled = true;
        try {
          const color = sampleEdgeColor(images[0], cropX > 0);
          setBgColor(color);
        } catch {
          setBgColor("#1e2430");
        }
      }

      if (loadedCount === totalFrames) {
        imagesRef.current = images;
        setIsLoaded(true);
        drawFrame(0);
      }
    };

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.onload = onLoad(i);
      img.onerror = onLoad(i);
      img.src = frameUrls[i];
      images[i] = img;
    }

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [frameUrls, totalFrames, drawFrame, animBgColor, cropX]);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!isLoaded || !sectionRef.current) return;

    const frameObj = { frame: 0 };
    const section = sectionRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const pct = Math.round(self.progress * 100);
          setScrollPercent(pct);

          if (progressBarRef.current) {
            progressBarRef.current.style.height = `${pct}%`;
          }
        },
      },
    });

    tl.to(frameObj, {
      frame: totalFrames - 1,
      ease: "none",
      duration: 10,
      onUpdate: () => {
        const idx = Math.round(frameObj.frame);
        if (idx !== currentFrameRef.current) {
          drawFrame(idx);
        }
      },
    });

    // Title mask reveal
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300",
            scrub: 0.3,
          },
        }
      );
    }

    // Staggered label reveals
    labelRefs.current.forEach((labelEl, i) => {
      if (!labelEl) return;
      const label = labels[i];
      const isRight = label.side === "right";

      gsap.fromTo(
        labelEl,
        {
          opacity: 0,
          x: isRight ? 60 : -60,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: section,
            start: `top+=${label.threshold * 40} top`,
            end: `top+=${label.threshold * 40 + 200} top`,
            scrub: 0.3,
          },
        }
      );
    });

    // Scroll hint fade out
    if (scrollHintRef.current) {
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.in",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200",
          scrub: true,
        },
      });
    }

    // Status badge fade in
    if (statusBadgeRef.current) {
      gsap.fromTo(
        statusBadgeRef.current,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=100",
            scrub: 0.3,
          },
        }
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) {
          st.kill();
        }
      });
    };
  }, [isLoaded, drawFrame, totalFrames, labels]);

  // Handle resize
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, drawFrame]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "500vh" }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Loading overlay */}
        {!isLoaded && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <div className="mb-6 text-sm font-mono tracking-[0.3em] text-white/40 uppercase">
              Loading Assembly View
            </div>
            <div className="w-56 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${loadProgress}%`,
                  background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
                }}
              />
            </div>
            <div className="mt-3 text-xs text-white/30 font-mono tabular-nums">
              {loadProgress}%
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        />

        {/* Header overlay */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.6s ease 0.3s",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
          }}
        >
          <div ref={titleRef} className="px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16 md:px-12 md:pt-24 md:pb-20">
            <p
              className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: `${accentColor}b3` }}
            >
              {subtitle}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-tight">
              Scroll to Disassemble
            </h2>
            <p className="mt-1 text-sm md:text-base text-white/40 font-light max-w-md">
              {title}
            </p>
            {disclaimer && (
              <p className="mt-3 text-[9px] md:text-[10px] text-white/25 font-mono max-w-lg leading-relaxed italic">
                {disclaimer}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-[2px] h-24 bg-white/10 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="w-full rounded-full"
                style={{
                  height: "0%",
                  backgroundColor: accentColor,
                  transition: "none",
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/30 tabular-nums">
              {scrollPercent}%
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div
          ref={statusBadgeRef}
          className="absolute top-16 sm:top-20 md:top-24 right-4 sm:right-6 md:right-12 z-10 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <div
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  scrollPercent < 5
                    ? "#34d399"
                    : scrollPercent > 90
                    ? "#f87171"
                    : accentColor,
              }}
            />
            <span className="text-[10px] font-mono text-white/60 tracking-wider uppercase">
              {scrollPercent < 5
                ? "Assembled"
                : scrollPercent > 90
                ? "Exploded"
                : "Disassembling"}
            </span>
          </div>
        </div>

        {/* Layer labels */}
        {isLoaded &&
          labels.map((label, i) => {
            const isRight = label.side === "right";
            return (
              <div
                key={i}
                ref={(el) => { labelRefs.current[i] = el; }}
                className={`absolute z-10 pointer-events-none hidden md:block ${
                  isRight ? "right-6 md:right-16" : "left-6 md:left-16"
                }`}
                style={{
                  top: `${18 + i * 13}%`,
                  opacity: 0,
                }}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isRight ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 ${
                      isRight ? "text-left" : "text-right"
                    }`}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      boxShadow: `0 4px 30px rgba(0,0,0,0.1), 0 0 20px ${accentColor}0d`,
                    }}
                  >
                    <div className="text-xs font-semibold text-white/90 tracking-wide">
                      {label.name}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5 max-w-[200px] leading-relaxed">
                      {label.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Scroll hint */}
        {isLoaded && (
          <div
            ref={scrollHintRef}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-mono text-white/25 tracking-[0.3em] uppercase">
                Scroll to explore
              </span>
              <svg
                width="20"
                height="30"
                viewBox="0 0 20 30"
                fill="none"
                className="text-white/20"
              >
                <rect
                  x="1"
                  y="1"
                  width="18"
                  height="28"
                  rx="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="2.5" fill="currentColor">
                  <animate
                    attributeName="cy"
                    values="10;20;10"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
