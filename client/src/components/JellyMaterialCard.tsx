/**
 * JellyMaterialCard v8 — Physically-based gel material.
 *
 * Architecture: Flat card + visible thickness strips (no preserve-3d).
 * The card tilts as a flat plane via perspective() rotateX/Y — never flips.
 * Depth illusion from bottom/right thickness strips + layered gel material.
 *
 * Physics (matched to TypeGPU reference):
 *  1. Fresnel reflectance (IOR 1.42, Schlick's)
 *  2. Beer-Lambert absorption (depth-dependent saturation)
 *  3. Subsurface scattering (warm internal glow)
 *  4. Spring physics (stiffness 900-1000, damping 10-20)
 *  5. Squash/wiggle deformation on impact
 *
 * GPU: Only transform & opacity animated (compositor-only).
 */
import { useRef, useCallback, memo, useState, useEffect } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";

// ═══════════════════════════════════════════════════════
// Spring Physics
// ═══════════════════════════════════════════════════════
interface SpringState { value: number; velocity: number; }
interface SpringConfig { stiffness: number; damping: number; mass: number; }

const SQUASH_SPRING: SpringConfig = { stiffness: 950, damping: 11, mass: 1 };
const WIGGLE_SPRING: SpringConfig = { stiffness: 1000, damping: 18, mass: 1 };
const TILT_SPRING: SpringConfig = { stiffness: 280, damping: 16, mass: 1 };

function stepSpring(s: SpringState, target: number, c: SpringConfig, dt: number): SpringState {
  const F = -c.stiffness * (s.value - target) - c.damping * s.velocity;
  const vel = s.velocity + (F / c.mass) * dt;
  return { value: s.value + vel * dt, velocity: vel };
}

// ═══════════════════════════════════════════════════════
// Optics
// ═══════════════════════════════════════════════════════
function fresnelAlpha(d: number): number {
  const R0 = 0.03;
  return R0 + (1 - R0) * Math.pow(d, 5);
}

function beerLambertAlpha(thickness: number, sigma = 2.5): number {
  return 1 - Math.exp(-sigma * thickness);
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

// Visible depth in px (the thickness strips)
const DEPTH = 14;
// Resting tilt — subtle enough to show thickness, never flips
const REST_X = 2;
const REST_Y = -1.2;

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

  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const springRef = useRef({
    squashX: { value: 0, velocity: 0 } as SpringState,
    squashY: { value: 0, velocity: 0 } as SpringState,
    wiggle: { value: 0, velocity: 0 } as SpringState,
    tiltX: { value: REST_X, velocity: 0 } as SpringState,
    tiltY: { value: REST_Y, velocity: 0 } as SpringState,
    lift: { value: 0, velocity: 0 } as SpringState,
  });
  const targetRef = useRef({ tiltX: REST_X, tiltY: REST_Y, lift: 0 });
  const lastTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [hover, setHover] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0.5, y: 0.5 });
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Animation loop ──
  const animate = useCallback((ts: number) => {
    if (!cardRef.current) return;
    const dt = lastTimeRef.current ? Math.min((ts - lastTimeRef.current) / 1000, 0.05) : 0.016;
    lastTimeRef.current = ts;

    const s = springRef.current;
    const t = targetRef.current;

    s.squashX = stepSpring(s.squashX, 0, SQUASH_SPRING, dt);
    s.squashY = stepSpring(s.squashY, 0, SQUASH_SPRING, dt);
    s.wiggle = stepSpring(s.wiggle, 0, WIGGLE_SPRING, dt);
    s.tiltX = stepSpring(s.tiltX, t.tiltX, TILT_SPRING, dt);
    s.tiltY = stepSpring(s.tiltY, t.tiltY, TILT_SPRING, dt);
    s.lift = stepSpring(s.lift, t.lift, TILT_SPRING, dt);

    const sx = 1 - s.squashX.value * 0.06;
    const sy = 1 + s.squashX.value * 0.04;
    const rz = s.wiggle.value * 2;

    cardRef.current.style.transform =
      `perspective(900px) rotateX(${s.tiltX.value.toFixed(2)}deg) rotateY(${s.tiltY.value.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)}) translateZ(${s.lift.value.toFixed(1)}px)`;

    const settled =
      Math.abs(s.squashX.velocity) < 0.001 && Math.abs(s.squashX.value) < 0.001 &&
      Math.abs(s.squashY.velocity) < 0.001 && Math.abs(s.squashY.value) < 0.001 &&
      Math.abs(s.wiggle.velocity) < 0.001 && Math.abs(s.wiggle.value) < 0.001 &&
      Math.abs(s.tiltX.velocity) < 0.01 && Math.abs(s.tiltX.value - t.tiltX) < 0.01 &&
      Math.abs(s.tiltY.velocity) < 0.01 && Math.abs(s.tiltY.value - t.tiltY) < 0.01 &&
      Math.abs(s.lift.velocity) < 0.01 && Math.abs(s.lift.value - t.lift) < 0.01;

    if (settled) {
      Object.assign(s, {
        squashX: { value: 0, velocity: 0 },
        squashY: { value: 0, velocity: 0 },
        wiggle: { value: 0, velocity: 0 },
        tiltX: { value: t.tiltX, velocity: 0 },
        tiltY: { value: t.tiltY, velocity: 0 },
        lift: { value: t.lift, velocity: 0 },
      });
      cardRef.current.style.transform =
        `perspective(900px) rotateX(${t.tiltX}deg) rotateY(${t.tiltY}deg) rotateZ(0deg) scale(1, 1) translateZ(${t.lift}px)`;
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

  const triggerImpact = useCallback((strength = 1) => {
    if (prefersReducedMotion) return;
    const s = springRef.current;
    s.squashX.velocity += -5 * strength;
    s.squashY.velocity += 3 * strength;
    s.wiggle.velocity += (Math.random() > 0.5 ? 10 : -10) * strength;
    startAnimation();
  }, [prefersReducedMotion, startAnimation]);

  const triggerAnticipation = useCallback(() => {
    if (prefersReducedMotion) return;
    const s = springRef.current;
    s.squashX.velocity += -2;
    s.squashY.velocity += 1;
    s.wiggle.velocity += (Math.random() > 0.5 ? 1 : -1);
    startAnimation();
  }, [prefersReducedMotion, startAnimation]);

  // Idle wobble
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion || !isInView) return;
    let phase = 0;
    const iv = setInterval(() => {
      phase++;
      const s = springRef.current;
      s.squashX.velocity += Math.sin(phase * 0.7) * 0.3;
      s.wiggle.velocity += Math.sin(phase * 1.1) * 0.4;
      startAnimation();
    }, 2500);
    return () => clearInterval(iv);
  }, [jellyMode, prefersReducedMotion, isInView, startAnimation]);

  // Scroll-into-view wobble
  useEffect(() => {
    if (!jellyMode || prefersReducedMotion) return;
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          setIsInView(e.isIntersecting);
          if (e.isIntersecting && !hasEnteredView) {
            setHasEnteredView(true);
            const rect = el.getBoundingClientRect();
            const delay = (rect.left / window.innerWidth) * 200;
            setTimeout(() => triggerImpact(1), delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [jellyMode, prefersReducedMotion, triggerImpact, hasEnteredView]);

  useEffect(() => { if (!jellyMode) { setHasEnteredView(false); setIsInView(false); } }, [jellyMode]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // ── Pointer handlers ──
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (prefersReducedMotion || !jellyMode) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointerPos({ x, y });
    targetRef.current.tiltX = REST_X + (0.5 - y) * 8 * intensity;
    targetRef.current.tiltY = REST_Y + (x - 0.5) * 10 * intensity;
    startAnimation();
  }, [prefersReducedMotion, jellyMode, intensity, startAnimation]);

  const handlePointerEnter = useCallback(() => {
    setHover(true);
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.lift = 6;
    triggerAnticipation();
  }, [jellyMode, prefersReducedMotion, triggerAnticipation]);

  const handlePointerLeave = useCallback(() => {
    setHover(false);
    setPointerPos({ x: 0.5, y: 0.5 });
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.tiltX = REST_X;
    targetRef.current.tiltY = REST_Y;
    targetRef.current.lift = 0;
    triggerImpact(0.4);
  }, [jellyMode, prefersReducedMotion, triggerImpact]);

  const handlePointerDown = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    const s = springRef.current;
    s.squashX.velocity += -3;
    s.squashY.velocity += 2;
    targetRef.current.lift = -2;
    startAnimation();
  }, [jellyMode, prefersReducedMotion, startAnimation]);

  const handlePointerUp = useCallback(() => {
    if (!jellyMode || prefersReducedMotion) return;
    targetRef.current.lift = hover ? 6 : 0;
    triggerImpact(0.8);
  }, [jellyMode, prefersReducedMotion, hover, triggerImpact]);

  // ── Non-jelly mode ──
  if (!jellyMode) {
    return (
      <div
        className={`relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:border-border/80 ${className}`}
        style={style}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Material calculations
  // ═══════════════════════════════════════════════════════
  const br = borderRadius || "1.25rem";
  const px = pointerPos.x;
  const py = pointerPos.y;

  // Fresnel: edges bright, center clear
  const edgeAlpha = fresnelAlpha(1) * intensity;
  const midAlpha = fresnelAlpha(0.5) * intensity;

  // Beer-Lambert: body tint (very subtle)
  const bodyAlpha = beerLambertAlpha(0.12, 2.5) * intensity;

  // ── Gel body ──
  const gelBody = isDark
    ? `radial-gradient(ellipse 75% 70% at 50% 48%,
        hsla(${hue}, 30%, 25%, ${bodyAlpha * 0.15}) 0%,
        hsla(${hue}, 40%, 20%, ${bodyAlpha * 0.5}) 55%,
        hsla(${hue}, 50%, 15%, ${bodyAlpha * 0.9}) 100%)`
    : `radial-gradient(ellipse 75% 70% at 50% 48%,
        hsla(${hue}, 25%, 97%, ${bodyAlpha * 0.12}) 0%,
        hsla(${hue}, 30%, 92%, ${bodyAlpha * 0.4}) 55%,
        hsla(${hue}, 38%, 86%, ${bodyAlpha * 0.75}) 100%)`;

  // ── Fresnel edge gradient ──
  const fresnelGrad = isDark
    ? `radial-gradient(ellipse 80% 75% at 50% 50%,
        transparent 35%,
        hsla(${hue}, 55%, 60%, ${midAlpha * 0.5}) 65%,
        hsla(${hue}, 60%, 70%, ${edgeAlpha * 0.85}) 85%,
        hsla(${hue}, 65%, 78%, ${edgeAlpha}) 100%)`
    : `radial-gradient(ellipse 80% 75% at 50% 50%,
        transparent 35%,
        hsla(${hue}, 40%, 82%, ${midAlpha * 0.35}) 65%,
        hsla(${hue}, 48%, 76%, ${edgeAlpha * 0.65}) 85%,
        hsla(${hue}, 55%, 70%, ${edgeAlpha * 0.85}) 100%)`;

  // ── Subsurface scattering ──
  const sssGlow = isDark
    ? `radial-gradient(ellipse 55% 50% at ${35 + px * 30}% ${35 + py * 30}%,
        hsla(${hue + 15}, 50%, 55%, 0.12) 0%,
        transparent 70%)`
    : `radial-gradient(ellipse 55% 50% at ${35 + px * 30}% ${35 + py * 30}%,
        hsla(${hue + 15}, 40%, 88%, 0.15) 0%,
        transparent 70%)`;

  // ── Chromatic aberration at corners ──
  const chromatic = [
    `radial-gradient(circle at 0% 0%, hsla(${hue + 60}, 70%, ${isDark ? 65 : 85}%, 0.12) 0%, transparent 30%)`,
    `radial-gradient(circle at 100% 0%, hsla(${hue - 40}, 65%, ${isDark ? 60 : 82}%, 0.1) 0%, transparent 28%)`,
    `radial-gradient(circle at 0% 100%, hsla(${hue + 90}, 60%, ${isDark ? 58 : 80}%, 0.08) 0%, transparent 25%)`,
    `radial-gradient(circle at 100% 100%, hsla(${hue - 60}, 55%, ${isDark ? 55 : 78}%, 0.1) 0%, transparent 28%)`,
  ].join(", ");

  // ── Caustics ──
  const caustics = [
    `radial-gradient(ellipse 20% 15% at ${30 + px * 40}% ${25 + py * 50}%,
      hsla(${hue + 20}, 60%, ${isDark ? 75 : 95}%, ${isDark ? 0.2 : 0.25}) 0%, transparent 100%)`,
    `radial-gradient(ellipse 15% 20% at ${60 + px * 20}% ${50 + py * 30}%,
      hsla(${hue - 10}, 55%, ${isDark ? 70 : 92}%, ${isDark ? 0.12 : 0.18}) 0%, transparent 100%)`,
  ].join(", ");

  // ── Specular highlight ──
  const specular = `radial-gradient(ellipse 35% 30% at ${px * 100}% ${py * 100}%,
    hsla(0, 0%, 100%, ${hover ? (isDark ? 0.3 : 0.45) : 0}) 0%,
    hsla(0, 0%, 100%, ${hover ? (isDark ? 0.08 : 0.12) : 0}) 50%,
    transparent 100%)`;

  // ── Top sheen ──
  const topSheen = isDark
    ? `linear-gradient(175deg,
        hsla(0, 0%, 100%, 0.08) 0%,
        hsla(0, 0%, 100%, 0.02) 25%,
        transparent 50%)`
    : `linear-gradient(175deg,
        hsla(0, 0%, 100%, 0.5) 0%,
        hsla(0, 0%, 100%, 0.15) 25%,
        transparent 50%)`;

  // ── Border colors (Fresnel-based) ──
  const bdrTop = isDark
    ? `hsla(${hue}, 50%, 70%, ${edgeAlpha * 0.6})`
    : `hsla(${hue}, 40%, 80%, ${edgeAlpha * 0.5})`;
  const bdrBottom = isDark
    ? `hsla(${hue}, 45%, 50%, ${edgeAlpha * 0.8})`
    : `hsla(${hue}, 35%, 65%, ${edgeAlpha * 0.6})`;

  // ── Inner shadow ──
  const innerShadow = isDark
    ? `inset 0 1px 2px hsla(0, 0%, 100%, 0.12), inset 0 -2px 6px hsla(${hue}, 40%, 20%, 0.3)`
    : `inset 0 2px 4px hsla(0, 0%, 100%, 0.6), inset 0 -2px 8px hsla(${hue}, 30%, 70%, 0.15)`;

  // ── Outer shadow (depth cue) ──
  const outerShadow = isDark
    ? `0 ${DEPTH}px ${DEPTH * 1.5}px -${DEPTH * 0.3}px hsla(${hue}, 40%, 10%, 0.35),
       0 ${DEPTH * 0.4}px ${DEPTH * 0.6}px -2px hsla(${hue}, 50%, 20%, 0.25),
       0 2px 4px hsla(0, 0%, 0%, 0.2)`
    : `0 ${DEPTH}px ${DEPTH * 2}px -${DEPTH * 0.4}px hsla(${hue}, 30%, 50%, 0.18),
       0 ${DEPTH * 0.5}px ${DEPTH * 0.8}px -2px hsla(${hue}, 35%, 60%, 0.12),
       0 2px 6px hsla(${hue}, 20%, 40%, 0.08)`;

  // ── Thickness strip colors ──
  const bottomStripBg = isDark
    ? `linear-gradient(180deg,
        hsla(${hue}, 50%, 30%, 0.55) 0%,
        hsla(${hue}, 45%, 20%, 0.35) 60%,
        hsla(${hue}, 40%, 15%, 0.15) 100%)`
    : `linear-gradient(180deg,
        hsla(${hue}, 38%, 72%, 0.45) 0%,
        hsla(${hue}, 32%, 80%, 0.3) 60%,
        hsla(${hue}, 28%, 88%, 0.12) 100%)`;

  const rightStripBg = isDark
    ? `linear-gradient(90deg,
        hsla(${hue}, 48%, 28%, 0.45) 0%,
        hsla(${hue}, 42%, 18%, 0.3) 60%,
        hsla(${hue}, 38%, 12%, 0.1) 100%)`
    : `linear-gradient(90deg,
        hsla(${hue}, 35%, 70%, 0.35) 0%,
        hsla(${hue}, 30%, 78%, 0.22) 60%,
        hsla(${hue}, 25%, 86%, 0.08) 100%)`;

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/70 ${className}`}
      style={{
        willChange: "transform",
        transform: `perspective(900px) rotateX(${REST_X}deg) rotateY(${REST_Y}deg) rotateZ(0deg) scale(1, 1) translateZ(0px)`,
        transformOrigin: "50% 60%",
        marginBottom: `${DEPTH + 4}px`,
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
      {/* ═══ MAIN GEL SURFACE ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: br,
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
        {/* L1: Gel body — nearly invisible center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: gelBody,
            backdropFilter: `blur(22px) saturate(1.7) brightness(${isDark ? 1.05 : 1.08})`,
            WebkitBackdropFilter: `blur(22px) saturate(1.7) brightness(${isDark ? 1.05 : 1.08})`,
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* L2: Fresnel edge reflectance */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: br, background: fresnelGrad, zIndex: 1 }}
          aria-hidden="true"
        />

        {/* L3: Subsurface scattering glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: sssGlow,
            zIndex: 2,
            mixBlendMode: isDark ? "screen" : "normal",
          }}
          aria-hidden="true"
        />

        {/* L4: Chromatic aberration at corners */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: chromatic,
            zIndex: 3,
            mixBlendMode: "screen",
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
            opacity: hover ? 1 : 0.5,
            transition: "opacity 0.4s ease",
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        />

        {/* L6: Specular highlight */}
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

        {/* L8: Animated internal refraction drift */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: br,
            background: [
              `radial-gradient(ellipse 28% 22% at 25% 35%,
                hsla(${hue + 30}, 55%, ${isDark ? 65 : 90}%, 0.08) 0%, transparent 100%)`,
              `radial-gradient(ellipse 22% 28% at 75% 65%,
                hsla(${hue - 20}, 50%, ${isDark ? 60 : 87}%, 0.06) 0%, transparent 100%)`,
            ].join(", "),
            zIndex: 3,
            opacity: 0.6,
            animation: "jelly-refraction-drift 14s ease-in-out infinite alternate",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div
          className="relative z-10"
          style={{
            textShadow: isDark
              ? "0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.25)"
              : "0 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.4), 0 -1px 1px rgba(0,0,0,0.03)",
          }}
        >
          {children}
        </div>
      </div>

      {/* ═══ BOTTOM THICKNESS STRIP ═══ */}
      <div
        className="absolute left-1 right-0 pointer-events-none"
        style={{
          bottom: `-${DEPTH}px`,
          height: `${DEPTH}px`,
          borderRadius: `0 0 ${br} ${br}`,
          background: bottomStripBg,
          filter: "blur(0.5px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* ═══ RIGHT THICKNESS STRIP ═══ */}
      <div
        className="absolute top-1 bottom-0 pointer-events-none"
        style={{
          right: `-${DEPTH * 0.7}px`,
          width: `${DEPTH * 0.7}px`,
          borderRadius: `0 ${br} ${br} 0`,
          background: rightStripBg,
          filter: "blur(0.5px)",
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* ═══ CORNER SHADOW (depth illusion) ═══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: `-${DEPTH + 2}px`,
          right: `-${DEPTH * 0.5}px`,
          width: `${DEPTH * 1.5}px`,
          height: `${DEPTH * 1.5}px`,
          borderRadius: "50%",
          background: isDark
            ? `radial-gradient(circle, hsla(${hue}, 40%, 10%, 0.25) 0%, transparent 70%)`
            : `radial-gradient(circle, hsla(${hue}, 25%, 50%, 0.1) 0%, transparent 70%)`,
          filter: "blur(4px)",
          zIndex: -2,
        }}
        aria-hidden="true"
      />

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
