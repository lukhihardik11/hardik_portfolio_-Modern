/*
 * PHILOSOPHY — GSAP word-by-word reveal + framer-motion scroll-reactive wobble
 * Framer-motion justified here: scroll-linked spring transforms (skew, scaleX, scaleY)
 * require continuous spring interpolation that GSAP ScrollTrigger scrub cannot replicate.
 */
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0.97, 1, 1, 0.97]);
  const y = useTransform(scrollYProgress, [0.15, 0.35], [30, 0]);

  /* Scroll-reactive wobble — reduced */
  const sectionSkew = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.6, -0.3, 0, 0.3, -0.4]);
  const sectionSX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [1.004, 0.998, 1, 1.003, 0.997]);
  const sectionSY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.996, 1.002, 1, 0.997, 1.003]);
  const springSkew = useSpring(sectionSkew, { stiffness: 80, damping: 15 });
  const springSX = useSpring(sectionSX, { stiffness: 80, damping: 15 });
  const springSY = useSpring(sectionSY, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote) return;

    const words = quote.querySelectorAll('.gsap-word');
    if (words.length === 0) return;

    gsap.fromTo(
      words,
      { opacity: 0.15, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: quote,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.3,
        },
      }
    );

    if (subRef.current) {
      gsap.fromTo(
        subRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: subRef.current,
            start: 'top 85%',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === quote || st.trigger === subRef.current) st.kill();
      });
    };
  }, []);

  const mainQuote = "Great hardware isn't just designed —";
  const subQuote = "it's validated, iterated, and perfected.";

  return (
    <motion.section
      ref={ref}
      style={{ skewX: springSkew, scaleX: springSX, scaleY: springSY }}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] jelly-float-blob-1"
          style={{
            background: 'radial-gradient(ellipse, oklch(0.55 0.18 230 / 5%) 0%, transparent 60%)',
            borderRadius: '40% 60% 70% 30% / 50% 40% 60% 50%',
          }}
        />
      </div>

      <motion.div
        style={{ opacity, scale, y }}
        className="container relative z-10"
      >
        <div className="max-w-3xl mx-auto text-center">
          {/* Divider above */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-12 jelly-divider" />
            <div className="w-2 h-2 jelly-dot jelly-dot-teal" />
            <div className="w-12 jelly-divider" />
          </div>

          {/* Quote — GSAP word-by-word reveal */}
          <h2
            ref={quoteRef}
            className="jelly-section-title leading-relaxed tracking-[-0.01em] cursor-default"
            style={{ fontWeight: 500 }}
          >
            {mainQuote.split(' ').map((word, i) => (
              <span key={i} className="gsap-word inline-block mr-[0.3em]" style={{ opacity: 0.15 }}>
                {word}
              </span>
            ))}{' '}
            <span className="text-foreground/40">
              {subQuote.split(' ').map((word, i) => (
                <span key={`sub-${i}`} className="gsap-word inline-block mr-[0.3em]" style={{ opacity: 0.15 }}>
                  {word}
                </span>
              ))}
            </span>
          </h2>

          <p
            ref={subRef}
            className="text-sm text-muted-foreground/50 mt-8 max-w-md mx-auto leading-relaxed"
          >
            Every test fixture, every failure analysis, every process optimization
            is a step toward building devices that people can trust with their lives.
          </p>

          {/* Attribution */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="w-8 jelly-divider" />
            <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
              Hardik Lukhi
            </span>
            <div className="w-8 jelly-divider" />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
