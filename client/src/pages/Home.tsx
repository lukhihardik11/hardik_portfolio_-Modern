/**
 * Home.tsx — Full portfolio page composition.
 * 
 * Anti-AI-made: Asymmetric section spacing — each section has intentionally
 * different vertical rhythm to avoid the "computed" feel of uniform padding.
 * Alternating backgrounds use subtle tonal shifts, not identical patterns.
 */
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { EducationSection } from "@/components/EducationSection";
import { ContactSection, Footer } from "@/components/ContactSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { useJellyMode } from "@/contexts/JellyModeContext";

export default function Home() {
  const { jellyMode } = useJellyMode();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      <main>
      {/* Hero — no padding, self-contained */}
      <div className="scroll-mt-20">
        <HeroSection />
      </div>

      {/* About — generous top breathing room, tighter bottom */}
      <section
        id="about"
        className={`scroll-mt-20 pt-24 pb-16 lg:pt-36 lg:pb-20 ${
          jellyMode ? "bg-foreground/[0.015]" : "bg-muted/20"
        }`}
      >
        <div className="container">
          <AboutSection />
        </div>
      </section>

      {/* Experience — asymmetric: more top, less bottom */}
      <section id="experience" className="scroll-mt-20 pt-20 pb-14 lg:pt-28 lg:pb-18">
        <div className="container">
          <ExperienceSection />
        </div>
      </section>

      {/* Philosophy — cinematic interlude, self-contained */}
      <PhilosophySection />

      {/* Projects — horizontal scroll, self-contained (pinned full viewport on desktop) */}
      <div id="projects" className="scroll-mt-20">
        <ProjectsSection />
      </div>

      {/* Skills — tighter rhythm, alt background */}
      <section
        id="skills"
        className={`scroll-mt-20 pt-18 pb-20 lg:pt-24 lg:pb-28 ${
          jellyMode ? "bg-foreground/[0.015]" : "bg-muted/20"
        }`}
      >
        <div className="container">
          <SkillsSection />
        </div>
      </section>

      {/* Education — generous breathing */}
      <section id="education" className="scroll-mt-20 pt-22 pb-16 lg:pt-30 lg:pb-22">
        <div className="container">
          <EducationSection />
        </div>
      </section>

      {/* Contact — alt background, generous */}
      <section
        id="contact"
        className={`scroll-mt-20 pt-24 pb-20 lg:pt-32 lg:pb-28 ${
          jellyMode ? "bg-foreground/[0.015]" : "bg-muted/20"
        }`}
      >
        <div className="container">
          <ContactSection />
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
