/**
 * JellyMaterialCard — Translucent 3D jelly cube with GPU-accelerated spring physics.
 *
 * Design: "A 1-4cm thick slab of colored gel viewed from a slight angle on a desk"
 *
 * v4 changes:
 * - JELLY_DEPTH increased to 56px for unmistakable 3D thickness
 * - Resting tilt 7° X + 3.5° Y → bottom + right side always prominently visible
 * - Perspective lowered to 650px → more dramatic 3D foreshortening
 * - Organic border-radius with per-corner variation + slight SVG-like bulge
 * - Stronger wobble: lower damping (5.0), higher velocity injections
 * - Continuous idle "breathing" wobble with multi-frequency Lissajous pattern
 * - Side faces have inner gel glow + gradient for convincing depth
 * - Fallback thickness strips doubled in size for non-3D browsers
 *
 * GPU: Only transform & opacity animated (compositor-only properties).
 */
import { useRef, useCallback, memo, useState, useEffect } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";

// ═══════════════════════════════════════════════════════
// Spring Physics Engine (Damped Harmonic Oscillator)
// ═══════════════════════════════════════════════════════
interface SpringState {
  value: number;
  velocity: number;
}

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

const JELLY_SPRING: SpringConfig = {
  stiffness: 110,   // Softer → more visible wobble travel distance
  damping: 5.0,     // Very low → lots of oscillation cycles before settling
  mass: 0.55,       // Light → snappy initial response
};

function stepSpring(
  state: SpringState,
  target: number,
  config: SpringConfig,
  dt: number
): SpringState {
  const { stiffness, damping, mass } = config;
  const displacement = state.value - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = (springForce + dampingForce) / mass;
  const newVelocity = state.velocity + acceleration * dt;
  const newValue = state.value + newVelocity * dt;
  return { value: newValue, velocity: newVelocity };
}

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════
interface JellyMaterialCardProps {
  children: React.ReactNode;
  className?: string;
  hue?: number;
  intensity?: number;
  borderRadius?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  "data-reveal"?: boolean;
  "data-exp-card"?: boolean;
  "data-project-card"?: boolean;
}

// Depth of the jelly slab — 56px ≈ 1.5-4cm visual thickness at screen distance
const JELLY_DEPTH = 56;

// Default resting tilt — prominently shows bottom edge AND right side
const REST_TILT_X = 7;     // degrees — tilted toward viewer (shows bottom)
const REST_TILT_Y = -3.5;  // degrees — slight left rotation (shows right side)

// Organic border-radius — different per corner for natural gel blob feel
const ORGANIC_BR = "1.6rem 1.15rem 1.4rem 1.1rem";
const ORGANIC_BR_SIDE_BOTTOM = "0 0 6px 6px";
const ORGANIC_BR_SIDE_RIGHT = "0 6px 6px 0";

function JellyMaterialCardInner({
  children,
  className = "",
  hue = 200,
  intensity = 0.8,
  borderRadius,
  style,
  onClick,
  ...rest
}: JellyMaterialCardProps) {
  const { jellyMode } = useJellyMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const springRef = useRef({
    scaleX: { value: 1, velocity: 0 } as SpringState,
    scaleY: { value: 1, velocity: 0 } as SpringState,
    rotX: { value: REST_TILT_X, velocity: 0 } as SpringState,
    rotY: { value: REST_TILT_Y, velocity: 0 } as SpringState,
    rotZ: { value: 0, velocity: 0 } as SpringState,
    translateZ: { value: 0, velocity: 0 } as SpringState,
  });
  const targetRef = useRef({
    scaleX: 1,
    scaleY: 1,
    rotX: REST_TILT_X,
    rotY: REST_TILT_Y,
    rotZ: 0,
    translateZ: 0,
  });
  const lastTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [hover, setHover] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0.5, y: 0.5 });
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Spring animation loop (GPU-only: transform) ──
  const animate = useCallback((timestamp: number) => {
    if (!cubeRef.current) return;

    const dt = lastTimeRef.current
      ? Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
      : 0.016;
    lastTimeRef.current = timestamp;

    const s = springRef.current;
    const t = targetRef.current;

    s.scaleX = stepSpring(s.scaleX, t.scaleX, JELLY_SPRING, dt);
    s.scaleY = stepSpring(s.scaleY, t.scaleY, JELLY_SPRING, dt);
    s.rotX = stepSpring(s.rotX, t.rotX, JELLY_SPRING, dt);
    s.rotY = stepSpring(s.rotY, t.rotY, JELLY_SPRING, dt);
    s.rotZ = stepSpring(s.rotZ, t.rotZ, JELLY_SPRING, dt);
    s.translateZ = stepSpring(s.translateZ, t.translateZ, JELLY_SPRING, dt);

    cubeRef.current.style.transform =
      `rotateX(${s.rotX.value.toFixed(3)}deg) ` +
      `rotateY(${s.rotY.value.toFixed(3)}deg) ` +
      `rotateZ(${s.rotZ.value.toFixed(3)}deg) ` +
      `scale3d(${s.scaleX.value.toFixed(4)}, ${s.scaleY.value.toFixed(4)}, 1) ` +
      `translateZ(${s.translateZ.value.toFixed(2)}px)`;

    const isSettled =
      Math.abs(s.scaleX.velocity) < 0.0003 &&
      Math.abs(s.scaleX.value - t.scaleX) < 0.0003 &&
      Math.abs(s.scaleY.velocity) < 0.0003 &&
      Math.abs(s.scaleY.value - t.scaleY) < 0.0003 &&
      Math.abs(s.rotX.velocity) < 0.003 &&
      Math.abs(s.rotX.value - t.rotX) < 0.003 &&
      Math.abs(s.rotY.velocity) < 0.003 &&
      Math.abs(s.rotY.value - t.rotY) < 0.003 &&
      Math.abs(s.rotZ.velocity) < 0.003 &&
      Math.abs(s.rotZ.value - t.rotZ) < 0.003 &&
      Math.abs(s.translateZ.velocity) < 0.003 &&
      Math.abs(s.translateZ.value - t.translateZ) < 0.003;

    if (isSettled) {
      s.scaleX = { value: t.scaleX, velocity: 0 };
      s.scaleY = { value: t.scaleY, velocity: 0 };
      s.rotX = { value: t.rotX, velocity: 0 };
      s.rotY = { value: t.rotY, velocity: 0 };
      s.rotZ = { value: t.rotZ, velocity: 0 };
      s.translateZ = { value: t.translateZ, velocity: 0 };
      cubeRef.current.style.transform =
        `rotateX(${t.rotX}deg) rotateY(${t.rotY}deg) rotateZ(${t.rotZ}deg) scale3d(${t.scaleX}, ${t.scaleY}, 1) translateZ(${t.translateZ}px)`;
      isAnimatingRef.current = false;
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Kick a wobble — inject velocity for jelly jiggle
  const triggerWobble = useCallback(
    (intensityMult = 1) => {
      if (prefersReducedMotion) return;
      const s = springRef.current;
      // Asymmetric velocity injection for organic wobble
      s.scaleX.velocity += (8 + Math.random() * 5) * intensityMult;
      s.scaleY.velocity += (-7 - Math.random() * 4) * intensityMult;
      s.rotX.velocity += (20 + Math.random() * 14) * intensityMult;
      s.rotY.velocity += (-16 - Math.random() * 10) * intensityMult;
      s.rotZ.velocity += (4 + Math.random() * 5) * intensityMult * (Math.random() > 0.5 ? 1 : -1);
      s.translateZ.velocity += (32 + Math.random() * 22) * intensityMult;
      startAnimation();
    },
    [prefersReducedMotion, startAnimation]
  );

  // ── Idle wobble breathing — multi-frequency Lissajous pattern ──
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion || !isInView) return;

    let phase = 0;
    const interval = setInterval(() => {
      phase += 1;
      const s = springRef.current;
      // Multi-frequency wobble for organic "alive" feel
      s.scaleX.velocity += Math.sin(phase * 0.6) * 0.7 + Math.cos(phase * 1.7) * 0.3;
      s.scaleY.velocity += Math.cos(phase * 0.9) * 0.6 + Math.sin(phase * 2.1) * 0.25;
      s.rotX.velocity += Math.sin(phase * 0.4) * 1.2 + Math.cos(phase * 1.5) * 0.5;
      s.rotY.velocity += Math.cos(phase * 0.7) * 0.9 + Math.sin(phase * 1.9) * 0.4;
      s.rotZ.velocity += Math.sin(phase * 1.1) * 0.5;
      s.translateZ.velocity += Math.cos(phase * 0.5) * 0.8;
      startAnimation();
    }, 1800);

    return () => clearInterval(interval);
  }, [jellyMode, prefersReducedMotion, isInView, startAnimation]);

  // ── Scroll-into-view wobble trigger ──
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting && !hasEnteredView) {
            setHasEnteredView(true);
            const rect = el.getBoundingClientRect();
            const delay = (rect.left / window.innerWidth) * 200;
            setTimeout(() => triggerWobble(1.6), delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [jellyMode, prefersReducedMotion, triggerWobble, hasEnteredView]);

  // Reset hasEnteredView when jelly mode toggles
  useEffect(() => {
    if (!jellyMode) {
      setHasEnteredView(false);
      setIsInView(false);
    }
  }, [jellyMode]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion || !jellyMode) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPointerPos({ x, y });

      // Tilt targets — keep base resting tilt, add pointer offset
      targetRef.current.rotX = REST_TILT_X + (y - 0.5) * -15 * intensity;
      targetRef.current.rotY = REST_TILT_Y + (x - 0.5) * 15 * intensity;
      // Organic Z rotation
      targetRef.current.rotZ = (x - 0.5) * (y - 0.5) * 4 * intensity;
      startAnimation();
    },
    [prefersReducedMotion, jellyMode, intensity, startAnimation]
  );

  const handlePointerEnter = useCallback(() => {
    setHover(true);
    if (jellyMode && !prefersReducedMotion) {
      targetRef.current.scaleX = 1.025;
      targetRef.current.scaleY = 1.025;
      targetRef.current.translateZ = 14;
      const s = springRef.current;
      s.scaleX.velocity += 4;
      s.scaleY.velocity -= 3.5;
      s.rotX.velocity += 7;
      s.rotZ.velocity += 2;
      startAnimation();
    }
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerLeave = useCallback(() => {
    setHover(false);
    setPointerPos({ x: 0.5, y: 0.5 });
    if (jellyMode) {
      targetRef.current.scaleX = 1;
      targetRef.current.scaleY = 1;
      targetRef.current.rotX = REST_TILT_X;
      targetRef.current.rotY = REST_TILT_Y;
      targetRef.current.rotZ = 0;
      targetRef.current.translateZ = 0;
      const s = springRef.current;
      s.scaleX.velocity += -3;
      s.scaleY.velocity += 3;
      s.rotX.velocity += -6;
      s.rotZ.velocity += -1.5;
      startAnimation();
    }
  }, [jellyMode, startAnimation]);

  const handlePointerDown = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    // Squish — compress vertically, expand horizontally (like pressing jelly)
    targetRef.current.scaleX = 1.09;
    targetRef.current.scaleY = 0.91;
    targetRef.current.translateZ = -12;
    startAnimation();
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerUp = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.scaleX = hover ? 1.025 : 1;
    targetRef.current.scaleY = hover ? 1.025 : 1;
    targetRef.current.translateZ = hover ? 14 : 0;
    const s = springRef.current;
    // Strong bounce-back
    s.scaleX.velocity += -9;
    s.scaleY.velocity += 10;
    s.rotX.velocity += 16;
    s.rotZ.velocity += 4;
    s.translateZ.velocity += 30;
    startAnimation();
  }, [jellyMode, prefersReducedMotion, hover, startAnimation]);

  // ═══════════════════════════════════════════════════════
  // Standard mode — clean frosted glass card
  // ═══════════════════════════════════════════════════════
  if (!jellyMode) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-card/60 backdrop-blur-md border border-border/30 shadow-sm hover:bg-card/80 hover:border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 ${className}`}
        style={{ borderRadius: borderRadius || "1.25rem", ...style }}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // JELLY MODE — True 3D gel cube with spring physics
  // ═══════════════════════════════════════════════════════

  const specX = pointerPos.x * 100;
  const specY = pointerPos.y * 100;
  const depth = JELLY_DEPTH;
  const br = ORGANIC_BR;

  // ── Material colors (more saturated for visible gel) ──
  const gelBodyColor = isDark
    ? `hsla(${hue}, 58%, 22%, 0.6)`
    : `hsla(${hue}, 48%, 90%, 0.52)`;

  // ── Edge thickness gradient (thicker gel at borders) ──
  const edgeThickness = isDark
    ? [
        `linear-gradient(180deg, hsla(${hue}, 72%, 62%, 0.5) 0%, transparent 28%)`,
        `linear-gradient(0deg, hsla(${hue}, 62%, 28%, 0.6) 0%, transparent 28%)`,
        `linear-gradient(90deg, hsla(${hue}, 66%, 62%, 0.4) 0%, transparent 24%)`,
        `linear-gradient(270deg, hsla(${hue}, 66%, 62%, 0.4) 0%, transparent 24%)`,
      ].join(", ")
    : [
        `linear-gradient(180deg, hsla(${hue}, 62%, 84%, 0.72) 0%, transparent 30%)`,
        `linear-gradient(0deg, hsla(${hue}, 52%, 62%, 0.3) 0%, transparent 28%)`,
        `linear-gradient(90deg, hsla(${hue}, 56%, 82%, 0.55) 0%, transparent 24%)`,
        `linear-gradient(270deg, hsla(${hue}, 56%, 82%, 0.55) 0%, transparent 24%)`,
      ].join(", ");

  // ── Top surface sheen (wet gel highlight — the "fresh out of mold" look) ──
  const topSheen = isDark
    ? `linear-gradient(172deg,
        rgba(255,255,255,0.42) 0%,
        rgba(255,255,255,0.22) 5%,
        rgba(255,255,255,0.08) 18%,
        transparent 34%)`
    : `linear-gradient(172deg,
        rgba(255,255,255,0.95) 0%,
        rgba(255,255,255,0.55) 5%,
        rgba(255,255,255,0.2) 18%,
        transparent 34%)`;

  // ── Specular highlight blob (follows pointer) ──
  const specularBlob = `radial-gradient(ellipse 65% 50% at ${specX}% ${specY}%,
    rgba(255,255,255,${isDark ? 0.45 : 0.72}) 0%,
    rgba(255,255,255,${isDark ? 0.16 : 0.35}) 26%,
    rgba(255,255,255,${isDark ? 0.05 : 0.1}) 52%,
    transparent 72%)`;

  // ── Internal caustic shimmer ──
  const cx = 18 + pointerPos.x * 64;
  const cy = 8 + pointerPos.y * 84;
  const causticShimmer = isDark
    ? `radial-gradient(ellipse 85% 65% at ${cx}% ${cy}%,
        hsla(${hue + 30}, 75%, 62%, 0.22) 0%,
        hsla(${hue - 20}, 65%, 52%, 0.11) 40%,
        transparent 70%)`
    : `radial-gradient(ellipse 85% 65% at ${cx}% ${cy}%,
        hsla(${hue + 30}, 65%, 74%, 0.32) 0%,
        hsla(${hue - 20}, 55%, 80%, 0.16) 40%,
        transparent 70%)`;

  // ── Corner glow (diagonal refraction) ──
  const cornerGlow = isDark
    ? `radial-gradient(ellipse 55% 55% at 0% 0%, hsla(${hue}, 72%, 62%, 0.26) 0%, transparent 65%),
       radial-gradient(ellipse 55% 55% at 100% 100%, hsla(${hue + 35}, 65%, 56%, 0.2) 0%, transparent 65%)`
    : `radial-gradient(ellipse 55% 55% at 0% 0%, hsla(${hue}, 62%, 82%, 0.42) 0%, transparent 65%),
       radial-gradient(ellipse 55% 55% at 100% 100%, hsla(${hue + 35}, 55%, 78%, 0.3) 0%, transparent 65%)`;

  // ── Inner shadows (gel depth — the "looking into thick gel" effect) ──
  const innerShadow = isDark
    ? `inset 0 5px 0 rgba(255,255,255,0.36),
       inset 0 -6px 0 rgba(0,0,0,0.6),
       inset 5px 0 0 rgba(255,255,255,0.16),
       inset -5px 0 0 rgba(255,255,255,0.16),
       inset 0 14px 28px rgba(255,255,255,0.12),
       inset 0 -14px 28px rgba(0,0,0,0.26)`
    : `inset 0 5px 0 rgba(255,255,255,0.99),
       inset 0 -6px 0 rgba(0,0,0,0.16),
       inset 5px 0 0 rgba(255,255,255,0.65),
       inset -5px 0 0 rgba(255,255,255,0.65),
       inset 0 14px 30px rgba(255,255,255,0.4),
       inset 0 -14px 30px rgba(0,0,0,0.08)`;

  // ── Outer shadow (gel slab physical depth — the "sitting on surface" shadow) ──
  const outerShadow = hover
    ? isDark
      ? `0 ${depth + 14}px ${depth * 4}px hsla(${hue}, 65%, 36%, 0.55),
         0 ${depth + 6}px ${depth * 1.5}px rgba(0,0,0,0.65),
         0 ${depth * 3}px ${depth * 6}px hsla(${hue}, 60%, 32%, 0.32),
         0 3px 0 hsla(${hue}, 60%, 62%, 0.24)`
      : `0 ${depth + 14}px ${depth * 4}px hsla(${hue}, 55%, 62%, 0.32),
         0 ${depth + 6}px ${depth * 1.5}px rgba(0,0,0,0.12),
         0 ${depth * 3}px ${depth * 6}px hsla(${hue}, 50%, 66%, 0.16),
         0 3px 0 rgba(255,255,255,0.65)`
    : isDark
      ? `0 ${depth}px ${depth * 2.5}px rgba(0,0,0,0.55),
         0 ${depth / 2}px ${depth * 0.8}px rgba(0,0,0,0.45),
         0 3px 0 hsla(${hue}, 50%, 56%, 0.16)`
      : `0 ${depth}px ${depth * 2.5}px rgba(0,0,0,0.14),
         0 ${depth / 2}px ${depth * 0.8}px rgba(0,0,0,0.08),
         0 3px 0 rgba(255,255,255,0.55)`;

  // ── Border colors (gel edge refraction) ──
  const bdrTop = isDark
    ? `hsla(${hue}, 65%, 72%, ${hover ? 0.62 : 0.42})`
    : `hsla(${hue}, 55%, 86%, ${hover ? 0.85 : 0.62})`;
  const bdrBottom = isDark
    ? `hsla(${hue}, 50%, 36%, ${hover ? 0.66 : 0.46})`
    : `hsla(${hue}, 40%, 64%, ${hover ? 0.52 : 0.36})`;

  // ── Side face gradients (visible 3D depth — the "gel slab thickness") ──
  const bottomSideGradient = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 65%, 52%, 0.65) 0%,
        hsla(${hue}, 60%, 34%, 0.82) 40%,
        hsla(${hue}, 55%, 22%, 0.92) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 52%, 90%, 0.72) 0%,
        hsla(${hue}, 46%, 80%, 0.62) 40%,
        hsla(${hue}, 40%, 70%, 0.52) 100%)`;

  const rightSideGradient = isDark
    ? `linear-gradient(90deg,
        hsla(${hue}, 60%, 48%, 0.6) 0%,
        hsla(${hue}, 55%, 28%, 0.78) 40%,
        hsla(${hue}, 50%, 18%, 0.88) 100%)`
    : `linear-gradient(90deg,
        hsla(${hue}, 48%, 88%, 0.65) 0%,
        hsla(${hue}, 42%, 78%, 0.55) 40%,
        hsla(${hue}, 38%, 70%, 0.45) 100%)`;

  const bottomFaceGradient = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 55%, 16%, 0.94) 0%,
        hsla(${hue}, 50%, 12%, 0.97) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 40%, 74%, 0.58) 0%,
        hsla(${hue}, 34%, 66%, 0.48) 100%)`;

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/70 ${className}`}
      style={{
        perspective: "650px",
        perspectiveOrigin: "38% 24%", // Shifted upper-left → dramatic 3D view
        marginBottom: `${depth * 1.1}px`,
        ...style,
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={onClick}
      {...rest}
    >
      {/* 3D Cube Container */}
      <div
        ref={cubeRef}
        style={{
          transformStyle: "preserve-3d" as any,
          willChange: "transform",
          transform: `rotateX(${REST_TILT_X}deg) rotateY(${REST_TILT_Y}deg) rotateZ(0deg) scale3d(1, 1, 1) translateZ(0px)`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ═══ TOP FACE — Main visible surface with all material layers ═══ */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: br,
            transform: `translateZ(${depth}px)`,
            backfaceVisibility: "hidden",
            boxShadow: `${innerShadow}, ${outerShadow}`,
            borderStyle: "solid",
            borderTopWidth: "2px",
            borderLeftWidth: "2px",
            borderRightWidth: "2.5px",
            borderBottomWidth: "3px",
            borderTopColor: bdrTop,
            borderLeftColor: bdrTop,
            borderRightColor: bdrBottom,
            borderBottomColor: bdrBottom,
          }}
        >
          {/* L1: Gel body */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              backgroundColor: gelBodyColor,
              backdropFilter: "blur(32px) saturate(2.0)",
              WebkitBackdropFilter: "blur(32px) saturate(2.0)",
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* L2: Edge thickness */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: br, background: edgeThickness, zIndex: 1 }}
            aria-hidden="true"
          />

          {/* L3: Top surface sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: br, background: topSheen, zIndex: 2 }}
            aria-hidden="true"
          />

          {/* L4: Specular blob */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: specularBlob,
              zIndex: 3,
              opacity: hover ? 1 : 0.25,
              transition: "opacity 0.4s ease",
            }}
            aria-hidden="true"
          />

          {/* L5: Internal caustic shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: causticShimmer,
              zIndex: 4,
              opacity: hover ? 0.95 : 0.45,
              transition: "opacity 0.5s ease",
            }}
            aria-hidden="true"
          />

          {/* L6: Corner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: br, background: cornerGlow, zIndex: 5 }}
            aria-hidden="true"
          />

          {/* L7: Text contrast backing */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: isDark
                ? "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.24) 100%)",
              zIndex: 6,
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div
            className="relative z-10"
            style={{
              textShadow: isDark
                ? "0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.2)"
                : "0 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.4)",
            }}
          >
            {children}
          </div>
        </div>

        {/* ═══ BOTTOM FACE — Visible when tilted ═══ */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: bottomFaceGradient,
            transform: `translateZ(0px) rotateX(180deg)`,
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* ═══ SIDE FACES — Visible 3D depth edges ═══ */}

        {/* Bottom edge — MOST visible (7° tilt shows this prominently) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            right: 0,
            bottom: 0,
            height: `${depth}px`,
            background: bottomSideGradient,
            borderRadius: ORGANIC_BR_SIDE_BOTTOM,
            transform: `rotateX(-90deg)`,
            transformOrigin: "bottom center",
            backfaceVisibility: "hidden",
            borderBottomWidth: "1.5px",
            borderBottomStyle: "solid",
            borderBottomColor: isDark
              ? `hsla(${hue}, 50%, 32%, 0.65)`
              : `hsla(${hue}, 40%, 72%, 0.45)`,
            // Gel inner glow on side face
            boxShadow: isDark
              ? `inset 0 -3px 12px hsla(${hue}, 58%, 48%, 0.35), inset 0 3px 6px rgba(255,255,255,0.1)`
              : `inset 0 -3px 12px hsla(${hue}, 48%, 68%, 0.25), inset 0 3px 6px rgba(255,255,255,0.35)`,
          }}
          aria-hidden="true"
        />

        {/* Top edge */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            right: 0,
            top: 0,
            height: `${depth}px`,
            background: isDark
              ? `linear-gradient(180deg,
                  hsla(${hue}, 65%, 62%, 0.55) 0%,
                  hsla(${hue}, 60%, 42%, 0.72) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 52%, 94%, 0.65) 0%,
                  hsla(${hue}, 46%, 84%, 0.55) 100%)`,
            borderRadius: `6px 6px 0 0`,
            transform: `rotateX(90deg)`,
            transformOrigin: "top center",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* Left edge */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            width: `${depth}px`,
            background: isDark
              ? `linear-gradient(180deg,
                  hsla(${hue}, 60%, 50%, 0.55) 0%,
                  hsla(${hue}, 55%, 30%, 0.72) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 48%, 90%, 0.6) 0%,
                  hsla(${hue}, 42%, 80%, 0.5) 100%)`,
            borderRadius: `6px 0 0 6px`,
            transform: `rotateY(90deg)`,
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* Right edge — SECOND most visible (3.5° Y tilt shows this) */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: 0,
            top: 0,
            bottom: 0,
            width: `${depth}px`,
            background: rightSideGradient,
            borderRadius: ORGANIC_BR_SIDE_RIGHT,
            transform: `rotateY(-90deg)`,
            transformOrigin: "right center",
            backfaceVisibility: "hidden",
            borderRightWidth: "1.5px",
            borderRightStyle: "solid",
            borderRightColor: isDark
              ? `hsla(${hue}, 48%, 28%, 0.55)`
              : `hsla(${hue}, 38%, 68%, 0.35)`,
            boxShadow: isDark
              ? `inset -3px 0 12px hsla(${hue}, 55%, 42%, 0.3), inset 3px 0 6px rgba(255,255,255,0.08)`
              : `inset -3px 0 12px hsla(${hue}, 45%, 64%, 0.22), inset 3px 0 6px rgba(255,255,255,0.3)`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* ═══ FALLBACK THICKNESS STRIP — Always visible even without 3D ═══ */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: `-${depth * 0.75}px`,
          height: `${depth * 0.85}px`,
          borderRadius: `0 0 1.4rem 1.1rem`,
          background: isDark
            ? `linear-gradient(180deg,
                hsla(${hue}, 55%, 34%, 0.6) 0%,
                hsla(${hue}, 50%, 22%, 0.4) 50%,
                transparent 100%)`
            : `linear-gradient(180deg,
                hsla(${hue}, 45%, 78%, 0.5) 0%,
                hsla(${hue}, 40%, 86%, 0.3) 50%,
                transparent 100%)`,
          filter: "blur(3px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* ═══ FALLBACK RIGHT EDGE STRIP ═══ */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          right: `-${depth * 0.4}px`,
          width: `${depth * 0.55}px`,
          borderRadius: `0 1.15rem 1.4rem 0`,
          background: isDark
            ? `linear-gradient(90deg,
                hsla(${hue}, 52%, 30%, 0.5) 0%,
                hsla(${hue}, 48%, 20%, 0.3) 50%,
                transparent 100%)`
            : `linear-gradient(90deg,
                hsla(${hue}, 42%, 76%, 0.4) 0%,
                hsla(${hue}, 38%, 84%, 0.22) 50%,
                transparent 100%)`,
          filter: "blur(3px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export const JellyMaterialCard = memo(JellyMaterialCardInner);
