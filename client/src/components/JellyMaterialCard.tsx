/**
 * JellyMaterialCard v6 — Ultra-transparent gel cube with real internal physics.
 *
 * Key principle: Real jelly is ~95% transparent. The "gel" feel comes from:
 *  1. Edge refraction (Fresnel) — colored, thick edges; clear center
 *  2. Internal light bending — animated refraction caustics
 *  3. Surface tension — wet specular sheen
 *  4. Chromatic aberration — light splits at gel boundaries
 *  5. Subsurface scattering — light bounces inside, exits elsewhere
 *  6. 3D depth — visible side faces with translucent gel glow
 *
 * GPU: Only transform & opacity animated (compositor-only).
 */
import { useRef, useCallback, memo, useState, useEffect } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";

// ═══════════════════════════════════════════════════════
// Spring Physics Engine
// ═══════════════════════════════════════════════════════
interface SpringState { value: number; velocity: number; }
interface SpringConfig { stiffness: number; damping: number; mass: number; }

const JELLY_SPRING: SpringConfig = { stiffness: 85, damping: 3.8, mass: 0.45 };

function stepSpring(s: SpringState, target: number, c: SpringConfig, dt: number): SpringState {
  const disp = s.value - target;
  const acc = (-c.stiffness * disp - c.damping * s.velocity) / c.mass;
  const vel = s.velocity + acc * dt;
  return { value: s.value + vel * dt, velocity: vel };
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

const JELLY_DEPTH = 48;
const REST_TILT_X = 6;
const REST_TILT_Y = -3;
const ORGANIC_BR = "1.5rem 1.1rem 1.35rem 1.05rem";

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
    scaleX: 1, scaleY: 1, rotX: REST_TILT_X, rotY: REST_TILT_Y, rotZ: 0, translateZ: 0,
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

  // ── Spring animation loop ──
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
    s.rotZ = stepSpring(s.rotZ, t.rotZ, JELLY_SPRING, dt);
    s.translateZ = stepSpring(s.translateZ, t.translateZ, JELLY_SPRING, dt);

    cubeRef.current.style.transform =
      `rotateX(${s.rotX.value.toFixed(3)}deg) rotateY(${s.rotY.value.toFixed(3)}deg) rotateZ(${s.rotZ.value.toFixed(3)}deg) scale3d(${s.scaleX.value.toFixed(4)}, ${s.scaleY.value.toFixed(4)}, 1) translateZ(${s.translateZ.value.toFixed(2)}px)`;

    const settled =
      Math.abs(s.scaleX.velocity) < 0.0003 && Math.abs(s.scaleX.value - t.scaleX) < 0.0003 &&
      Math.abs(s.scaleY.velocity) < 0.0003 && Math.abs(s.scaleY.value - t.scaleY) < 0.0003 &&
      Math.abs(s.rotX.velocity) < 0.003 && Math.abs(s.rotX.value - t.rotX) < 0.003 &&
      Math.abs(s.rotY.velocity) < 0.003 && Math.abs(s.rotY.value - t.rotY) < 0.003 &&
      Math.abs(s.rotZ.velocity) < 0.003 && Math.abs(s.rotZ.value - t.rotZ) < 0.003 &&
      Math.abs(s.translateZ.velocity) < 0.003 && Math.abs(s.translateZ.value - t.translateZ) < 0.003;

    if (settled) {
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

  const triggerWobble = useCallback((mult = 1) => {
    if (prefersReducedMotion) return;
    const s = springRef.current;
    s.scaleX.velocity += (8 + Math.random() * 5) * mult;
    s.scaleY.velocity += (-7 - Math.random() * 4) * mult;
    s.rotX.velocity += (20 + Math.random() * 14) * mult;
    s.rotY.velocity += (-16 - Math.random() * 10) * mult;
    s.rotZ.velocity += (4 + Math.random() * 5) * mult * (Math.random() > 0.5 ? 1 : -1);
    s.translateZ.velocity += (32 + Math.random() * 22) * mult;
    startAnimation();
  }, [prefersReducedMotion, startAnimation]);

  // Idle wobble
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion || !isInView) return;
    let phase = 0;
    const interval = setInterval(() => {
      phase += 1;
      const s = springRef.current;
      s.scaleX.velocity += Math.sin(phase * 0.6) * 0.6;
      s.scaleY.velocity += Math.cos(phase * 0.9) * 0.5;
      s.rotX.velocity += Math.sin(phase * 0.4) * 1.0;
      s.rotY.velocity += Math.cos(phase * 0.7) * 0.8;
      s.rotZ.velocity += Math.sin(phase * 1.1) * 0.4;
      s.translateZ.velocity += Math.cos(phase * 0.5) * 0.7;
      startAnimation();
    }, 2000);
    return () => clearInterval(interval);
  }, [jellyMode, prefersReducedMotion, isInView, startAnimation]);

  // Scroll-into-view wobble
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
            setTimeout(() => triggerWobble(1.5), delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [jellyMode, prefersReducedMotion, triggerWobble, hasEnteredView]);

  useEffect(() => { if (!jellyMode) { setHasEnteredView(false); setIsInView(false); } }, [jellyMode]);
  useEffect(() => { return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (prefersReducedMotion || !jellyMode) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointerPos({ x, y });
    targetRef.current.rotX = REST_TILT_X + (0.5 - y) * 12 * intensity;
    targetRef.current.rotY = REST_TILT_Y + (x - 0.5) * 15 * intensity;
    targetRef.current.rotZ = (x - 0.5) * (y - 0.5) * 4 * intensity;
    startAnimation();
  }, [prefersReducedMotion, jellyMode, intensity, startAnimation]);

  const handlePointerEnter = useCallback(() => {
    setHover(true);
    if (jellyMode && !prefersReducedMotion) {
      targetRef.current.scaleX = 1.02;
      targetRef.current.scaleY = 1.02;
      targetRef.current.translateZ = 12;
      const s = springRef.current;
      s.scaleX.velocity += 3.5;
      s.scaleY.velocity -= 3;
      s.rotX.velocity += 6;
      s.rotZ.velocity += 1.5;
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
      s.scaleX.velocity += -2.5;
      s.scaleY.velocity += 2.5;
      s.rotX.velocity += -5;
      s.rotZ.velocity += -1;
      startAnimation();
    }
  }, [jellyMode, startAnimation]);

  const handlePointerDown = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.scaleX = 1.07;
    targetRef.current.scaleY = 0.93;
    targetRef.current.translateZ = -10;
    startAnimation();
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerUp = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.scaleX = hover ? 1.02 : 1;
    targetRef.current.scaleY = hover ? 1.02 : 1;
    targetRef.current.translateZ = hover ? 12 : 0;
    const s = springRef.current;
    s.scaleX.velocity += -8;
    s.scaleY.velocity += 9;
    s.rotX.velocity += 14;
    s.rotZ.velocity += 3;
    s.translateZ.velocity += 25;
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
  // JELLY MODE — Ultra-transparent gel cube
  // ═══════════════════════════════════════════════════════

  const specX = pointerPos.x * 100;
  const specY = pointerPos.y * 100;
  const depth = JELLY_DEPTH;
  const br = ORGANIC_BR;

  // ── L1: Ultra-transparent gel body ──
  // Real jelly is 90-97% transparent. Body alpha is VERY low.
  // The "gel" look comes from backdrop-filter distortion + edge effects.
  const bodyAlpha = isDark ? 0.08 : 0.06;
  const gelBody = isDark
    ? `hsla(${hue}, 45%, 30%, ${bodyAlpha})`
    : `hsla(${hue}, 35%, 85%, ${bodyAlpha})`;

  // ── L2: Fresnel edge gradient — THE MAIN VISUAL CUE ──
  // Real transparent materials: clear center, colored opaque edges.
  // This is what makes it look like GEL, not glass.
  const fA = isDark ? 0.7 : 0.55; // Fresnel alpha — strong!
  const fEdge = [
    // Top edge — brightest (light source above)
    `linear-gradient(180deg,
      hsla(${hue}, 70%, ${isDark ? 75 : 92}%, ${fA * 1.3}) 0%,
      hsla(${hue}, 60%, ${isDark ? 60 : 85}%, ${fA * 0.7}) 6%,
      hsla(${hue}, 50%, ${isDark ? 50 : 80}%, ${fA * 0.2}) 15%,
      transparent 30%)`,
    // Bottom edge — darker, denser
    `linear-gradient(0deg,
      hsla(${hue}, 55%, ${isDark ? 40 : 60}%, ${fA * 0.9}) 0%,
      hsla(${hue}, 45%, ${isDark ? 35 : 68}%, ${fA * 0.4}) 6%,
      hsla(${hue}, 35%, ${isDark ? 30 : 72}%, ${fA * 0.1}) 18%,
      transparent 30%)`,
    // Left edge
    `linear-gradient(90deg,
      hsla(${hue + 8}, 60%, ${isDark ? 65 : 88}%, ${fA * 1.0}) 0%,
      hsla(${hue + 8}, 50%, ${isDark ? 55 : 82}%, ${fA * 0.4}) 5%,
      transparent 22%)`,
    // Right edge
    `linear-gradient(270deg,
      hsla(${hue - 8}, 60%, ${isDark ? 65 : 88}%, ${fA * 1.0}) 0%,
      hsla(${hue - 8}, 50%, ${isDark ? 55 : 82}%, ${fA * 0.4}) 5%,
      transparent 22%)`,
    // Radial clear-out center (reinforces clear center)
    `radial-gradient(ellipse 70% 65% at 50% 50%,
      transparent 0%,
      transparent 50%,
      hsla(${hue}, 55%, ${isDark ? 55 : 80}%, ${fA * 0.35}) 85%,
      hsla(${hue}, 60%, ${isDark ? 60 : 75}%, ${fA * 0.5}) 100%)`,
  ].join(", ");

  // ── L3: Chromatic aberration — rainbow edge splitting ──
  // Light splits into component colors at gel boundaries
  const cA = isDark ? 0.22 : 0.18;
  const chromatic = [
    // Warm shift (red/orange) — top-left corner
    `linear-gradient(135deg,
      hsla(${hue + 50}, 85%, ${isDark ? 70 : 80}%, ${cA}) 0%,
      transparent 18%)`,
    // Cool shift (blue/violet) — bottom-right corner
    `linear-gradient(315deg,
      hsla(${hue - 50}, 85%, ${isDark ? 70 : 80}%, ${cA}) 0%,
      transparent 18%)`,
    // Cyan shift — top-right
    `linear-gradient(225deg,
      hsla(${hue + 90}, 80%, ${isDark ? 65 : 75}%, ${cA * 0.7}) 0%,
      transparent 14%)`,
    // Magenta shift — bottom-left
    `linear-gradient(45deg,
      hsla(${hue - 90}, 80%, ${isDark ? 65 : 75}%, ${cA * 0.7}) 0%,
      transparent 14%)`,
  ].join(", ");

  // ── L4: Subsurface scattering glow ──
  // Light enters gel, bounces internally, exits at different point
  const sssA = isDark ? 0.2 : 0.15;
  const sssGlow = `radial-gradient(ellipse 85% 75% at 50% 55%,
    hsla(${hue}, ${isDark ? 55 : 50}%, ${isDark ? 50 : 82}%, ${sssA}) 0%,
    hsla(${hue + 15}, ${isDark ? 50 : 45}%, ${isDark ? 42 : 76}%, ${sssA * 0.5}) 40%,
    transparent 70%)`;

  // ── L5: Animated caustic light concentrations ──
  // Light focuses at certain points inside gel due to curved surfaces
  const cx1 = 15 + pointerPos.x * 70;
  const cy1 = 10 + pointerPos.y * 80;
  const cx2 = 85 - pointerPos.x * 60;
  const cy2 = 90 - pointerPos.y * 70;
  const caA = hover ? (isDark ? 0.4 : 0.3) : (isDark ? 0.18 : 0.14);
  const caustics = [
    `radial-gradient(ellipse 45% 40% at ${cx1}% ${cy1}%,
      hsla(${hue + 20}, 75%, ${isDark ? 75 : 90}%, ${caA}) 0%,
      hsla(${hue + 20}, 65%, ${isDark ? 65 : 85}%, ${caA * 0.35}) 35%,
      transparent 65%)`,
    `radial-gradient(ellipse 40% 35% at ${cx2}% ${cy2}%,
      hsla(${hue - 15}, 70%, ${isDark ? 70 : 88}%, ${caA * 0.7}) 0%,
      hsla(${hue - 15}, 60%, ${isDark ? 60 : 82}%, ${caA * 0.2}) 30%,
      transparent 60%)`,
    // Sharp caustic sparkle
    `radial-gradient(circle 12% at ${30 + pointerPos.x * 40}% ${20 + pointerPos.y * 60}%,
      rgba(255, 255, 255, ${caA * 0.6}) 0%,
      transparent 100%)`,
  ].join(", ");

  // ── L6: Wet specular highlight (follows pointer) ──
  const spA = hover ? (isDark ? 0.6 : 0.8) : (isDark ? 0.15 : 0.2);
  const specular = `radial-gradient(ellipse 50% 40% at ${specX}% ${specY}%,
    rgba(255,255,255,${spA}) 0%,
    rgba(255,255,255,${spA * 0.4}) 22%,
    rgba(255,255,255,${spA * 0.08}) 50%,
    transparent 70%)`;

  // ── L7: Top surface sheen (wet gel surface tension line) ──
  const topSheen = isDark
    ? `linear-gradient(172deg,
        rgba(255,255,255,0.4) 0%,
        rgba(255,255,255,0.18) 3.5%,
        rgba(255,255,255,0.05) 12%,
        transparent 25%)`
    : `linear-gradient(172deg,
        rgba(255,255,255,0.95) 0%,
        rgba(255,255,255,0.5) 3.5%,
        rgba(255,255,255,0.15) 12%,
        transparent 25%)`;

  // ── L8: Internal refraction pattern (animated CSS) ──
  // Simulates light bending through the gel volume
  const refractionPattern = [
    `radial-gradient(ellipse 30% 25% at 25% 35%,
      hsla(${hue + 30}, 60%, ${isDark ? 65 : 88}%, 0.12) 0%,
      transparent 100%)`,
    `radial-gradient(ellipse 25% 30% at 75% 65%,
      hsla(${hue - 20}, 55%, ${isDark ? 60 : 85}%, 0.1) 0%,
      transparent 100%)`,
    `radial-gradient(ellipse 35% 20% at 50% 80%,
      hsla(${hue + 10}, 50%, ${isDark ? 55 : 82}%, 0.08) 0%,
      transparent 100%)`,
  ].join(", ");

  // ── Inner shadows (gel depth — looking INTO thick gel) ──
  const innerShadow = isDark
    ? `inset 0 2px 0 rgba(255,255,255,0.3),
       inset 0 -3px 0 rgba(0,0,0,0.3),
       inset 3px 0 0 rgba(255,255,255,0.12),
       inset -3px 0 0 rgba(255,255,255,0.12),
       inset 0 12px 30px rgba(255,255,255,0.05),
       inset 0 -12px 30px rgba(0,0,0,0.12)`
    : `inset 0 2px 0 rgba(255,255,255,0.95),
       inset 0 -3px 0 rgba(0,0,0,0.04),
       inset 3px 0 0 rgba(255,255,255,0.6),
       inset -3px 0 0 rgba(255,255,255,0.6),
       inset 0 12px 30px rgba(255,255,255,0.3),
       inset 0 -12px 30px rgba(0,0,0,0.03)`;

  // ── Outer shadow (gel slab sitting on surface) ──
  const outerShadow = hover
    ? isDark
      ? `0 ${depth + 12}px ${depth * 3}px hsla(${hue}, 55%, 30%, 0.4),
         0 ${depth + 4}px ${depth}px rgba(0,0,0,0.5),
         0 ${depth * 2.5}px ${depth * 5}px hsla(${hue}, 50%, 28%, 0.25)`
      : `0 ${depth + 12}px ${depth * 3}px hsla(${hue}, 45%, 55%, 0.18),
         0 ${depth + 4}px ${depth}px rgba(0,0,0,0.06),
         0 ${depth * 2.5}px ${depth * 5}px hsla(${hue}, 40%, 60%, 0.08)`
    : isDark
      ? `0 ${depth}px ${depth * 2}px rgba(0,0,0,0.35),
         0 ${depth / 2}px ${depth * 0.6}px rgba(0,0,0,0.25)`
      : `0 ${depth}px ${depth * 2}px rgba(0,0,0,0.08),
         0 ${depth / 2}px ${depth * 0.6}px rgba(0,0,0,0.04)`;

  // ── Border colors (gel edge refraction — subtle colored borders) ──
  const bdrTop = isDark
    ? `hsla(${hue}, 60%, 72%, ${hover ? 0.55 : 0.35})`
    : `hsla(${hue}, 50%, 90%, ${hover ? 0.75 : 0.5})`;
  const bdrBottom = isDark
    ? `hsla(${hue}, 45%, 35%, ${hover ? 0.5 : 0.3})`
    : `hsla(${hue}, 35%, 70%, ${hover ? 0.45 : 0.3})`;

  // ── Side face gradients (translucent gel thickness) ──
  const bottomSideGrad = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 55%, 50%, 0.35) 0%,
        hsla(${hue}, 50%, 32%, 0.55) 50%,
        hsla(${hue}, 45%, 22%, 0.65) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 45%, 90%, 0.4) 0%,
        hsla(${hue}, 40%, 80%, 0.3) 50%,
        hsla(${hue}, 35%, 72%, 0.25) 100%)`;

  const rightSideGrad = isDark
    ? `linear-gradient(90deg,
        hsla(${hue}, 50%, 45%, 0.3) 0%,
        hsla(${hue}, 45%, 28%, 0.5) 50%,
        hsla(${hue}, 40%, 20%, 0.6) 100%)`
    : `linear-gradient(90deg,
        hsla(${hue}, 40%, 88%, 0.35) 0%,
        hsla(${hue}, 36%, 78%, 0.28) 50%,
        hsla(${hue}, 32%, 70%, 0.22) 100%)`;

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/70 ${className}`}
      style={{
        perspective: "650px",
        perspectiveOrigin: "38% 25%",
        marginBottom: `${depth * 0.9}px`,
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
        {/* ═══ TOP FACE — Main visible surface ═══ */}
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
            borderRightWidth: "2px",
            borderBottomWidth: "2.5px",
            borderTopColor: bdrTop,
            borderLeftColor: bdrTop,
            borderRightColor: bdrBottom,
            borderBottomColor: bdrBottom,
          }}
        >
          {/* L1: Ultra-transparent gel body + backdrop blur */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              backgroundColor: gelBody,
              backdropFilter: "blur(22px) saturate(1.9) brightness(1.08)",
              WebkitBackdropFilter: "blur(22px) saturate(1.9) brightness(1.08)",
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* L2: Fresnel edge gradient — THE KEY LAYER */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: br, background: fEdge, zIndex: 1 }}
            aria-hidden="true"
          />

          {/* L3: Chromatic aberration at corners */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: chromatic,
              zIndex: 2,
              mixBlendMode: "screen",
            }}
            aria-hidden="true"
          />

          {/* L4: Subsurface scattering glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: sssGlow,
              zIndex: 3,
              mixBlendMode: isDark ? "screen" : "normal",
            }}
            aria-hidden="true"
          />

          {/* L5: Caustic light concentrations */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: caustics,
              zIndex: 4,
              opacity: hover ? 1 : 0.6,
              transition: "opacity 0.4s ease",
              mixBlendMode: "screen",
            }}
            aria-hidden="true"
          />

          {/* L6: Specular highlight blob */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: specular,
              zIndex: 5,
              transition: "opacity 0.3s ease",
            }}
            aria-hidden="true"
          />

          {/* L7: Top surface sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: br, background: topSheen, zIndex: 6 }}
            aria-hidden="true"
          />

          {/* L8: Internal refraction pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: br,
              background: refractionPattern,
              zIndex: 3,
              opacity: 0.7,
              animation: "jelly-refraction-drift 12s ease-in-out infinite alternate",
            }}
            aria-hidden="true"
          />

          {/* Content — text embedded IN the gel */}
          <div
            className="relative z-10"
            style={{
              textShadow: isDark
                ? "0 1px 3px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)"
                : "0 1px 2px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.5), 0 -1px 1px rgba(0,0,0,0.04)",
            }}
          >
            {children}
          </div>
        </div>

        {/* ═══ BOTTOM FACE ═══ */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: isDark
              ? `hsla(${hue}, 45%, 14%, 0.7)`
              : `hsla(${hue}, 30%, 72%, 0.3)`,
            transform: `translateZ(0px) rotateX(180deg)`,
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* ═══ SIDE FACES — Visible 3D depth edges ═══ */}

        {/* Bottom edge — MOST visible */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0, right: 0, bottom: 0,
            height: `${depth}px`,
            background: bottomSideGrad,
            borderRadius: "0 0 6px 6px",
            transform: `rotateX(-90deg)`,
            transformOrigin: "bottom center",
            backfaceVisibility: "hidden",
            boxShadow: isDark
              ? `inset 0 -2px 10px hsla(${hue}, 50%, 42%, 0.3), inset 0 2px 5px rgba(255,255,255,0.08)`
              : `inset 0 -2px 10px hsla(${hue}, 40%, 65%, 0.2), inset 0 2px 5px rgba(255,255,255,0.3)`,
          }}
          aria-hidden="true"
        />

        {/* Top edge */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0, right: 0, top: 0,
            height: `${depth}px`,
            background: isDark
              ? `linear-gradient(180deg,
                  hsla(${hue}, 55%, 55%, 0.35) 0%,
                  hsla(${hue}, 50%, 35%, 0.5) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 42%, 92%, 0.45) 0%,
                  hsla(${hue}, 38%, 82%, 0.35) 100%)`,
            borderRadius: "6px 6px 0 0",
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
            left: 0, top: 0, bottom: 0,
            width: `${depth}px`,
            background: isDark
              ? `linear-gradient(180deg,
                  hsla(${hue}, 50%, 44%, 0.35) 0%,
                  hsla(${hue}, 45%, 26%, 0.5) 100%)`
              : `linear-gradient(180deg,
                  hsla(${hue}, 38%, 88%, 0.4) 0%,
                  hsla(${hue}, 34%, 78%, 0.3) 100%)`,
            borderRadius: "6px 0 0 6px",
            transform: `rotateY(90deg)`,
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        {/* Right edge — SECOND most visible */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: 0, top: 0, bottom: 0,
            width: `${depth}px`,
            background: rightSideGrad,
            borderRadius: "0 6px 6px 0",
            transform: `rotateY(-90deg)`,
            transformOrigin: "right center",
            backfaceVisibility: "hidden",
            boxShadow: isDark
              ? `inset -2px 0 10px hsla(${hue}, 45%, 38%, 0.25), inset 2px 0 5px rgba(255,255,255,0.06)`
              : `inset -2px 0 10px hsla(${hue}, 38%, 62%, 0.18), inset 2px 0 5px rgba(255,255,255,0.25)`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* ═══ FALLBACK THICKNESS STRIP — Bottom ═══ */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: `-${depth * 0.65}px`,
          height: `${depth * 0.75}px`,
          borderRadius: "0 0 1.35rem 1.05rem",
          background: isDark
            ? `linear-gradient(180deg,
                hsla(${hue}, 45%, 30%, 0.4) 0%,
                hsla(${hue}, 40%, 20%, 0.2) 50%,
                transparent 100%)`
            : `linear-gradient(180deg,
                hsla(${hue}, 35%, 75%, 0.3) 0%,
                hsla(${hue}, 30%, 82%, 0.15) 50%,
                transparent 100%)`,
          filter: "blur(2px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* ═══ FALLBACK RIGHT EDGE STRIP ═══ */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          right: `-${depth * 0.35}px`,
          width: `${depth * 0.45}px`,
          borderRadius: "0 1.1rem 1.35rem 0",
          background: isDark
            ? `linear-gradient(90deg,
                hsla(${hue}, 42%, 26%, 0.3) 0%,
                hsla(${hue}, 38%, 18%, 0.15) 50%,
                transparent 100%)`
            : `linear-gradient(90deg,
                hsla(${hue}, 32%, 72%, 0.22) 0%,
                hsla(${hue}, 28%, 80%, 0.1) 50%,
                transparent 100%)`,
          filter: "blur(2px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* CSS Keyframes for internal refraction drift */}
      <style>{`
        @keyframes jelly-refraction-drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, -2%) scale(1.03); }
          66% { transform: translate(-2%, 3%) scale(0.97); }
          100% { transform: translate(1%, -1%) scale(1.01); }
        }
      `}</style>
    </div>
  );
}

export const JellyMaterialCard = memo(JellyMaterialCardInner);
