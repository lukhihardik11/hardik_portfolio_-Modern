/**
 * JellyToggle — Minimal frosted-glass toggle that matches the navbar aesthetic.
 *
 * Design: Same border-radius, backdrop-blur, and color tokens as the navbar.
 * The knob uses CSS spring animation for a satisfying wobble on toggle.
 * No WebGPU/Canvas — pure CSS + React for consistency and performance.
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Droplet } from "lucide-react";

export default function JellyToggle() {
  const { jellyMode, toggleJellyMode } = useJellyMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleClick = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsAnimating(true);
    toggleJellyMode();
    // Let the wobble animation play out
    timeoutRef.current = setTimeout(() => setIsAnimating(false), 600);
  }, [toggleJellyMode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-300 border outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/70"
      style={{
        background: jellyMode
          ? isDark
            ? "rgba(60, 140, 130, 0.15)"
            : "rgba(60, 180, 170, 0.12)"
          : isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)",
        borderColor: jellyMode
          ? isDark
            ? "rgba(100, 220, 210, 0.3)"
            : "rgba(60, 180, 170, 0.25)"
          : isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      aria-label={jellyMode ? "Disable jelly mode" : "Enable jelly mode"}
      aria-pressed={jellyMode}
      title={jellyMode ? "Jelly Mode: ON" : "Jelly Mode: OFF"}
    >
      {/* Droplet icon */}
      <Droplet
        className="transition-all duration-300"
        style={{
          width: 14,
          height: 14,
          color: jellyMode
            ? isDark
              ? "rgb(100, 220, 210)"
              : "rgb(50, 160, 150)"
            : isDark
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(0, 0, 0, 0.35)",
          fill: jellyMode
            ? isDark
              ? "rgba(100, 220, 210, 0.25)"
              : "rgba(50, 160, 150, 0.2)"
            : "transparent",
        }}
      />

      {/* Track */}
      <div
        className="relative rounded-full transition-all duration-300"
        style={{
          width: 32,
          height: 18,
          background: jellyMode
            ? isDark
              ? "rgba(100, 220, 210, 0.25)"
              : "rgba(60, 180, 170, 0.2)"
            : isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.08)",
          border: `1px solid ${
            jellyMode
              ? isDark
                ? "rgba(100, 220, 210, 0.35)"
                : "rgba(60, 180, 170, 0.3)"
              : isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)"
          }`,
          boxShadow: jellyMode
            ? isDark
              ? "inset 0 1px 3px rgba(100, 220, 210, 0.15)"
              : "inset 0 1px 3px rgba(60, 180, 170, 0.12)"
            : "inset 0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {/* Knob */}
        <div
          className="absolute top-[2px] rounded-full transition-all"
          style={{
            width: 12,
            height: 12,
            left: jellyMode ? 16 : 2,
            background: jellyMode
              ? isDark
                ? "rgb(100, 220, 210)"
                : "rgb(50, 160, 150)"
              : isDark
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(0, 0, 0, 0.25)",
            boxShadow: jellyMode
              ? isDark
                ? "0 0 8px rgba(100, 220, 210, 0.5), 0 1px 3px rgba(0,0,0,0.2)"
                : "0 0 8px rgba(50, 160, 150, 0.4), 0 1px 3px rgba(0,0,0,0.1)"
              : "0 1px 3px rgba(0,0,0,0.15)",
            transitionDuration: prefersReducedMotion ? "150ms" : "400ms",
            transitionTimingFunction: prefersReducedMotion
              ? "ease"
              : "cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy spring curve
            // Wobble animation on toggle
            ...(isAnimating && !prefersReducedMotion
              ? {
                  animation: "jelly-knob-wobble 0.5s ease-out",
                }
              : {}),
          }}
        />
      </div>

      {/* Label text */}
      <span
        className="text-[10px] font-medium tracking-tight transition-colors duration-300 hidden sm:block"
        style={{
          color: jellyMode
            ? isDark
              ? "rgb(100, 220, 210)"
              : "rgb(50, 160, 150)"
            : isDark
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(0, 0, 0, 0.35)",
        }}
      >
        {jellyMode ? "Jelly" : "Flat"}
      </span>

      {/* Wobble keyframe animation */}
      <style>{`
        @keyframes jelly-knob-wobble {
          0% { transform: scale(1, 1); }
          15% { transform: scale(1.25, 0.75); }
          30% { transform: scale(0.85, 1.15); }
          45% { transform: scale(1.12, 0.88); }
          60% { transform: scale(0.95, 1.05); }
          75% { transform: scale(1.04, 0.96); }
          100% { transform: scale(1, 1); }
        }
      `}</style>
    </button>
  );
}
