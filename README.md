# Hardik Lukhi — Modern Portfolio

A high-performance, physics-driven portfolio website for **Hardik Lukhi**, a Hardware Engineer and Project Manager with 8+ years of experience at Meta, Stryker, Abbott, Terumo, and J Group Robotics. The site showcases engineering projects through **scroll-driven exploded-view animations** and a custom **spring-physics Jelly Mode** — a signature feature where every card, button, and surface behaves like a translucent gel cube responding to hover, click, and scroll with physically accurate spring dynamics.

> This is the **Modern** rebuild of the original [hardik-portfolio](https://github.com/lukhihardik11/hardik-portfolio) repository. It uses React 19, Tailwind CSS 4, a custom 825-line spring physics engine (replacing Framer Motion springs), CDN-hosted frame sequences (replacing local frames), and Jelly Mode enabled by default.

---

## Table of Contents

1. [Live Demo](#live-demo)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Design Philosophy](#design-philosophy)
7. [Documentation Index](#documentation-index)
8. [Scripts Reference](#scripts-reference)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)
11. [Handoff Guide](#handoff-guide)
12. [License](#license)

---

## Live Demo

The portfolio is a private project. Contact the repository owner for access to the live deployment.

---

## Key Features

### Scroll-Driven Exploded Views

The portfolio's signature interaction is a GSAP ScrollTrigger-powered canvas flipbook. Each engineering project has 30-60 pre-rendered `.webp` frames hosted on CloudFront CDN. As the user scrolls, the canvas scrubs through frames, creating a smooth disassembly animation with staggered label reveals, connector lines, and glassmorphism info cards.

### Jelly Design System

A custom two-mode design system controlled by a unified toggle in the navbar:

| Mode | Behavior |
|------|----------|
| **Jelly ON (Default)** | Highly expressive, physics-based UI with a custom 825-line spring engine. Translucent gel cubes with five-channel spring dynamics (tiltX, tiltY, wiggle, scale, depth), specular highlights, edge brightening, and idle wobble breathing. |
| **Jelly OFF** | Subtle, premium glassmorphism aesthetic with calm hover transitions. Clean and professional. |

The Jelly system is built on a **custom spring-mass-damper solver** running at 60 fps via `requestAnimationFrame`. Unlike the original portfolio's Framer Motion springs, this implementation provides per-card independent physics with value clamping to prevent runaway rotation. No WebGL or WebGPU dependency — it runs on all modern browsers using GPU-composited CSS transforms.

### Adaptive Device Performance

Performance is strictly gated based on device capabilities using the `useFineHover` hook, which evaluates `(hover: hover) and (pointer: fine)`:

| Device | Behavior |
|--------|----------|
| **Desktop + Mouse** | Full jelly physics, RAF spring loops, hover wobble, drag-across impulse, specular highlights |
| **Touch Devices (iPad, iPhone, Android)** | Heavy RAF physics disabled, simple scale feedback, no sticky hover effects |

### Interactive 3D Hero

The hero section features a Spline 3D interactive scene (desktop only), with a configurable timeout and graceful fallback to a static gradient. Mobile devices skip the 5.6 MB Spline download entirely via the `useSplineGating` hook.

### Dual Theme System

Light/dark theme with manual toggle. Light mode uses a warm pearl palette; dark mode uses deep charcoal. Theme preference persists in `localStorage` with flash-prevention via an inline script in `index.html` that applies the stored class before React mounts.

### Six Engineering Projects

The portfolio showcases 6 engineering projects spanning failure analysis, test engineering, fixture design, automation, and quality:

| ID | Project | Category |
|----|---------|----------|
| `fpc` | EMG Failure Analysis — FPC Design | Failure Analysis |
| `ct-scan` | CT Scanning & Inspection | Test Engineering |
| `fixtures` | Custom Test Fixture Design | Fixture Design |
| `automation` | Factory Test Automation | Automation |
| `cm-transfer` | CM Transfer & NPI | Program Management |
| `spc` | Statistical Process Control | Quality Engineering |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework (upgraded from React 18 in original) |
| TypeScript | Type safety across the entire codebase |
| Vite 6 | Build tool and dev server with HMR |
| Tailwind CSS 4 | Utility-first styling with OKLCH color tokens |
| GSAP 3.14 + ScrollTrigger + SplitText + DrawSVG | Scroll-driven animations, text reveals, timeline orchestration |
| Framer Motion 12 | AnimatePresence for lightbox transitions (physics moved to custom engine) |
| Spline | 3D interactive hero scene (desktop only) |
| wouter 3 | Lightweight client-side routing (3 KB vs React Router's 30 KB) |
| shadcn/ui + Radix | 40+ accessible UI primitives |
| Lucide React | Icon library |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| CloudFront CDN | Hosts all frame sequences, resume PDF, and generated images |
| pnpm | Package manager |
| Vite | Production bundling with code splitting and tree shaking |

> **Note:** This is a **static-only** project (no backend). The original `hardik-portfolio` included Express, tRPC, Drizzle ORM, and database integration. The Modern version serves all content statically with assets on CDN.

---

## Getting Started

### Prerequisites

- **Node.js** 22.x or later
- **pnpm** 9+ (recommended) or npm
- No database required — this is a fully static project

### Installation

```bash
# Clone the repository
gh repo clone lukhihardik11/hardik_portfolio_-Modern
cd hardik_portfolio_-Modern

# Install dependencies
pnpm install
```

### Development

```bash
# Start the dev server (Vite HMR)
pnpm run dev
```

The dev server starts on `http://localhost:3000` with hot module replacement enabled.

### Production Build

```bash
# Build the client (Vite)
pnpm run build
```

Output is written to `dist/public/`. The build is a fully static bundle — no server runtime required. Deploy to any static hosting provider.

---

## Project Structure

A high-level overview of the repository layout. For a detailed component-by-component breakdown, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
hardik_portfolio_-Modern/
├── client/                                 # Frontend application
│   ├── index.html                          # Entry HTML with flash-prevention scripts
│   ├── public/
│   │   ├── favicon.ico                     # H monogram favicon (32x32)
│   │   └── favicon.svg                     # SVG favicon with steel blue gradient
│   └── src/
│       ├── main.tsx                        # React entry point
│       ├── App.tsx                         # Provider stack + router
│       ├── index.css                       # Design tokens, theme variables, jelly CSS
│       ├── const.ts                        # Shared constants
│       │
│       ├── pages/
│       │   ├── Home.tsx                    # Full portfolio page composition
│       │   ├── ProjectPage.tsx             # Project detail with exploded view (668 lines)
│       │   └── NotFound.tsx                # 404 error page
│       │
│       ├── components/
│       │   ├── Navbar.tsx                  # Sticky nav with scroll-aware active state
│       │   ├── HeroSection.tsx             # Hero with Spline 3D + parallax (545 lines)
│       │   ├── AboutSection.tsx            # Metrics grid + bio narrative
│       │   ├── ExperienceSection.tsx       # Timeline with GSAP DrawSVG
│       │   ├── ProjectsSection.tsx         # Horizontal scroll project gallery
│       │   ├── SkillsSection.tsx           # Categorized skill bars
│       │   ├── EducationSection.tsx        # Degree cards with GPA
│       │   ├── ContactSection.tsx          # Contact cards + mailto/tel links
│       │   ├── PhilosophySection.tsx       # Engineering philosophy statement
│       │   ├── JellyMaterialCard.tsx       # Spring physics engine (825 lines)
│       │   ├── JellyWrapper.tsx            # Lightweight jelly hover wrapper
│       │   ├── JellyBackground.tsx         # Ambient jelly atmosphere layer
│       │   ├── ProjectExplodedView.tsx     # Scroll-scrubbed frame player (616 lines)
│       │   ├── ScrollProgress.tsx          # Top progress bar
│       │   ├── SignalDivider.tsx           # Animated horizontal divider
│       │   ├── Section.tsx                 # Reusable section wrapper
│       │   ├── PageTransition.tsx          # GSAP overlay slide transition
│       │   ├── ErrorBoundary.tsx           # React error boundary
│       │   │
│       │   ├── animation/                  # Animation system (734 lines total)
│       │   │   ├── AnimationProvider.tsx    # Touch/motion detection context
│       │   │   ├── CustomCursor.tsx         # Physics-smoothed cursor
│       │   │   ├── Magnetic.tsx             # Cursor-follow hover effect
│       │   │   ├── ScrollReveal.tsx         # Fade-and-slide on scroll
│       │   │   ├── SectionWipe.tsx          # Clip-path section transitions
│       │   │   ├── TextReveal.tsx           # SplitText character animation
│       │   │   └── index.ts                # Barrel export
│       │   │
│       │   ├── anchors/                    # WebGPU cross-section renderer (experimental)
│       │   │   └── lib/
│       │   │       ├── spring.ts           # Spring physics primitives
│       │   │       ├── crossSectionCPU.ts  # CPU fallback renderer
│       │   │       ├── gpu.ts              # WebGPU device initialization
│       │   │       ├── opticalFunctions.ts # Optical simulation helpers
│       │   │       ├── crossSectionShader.wgsl.ts
│       │   │       └── toggleShader.wgsl.ts
│       │   │
│       │   └── ui/                         # shadcn/ui component library (40+ primitives)
│       │
│       ├── contexts/
│       │   ├── ThemeContext.tsx             # Light/dark theme provider
│       │   └── JellyModeContext.tsx         # Jelly mode toggle provider
│       │
│       ├── data/
│       │   ├── projects.ts                 # Project metadata and labels
│       │   └── frameUrlsIndex.ts           # CDN frame URL registry
│       │
│       ├── hooks/
│       │   ├── useComposition.ts           # Composition tracking
│       │   ├── useFineHover.ts             # Precise hover / device detection
│       │   ├── useMobile.tsx               # Mobile breakpoint hook
│       │   ├── usePersistFn.ts             # Stable callback reference
│       │   ├── useScrollReveal.ts          # Scroll reveal trigger
│       │   └── useSplineGating.ts          # Spline load gating logic
│       │
│       └── lib/
│           ├── design-tokens.ts            # TypeScript design token exports
│           └── utils.ts                    # cn() utility (clsx + tailwind-merge)
│
├── server/                                 # Placeholder (static-only project)
├── shared/                                 # Shared constants
├── docs/                                   # Extended documentation
│   ├── PROJECT_SUMMARY.md                  # Feature summary and project catalog
│   ├── ARCHITECTURE.md                     # Component architecture and data flow
│   ├── DESIGN_PHILOSOPHY.md                # Design movement, color, typography
│   └── FUNCTIONS.md                        # Important functions and hooks reference
├── package.json                            # Dependencies and scripts
├── tsconfig.json                           # TypeScript configuration
└── vite.config.ts                          # Vite build configuration
```

---

## Design Philosophy

The portfolio is built around three core principles that dictate how components are written and how interactions are handled.

### 1. Material Realism Over Decoration

Every visual effect simulates real physical behavior. The Jelly Mode does not add arbitrary animations — it implements a **spring-mass-damper physics** simulation where stiffness, damping, and mass parameters control how elements tilt, wobble, and settle. The five-channel spring engine (tiltX, tiltY, wiggle, scale, depth) produces physically plausible deformation. Specular highlights shift with tilt angle, edges brighten under compression, and idle wobble creates a breathing effect. Value clamping (15 degrees tilt, 12 degrees wiggle) prevents runaway rotation while preserving expressiveness.

### 2. Progressive Enhancement

The site works beautifully with Jelly Mode off. Every feature degrades gracefully:

- **No Spline 3D?** Gradient fallback after timeout.
- **Touch device?** Lighter interaction path with no RAF loops.
- **Slow connection?** Frame loading shows progress percentage.
- **Reduced motion preference?** All scroll-triggered animations replaced with instant visibility.
- **No JavaScript?** HTML structure remains semantic and accessible.

### 3. Performance as a Feature

GPU compositing is not optional — it is the default. Every animated element uses `transform-style: preserve-3d` for layer promotion and CSS `transform` for compositor-only updates. The `useFineHover` hook gates expensive physics off touch devices. The Spline 3D scene is viewport-gated (desktop only) and timeout-gated. All frame sequences are hosted on CloudFront CDN with WebP compression, eliminating the need to bundle 1,700+ frames in the repository.

For a deeper exploration of the design system, component architecture, and interaction physics, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md).

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) | Complete feature summary, project catalog with descriptions, and key metrics |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Detailed component architecture, provider stack, data flow, and rendering pipeline |
| [docs/DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md) | Design movement, color philosophy, typography system, and interaction principles |
| [docs/FUNCTIONS.md](docs/FUNCTIONS.md) | Reference for all important functions, hooks, spring physics, and animation systems |

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm run dev` | Start development server with Vite HMR on port 3000 |
| `build` | `pnpm run build` | Production build (Vite client bundle to `dist/public/`) |
| `check` | `pnpm run check` | TypeScript type checking (no emit) |

---

## Environment Variables

This is a **static-only** project. No environment variables are required for local development or production builds. All content is baked into the client bundle at build time, and all media assets are referenced by CDN URL.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_TITLE` | No | Site title (defaults to "Hardik Lukhi") |
| `VITE_APP_LOGO` | No | Logo URL for branding |

---

## Deployment

### Production Build

```bash
pnpm run build
```

The output in `dist/public/` is a fully static bundle. No server runtime is needed.

### SPA Routing

If deploying to a static hosting provider (Vercel, Netlify, Cloudflare Pages), configure a rewrite rule to support client-side routing:

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Asset Considerations

All animation frames are hosted on **CloudFront CDN** — there is no local frame storage in this repository. The only external runtime dependency is the Spline 3D scene loaded from `prod.spline.design`, which has a graceful timeout fallback. The resume PDF and generated hero images are also CDN-hosted.

---

## Handoff Guide

This section documents the current state and provides guidance for continuing development in a new session.

### Current Completed State

The project has progressed through a complete rebuild and is **feature-complete and QA-verified**.

**Foundation:** Full portfolio site implemented with 7 sections (Hero, About, Experience, Projects, Skills, Education, Contact). Light/dark mode, scroll-driven animations, and GSAP-powered text reveals all functional.

**Jelly Mode (Signature Feature):** Custom 825-line spring physics engine (`JellyMaterialCard.tsx`) with five-channel simulation, value clamping, idle wobble, and specular highlights. Jelly Mode defaults to ON for new visitors. Flash prevention script in `index.html` applies stored state before React mounts.

**Exploded Views:** Six project detail pages with scroll-driven frame sequence animations. All frames hosted on CloudFront CDN. Annotation labels with configurable scroll thresholds.

**Animation System:** Six reusable GSAP components (TextReveal, ScrollReveal, SectionWipe, Magnetic, CustomCursor, AnimationProvider) with touch device and reduced-motion detection.

**Accessibility:** Pinch-to-zoom enabled, `<main>` landmark, keyboard-navigable jelly cards, proper `aria-label` attributes.

**QA Verified:** 69 automated tests passing. All nav links, project pages, mobile responsive, external links, and performance metrics verified.

### Key Files & Architecture

| File | Lines | Purpose |
|------|-------|---------|
| `JellyMaterialCard.tsx` | 825 | Custom spring physics engine — the core of Jelly Mode |
| `ProjectPage.tsx` | 668 | Project detail page with exploded view integration |
| `ProjectExplodedView.tsx` | 616 | GSAP ScrollTrigger frame sequence player |
| `HeroSection.tsx` | 545 | Hero with Spline 3D, parallax, and CTAs |
| `ProjectsSection.tsx` | 294 | Horizontal scroll project gallery |
| `ExperienceSection.tsx` | 245 | Professional timeline with DrawSVG |
| `Navbar.tsx` | 237 | Sticky nav with scroll-aware active state |
| `index.css` | ~600 | Design system tokens, theme variables, jelly CSS |
| `projects.ts` | ~300 | Central data store for all 6 projects |
| `frameUrlsIndex.ts` | ~400 | CDN frame URL registry |

### How to Continue Safely in a New Session

1. **Inspect First:** Read this README and the docs directory to understand the current state and constraints.
2. **Start from Latest:** Always start from the latest commit on the `main` branch.
3. **Verify Health:** Run `pnpm install` and `pnpm run dev` to ensure the project builds and runs. Check the browser console for unexpected errors.
4. **Respect the Physics:** The spring clamping values in `JellyMaterialCard.tsx` (15 degrees tilt, 12 degrees wiggle) were calibrated to prevent card flipping. Do not increase these without thorough testing.
5. **CDN Assets:** All frame sequences and media are on CloudFront. If adding new projects, upload frames via `manus-upload-file` and add URLs to `frameUrlsIndex.ts`.

### Repo Safety Rules

- **No Broad Redesigns:** The design system is finalized. Do not initiate new design phases without explicit user approval.
- **Verify Before Acting:** Always check the actual code and repository state before making changes.
- **Commit & Push:** Commit and push to GitHub after every approved change.
- **Keep it Private:** The repository must remain private unless deployment requires otherwise.

---

## Comparison with Original Portfolio

| Aspect | Original (`hardik-portfolio`) | Modern (`hardik_portfolio_-Modern`) |
|--------|-------------------------------|-------------------------------------|
| React | 18 | 19 |
| Tailwind | 4 | 4 (OKLCH tokens) |
| Jelly Physics | Framer Motion springs | Custom 825-line spring engine |
| Jelly Default | OFF | ON |
| Projects | 9 | 6 |
| Frame Storage | 1,727 local files | CDN-hosted WebP sequences |
| Backend | Express + tRPC + Drizzle | Static only (no backend) |
| Database | MySQL/TiDB via Drizzle | None |
| Animation System | Framer Motion + GSAP | Custom GSAP components (734 lines) |
| Typography | System fonts | DM Sans + Instrument Serif + JetBrains Mono |
| Total Lines | ~12,000 | 18,276 |

---

## License

This is a private portfolio project. All rights reserved by **Hardik Lukhi**. All content, design, code, project data, images, and frame sequences are the intellectual property of Hardik Lukhi and are not licensed for reuse.

---

## Author

**Hardik Lukhi** — Project Manager | Senior Mechanical Engineer at Meta Platforms
[lukhihardik11@gmail.com](mailto:lukhihardik11@gmail.com) | [LinkedIn](https://linkedin.com/in/hardiklukhi)
