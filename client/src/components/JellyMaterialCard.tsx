/**
 * JellyMaterialCard — Reusable GPU-rendered jelly material card.
 *
 * Renders a Canvas2D (CPU ray-marched) jelly material surface behind
 * any card content. Uses SDF rounded-rect with Fresnel reflections,
 * subsurface scattering, and spring-physics deformation on hover.
 *
 * When jelly mode is OFF, renders as a standard card with subtle styling.
 * When jelly mode is ON, renders the full jelly material surface.
 *
 * Props:
 *   - children: card content
 *   - className: additional classes for the outer wrapper
 *   - hue: OKLCH hue angle for the jelly color (default 200 = teal)
 *   - intensity: material intensity 0-1 (default 0.7)
 *   - borderRadius: CSS border-radius string
 *   - as: HTML element tag (default "div")
 */
import { useRef, useEffect, useCallback, memo } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Spring } from "@/components/anchors/lib/spring";

// CPU render resolution (low for performance, CSS upscales)
const RENDER_W = 160;
const RENDER_H = 100;

// SDF rounded rectangle
function sdRoundedRect(px: number, py: number, bx: number, by: number, r: number): number {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  const outside = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

// Smooth minimum for soft blending
function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * h * k) / 6;
}

// Clamp
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// OKLCH-like hue to RGB (simplified)
function hueToRGB(hue: number, chroma: number, lightness: number): [number, number, number] {
  const h = (hue % 360) / 60;
  const c = chroma;
  const x = c * (1 - Math.abs((h % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (h < 1) { r = c; g = x; }
  else if (h < 2) { r = x; g = c; }
  else if (h < 3) { g = c; b = x; }
  else if (h < 4) { g = x; b = c; }
  else if (h < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = lightness - 0.5 * c;
  return [clamp(r + m, 0, 1), clamp(g + m, 0, 1), clamp(b + m, 0, 1)];
}

interface JellyMaterialCardProps {
  children: React.ReactNode;
  className?: string;
  hue?: number;
  intensity?: number;
  borderRadius?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  "data-project-card"?: boolean;
}

function JellyMaterialCardInner({
  children,
  className = "",
  hue = 200,
  intensity = 0.7,
  borderRadius = "1.25rem",
  style,
  onClick,
  ...rest
}: JellyMaterialCardProps) {
  const { jellyMode } = useJellyMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const springRef = useRef(new Spring(0, 180, 24, 1.0));
  const pointerRef = useRef({ x: 99, y: 99 });
  const isVisibleRef = useRef(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastParamsRef = useRef("");
  const needsRenderRef = useRef(true);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Render the jelly material surface
  const renderFrame = useCallback(() => {
    const ctx = ctxRef.current;
    const imageData = imageDataRef.current;
    if (!ctx || !imageData) return;

    const spring = springRef.current;
    if (!prefersReducedMotion) {
      spring.update(1 / 60);
    }

    const deformVal = prefersReducedMotion ? 0 : spring.value;
    const paramsKey = `${isDark}|${hue}|${pointerRef.current.x.toFixed(1)}|${pointerRef.current.y.toFixed(1)}|${deformVal.toFixed(3)}`;
    const isSettled = spring.isSettled(0.001);
    if (isSettled && paramsKey === lastParamsRef.current && !needsRenderRef.current) {
      return;
    }
    lastParamsRef.current = paramsKey;
    needsRenderRef.current = false;

    const w = RENDER_W;
    const h = RENDER_H;
    const data = imageData.data;

    // Background color
    const bgR = isDark ? 0.08 : 0.97;
    const bgG = isDark ? 0.08 : 0.97;
    const bgB = isDark ? 0.10 : 0.96;

    // Jelly color from hue
    const jellyColor = hueToRGB(hue, isDark ? 0.35 : 0.25, isDark ? 0.55 : 0.65);
    const fresnelMul = isDark ? 2.2 : 1.6;
    const scatterStr = isDark ? 1.5 : 2.0;
    const specInt = isDark ? 0.5 : 0.35;

    // SDF parameters
    const aspect = w / h;
    const slabW = 0.85;
    const slabH = 0.75;
    const cornerR = 0.12;

    // Pointer in normalized space
    const px = pointerRef.current.x;
    const py = pointerRef.current.y;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // UV in [-1, 1]
        const u = (x / w - 0.5) * 2 * aspect;
        const v = (y / h - 0.5) * 2;

        // Deformation: push surface away from pointer
        let du = 0, dv = 0;
        if (deformVal > 0.001) {
          const dx = u - px;
          const dy = v - py;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const push = deformVal * 0.15 * Math.exp(-dist * 3);
          du = dx / dist * push;
          dv = dy / dist * push;
        }

        const su = u + du;
        const sv = v + dv;

        // SDF distance
        const d = sdRoundedRect(su, sv, slabW, slabH, cornerR);

        if (d > 0.08) {
          // Outside — background
          const idx = (y * w + x) * 4;
          data[idx] = bgR * 255;
          data[idx + 1] = bgG * 255;
          data[idx + 2] = bgB * 255;
          data[idx + 3] = 255;
          continue;
        }

        // Inside or near edge
        const edgeDist = clamp(-d / 0.08, 0, 1);

        // Fresnel: stronger at edges
        const fresnel = Math.pow(1 - edgeDist, 3) * fresnelMul * intensity;

        // Subsurface scattering: deeper = more color
        const scatter = clamp(edgeDist * scatterStr * intensity, 0, 1);

        // Specular highlight (top-left light)
        const lightX = -0.4, lightY = -0.5;
        const nx = du * 8, ny = dv * 8;
        const specDot = clamp(-(nx * lightX + ny * lightY), 0, 1);
        const specular = Math.pow(specDot, 16) * specInt * intensity;

        // Compose color
        let r = lerp(bgR, jellyColor[0], scatter * 0.6);
        let g = lerp(bgG, jellyColor[1], scatter * 0.6);
        let b = lerp(bgB, jellyColor[2], scatter * 0.6);

        // Add Fresnel rim
        r += fresnel * 0.15;
        g += fresnel * 0.15;
        b += fresnel * 0.15;

        // Add specular
        r += specular;
        g += specular;
        b += specular;

        // Edge anti-aliasing
        if (d > -0.02) {
          const aa = clamp((0.08 - d) / 0.1, 0, 1);
          r = lerp(bgR, r, aa);
          g = lerp(bgG, g, aa);
          b = lerp(bgB, b, aa);
        }

        const idx = (y * w + x) * 4;
        data[idx] = clamp(r, 0, 1) * 255;
        data[idx + 1] = clamp(g, 0, 1) * 255;
        data[idx + 2] = clamp(b, 0, 1) * 255;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [isDark, hue, intensity, prefersReducedMotion]);

  // Animation loop
  const animate = useCallback(() => {
    if (isVisibleRef.current) {
      renderFrame();
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }, [renderFrame]);

  // Initialize canvas and start animation
  useEffect(() => {
    if (!jellyMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = RENDER_W;
    canvas.height = RENDER_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctxRef.current = ctx;
    imageDataRef.current = ctx.createImageData(RENDER_W, RENDER_H);
    needsRenderRef.current = true;

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [jellyMode, animate]);

  // Intersection observer for visibility gating
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Force re-render on theme change
  useEffect(() => {
    needsRenderRef.current = true;
  }, [isDark]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion || !jellyMode) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * aspect;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerRef.current = { x, y };
      springRef.current.target = 0.06;
      needsRenderRef.current = true;
    },
    [prefersReducedMotion, jellyMode]
  );

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = { x: 99, y: 99 };
    springRef.current.target = 0;
    needsRenderRef.current = true;
  }, []);

  // Standard mode — no GPU canvas, just styled card
  if (!jellyMode) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-card/40 backdrop-blur-sm border border-border/40 hover:bg-card/70 hover:border-border/60 hover:shadow-xl hover:shadow-primary/5 transition-all duration-400 ${className}`}
        style={{ borderRadius, ...style }}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // Jelly mode — GPU-rendered material surface
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group ${className}`}
      style={{ borderRadius, ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      {...rest}
    >
      {/* GPU-rendered jelly material canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          borderRadius,
          imageRendering: "auto",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export const JellyMaterialCard = memo(JellyMaterialCardInner);
