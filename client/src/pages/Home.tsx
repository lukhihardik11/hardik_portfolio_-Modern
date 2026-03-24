/**
 * Home.tsx — Full portfolio page composition.
 * All sections with SignalDividers and PhilosophySection.
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
import { PhilosophySection } from "@/components/PhilosophySection";
import { SignalDivider } from "@/components/SignalDivider";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      <Section id="hero" jellyBg>
        <HeroSection />
      </Section>

      <SignalDivider />

      <Section id="about" className="bg-muted/40" jellyBg>
        <AboutSection />
      </Section>

      <SignalDivider />

      <Section id="experience" jellyBg>
        <ExperienceSection />
      </Section>

      <SignalDivider />

      <PhilosophySection />

      <SignalDivider />

      <Section id="projects" className="bg-muted/40" jellyBg>
        <ProjectsSection />
      </Section>

      <SignalDivider />

      <Section id="skills" jellyBg>
        <SkillsSection />
      </Section>

      <SignalDivider />

      <Section id="education" className="bg-muted/40" jellyBg>
        <EducationSection />
      </Section>

      <SignalDivider />

      <Section id="contact" jellyBg>
        <ContactSection />
      </Section>

      <Footer />
    </div>
  );
}
