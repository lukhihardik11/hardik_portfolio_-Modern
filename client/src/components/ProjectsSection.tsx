/**
 * ProjectsSection — Responsive card grid with JellyWrapper spring physics.
 * GSAP: staggered card entrance on scroll.
 * Cards link to individual project detail pages.
 */
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { projects } from "@/data/projects";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { JellyWrapper } from "@/components/JellyWrapper";

export function ProjectsSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>({ stagger: 0.06 });

  return (
    <div ref={sectionRef}>
      {/* Section header */}
      <div className="mb-14" data-reveal>
        <p className="section-label-accent text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Projects</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-xl">Engineering that pushes boundaries</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
          A selection of hardware engineering, test fixture, and research projects.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="no-underline"
          >
            <JellyWrapper
              intensity="medium"
              className="jelly-card bg-card text-card-foreground rounded-xl border border-border dark:border-border/50 p-6 flex flex-col card-polished group cursor-pointer h-full"
            >
              {/* Accent color indicator */}
              <div
                className="w-8 h-1 rounded-full mb-4 relative z-[2]"
                style={{ backgroundColor: project.accentColor }}
              />

              {/* Category */}
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-2 relative z-[2]">
                {project.category}
              </span>

              {/* Title */}
              <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug relative z-[2]">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1 relative z-[2]">
                {project.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 py-3 border-t border-border/60 relative z-[2]">
                {project.stats.map((stat, i) => (
                  <div key={stat.label} className={`text-center flex-1 ${i > 0 ? "border-l border-border/40 pl-4" : ""}`}>
                    <p className="text-xs font-bold text-foreground">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 relative z-[2]">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="jelly-tag text-[9px] font-medium px-2 py-0.5 rounded-md bg-primary/5 text-primary/70 border border-primary/10">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="jelly-tag text-[9px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground/50">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all relative z-[2]">
                <span>Explore</span>
                <ArrowUpRight size={12} />
              </div>
            </JellyWrapper>
          </Link>
        ))}
      </div>
    </div>
  );
}
