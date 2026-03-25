# Project Summary

This document provides a complete feature summary, project catalog, and asset inventory for the Modern portfolio.

---

## 1. Feature Overview

### Jelly Material Design System

The defining feature of the Modern portfolio is the **Jelly Material Design System**, a custom physics-based interaction layer built from scratch. Unlike the original portfolio's Framer Motion springs, the Modern version implements a dedicated 825-line spring-mass-damper engine (`JellyMaterialCard.tsx`) with five independent physics channels per card.

The system operates in two modes controlled by a navbar toggle:

| Mode | Behavior |
|------|----------|
| **Jelly ON (Default)** | Every card becomes a translucent gel cube with tilt, wobble, scale, and depth spring dynamics. Specular highlights shift with deformation. Edges brighten under compression. Idle wobble creates a breathing effect. |
| **Jelly OFF** | Cards use subtle hover transitions with border and shadow. No physics simulation runs. Clean, professional aesthetic. |

The spring engine runs at 60 fps via `requestAnimationFrame` and applies value clamping to prevent runaway rotation (15 degrees tilt, 12 degrees wiggle). Impulses are applied on hover enter, hover move, click press, click release, and scroll-into-view. The idle wobble system applies micro-impulses only when springs are near rest, preventing accumulation.

### Scroll-Driven Exploded Views

The signature interaction of the portfolio. Instead of static images or standard videos, engineering projects are presented as interactive teardowns.

- Powered by GSAP `ScrollTrigger` and HTML `<canvas>`.
- Scrubs through 30-60 pre-rendered `.webp` frames per project based on scroll position.
- Features staggered, timeline-driven label reveals with animated connector lines pointing to specific hardware components.
- All frames hosted on CloudFront CDN (no local frame storage).

### GSAP Animation System

Six reusable animation components (734 lines total) provide a unified motion layer:

| Component | Purpose |
|-----------|---------|
| `TextReveal` | Splits headings into characters/words/lines with staggered scroll-triggered entrance |
| `ScrollReveal` | Generic fade-and-slide entrance animation with configurable direction and stagger |
| `SectionWipe` | Cinematic clip-path transitions between sections (inset, circle, diagonal modes) |
| `Magnetic` | Elements subtly follow cursor within bounds, snap back with elastic easing |
| `CustomCursor` | Physics-smoothed dot-and-ring cursor replacement (desktop only) |
| `AnimationProvider` | Context provider detecting touch devices and reduced-motion preference |

### Adaptive Performance

Performance is strictly gated based on device capabilities:

- **Desktop + Mouse:** Full jelly physics, RAF spring loops, hover wobble, specular highlights.
- **Touch Devices:** Heavy RAF physics disabled, simple scale feedback, no sticky hover effects.
- **Spline 3D:** Viewport-gated (768px minimum) and timeout-gated. Mobile devices skip the 5.6 MB download entirely.
- **Reduced Motion:** All scroll-triggered animations replaced with instant visibility changes.

---

## 2. Homepage Sections

| Section | Component | Lines | Description |
|---------|-----------|-------|-------------|
| **Hero** | `HeroSection.tsx` | 545 | Full-viewport introduction with name, title, company affiliation, and three CTAs (Say Hello, View Work, Resume). Includes optional Spline 3D scene on desktop. |
| **About** | `AboutSection.tsx` | 183 | Narrative bio with four metric cards: 1,900+ Fleet Units Fixed, 400+ Devices Analyzed, 20+ Custom Test Fixtures, 6 Product Generations. |
| **Experience** | `ExperienceSection.tsx` | 245 | Professional timeline with GSAP DrawSVG-animated connector lines. Three roles at Meta and Stryker. |
| **Projects** | `ProjectsSection.tsx` | 294 | Horizontal scroll gallery with six project cards linking to dedicated detail pages. |
| **Skills** | `SkillsSection.tsx` | 212 | Four categorized skill groups with animated progress bars: Engineering & Design, Quality & Compliance, Software & Tools, Leadership & Process. |
| **Education** | `EducationSection.tsx` | 198 | Three degree cards: M.S. IT (Texas A&M), M.S. Mechanical (Cumberlands), B.E. Mechanical (Gujarat Tech). |
| **Contact** | `ContactSection.tsx` | 189 | Four contact cards (Say Hello CTA, Email, LinkedIn, Phone) with direct mailto/tel links. |

---

## 3. Engineering Project Catalog

The portfolio details 6 engineering projects. Data is centralized in `client/src/data/projects.ts`.

### Professional Projects (Meta Platforms)

1. **EMG Failure Analysis — FPC Design (`fpc`)**
   - **Category:** Failure Analysis
   - **Description:** Root cause analysis and material improvement for a flexible printed circuit (FPC) experiencing delamination in the EMG wearable program.
   - **Key Skills:** Failure Analysis, FPC Design, Material Science, Cross-functional Leadership.

2. **CT Scanning & Inspection (`ct-scan`)**
   - **Category:** Test Engineering
   - **Description:** Industrial CT scanning workflow for non-destructive inspection of wearable device assemblies, identifying internal defects and assembly issues.
   - **Key Skills:** CT Scanning, Non-Destructive Testing, Quality Engineering.

3. **Custom Test Fixture Design (`fixtures`)**
   - **Category:** Fixture Design
   - **Description:** Design and fabrication of high-precision custom test fixtures for EMG sensor verification and PCB validation during the manufacturing process.
   - **Key Skills:** SolidWorks, Tolerance Analysis, DFM, Pogo Pin Design.

4. **Factory Test Automation (`automation`)**
   - **Category:** Automation
   - **Description:** End-of-line functional test automation integrating mechanical actuation, electrical validation, and software-driven test sequences.
   - **Key Skills:** System Integration, Automation, LabVIEW, Python.

5. **CM Transfer & NPI (`cm-transfer`)**
   - **Category:** Program Management
   - **Description:** Contract manufacturer transfer and new product introduction program management, coordinating cross-functional teams across mechanical, electrical, and firmware engineering.
   - **Key Skills:** Program Management, NPI, Supply Chain, Cross-functional Leadership.

6. **Statistical Process Control (`spc`)**
   - **Category:** Quality Engineering
   - **Description:** Implementation of SPC methodologies for manufacturing process monitoring, capability analysis, and continuous improvement.
   - **Key Skills:** SPC, Six Sigma, Data Analysis, Process Improvement.

---

## 4. Key Metrics

| Metric | Value |
|--------|-------|
| Total source lines | 18,276 |
| Section components | 7 |
| Project detail pages | 6 |
| Custom hooks | 6 |
| Animation components | 6 |
| Jelly physics engine | 825 lines |
| Exploded view renderer | 616 lines |
| CDN-hosted frame sequences | 6 projects, 30-60 frames each |
| shadcn/ui primitives | 40+ |
| DOM Content Loaded | ~300ms |
| QA tests passing | 69/69 |

---

## 5. Asset Inventory

### CDN-Hosted Assets (CloudFront)

All media assets are hosted on CloudFront CDN. There is no local frame storage in this repository.

| Asset Type | Count | Format | Location |
|-----------|-------|--------|----------|
| Animation frames | ~300 total | WebP | CloudFront CDN (URLs in `frameUrlsIndex.ts`) |
| Hero background | 1 | PNG | CloudFront CDN |
| Generated section images | 4 | PNG | CloudFront CDN |
| Resume PDF | 1 | PDF | CloudFront CDN |

### Local Assets

| Asset | Location | Description |
|-------|----------|-------------|
| `favicon.ico` | `client/public/` | H monogram favicon (32x32 PNG in ICO container) |
| `favicon.svg` | `client/public/` | SVG favicon with steel blue gradient |

### External Dependencies

| Dependency | URL | Fallback |
|-----------|-----|----------|
| Spline 3D Scene | `prod.spline.design` | Static gradient after timeout |
| Google Fonts | `fonts.googleapis.com` | System font stack (DM Sans → system-ui) |
