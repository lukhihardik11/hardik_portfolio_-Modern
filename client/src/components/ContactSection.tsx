/**
 * ContactSection + Footer — Contact cards, primary CTA, and footer.
 * GSAP: staggered reveal on scroll.
 * Jelly-card on contact cards, jelly-btn on primary CTA (inert in standard mode).
 */
import { Mail, Linkedin, Phone, ArrowUpRight, ChevronUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const contactLinks = [
  { label: "Email", value: "lukhihardik11@gmail.com", href: "mailto:lukhihardik11@gmail.com", Icon: Mail },
  { label: "LinkedIn", value: "linkedin.com/in/hardiklukhi", href: "https://linkedin.com/in/hardiklukhi", Icon: Linkedin },
  { label: "Phone", value: "361-228-5831", href: "tel:+13612285831", Icon: Phone },
];

export function ContactSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="text-center mb-16" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 justify-center">Contact</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
          {"Let\u2019s build something extraordinary"}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Open to discussing hardware engineering roles, project management opportunities,
          and collaborative work in wearable technology and medical devices.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="flex justify-center mb-14" data-reveal>
        <a
          href="mailto:lukhihardik11@gmail.com"
          className="jelly-btn jelly-btn-teal btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
        >
          <Mail size={16} />
          Say Hello
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            data-reveal
            className="jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-5 text-center group no-underline card-polished"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative z-[2]">
              <link.Icon size={16} />
            </div>
            <div className="text-xs font-semibold text-foreground mb-0.5 relative z-[2]">{link.label}</div>
            <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-1 relative z-[2]">
              {link.value}
              <ArrowUpRight size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-8 relative">
      <div className="footer-separator mb-8" />
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground/35">
            &copy; {new Date().getFullYear()} Hardik Lukhi
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/20 tracking-wider">
            Designed &amp; engineered with precision
          </span>
          <div className="flex items-center gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-foreground/60 transition-colors duration-200 no-underline"
                aria-label={link.label}
              >
                <link.Icon size={13} />
              </a>
            ))}
            <button
              onClick={scrollToTop}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-foreground/60 transition-colors duration-200 bg-transparent border-none ml-1 no-jelly"
              aria-label="Back to top"
            >
              <ChevronUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
