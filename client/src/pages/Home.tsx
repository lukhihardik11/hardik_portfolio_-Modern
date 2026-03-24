/**
 * Home.tsx — Phase 1B Content + Phase 1C Polish + Phase 2A Jelly Atmosphere
 *
 * Real authored content in all sections. Strengthened alternating backgrounds.
 * CSS-only section dividers for visual rhythm.
 * Phase 2A: jellyBg prop on alternating sections for caustic overlay in jelly mode.
 * No Framer Motion, no GSAP, no Spline, no WebGPU.
 */
import { Navbar } from "@/components/Navbar";
import { Section } from "@/components/Section";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { EducationSection } from "@/components/EducationSection";
import { ContactSection, Footer } from "@/components/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      <Section id="hero" divider jellyBg>
        <HeroSection />
      </Section>

      <Section id="about" className="bg-muted/40" divider jellyBg>
        <AboutSection />
      </Section>

      <Section id="experience" divider jellyBg>
        <ExperienceSection />
      </Section>

      <Section id="projects" className="bg-muted/40" divider jellyBg>
        <ProjectsSection />
      </Section>

      <Section id="skills" divider jellyBg>
        <SkillsSection />
      </Section>

      <Section id="education" className="bg-muted/40" divider jellyBg>
        <EducationSection />
      </Section>

      <Section id="contact" jellyBg>
        <ContactSection />
      </Section>

      <Footer />
    </div>
  );
}
