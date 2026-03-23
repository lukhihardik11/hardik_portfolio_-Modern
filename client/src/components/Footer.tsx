export default function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-mono text-xs tracking-wider text-muted-foreground">
          &copy; {new Date().getFullYear()} Hardik Lukhi. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="https://linkedin.com/in/hardiklukhi" target="_blank" rel="noopener noreferrer" className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            LinkedIn
          </a>
          <a href="mailto:lukhihardik11@gmail.com" className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
