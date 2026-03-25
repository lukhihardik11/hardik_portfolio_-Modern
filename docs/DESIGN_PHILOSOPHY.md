# Design Philosophy

This document describes the design movement, color philosophy, typography system, layout paradigm, and interaction principles that govern every visual decision in the Modern portfolio.

---

## 1. Design Movement: Precision Brutalism Meets Material Realism

The portfolio draws from two seemingly opposing traditions. **Precision Brutalism** provides the structural backbone — asymmetric layouts, intentionally varied section spacing, raw typographic hierarchy, and a refusal to default to centered, uniform grids. **Material Realism** provides the interaction layer — every animated surface simulates real physical behavior with spring-mass-damper physics, specular highlights, and edge brightening.

The tension between these two movements is intentional. The brutalist structure communicates engineering rigor and technical confidence, while the material realism communicates craft and attention to detail. Together, they produce a portfolio that feels "hand-built" rather than "template-assembled."

### Anti-AI-Made Principles

The design deliberately avoids patterns commonly associated with AI-generated websites:

- **No centered everything.** Sections use asymmetric layouts with intentionally different vertical rhythm.
- **No purple gradients.** The palette is warm pearl and steel teal — grounded in industrial design, not tech startup aesthetics.
- **No uniform rounded corners.** The jelly cards use organic, asymmetric border radii (`1.5rem 1.1rem 1.35rem 1.05rem`).
- **No Inter font.** Typography uses DM Sans (geometric humanist), Instrument Serif (editorial display), and JetBrains Mono (engineering monospace).

---

## 2. Color Philosophy

The color system is built on **OKLCH** (Oklab Lightness, Chroma, Hue) — a perceptually uniform color space that ensures consistent contrast ratios across the entire palette. Colors are defined as CSS custom properties in `index.css` and consumed through Tailwind's semantic classes.

### Light Mode: Warm Pearl

The light theme evokes the clean, warm environment of a well-lit engineering lab. The background is not pure white but a warm pearl with a subtle yellow undertone, reducing eye strain during extended reading.

| Token | OKLCH Value | Purpose |
|-------|-------------|---------|
| Background | `oklch(0.97 0.005 80)` | Warm pearl — not clinical white |
| Foreground | `oklch(0.25 0.01 260)` | Deep slate — high contrast without harshness |
| Primary | `oklch(0.55 0.12 220)` | Steel teal — industrial, trustworthy |
| Accent | `oklch(0.70 0.14 75)` | Warm amber — draws attention without alarm |
| Muted | `oklch(0.92 0.005 80)` | Subtle pearl — card backgrounds, secondary surfaces |
| Border | `oklch(0.88 0.01 80)` | Soft boundary — present but not dominant |

### Dark Mode: Deep Charcoal

The dark theme is not pure black. It uses a deep charcoal with a cool blue undertone that provides depth without the "void" feeling of `#000`. The primary teal brightens slightly to maintain contrast.

| Token | OKLCH Value | Purpose |
|-------|-------------|---------|
| Background | `oklch(0.15 0.01 260)` | Deep charcoal — warm enough to avoid void |
| Foreground | `oklch(0.93 0.005 80)` | Pearl white — soft, not blinding |
| Primary | `oklch(0.65 0.14 220)` | Bright teal — maintains contrast in dark context |
| Accent | `oklch(0.75 0.14 75)` | Amber — slightly brighter for dark backgrounds |

### Emotional Intent

The palette communicates **industrial precision with human warmth**. Steel teal references the metallic surfaces of the hardware Hardik works with daily. Warm amber references the amber indicators on test equipment. The pearl background references the clean rooms where wearable devices are assembled.

---

## 3. Typography System

Typography is the primary tool for establishing visual hierarchy. The system uses three fonts, each serving a distinct role.

### Font Stack

| Font | Role | Weight Range | Source |
|------|------|-------------|--------|
| **DM Sans** | Body text, navigation, labels, metrics | 400–700 | Google Fonts CDN |
| **Instrument Serif** | Display headings, hero title, section titles | 400 (regular italic) | Google Fonts CDN |
| **JetBrains Mono** | Code snippets, technical labels, monospace microcopy | 400–500 | Google Fonts CDN |

### Hierarchy Rules

The typography hierarchy uses **negative tracking** (letter-spacing) as a key differentiator between heading levels. Larger headings use tighter tracking to create visual density, while body text uses normal tracking for readability.

| Level | Font | Size | Tracking | Usage |
|-------|------|------|----------|-------|
| Hero | Instrument Serif | 4.5rem–6rem | `-0.03em` | Main hero heading only |
| Section Title | Instrument Serif | 2.5rem–3.5rem | `-0.025em` | Section headings (About, Experience, etc.) |
| Card Title | DM Sans 600 | 1.25rem–1.5rem | `-0.015em` | Card headings, project titles |
| Body | DM Sans 400 | 1rem | `0` | Paragraphs, descriptions |
| Label | DM Sans 500 | 0.875rem | `0.01em` | Navigation items, tags, metadata |
| Mono | JetBrains Mono 400 | 0.75rem–0.875rem | `0.2em` | Technical labels, eyebrow text |

### Why Not Inter?

Inter is the default font for most AI-generated and template-based websites. Using DM Sans instead provides a similar geometric clarity but with a warmer, more humanist character. The slightly rounded terminals of DM Sans complement the organic border radii of the jelly cards. Instrument Serif provides editorial gravitas that Inter's companion serif fonts lack.

---

## 4. Layout Paradigm

### Asymmetric Section Spacing

Each section has intentionally different vertical padding to avoid the "computed" feel of uniform spacing. This is documented in the `Home.tsx` file header:

| Section | Top Padding | Bottom Padding | Rationale |
|---------|------------|----------------|-----------|
| Hero | 0 | 0 | Full viewport, no padding |
| About | 5rem | 7rem | Generous breathing room after hero |
| Experience | 5rem | 5rem | Standard — timeline needs vertical space |
| Projects | 5rem | 7rem | Extra bottom for horizontal scroll clearance |
| Skills | 5rem | 5rem | Standard |
| Education | 5rem | 7rem | Extra bottom before contact |
| Contact | 5rem | 5rem | Standard — footer follows |

### Container Strategy

The `Section` component provides a consistent container with `max-width` and responsive horizontal padding. Content within sections uses CSS Grid and Flexbox for layout, never relying on absolute positioning for primary content flow.

### Organic Border Radii

The jelly cards use asymmetric border radii (`1.5rem 1.1rem 1.35rem 1.05rem`) instead of uniform `rounded-xl`. This creates a subtle organic quality that distinguishes the cards from standard UI components and reinforces the "hand-crafted" aesthetic.

---

## 5. Interaction Principles

### Material Realism

Every interaction simulates real physical behavior. The spring-mass-damper model uses three parameters per channel:

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| **Stiffness** | How quickly the spring returns to rest | 80–200 |
| **Damping** | How quickly oscillation decays | 8–15 |
| **Mass** | Inertia — heavier objects respond slower | 0.8–1.2 |

When a user hovers over a jelly card, the tilt channels receive an impulse proportional to the cursor position relative to the card center. When the user clicks, the scale channel compresses (squash) and the depth channel pushes forward. On release, the springs overshoot and oscillate back to rest, producing a satisfying bounce.

### Specular Highlights

The jelly cards include a specular highlight layer — a radial gradient overlay that shifts position based on the current tilt angle. When the card tilts left, the highlight moves right (simulating a fixed light source above). This creates the illusion of a translucent material catching light as it deforms.

### Edge Brightening

Under compression (click/press), the card's box-shadow intensity increases on the edges closest to the viewer, simulating the way translucent materials brighten at their edges when compressed. This is a subtle effect but contributes significantly to the perception of physical depth.

### Idle Wobble

Cards at rest exhibit a subtle breathing effect — micro-impulses applied at random intervals to the tilt and wiggle channels. The impulses are only applied when spring velocity is below a threshold, preventing accumulation that could cause flipping. The wobble interval and magnitude are randomized per card to avoid synchronized motion across the grid.

### Value Clamping

All spring channels are clamped to safe ranges to prevent runaway rotation:

| Channel | Min | Max | Purpose |
|---------|-----|-----|---------|
| Tilt X | -15° | +15° | Prevents vertical flipping |
| Tilt Y | -15° | +15° | Prevents horizontal flipping |
| Wiggle (Z) | -12° | +12° | Prevents upside-down text |
| Scale | 0.85 | 1.15 | Prevents extreme squash/stretch |

---

## 6. Motion Design

### Entrance Animations

All section content uses scroll-triggered entrance animations via `ScrollReveal` and `TextReveal`. The animation philosophy follows three rules:

1. **Direction matches reading flow.** Elements enter from below (the direction the user is scrolling toward).
2. **Stagger creates narrative.** Child elements within a section stagger their entrance by 50-100ms, creating a cascading reveal that guides the eye.
3. **Duration is short.** Entrance animations complete in 300-500ms. Longer durations feel sluggish and interrupt reading flow.

### Page Transitions

Route changes trigger a `PageTransition` overlay — a colored panel that slides in from the right, covers the viewport, then slides out to reveal the new page. The transition takes 600ms total and uses GSAP's `power2.inOut` easing for a smooth, cinematic feel.

### Scroll Progress

A thin progress bar at the top of the viewport fills from left to right as the user scrolls. It uses the primary teal color and provides a constant visual indicator of position within the page.

---

## 7. Accessibility Commitments

The design system makes the following accessibility commitments:

- **Pinch-to-zoom enabled.** The viewport meta tag does not restrict `maximum-scale`, allowing users to zoom freely.
- **Main landmark.** All content is wrapped in a `<main>` element for screen reader navigation.
- **Keyboard navigation.** Jelly cards with click handlers have `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers for Enter and Space keys.
- **Reduced motion.** The `AnimationProvider` checks `prefers-reduced-motion` and disables all scroll-triggered animations when active.
- **Color contrast.** All text-background combinations meet WCAG AA contrast ratios. The OKLCH color space makes it straightforward to verify perceptual contrast.
- **Semantic HTML.** Sections use `<section>` elements with `id` attributes. Navigation uses `<nav>`. Headings follow a logical hierarchy (`h1` → `h2` → `h3`).
