/**
 * JellyMaterialCard — True 3D jelly cube with GPU-accelerated spring physics.
 *
 * Key improvements:
 * - Default 3° X-tilt so bottom edge is ALWAYS visible (thickness feel)
 * - Increased depth (24px) for more pronounced 3D slab
 * - Visible gel shadow strip below card (CSS pseudo-element backup)
 * - Idle wobble breathing animation when in view
 * - More dramatic spring physics with lower damping
 * - Continuous subtle jiggle on scroll
 *
 * GPU: Only transform & opacity are animated (compositor-only).
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
  stiffness: 150,   // Slightly softer for more wobble travel
  damping: 8,       // LOW damping = visible wobble oscillation (was 12)
  mass: 0.7,        // Light mass = responsive
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

// Depth of the jelly slab in pixels — increased for visible thickness
const JELLY_DEPTH = 24;

// Default resting tilt so bottom edge is ALWAYS partially visible
const REST_TILT_X = 3; // degrees — tilted slightly toward viewer

function JellyMaterialCardInner({
  children,
  className = "",
  hue = 200,
  intensity = 0.8,
  borderRadius = "1.25rem",
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
    rotY: { value: 0, velocity: 0 } as SpringState,
    translateZ: { value: 0, velocity: 0 } as SpringState,
  });
  const targetRef = useRef({
    scaleX: 1,
    scaleY: 1,
    rotX: REST_TILT_X, // Default tilt
    rotY: 0,
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

    const dt = lastTimeRef.current ? Math.min((timestamp - lastTimeRef.current) / 1000, 0.05) : 0.016;
    lastTimeRef.current = timestamp;

    const s = springRef.current;
    const t = targetRef.current;

    s.scaleX = stepSpring(s.scaleX, t.scaleX, JELLY_SPRING, dt);
    s.scaleY = stepSpring(s.scaleY, t.scaleY, JELLY_SPRING, dt);
    s.rotX = stepSpring(s.rotX, t.rotX, JELLY_SPRING, dt);
    s.rotY = stepSpring(s.rotY, t.rotY, JELLY_SPRING, dt);
    s.translateZ = stepSpring(s.translateZ, t.translateZ, JELLY_SPRING, dt);

    cubeRef.current.style.transform =
      `rotateX(${s.rotX.value.toFixed(3)}deg) ` +
      `rotateY(${s.rotY.value.toFixed(3)}deg) ` +
      `scale3d(${s.scaleX.value.toFixed(4)}, ${s.scaleY.value.toFixed(4)}, 1) ` +
      `translateZ(${s.translateZ.value.toFixed(2)}px)`;

    const isSettled =
      Math.abs(s.scaleX.velocity) < 0.0005 && Math.abs(s.scaleX.value - t.scaleX) < 0.0005 &&
      Math.abs(s.scaleY.velocity) < 0.0005 && Math.abs(s.scaleY.value - t.scaleY) < 0.0005 &&
      Math.abs(s.rotX.velocity) < 0.005 && Math.abs(s.rotX.value - t.rotX) < 0.005 &&
      Math.abs(s.rotY.velocity) < 0.005 && Math.abs(s.rotY.value - t.rotY) < 0.005 &&
      Math.abs(s.translateZ.velocity) < 0.005 && Math.abs(s.translateZ.value - t.translateZ) < 0.005;

    if (isSettled) {
      s.scaleX = { value: t.scaleX, velocity: 0 };
      s.scaleY = { value: t.scaleY, velocity: 0 };
      s.rotX = { value: t.rotX, velocity: 0 };
      s.rotY = { value: t.rotY, velocity: 0 };
      s.translateZ = { value: t.translateZ, velocity: 0 };
      cubeRef.current.style.transform =
        `rotateX(${t.rotX}deg) rotateY(${t.rotY}deg) scale3d(${t.scaleX}, ${t.scaleY}, 1) translateZ(${t.translateZ}px)`;
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
  const triggerWobble = useCallback((intensityMult = 1) => {
    if (prefersReducedMotion) return;
    const s = springRef.current;
    // Inject LARGE asymmetric velocity for dramatic wobble
    s.scaleX.velocity += (5 + Math.random() * 3) * intensityMult;
    s.scaleY.velocity += (-4.5 - Math.random() * 3) * intensityMult;
    s.rotX.velocity += (12 + Math.random() * 8) * intensityMult;
    s.rotY.velocity += (-10 - Math.random() * 6) * intensityMult;
    s.translateZ.velocity += (20 + Math.random() * 15) * intensityMult;
    startAnimation();
  }, [prefersReducedMotion, startAnimation]);

  // ── Idle wobble breathing — periodic nudge (battery-efficient) ──
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion || !isInView) return;

    let phase = 0;
    // Use setInterval instead of continuous RAF — fires every 2s for gentle nudge
    const interval = setInterval(() => {
      phase += 1;
      const s = springRef.current;
      s.scaleX.velocity += Math.sin(phase * 0.7) * 0.4;
      s.scaleY.velocity += Math.cos(phase * 1.1) * 0.35;
      s.rotX.velocity += Math.sin(phase * 0.5) * 0.6;
      s.rotY.velocity += Math.cos(phase * 0.8) * 0.5;
      startAnimation();
    }, 2000);

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
            setTimeout(() => triggerWobble(1.2), delay); // Stronger entrance wobble
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

      // Tilt targets — keep the base REST_TILT_X added
      targetRef.current.rotX = REST_TILT_X + (y - 0.5) * -10 * intensity;
      targetRef.current.rotY = (x - 0.5) * 10 * intensity;
      startAnimation();
    },
    [prefersReducedMotion, jellyMode, intensity, startAnimation]
  );

  const handlePointerEnter = useCallback(() => {
    setHover(true);
    if (jellyMode && !prefersReducedMotion) {
      targetRef.current.scaleX = 1.025;
      targetRef.current.scaleY = 1.025;
      targetRef.current.translateZ = 8;
      const s = springRef.current;
      s.scaleX.velocity += 2.5;
      s.scaleY.velocity -= 2;
      s.rotX.velocity += 4;
      startAnimation();
    }
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerLeave = useCallback(() => {
    setHover(false);
    setPointerPos({ x: 0.5, y: 0.5 });
    if (jellyMode) {
      targetRef.current.scaleX = 1;
      targetRef.current.scaleY = 1;
      targetRef.current.rotX = REST_TILT_X; // Return to resting tilt
      targetRef.current.rotY = 0;
      targetRef.current.translateZ = 0;
      // Add departure wobble
      const s = springRef.current;
      s.scaleX.velocity += -1.5;
      s.scaleY.velocity += 1.8;
      s.rotX.velocity += -3;
      startAnimation();
    }
  }, [jellyMode, startAnimation]);

  const handlePointerDown = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    // Squish — like pressing into jelly
    targetRef.current.scaleX = 1.06;
    targetRef.current.scaleY = 0.94;
    targetRef.current.translateZ = -6;
    startAnimation();
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerUp = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.scaleX = hover ? 1.025 : 1;
    targetRef.current.scaleY = hover ? 1.025 : 1;
    targetRef.current.translateZ = hover ? 8 : 0;
    // Inject extra velocity for bouncy release
    const s = springRef.current;
    s.scaleX.velocity += -6;
    s.scaleY.velocity += 7;
    s.rotX.velocity += 10;
    s.translateZ.velocity += 20;
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
        style={{ borderRadius, ...style }}
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
  const br = borderRadius;
  const brNum = parseFloat(borderRadius) || 20;
  const sideBr = `${Math.max(2, brNum * 0.15)}px`;

  // ── Material colors ──
  const gelBodyColor = isDark
    ? `hsla(${hue}, 50%, 18%, 0.6)`
    : `hsla(${hue}, 38%, 91%, 0.5)`;

  // ── Edge thickness gradient (thicker gel at borders) ──
  const edgeThickness = isDark
    ? [
        `linear-gradient(180deg, hsla(${hue}, 65%, 55%, 0.4) 0%, transparent 22%)`,
        `linear-gradient(0deg, hsla(${hue}, 55%, 22%, 0.5) 0%, transparent 22%)`,
        `linear-gradient(90deg, hsla(${hue}, 60%, 55%, 0.3) 0%, transparent 19%)`,
        `linear-gradient(270deg, hsla(${hue}, 60%, 55%, 0.3) 0%, transparent 19%)`,
      ].join(", ")
    : [
        `linear-gradient(180deg, hsla(${hue}, 55%, 80%, 0.6) 0%, transparent 24%)`,
        `linear-gradient(0deg, hsla(${hue}, 45%, 58%, 0.22) 0%, transparent 22%)`,
        `linear-gradient(90deg, hsla(${hue}, 50%, 78%, 0.45) 0%, transparent 20%)`,
        `linear-gradient(270deg, hsla(${hue}, 50%, 78%, 0.45) 0%, transparent 20%)`,
      ].join(", ");

  // ── Top surface sheen (wet gel highlight) ──
  const topSheen = isDark
    ? `linear-gradient(180deg,
        rgba(255,255,255,0.3) 0%,
        rgba(255,255,255,0.15) 3%,
        rgba(255,255,255,0.05) 14%,
        transparent 28%)`
    : `linear-gradient(180deg,
        rgba(255,255,255,0.85) 0%,
        rgba(255,255,255,0.45) 3%,
        rgba(255,255,255,0.14) 14%,
        transparent 28%)`;

  // ── Specular highlight blob (follows pointer) ──
  const specularBlob = `radial-gradient(ellipse 55% 40% at ${specX}% ${specY}%,
    rgba(255,255,255,${isDark ? 0.35 : 0.6}) 0%,
    rgba(255,255,255,${isDark ? 0.12 : 0.28}) 22%,
    rgba(255,255,255,${isDark ? 0.03 : 0.07}) 48%,
    transparent 68%)`;

  // ── Internal caustic shimmer ──
  const cx = 25 + pointerPos.x * 50;
  const cy = 15 + pointerPos.y * 70;
  const causticShimmer = isDark
    ? `radial-gradient(ellipse 75% 55% at ${cx}% ${cy}%,
        hsla(${hue + 25}, 70%, 58%, 0.16) 0%,
        hsla(${hue - 15}, 60%, 48%, 0.08) 35%,
        transparent 65%)`
    : `radial-gradient(ellipse 75% 55% at ${cx}% ${cy}%,
        hsla(${hue + 25}, 60%, 70%, 0.24) 0%,
        hsla(${hue - 15}, 50%, 76%, 0.12) 35%,
        transparent 65%)`;

  // ── Corner glow (diagonal refraction) ──
  const cornerGlow = isDark
    ? `radial-gradient(ellipse 45% 45% at 0% 0%, hsla(${hue}, 65%, 58%, 0.2) 0%, transparent 60%),
       radial-gradient(ellipse 45% 45% at 100% 100%, hsla(${hue + 30}, 60%, 52%, 0.14) 0%, transparent 60%)`
    : `radial-gradient(ellipse 45% 45% at 0% 0%, hsla(${hue}, 55%, 78%, 0.35) 0%, transparent 60%),
       radial-gradient(ellipse 45% 45% at 100% 100%, hsla(${hue + 30}, 50%, 73%, 0.22) 0%, transparent 60%)`;

  // ── Inner shadows (gel depth) ──
  const innerShadow = isDark
    ? `inset 0 3px 0 rgba(255,255,255,0.3),
       inset 0 -4px 0 rgba(0,0,0,0.5),
       inset 3px 0 0 rgba(255,255,255,0.12),
       inset -3px 0 0 rgba(255,255,255,0.12),
       inset 0 10px 20px rgba(255,255,255,0.08),
       inset 0 -10px 20px rgba(0,0,0,0.2)`
    : `inset 0 3px 0 rgba(255,255,255,0.95),
       inset 0 -4px 0 rgba(0,0,0,0.12),
       inset 3px 0 0 rgba(255,255,255,0.55),
       inset -3px 0 0 rgba(255,255,255,0.55),
       inset 0 10px 22px rgba(255,255,255,0.3),
       inset 0 -10px 22px rgba(0,0,0,0.05)`;

  // ── Outer shadow (gel slab physical depth) ──
  const outerShadow = hover
    ? isDark
      ? `0 ${depth + 8}px ${depth * 3}px hsla(${hue}, 60%, 32%, 0.5),
         0 ${depth + 3}px ${depth * 1.2}px rgba(0,0,0,0.55),
         0 ${depth * 2.5}px ${depth * 5}px hsla(${hue}, 55%, 28%, 0.25),
         0 1px 0 hsla(${hue}, 55%, 58%, 0.18)`
      : `0 ${depth + 8}px ${depth * 3}px hsla(${hue}, 50%, 58%, 0.25),
         0 ${depth + 3}px ${depth * 1.2}px rgba(0,0,0,0.08),
         0 ${depth * 2.5}px ${depth * 5}px hsla(${hue}, 45%, 62%, 0.12),
         0 1px 0 rgba(255,255,255,0.55)`
    : isDark
      ? `0 ${depth}px ${depth * 1.8}px rgba(0,0,0,0.45),
         0 ${depth / 2}px ${depth * 0.6}px rgba(0,0,0,0.35),
         0 1px 0 hsla(${hue}, 45%, 52%, 0.12)`
      : `0 ${depth}px ${depth * 1.8}px rgba(0,0,0,0.1),
         0 ${depth / 2}px ${depth * 0.6}px rgba(0,0,0,0.05),
         0 1px 0 rgba(255,255,255,0.45)`;

  // ── Border colors (gel edge refraction) ──
  const bdrTop = isDark
    ? `hsla(${hue}, 60%, 68%, ${hover ? 0.55 : 0.35})`
    : `hsla(${hue}, 50%, 82%, ${hover ? 0.8 : 0.55})`;
  const bdrBottom = isDark
    ? `hsla(${hue}, 45%, 32%, ${hover ? 0.6 : 0.4})`
    : `hsla(${hue}, 35%, 60%, ${hover ? 0.45 : 0.3})`;

  // ── Side face gradients (visible 3D depth) ──
  const sideGradient = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 60%, 48%, 0.55) 0%,
        hsla(${hue}, 55%, 28%, 0.75) 50%,
        hsla(${hue}, 50%, 18%, 0.85) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 45%, 86%, 0.65) 0%,
        hsla(${hue}, 40%, 76%, 0.55) 50%,
        hsla(${hue}, 35%, 66%, 0.45) 100%)`;

  const bottomGradient = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 50%, 12%, 0.9) 0%,
        hsla(${hue}, 45%, 8%, 0.95) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 35%, 70%, 0.5) 0%,
        hsla(${hue}, 30%, 62%, 0.4) 100%)`;

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/70 ${className}`}
      style={{
        perspective: "900px",
        perspectiveOrigin: "50% 35%",
        // Extra bottom margin for the visible depth + shadow
        marginBottom: `${depth * 0.8}px`,
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
      {/* 3D Cube Container — preserve-3d for visible side faces */}
      <div
        ref={cubeRef}
        style={{
          transformStyle: "preserve3d" as any,
          willChange: "transform",
          // DEFAULT: slight tilt so bottom edge is visible at rest
          transform: `rotateX(${REST_TILT_X}deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)`,
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
            borderTopWidth: "1.5px",
            borderLeftWidth: "1.5px",
            borderRightWidth: "1.5px",
            borderBottomWidth: "2.5px",
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
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
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
              opacity: hover ? 1 : 0.35,
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
              opacity: hover ? 0.95 : 0.55,
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

          {/* L7: Text contrast backing — ensures WCAG readability over gel */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: isDark
                ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.2) 100%)',
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
            background: bottomGradient,
            transform: `translateZ(0px) rotateX(180deg)`,
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* ═══ SIDE FACES — Visible 3D depth edges ═══ */}
        {/* Bottom edge (MOST visible due to default tilt — the "thickness" you see) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            right: 0,
            bottom: 0,
            height: `${depth}px`,
            background: sideGradient,
            borderRadius: `0 0 ${sideBr} ${sideBr}`,
            transform: `rotateX(-90deg)`,
            transformOrigin: "bottom center",
            backfaceVisibility: "hidden",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: isDark
              ? `hsla(${hue}, 45%, 28%, 0.55)`
              : `hsla(${hue}, 35%, 68%, 0.35)`,
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
                  hsla(${hue}, 60%, 58%, 0.45) 0%,
                  hsla(${hue}, 55%, 38%, 0.65) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 45%, 90%, 0.55) 0%,
                  hsla(${hue}, 40%, 80%, 0.45) 100%)`,
            borderRadius: `${sideBr} ${sideBr} 0 0`,
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
            background: sideGradient,
            borderRadius: `${sideBr} 0 0 ${sideBr}`,
            transform: `rotateY(90deg)`,
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* Right edge */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: 0,
            top: 0,
            bottom: 0,
            width: `${depth}px`,
            background: isDark
              ? `linear-gradient(180deg,
                  hsla(${hue}, 55%, 42%, 0.5) 0%,
                  hsla(${hue}, 50%, 22%, 0.7) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 42%, 84%, 0.55) 0%,
                  hsla(${hue}, 36%, 74%, 0.45) 100%)`,
            borderRadius: `0 ${sideBr} ${sideBr} 0`,
            transform: `rotateY(-90deg)`,
            transformOrigin: "right center",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ═══ FALLBACK THICKNESS STRIP — Always visible even without 3D ═══ */}
      {/* This ensures the "height/thickness" is visible even on browsers with poor preserve-3d */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: `-${depth * 0.6}px`,
          height: `${depth * 0.7}px`,
          borderRadius: `0 0 ${br} ${br}`,
          background: isDark
            ? `linear-gradient(180deg,
                hsla(${hue}, 50%, 30%, 0.5) 0%,
                hsla(${hue}, 45%, 18%, 0.3) 60%,
                transparent 100%)`
            : `linear-gradient(180deg,
                hsla(${hue}, 40%, 75%, 0.4) 0%,
                hsla(${hue}, 35%, 82%, 0.2) 60%,
                transparent 100%)`,
          filter: "blur(2px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />


    </div>
  );
}

export const JellyMaterialCard = memo(JellyMaterialCardInner);
