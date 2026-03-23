/*
 * Footer — Minimal, functional
 * Design: Kinetic Restraint — no decoration without purpose
 */
export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-foreground">HL</span>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Hardik Lukhi
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="mailto:hardiklukhi@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            hardiklukhi@gmail.com
          </a>
          <span className="hidden sm:inline">·</span>
          <a
            href="https://linkedin.com/in/hardiklukhi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
