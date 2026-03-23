/*
 * Navbar — "Quiet Authority" design
 * Minimal, transparent, with theme + jelly toggles.
 * Backdrop blur on scroll. Instrument Serif wordmark.
 */
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useJellyMode } from "@/contexts/JellyModeContext";
import { Sun, Moon, Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { jellyOn, toggleJelly } = useJellyMode();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 lg:h-20">
        {/* Wordmark */}
        <a
          href="#"
          className="font-display text-xl lg:text-2xl text-foreground tracking-tight hover:text-[oklch(0.55_0.08_230)] transition-colors duration-300"
        >
          Hardik Lukhi
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-border" />

          {/* Jelly toggle */}
          <button
            onClick={toggleJelly}
            className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-all duration-300 ${
              jellyOn
                ? "border-[oklch(0.55_0.08_230)] text-[oklch(0.55_0.08_230)] bg-[oklch(0.55_0.08_230_/_8%)]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            }`}
            title={jellyOn ? "Jelly ON — expressive mode" : "Jelly OFF — subtle premium"}
          >
            Jelly {jellyOn ? "ON" : "OFF"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-300"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex items-center gap-4">
              <button
                onClick={toggleJelly}
                className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  jellyOn
                    ? "border-[oklch(0.55_0.08_230)] text-[oklch(0.55_0.08_230)]"
                    : "border-border text-muted-foreground"
                }`}
              >
                Jelly {jellyOn ? "ON" : "OFF"}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
