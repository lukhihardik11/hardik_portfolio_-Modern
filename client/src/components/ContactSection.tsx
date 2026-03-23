import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Phone, MapPin, Linkedin, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CONTACT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/contact-bg-Yo788DwhD5SbxAaMPkyhT2.webp";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${CONTACT_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-background/80" />

      <div className="container relative z-10">
        <div data-reveal className="flex items-center gap-4 mb-16">
          <span className="section-number">07</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Contact</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
              Let's build something together.
            </h2>
            <p data-reveal className="text-muted-foreground leading-relaxed max-w-md mb-10">
              Whether you're looking for an engineering leader, a project manager, or a technical collaborator — I'm always open to discussing new opportunities.
            </p>

            <div data-reveal className="space-y-6">
              <a href="mailto:lukhihardik11@gmail.com" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-[oklch(0.55_0.08_230)] transition-colors">
                  <Mail size={18} className="text-[oklch(0.55_0.08_230)]" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Email</div>
                  <div className="text-sm text-foreground group-hover:text-[oklch(0.55_0.08_230)] transition-colors">lukhihardik11@gmail.com</div>
                </div>
              </a>

              <a href="tel:+13612285831" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-[oklch(0.55_0.08_230)] transition-colors">
                  <Phone size={18} className="text-[oklch(0.55_0.08_230)]" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Phone</div>
                  <div className="text-sm text-foreground group-hover:text-[oklch(0.55_0.08_230)] transition-colors">361-228-5831</div>
                </div>
              </a>

              <a href="https://linkedin.com/in/hardiklukhi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-[oklch(0.55_0.08_230)] transition-colors">
                  <Linkedin size={18} className="text-[oklch(0.55_0.08_230)]" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">LinkedIn</div>
                  <div className="text-sm text-foreground group-hover:text-[oklch(0.55_0.08_230)] transition-colors flex items-center gap-1">
                    linkedin.com/in/hardiklukhi <ExternalLink size={12} />
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                  <MapPin size={18} className="text-[oklch(0.55_0.08_230)]" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Location</div>
                  <div className="text-sm text-foreground">Ridgefield Park, NJ</div>
                </div>
              </div>
            </div>
          </div>

          <div data-reveal className="flex items-center">
            <div className="w-full p-8 lg:p-12 rounded-lg bg-card border border-border">
              <h3 className="font-display text-2xl text-foreground mb-4">Open to opportunities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                I'm currently exploring new roles in hardware engineering leadership, program management, and technical operations. If you have an interesting challenge, let's talk.
              </p>
              <a
                href="mailto:lukhihardik11@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.55_0.08_230)] text-white font-body text-sm font-medium rounded-lg hover:bg-[oklch(0.50_0.09_230)] transition-all duration-300"
              >
                <Mail size={16} />
                Send an Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
