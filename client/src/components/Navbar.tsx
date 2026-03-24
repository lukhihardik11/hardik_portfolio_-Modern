/**
 * Navbar — Premium navigation with jelly material integration.
 * 
 * Features:
 *   - JellyToggle anchor component (WebGPU/Canvas2D/CSS 3-tier)
 *   - Jelly CSS classes: jelly-navbar, jelly-nav-link, jelly-logo-badge
 *   - Magnetic hover on nav links (desktop)
 *   - Active section tracking via IntersectionObserver
 *   - First-visit tooltip for jelly mode
 */
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Sun, Moon, Menu, X, Droplet } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { Magnetic } from "@/components/animation/Magnetic";

const JellyToggle = lazy(() => import("@/components/anchors/JellyToggle"));

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const TOOLTIP_KEY = "jelly-tooltip-dismissed";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { jellyMode } = useJellyMode();

  // First-visit tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(TOOLTIP_KEY);
      if (!dismissed) {
        const timer = setTimeout(() => setShowTooltip(true), 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
        try { localStorage.setItem(TOOLTIP_KEY, "true"); } catch { /* ignore */ }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const dismissTooltip = useCallback(() => {
    setShowTooltip(false);
    try { localStorage.setItem(TOOLTIP_KEY, "true"); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const nav = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          scrolled ? "py-2" : "py-3"
        }`}
        style={{ transitionDuration: "var(--duration-slow)" }}
      >
        <div className="container">
          <nav
            className={`flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl transition-all ${
              scrolled
                ? jellyMode
                  ? "jelly-navbar"
                  : "bg-background/80 backdrop-blur-lg border border-border shadow-[var(--shadow-md)]"
                : ""
            }`}
            style={{ transitionDuration: "var(--duration-slow)" }}
          >
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 no-underline shrink-0"
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-primary-foreground text-[10px] sm:text-xs font-bold ${
                jellyMode ? "jelly-logo-badge" : "bg-primary"
              }`}>
                HL
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight hidden sm:block">
                Hardik Lukhi
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <Magnetic key={link.href} strength={0.15}>
                    <button
                      onClick={() => nav(link.href)}
                      className={`jelly-nav-link px-3.5 py-1.5 text-xs font-semibold rounded-full border-none outline-none transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                      }`}
                      style={{ transitionDuration: "var(--duration-fast)" }}
                    >
                      {link.label}
                    </button>
                  </Magnetic>
                );
              })}
            </div>

            {/* Right side: jelly toggle + theme toggle + hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Jelly mode toggle — premium anchor component */}
              <div className="relative flex items-center" onClick={dismissTooltip}>
                <Suspense
                  fallback={
                    <button
                      className="p-2 rounded-full text-muted-foreground no-jelly"
                      aria-label="Loading jelly toggle"
                    >
                      <Droplet className="w-4 h-4" />
                    </button>
                  }
                >
                  <JellyToggle />
                </Suspense>

                {/* First-visit tooltip — subtle, non-blocking, auto-dismisses */}
                {showTooltip && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-foreground/90 text-background text-[10px] font-medium whitespace-nowrap pointer-events-auto cursor-pointer z-50"
                    onClick={dismissTooltip}
                    role="tooltip"
                  >
                    Try Jelly Mode
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/90 rotate-45" />
                  </div>
                )}
              </div>

              {/* Theme toggle — standard icon button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors border border-transparent hover:border-border no-jelly"
                style={{ transitionDuration: "var(--duration-fast)" }}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-foreground hover:bg-foreground/[0.04] no-jelly"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={`fixed inset-0 z-40 lg:hidden ${
          jellyMode ? "jelly-mobile-overlay" : "bg-background/95 backdrop-blur-lg"
        }`}>
          <div className="flex flex-col items-center justify-center h-full gap-5">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => nav(link.href)}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer border-none outline-none bg-transparent"
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
