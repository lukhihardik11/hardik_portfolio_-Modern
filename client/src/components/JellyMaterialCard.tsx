/**
 * JellyMaterialCard — Translucent jelly-cube card with 5mm–1mm thick gel feel.
 *
 * The card should look like a slab of translucent colored jelly/gelatin sitting
 * on the page. Key visual cues:
 * - Thick, saturated edges (like looking through thicker gel at the borders)
 * - Clear/translucent center (thinner gel = more see-through)
 * - Bright specular highlight on top surface (wet gel sheen)
 * - Visible inner depth via multiple inset shadows
 * - Bottom "thickness" shadow (the gel slab has physical depth)
 * - Subtle internal color caustics that shift with pointer
 * - Spring-physics tilt on hover
 *
 * Pure CSS — 7 stacked layers + backdrop-blur + pointer-tracking.
 */
import { useRef, useCallback, memo, useState } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";

interface JellyMaterialCardProps {
  children: React.ReactNode;
  className?: string;
  hue?: number;
  intensity?: number;
  borderRadius?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  "data-project-card"?: boolean;
}

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
  const [hover, setHover] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0.5, y: 0.5 });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion || !jellyMode) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPointerPos({ x, y });
    },
    [prefersReducedMotion, jellyMode]
  );

  const handlePointerEnter = useCallback(() => setHover(true), []);
  const handlePointerLeave = useCallback(() => {
    setHover(false);
    setPointerPos({ x: 0.5, y: 0.5 });
  }, []);

  // Standard mode — clean frosted glass card
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
  // JELLY MODE — Translucent gel cube material
  // ═══════════════════════════════════════════════════════

  const tiltX = prefersReducedMotion ? 0 : (pointerPos.y - 0.5) * -7 * intensity;
  const tiltY = prefersReducedMotion ? 0 : (pointerPos.x - 0.5) * 7 * intensity;
  const scale = hover && !prefersReducedMotion ? 1.018 : 1;
  const specX = pointerPos.x * 100;
  const specY = pointerPos.y * 100;

  // ── L1: Gel body — the jelly's bulk material ──
  // Translucent colored fill — like looking through a thin sheet of gelatin.
  const gelBody = isDark
    ? `hsla(${hue}, 45%, 16%, 0.6)`
    : `hsla(${hue}, 35%, 92%, 0.5)`;

  // ── L2: Edge thickness gradient ──
  // Jelly is thicker at edges → more saturated/opaque at borders.
  // Uses a "frame" gradient: opaque edges, clear center.
  const edgeThickness = isDark
    ? [
        // Top edge
        `linear-gradient(180deg, hsla(${hue}, 60%, 50%, 0.3) 0%, transparent 18%)`,
        // Bottom edge (darker — shadow side)
        `linear-gradient(0deg, hsla(${hue}, 50%, 20%, 0.4) 0%, transparent 18%)`,
        // Left edge
        `linear-gradient(90deg, hsla(${hue}, 55%, 50%, 0.2) 0%, transparent 15%)`,
        // Right edge
        `linear-gradient(270deg, hsla(${hue}, 55%, 50%, 0.2) 0%, transparent 15%)`,
      ].join(', ')
    : [
        // Top edge — bright (light hitting top surface)
        `linear-gradient(180deg, hsla(${hue}, 50%, 80%, 0.5) 0%, transparent 20%)`,
        // Bottom edge — slightly darker
        `linear-gradient(0deg, hsla(${hue}, 40%, 60%, 0.15) 0%, transparent 18%)`,
        // Left edge
        `linear-gradient(90deg, hsla(${hue}, 45%, 78%, 0.35) 0%, transparent 16%)`,
        // Right edge
        `linear-gradient(270deg, hsla(${hue}, 45%, 78%, 0.35) 0%, transparent 16%)`,
      ].join(', ');

  // ── L3: Top surface sheen (wet gel highlight) ──
  // A bright, thin strip across the top — like light reflecting off wet gelatin.
  const topSheen = isDark
    ? `linear-gradient(180deg,
        rgba(255,255,255,0.2) 0%,
        rgba(255,255,255,0.1) 3%,
        rgba(255,255,255,0.03) 12%,
        transparent 22%)`
    : `linear-gradient(180deg,
        rgba(255,255,255,0.7) 0%,
        rgba(255,255,255,0.35) 3%,
        rgba(255,255,255,0.1) 12%,
        transparent 22%)`;

  // ── L4: Specular highlight blob (follows pointer) ──
  const specularBlob = `radial-gradient(ellipse 45% 30% at ${specX}% ${specY}%,
    rgba(255,255,255,${isDark ? 0.25 : 0.5}) 0%,
    rgba(255,255,255,${isDark ? 0.08 : 0.2}) 20%,
    rgba(255,255,255,${isDark ? 0.02 : 0.05}) 45%,
    transparent 65%)`;

  // ── L5: Internal caustic shimmer ──
  // Colored light patterns inside the gel, shifting with pointer.
  const cx = 25 + pointerPos.x * 50;
  const cy = 15 + pointerPos.y * 70;
  const causticShimmer = isDark
    ? `radial-gradient(ellipse 70% 50% at ${cx}% ${cy}%,
        hsla(${hue + 25}, 65%, 55%, 0.12) 0%,
        hsla(${hue - 15}, 55%, 45%, 0.06) 35%,
        transparent 65%)`
    : `radial-gradient(ellipse 70% 50% at ${cx}% ${cy}%,
        hsla(${hue + 25}, 55%, 72%, 0.18) 0%,
        hsla(${hue - 15}, 45%, 78%, 0.08) 35%,
        transparent 65%)`;

  // ── L6: Corner glow (diagonal refraction) ──
  // Subtle colored glow in corners — like light bending through the gel corners.
  const cornerGlow = isDark
    ? `radial-gradient(ellipse 40% 40% at 0% 0%, hsla(${hue}, 60%, 55%, 0.15) 0%, transparent 60%),
       radial-gradient(ellipse 40% 40% at 100% 100%, hsla(${hue + 30}, 55%, 50%, 0.1) 0%, transparent 60%)`
    : `radial-gradient(ellipse 40% 40% at 0% 0%, hsla(${hue}, 50%, 80%, 0.25) 0%, transparent 60%),
       radial-gradient(ellipse 40% 40% at 100% 100%, hsla(${hue + 30}, 45%, 75%, 0.15) 0%, transparent 60%)`;

  // ── Inner shadows (gel depth) ──
  // Multiple inset shadows create the "looking into a gel slab" effect.
  // Top inset = bright (light entering), bottom inset = dark (shadow), sides = subtle.
  const innerShadow = isDark
    ? `inset 0 2px 0 rgba(255,255,255,0.22),
       inset 0 -2.5px 0 rgba(0,0,0,0.4),
       inset 2px 0 0 rgba(255,255,255,0.08),
       inset -2px 0 0 rgba(255,255,255,0.08),
       inset 0 6px 12px rgba(255,255,255,0.05),
       inset 0 -6px 12px rgba(0,0,0,0.15)`
    : `inset 0 2px 0 rgba(255,255,255,0.85),
       inset 0 -2.5px 0 rgba(0,0,0,0.08),
       inset 2px 0 0 rgba(255,255,255,0.4),
       inset -2px 0 0 rgba(255,255,255,0.4),
       inset 0 6px 14px rgba(255,255,255,0.2),
       inset 0 -6px 14px rgba(0,0,0,0.03)`;

  // ── Outer shadow (gel slab sitting on surface) ──
  // The shadow suggests the card has physical thickness — like a gel cube on a table.
  const outerShadow = hover
    ? isDark
      ? `0 8px 28px hsla(${hue}, 55%, 40%, 0.4),
         0 2px 6px rgba(0,0,0,0.45),
         0 16px 48px hsla(${hue}, 50%, 35%, 0.18),
         0 1px 0 hsla(${hue}, 50%, 55%, 0.15)`
      : `0 8px 28px hsla(${hue}, 45%, 60%, 0.25),
         0 2px 6px rgba(0,0,0,0.06),
         0 16px 48px hsla(${hue}, 40%, 65%, 0.12),
         0 1px 0 rgba(255,255,255,0.5)`
    : isDark
      ? `0 4px 14px rgba(0,0,0,0.35),
         0 1px 3px rgba(0,0,0,0.25),
         0 1px 0 hsla(${hue}, 40%, 50%, 0.1)`
      : `0 4px 14px rgba(0,0,0,0.06),
         0 1px 3px rgba(0,0,0,0.03),
         0 1px 0 rgba(255,255,255,0.4)`;

  // ── Border (gel edge refraction line) ──
  // Slightly colored, semi-transparent — like light refracting at the gel boundary.
  const borderTopColor = isDark
    ? `hsla(${hue}, 55%, 65%, ${hover ? 0.45 : 0.25})`
    : `hsla(${hue}, 45%, 82%, ${hover ? 0.7 : 0.45})`;
  const borderBottomColor = isDark
    ? `hsla(${hue}, 40%, 30%, ${hover ? 0.5 : 0.3})`
    : `hsla(${hue}, 30%, 60%, ${hover ? 0.35 : 0.2})`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      style={{
        borderRadius,
        transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
        transition: prefersReducedMotion
          ? "none"
          : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease, border-color 0.4s ease",
        willChange: "transform",
        boxShadow: `${innerShadow}, ${outerShadow}`,
        borderStyle: 'solid',
        borderTopWidth: '1.5px',
        borderLeftWidth: '1.5px',
        borderRightWidth: '1.5px',
        borderBottomWidth: '2px',
        borderTopColor: borderTopColor,
        borderLeftColor: borderTopColor,
        borderRightColor: borderBottomColor,
        borderBottomColor: borderBottomColor,
        ...style,
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      {...rest}
    >
      {/* L1: Gel body — base translucent color + blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          backgroundColor: gelBody,
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* L2: Edge thickness — opaque borders, clear center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          background: edgeThickness,
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* L3: Top surface sheen (wet gel highlight) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          background: topSheen,
          zIndex: 2,
        }}
        aria-hidden="true"
      />

      {/* L4: Specular blob (follows pointer) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
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
          borderRadius,
          background: causticShimmer,
          zIndex: 4,
          opacity: hover ? 0.9 : 0.5,
          transition: "opacity 0.5s ease",
        }}
        aria-hidden="true"
      />

      {/* L6: Corner glow (diagonal refraction) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          background: cornerGlow,
          zIndex: 5,
        }}
        aria-hidden="true"
      />

      {/* Content — above all material layers */}
      <div
        className="relative z-10"
        style={{
          textShadow: isDark ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const JellyMaterialCard = memo(JellyMaterialCardInner);
