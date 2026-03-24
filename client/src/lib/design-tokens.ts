/**
 * Design Tokens — Phase 1A Foundation
 *
 * TypeScript export of design token values for programmatic use in components.
 * Mirrors the CSS custom properties in index.css for type-safe access.
 * Does not define new values — only provides typed references.
 */

/** Spacing scale (8px grid base) */
export const spacing = {
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
  32: "8rem",     // 128px
} as const;

/** Shadow levels (CSS custom property names) */
export const shadows = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
} as const;

/** Motion durations (CSS custom property names) */
export const durations = {
  fast: "var(--duration-fast)",     // 150ms
  normal: "var(--duration-normal)", // 300ms
  slow: "var(--duration-slow)",     // 500ms
} as const;

/** Typography tracking values (reference-faithful) */
export const tracking = {
  hero: "-0.03em",
  section: "-0.025em",
  tight: "-0.015em",
  normal: "0",
  wide: "0.01em",
  mono: "0.2em",
} as const;

/** Section IDs for navigation */
export const sectionIds = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "education",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];
