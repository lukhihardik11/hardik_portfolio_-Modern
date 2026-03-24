/**
 * JellyWrapper — Wraps any element with real spring-physics jelly behavior.
 *
 * Key behaviors (FULL PATH — desktop with fine pointer):
 *   1. REACTIVE RE-TRIGGER: Every tap/click re-fires the wobble, even mid-wobble.
 *   2. PRESS-DURATION INTENSITY: Longer hold = bigger squash.
 *   3. CONTINUOUS REACTION: Sliding finger/mouse across boxes triggers wobble on each.
 *   4. Spring physics with overshoot — like real gelatin.
 *
 * LIGHTER PATH (touch / coarse-pointer devices):
 *   - No continuous RAF spring loop (eliminates scroll lag)
 *   - Entrance animations preserved (whileInView bounce-in)
 *   - Simple whileTap scale for tap feedback
 *   - No drag-across impulse, no hover wobble
 */
import { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useJellyMode } from '@/contexts/JellyModeContext';
import { useFineHover } from '@/hooks/useFineHover';

/* ─── Spring simulation ─── */
class Spring {
  value = 0;
  target = 0;
  velocity = 0;
  constructor(public stiffness: number, public damping: number, public mass: number) {}
  update(dt: number) {
    const F = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
    this.velocity += (F / this.mass) * dt;
    this.value += this.velocity * dt;
  }
  atRest() {
    return Math.abs(this.value - this.target) < 0.001 && Math.abs(this.velocity) < 0.01;
  }
}

type JellyIntensity = 'soft' | 'medium' | 'bouncy';

interface JellyWrapperProps {
  children: ReactNode;
  intensity?: JellyIntensity;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'span' | 'li' | 'section' | 'article';
  noEntrance?: boolean;
  hoverScale?: number;
  tapSquash?: number;
}

const SPRING_CONFIGS: Record<JellyIntensity, { stiffness: number; damping: number; mass: number }> = {
  soft:   { stiffness: 400, damping: 14, mass: 0.5 },
  medium: { stiffness: 600, damping: 10, mass: 0.4 },
  bouncy: { stiffness: 900, damping: 7,  mass: 0.3 },
};

const ENTRANCE_SPRING = { stiffness: 400, damping: 16, mass: 0.6 };

export function JellyWrapper({
  children,
  intensity = 'medium',
  className = '',
  style,
  as = 'div',
  noEntrance = false,
  hoverScale = 1.03,
  tapSquash = 0.15,
}: JellyWrapperProps) {
  const { jellyMode } = useJellyMode();
  const fineHover = useFineHover();
  const elRef = useRef<HTMLDivElement>(null);
  const springCfg = SPRING_CONFIGS[intensity];

  const sxRef = useRef(new Spring(springCfg.stiffness, springCfg.damping, springCfg.mass));
  const syRef = useRef(new Spring(springCfg.stiffness, springCfg.damping, springCfg.mass));
  const rotRef = useRef(new Spring(springCfg.stiffness * 0.8, springCfg.damping * 1.2, springCfg.mass));
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const pressStartRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isPressedRef = useRef(false);

  useEffect(() => {
    const cfg = SPRING_CONFIGS[intensity];
    for (const s of [sxRef.current, syRef.current]) {
      s.stiffness = cfg.stiffness;
      s.damping = cfg.damping;
      s.mass = cfg.mass;
    }
    rotRef.current.stiffness = cfg.stiffness * 0.8;
    rotRef.current.damping = cfg.damping * 1.2;
    rotRef.current.mass = cfg.mass;
  }, [intensity]);

  /* ── Animation loop (FULL PATH only) ── */
  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTRef.current) * 0.001, 0.05);
    lastTRef.current = now;

    const sx = sxRef.current;
    const sy = syRef.current;
    const rot = rotRef.current;

    if (isPressedRef.current) {
      const holdTime = (now - pressStartRef.current) * 0.001;
      const holdFactor = Math.min(holdTime / 1.5, 1);
      const squashAmount = tapSquash * (0.4 + holdFactor * 1.6);
      sx.target = squashAmount;
      sy.target = -squashAmount * 0.8;
    }

    sx.update(dt);
    sy.update(dt);
    rot.update(dt);

    const el = elRef.current;
    if (el) {
      const baseScale = isHoveredRef.current && !isPressedRef.current ? hoverScale : 1;
      el.style.transform = `scale(${baseScale + sx.value}, ${baseScale + sy.value}) rotate(${rot.value}deg)`;
    }

    if (!sx.atRest() || !sy.atRest() || !rot.atRest() || isPressedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
      if (el) el.style.transform = '';
    }
  }, [hoverScale, tapSquash]);

  const startLoop = useCallback(() => {
    if (rafRef.current === 0) {
      lastTRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  /* ── Event handlers (FULL PATH only) ── */
  const handlePointerDown = useCallback(() => {
    isPressedRef.current = true;
    pressStartRef.current = performance.now();
    sxRef.current.velocity += (Math.random() - 0.3) * 4;
    syRef.current.velocity += (Math.random() - 0.7) * 4;
    rotRef.current.velocity += (Math.random() - 0.5) * 18;
    sxRef.current.target = tapSquash * 0.4;
    syRef.current.target = -tapSquash * 0.3;
    startLoop();
  }, [tapSquash, startLoop]);

  const handlePointerUp = useCallback(() => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    const holdTime = (performance.now() - pressStartRef.current) * 0.001;
    const holdFactor = Math.min(holdTime / 1.5, 1);
    const releaseForce = 2 + holdFactor * 8;
    sxRef.current.target = 0;
    syRef.current.target = 0;
    rotRef.current.target = 0;
    sxRef.current.velocity -= releaseForce * (0.5 + Math.random() * 0.5);
    syRef.current.velocity += releaseForce * (0.4 + Math.random() * 0.4);
    rotRef.current.velocity += (Math.random() - 0.5) * releaseForce * 3;
    startLoop();
  }, [startLoop]);

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    isHoveredRef.current = true;
    const isDragging = e.buttons > 0;
    if (isDragging) {
      sxRef.current.velocity += (Math.random() - 0.3) * 5;
      syRef.current.velocity += (Math.random() - 0.7) * 5;
      rotRef.current.velocity += (Math.random() - 0.5) * 20;
      sxRef.current.target = tapSquash * 0.3;
      syRef.current.target = -tapSquash * 0.25;
      setTimeout(() => {
        sxRef.current.target = 0;
        syRef.current.target = 0;
        rotRef.current.target = 0;
      }, 80);
    } else {
      sxRef.current.velocity += 1.8;
      syRef.current.velocity -= 1.2;
      rotRef.current.velocity += (Math.random() - 0.5) * 8;
    }
    startLoop();
  }, [startLoop, tapSquash]);

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false;
    isPressedRef.current = false;
    sxRef.current.target = 0;
    syRef.current.target = 0;
    rotRef.current.target = 0;
    startLoop();
  }, [startLoop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons > 0 && !isPressedRef.current) {
      isPressedRef.current = true;
      pressStartRef.current = performance.now();
      sxRef.current.velocity += 3;
      syRef.current.velocity -= 3;
      rotRef.current.velocity += (Math.random() - 0.5) * 12;
      startLoop();
    }
  }, [startLoop]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ── Jelly OFF: plain element ── */
  if (!jellyMode) {
    const Tag = as;
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  const MotionTag = motion[as] as any;

  const entranceVariants: Variants = noEntrance
    ? {}
    : {
        hidden: { opacity: 0, scale: 0.85, y: 20 },
        visible: {
          opacity: 1, scale: 1, y: 0,
          transition: { ...ENTRANCE_SPRING, opacity: { duration: 0.3 } },
        },
      };

  /* ── LIGHTER PATH: touch / coarse-pointer devices ── */
  if (!fineHover) {
    return (
      <MotionTag
        className={className}
        style={{ ...style, touchAction: 'manipulation' }}
        variants={noEntrance ? undefined : entranceVariants}
        initial={noEntrance ? undefined : 'hidden'}
        whileInView={noEntrance ? undefined : 'visible'}
        viewport={noEntrance ? undefined : { once: true, margin: '-50px' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {children}
      </MotionTag>
    );
  }

  /* ── FULL PATH: desktop with fine pointer ── */
  return (
    <MotionTag
      ref={elRef}
      className={className}
      style={{ ...style, willChange: 'transform', touchAction: 'manipulation' }}
      variants={noEntrance ? undefined : entranceVariants}
      initial={noEntrance ? undefined : 'hidden'}
      whileInView={noEntrance ? undefined : 'visible'}
      viewport={noEntrance ? undefined : { once: true, margin: '-50px' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {children}
    </MotionTag>
  );
}

/**
 * JellyText — Makes text elements wobble like jelly on hover.
 * FULL PATH: whileHover multi-axis scale wobble.
 * LIGHTER PATH: no hover effect (prevents sticky wobble on touch).
 */
interface JellyTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function JellyText({ children, className = '', as = 'span' }: JellyTextProps) {
  const { jellyMode } = useJellyMode();
  const fineHover = useFineHover();

  if (!jellyMode) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as any;

  return (
    <MotionTag
      className={className}
      whileHover={fineHover ? {
        scaleX: [1, 1.02, 0.98, 1.01, 1],
        scaleY: [1, 0.98, 1.02, 0.99, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      } : undefined}
    >
      {children}
    </MotionTag>
  );
}

/**
 * JellyButton — A button with full jelly physics.
 * FULL PATH: Continuous RAF spring loop, hold-duration squash, release force wobble.
 * LIGHTER PATH: Simple whileTap scale, no continuous spring simulation.
 */
interface JellyButtonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  download?: string;
}

export function JellyButton({
  children,
  className = '',
  style,
  onClick,
  href,
  target,
  rel,
  disabled,
  download,
}: JellyButtonProps) {
  const { jellyMode } = useJellyMode();
  const fineHover = useFineHover();
  const elRef = useRef<HTMLElement>(null);
  const sxRef = useRef(new Spring(800, 8, 0.3));
  const syRef = useRef(new Spring(800, 8, 0.3));
  const rotRef = useRef(new Spring(600, 10, 0.3));
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const pressStartRef = useRef(0);
  const isPressedRef = useRef(false);

  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTRef.current) * 0.001, 0.05);
    lastTRef.current = now;
    const sx = sxRef.current;
    const sy = syRef.current;
    const rot = rotRef.current;
    if (isPressedRef.current) {
      const holdTime = (now - pressStartRef.current) * 0.001;
      const holdFactor = Math.min(holdTime / 1.0, 1);
      sx.target = 0.08 + holdFactor * 0.15;
      sy.target = -(0.06 + holdFactor * 0.12);
    }
    sx.update(dt);
    sy.update(dt);
    rot.update(dt);
    const el = elRef.current;
    if (el) {
      el.style.transform = `scale(${1 + sx.value}, ${1 + sy.value}) rotate(${rot.value}deg)`;
    }
    if (!sx.atRest() || !sy.atRest() || !rot.atRest() || isPressedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
      if (el) el.style.transform = '';
    }
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current === 0) {
      lastTRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const handlePointerDown = useCallback(() => {
    isPressedRef.current = true;
    pressStartRef.current = performance.now();
    sxRef.current.velocity += 2;
    syRef.current.velocity -= 2;
    rotRef.current.velocity += (Math.random() - 0.5) * 12;
    startLoop();
  }, [startLoop]);

  const handlePointerUp = useCallback(() => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    const holdTime = (performance.now() - pressStartRef.current) * 0.001;
    const force = 3 + Math.min(holdTime / 1.0, 1) * 6;
    sxRef.current.target = 0;
    syRef.current.target = 0;
    rotRef.current.target = 0;
    sxRef.current.velocity -= force;
    syRef.current.velocity += force * 0.8;
    rotRef.current.velocity += (Math.random() - 0.5) * force * 3;
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ── Jelly OFF: plain element ── */
  if (!jellyMode) {
    if (href) {
      return (
        <a href={href} target={target} rel={rel} download={download} className={className} style={style}>
          {children}
        </a>
      );
    }
    return (
      <button onClick={onClick} disabled={disabled} className={className} style={style}>
        {children}
      </button>
    );
  }

  const Tag = href ? motion.a : motion.button;
  const props = href
    ? { href, target, rel, download }
    : { onClick, disabled };

  /* ── LIGHTER PATH: touch / coarse-pointer devices ── */
  if (!fineHover) {
    return (
      <Tag
        {...props}
        className={className}
        style={style}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {children}
      </Tag>
    );
  }

  /* ── FULL PATH: desktop with fine pointer ── */
  return (
    <Tag
      {...props}
      ref={elRef as any}
      className={className}
      style={{ ...style, willChange: 'transform' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseLeave={() => {
        isPressedRef.current = false;
        sxRef.current.target = 0;
        syRef.current.target = 0;
        rotRef.current.target = 0;
        startLoop();
      }}
      whileHover={{
        scale: 1.05,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
      }}
    >
      {children}
    </Tag>
  );
}
