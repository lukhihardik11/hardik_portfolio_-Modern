/*
 * ProjectPage — Individual project detail page with scroll-driven exploded view animation.
 * Uses GSAP for scroll-driven animations. Framer-motion used only for AnimatePresence lightbox.
 */

import { useParams, Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  FileText,
  Presentation,
  ZoomIn,
} from "lucide-react";
import { getProjectById } from "@/data/projects";
import { getFrameUrls } from "@/data/frameUrlsIndex";
import ProjectExplodedView from "@/components/ProjectExplodedView";
import { useTheme } from "@/contexts/ThemeContext";
import gsap from "gsap";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id ?? "";
  const project = getProjectById(projectId);
  const frameUrls = getFrameUrls(projectId);
  const { theme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The project you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm no-underline hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed back button */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium no-underline rounded-xl bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
      </div>

      {/* Scroll-driven exploded view animation */}
      {project.hasAnimation && frameUrls.length > 0 && (
        <ProjectExplodedView
          frameUrls={frameUrls}
          labels={project.labels}
          accentColor={project.accentColor}
          title={project.title}
          subtitle={project.category}
          disclaimer={project.disclaimer}
          contentCropX={project.contentCropX}
          animBgColor={project.animBgColor}
          fitMode={project.fitMode}
        />
      )}

      {/* Gallery hero for non-animated projects */}
      {!project.hasAnimation &&
        project.projectGallery &&
        project.projectGallery.length > 0 && (
          <ProjectGalleryHero
            images={project.projectGallery}
            title={project.title}
            category={project.category}
            accentColor={project.accentColor}
          />
        )}

      {/* Project details section */}
      <section className="relative py-24 md:py-32">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Category badge */}
          <FadeInView delay={0}>
            <span
              className="glass-pill inline-block px-3 py-1 text-[10px] font-mono tracking-wider uppercase mb-6"
              style={{ color: project.accentColor }}
            >
              {project.category}
            </span>
          </FadeInView>

          {/* Title */}
          <FadeInView delay={0.1}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {project.title}
            </h1>
          </FadeInView>

          {/* Subtitle */}
          <FadeInView delay={0.2}>
            <p className="text-lg text-muted-foreground mb-12">
              {project.subtitle}
            </p>
          </FadeInView>

          {/* Stats row */}
          <FadeInView delay={0.3}>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16 p-4 sm:p-6 rounded-2xl"
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                border: `1px solid ${
                  theme === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)"
                }`,
              }}
            >
              {project.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-2xl md:text-3xl font-bold font-mono"
                    style={{ color: project.accentColor }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInView>

          {/* Long description */}
          <FadeInView delay={0.4}>
            <div className="mb-16">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {project.longDescription}
              </p>
            </div>
          </FadeInView>

          {/* Download links */}
          {project.downloadLinks && project.downloadLinks.length > 0 && (
            <FadeInView delay={0.45}>
              <div className="mb-16">
                <h3 className="text-lg font-semibold mb-4">Downloads</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.downloadLinks.map((dl, i) => (
                    <a
                      key={i}
                      href={dl.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl no-underline transition-all hover:scale-[1.02]"
                      style={{
                        background:
                          theme === "dark"
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                        border: `1px solid ${
                          theme === "dark"
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.06)"
                        }`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${project.accentColor}15`,
                          color: project.accentColor,
                        }}
                      >
                        {dl.fileType === "PDF" ? (
                          <FileText size={20} />
                        ) : (
                          <Presentation size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {dl.label}
                        </div>
                        <div className="text-xs text-muted-foreground/60">
                          {dl.fileType} · {dl.fileSize}
                        </div>
                      </div>
                      <Download
                        size={16}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </FadeInView>
          )}

          {/* Project gallery */}
          {project.projectGallery && project.projectGallery.length > 0 && (
            <ProjectInlineGallery
              images={project.projectGallery}
              accentColor={project.accentColor}
              theme={theme}
            />
          )}

          {/* Component breakdown */}
          <FadeInView delay={0.5}>
            <div className="mb-16">
              <h3 className="text-lg font-semibold mb-6">
                Component Breakdown
              </h3>
              <div className="space-y-3">
                {project.labels.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl transition-colors"
                    style={{
                      background:
                        theme === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.015)",
                      border: `1px solid ${
                        theme === "dark"
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.04)"
                      }`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: project.accentColor,
                        boxShadow: `0 0 8px ${project.accentColor}40`,
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium">{label.name}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">
                        {label.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Tags */}
          <FadeInView delay={0.6}>
            <div className="mb-16">
              <h3 className="text-lg font-semibold mb-4">
                Technologies & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="glass-pill px-3 py-1.5 text-xs font-mono cursor-default"
                    style={{ color: `${project.accentColor}cc` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Back to portfolio */}
          <FadeInView delay={0.7}>
            <div
              className="pt-8 border-t"
              style={{
                borderColor:
                  theme === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
              }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm no-underline rounded-xl bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft size={14} />
                Back to all projects
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
}

/** Simple GSAP-based fade-in-view component using IntersectionObserver */
function FadeInView({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 20 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay,
              ease: "power2.out",
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    // Safety timeout
    const timer = setTimeout(() => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.3 });
    }, 2000 + delay * 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}

/** Gallery hero section for non-animated projects */
function ProjectGalleryHero({
  images,
  title,
  category,
  accentColor,
}: {
  images: { url: string; caption: string }[];
  title: string;
  category: string;
  accentColor: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () =>
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <>
      <section className="relative min-h-screen flex flex-col">
        <div className="relative flex-1 min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].url}
              alt={images[currentIndex].caption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-contain bg-black/90 cursor-pointer"
              onClick={() => {
                setLightboxIndex(currentIndex);
                setLightboxOpen(true);
              }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <p
              className="text-[10px] font-mono tracking-[0.25em] uppercase mb-2"
              style={{ color: accentColor }}
            >
              {category}
            </p>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h1>
            <p className="text-xs text-white/60">
              {images[currentIndex].caption}
            </p>
          </div>

          <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    i === currentIndex ? accentColor : "rgba(255,255,255,0.3)",
                  transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="bg-black/95 border-t border-white/5 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 transition-all"
                style={{
                  border:
                    i === currentIndex
                      ? `2px solid ${accentColor}`
                      : "2px solid transparent",
                  opacity: i === currentIndex ? 1 : 0.5,
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <Lightbox
        images={images}
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        accentColor={accentColor}
      />
    </>
  );
}

/** Inline project gallery */
function ProjectInlineGallery({
  images,
  accentColor,
  theme,
}: {
  images: { url: string; caption: string }[];
  accentColor: string;
  theme: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <>
      <FadeInView delay={0.5}>
        <div className="mb-16">
          <h3 className="text-lg font-semibold mb-6">Project Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.02)",
                  border: `1px solid ${
                    theme === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                }}
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn
                    size={24}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeInView>

      <Lightbox
        images={images}
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        accentColor={accentColor}
      />
    </>
  );
}

/** Shared lightbox component */
function Lightbox({
  images,
  isOpen,
  currentIndex,
  onClose,
  onIndexChange,
  accentColor,
}: {
  images: { url: string; caption: string }[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  accentColor: string;
}) {
  const next = () => onIndexChange((currentIndex + 1) % images.length);
  const prev = () =>
    onIndexChange((currentIndex - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].caption}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 max-w-lg text-center px-4">
            {images[currentIndex].caption}
          </p>

          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onIndexChange(i);
                }}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    i === currentIndex
                      ? accentColor
                      : "rgba(255,255,255,0.3)",
                  transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
