/**
 * Section — Phase 1A Foundation + Phase 1C Polish + Phase 2A Jelly Atmosphere
 *
 * Reusable section wrapper providing consistent vertical padding,
 * container width, scroll-margin-top for anchor navigation,
 * optional CSS-only gradient divider, and optional jelly section background.
 * Phase 2A: adds jelly-section-bg class (inert in standard mode, caustic overlay in jelly mode).
 * No WebGPU, no canvas, no TypeGPU.
 */
interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  divider?: boolean;
  jellyBg?: boolean;
}

export function Section({ id, className = "", children, divider = false, jellyBg = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-20 md:py-28 scroll-mt-20 relative ${divider ? "section-divider" : ""} ${jellyBg ? "jelly-section-bg" : ""} ${className}`}
    >
      <div className="container relative z-[1]">
        {children}
      </div>
    </section>
  );
}
