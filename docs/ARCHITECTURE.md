# Architecture

This document provides a detailed breakdown of the component architecture, provider stack, data flow, rendering pipeline, and device adaptation strategy for the Modern portfolio.

---

## 1. Directory Structure

### Client Directory (`/client`)

```
client/
├── index.html                          # Vite HTML entry with flash-prevention scripts
├── public/                             # Static assets served at root path
│   ├── favicon.ico                     # H monogram (32x32)
│   └── favicon.svg                     # SVG favicon with gradient
└── src/
    ├── App.tsx                         # Root component — provider stack + router
    ├── main.tsx                        # React bootstrap entry point
    ├── index.css                       # Global CSS — design tokens, themes, jelly styles
    ├── const.ts                        # Shared constants
    ├── components/
    │   ├── ui/                         # shadcn/ui primitives (40+ Radix-based components)
    │   ├── animation/                  # GSAP animation system (6 components, 734 lines)
    │   ├── anchors/                    # WebGPU cross-section renderer (experimental, 630 lines)
    │   ├── JellyMaterialCard.tsx       # Spring physics engine (825 lines)
    │   ├── JellyWrapper.tsx            # Lightweight jelly hover wrapper
    │   ├── JellyBackground.tsx         # Ambient jelly atmosphere
    │   ├── HeroSection.tsx             # Hero with Spline 3D (545 lines)
    │   ├── AboutSection.tsx            # Metrics grid + bio (183 lines)
    │   ├── ExperienceSection.tsx       # Timeline with DrawSVG (245 lines)
    │   ├── ProjectsSection.tsx         # Horizontal scroll gallery (294 lines)
    │   ├── SkillsSection.tsx           # Categorized skill bars (212 lines)
    │   ├── EducationSection.tsx        # Degree cards (198 lines)
    │   ├── ContactSection.tsx          # Contact cards (189 lines)
    │   ├── ProjectExplodedView.tsx     # Scroll-scrubbed frame player (616 lines)
    │   ├── Section.tsx                 # Reusable section wrapper
    │   ├── Navbar.tsx                  # Sticky nav (237 lines)
    │   ├── ScrollProgress.tsx          # Top progress bar
    │   ├── SignalDivider.tsx           # Animated horizontal divider
    │   ├── PageTransition.tsx          # GSAP overlay slide transition
    │   └── ErrorBoundary.tsx           # React error boundary
    ├── contexts/
    │   ├── ThemeContext.tsx             # Light/dark mode state
    │   └── JellyModeContext.tsx         # Jelly mode toggle state
    ├── data/
    │   ├── projects.ts                 # Project metadata and labels
    │   └── frameUrlsIndex.ts           # CDN frame URL registry
    ├── hooks/
    │   ├── useFineHover.ts             # Device capability detection
    │   ├── useSplineGating.ts          # 3D scene loading/timeout gating
    │   ├── useScrollReveal.ts          # Scroll reveal trigger
    │   ├── useComposition.ts           # IME composition tracking
    │   ├── useMobile.tsx               # Mobile breakpoint detection
    │   └── usePersistFn.ts             # Stable callback reference
    └── lib/
        ├── design-tokens.ts            # TypeScript design token exports
        └── utils.ts                    # cn() class merging utility
```

### Server & Shared Directories

The `server/` and `shared/` directories are **placeholders** for imported template compatibility. This is a static-only project — no backend code is executed at runtime. The original `hardik-portfolio` repository includes a full Express + tRPC + Drizzle backend; the Modern version serves all content statically with assets on CDN.

---

## 2. Provider Stack

The application wraps all content in a layered provider stack defined in `App.tsx`. Each provider serves a distinct responsibility and is ordered so that inner providers can consume outer contexts.

```
ErrorBoundary
  └── ThemeProvider              (light/dark mode state + localStorage persistence)
        └── JellyModeProvider        (jelly on/off state + DOM class + localStorage)
              └── AnimationProvider      (touch detection, reduced-motion, GSAP defaults)
                    └── TooltipProvider      (Radix tooltip context)
                          ├── Toaster            (sonner toast notifications)
                          ├── ScrollProgress     (top progress bar)
                          ├── CustomCursor       (physics-smoothed cursor, desktop only)
                          └── Router             (Wouter Switch with PageTransition)
```

**ErrorBoundary** catches rendering errors in any child component and displays a fallback UI instead of a blank screen.

**ThemeProvider** reads the user's stored theme preference from localStorage (falling back to system `prefers-color-scheme`) and applies the corresponding CSS class (`light` or `dark`) to `document.documentElement`. An inline script in `index.html` applies the stored class before React mounts to prevent a flash of wrong theme.

**JellyModeProvider** manages the jelly toggle independently from theme. It adds or removes the `jelly-mode` class on the root element. Defaults to `true` for new visitors (no localStorage entry). An inline script in `index.html` applies the stored jelly state before React mounts.

**AnimationProvider** detects touch devices via `ScrollTrigger.isTouch` and checks `prefers-reduced-motion` to provide a unified animation context. All animation components consume this context to gracefully degrade.

---

## 3. Routing

Client-side routing uses **Wouter 3**, a lightweight alternative to React Router (3 KB vs 30 KB).

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Full portfolio single-page layout with 7 sections |
| `/project/:id` | `ProjectPage` | Project detail with exploded view animation |
| `*` | `NotFound` | 404 error page |

All route transitions are wrapped in `PageTransition`, which uses GSAP to animate a colored overlay that slides in from the right, covers the viewport, then slides out to reveal the new page content. The transition takes 600ms with `power2.inOut` easing.

---

## 4. Component Architecture

### Section Components

Each portfolio section follows a consistent pattern:

```
Section (id, padding, container, scroll-margin)
  └── TextReveal (heading animation)
  └── ScrollReveal (content entrance)
        └── JellyMaterialCard (interactive surface)
              └── Actual content (text, metrics, links)
```

The `Section` component provides an `id` for anchor navigation, consistent vertical padding (`py-20 md:py-28`), `scroll-mt-20` for header offset, container width constraints, and optional jelly atmosphere backgrounds via the `jellyBg` prop.

### JellyMaterialCard Rendering Pipeline

The `JellyMaterialCard` component (825 lines) is the most complex component in the project. It renders differently based on whether Jelly Mode is enabled.

**Standard Mode** renders a simple `div` with hover transitions, border, and shadow. No physics simulation runs. This is the lightweight path for users who prefer a calm interface.

**Jelly Mode** activates the full rendering pipeline:

1. **Spring Initialization** — Five spring channels are created with independent physics parameters. Initial values are set to resting tilt angles (`REST_TILT_X = 3°`, `REST_TILT_Y = -1.5°`).

2. **Animation Loop** — A `requestAnimationFrame` loop runs continuously while the card is mounted. Each frame: reads elapsed time, advances all five springs by `dt`, applies value clamping, constructs a CSS `transform` string, and applies it to the container DOM element.

3. **Event Handlers** — Mouse enter, mouse move, mouse leave, mouse down, mouse up, and scroll-into-view events apply impulses to the spring channels. Impulse magnitude varies by event type.

4. **Idle Wobble** — When all springs are near rest (velocity below threshold), micro-impulses are applied at random intervals. Only applied when springs are settled, preventing accumulation.

5. **DOM Output** — The computed transform is applied to a container `div` with `transform-style: preserve-3d`. The container has a fixed depth (`JELLY_DEPTH = 48px`) and organic border radius (`1.5rem 1.1rem 1.35rem 1.05rem`). A specular highlight overlay shifts position based on tilt. Background uses a translucent gradient with the card's `hue` parameter.

### Exploded View Pipeline

The `ProjectExplodedView` component (616 lines) implements scroll-driven frame sequence animation:

1. **Frame Preloading** — Fetches frame URL array from `frameUrlsIndex.ts` and preloads all images via `new Image()`. Progress indicator shows loading percentage.

2. **Canvas Rendering** — Frames are drawn to an HTML5 `<canvas>` element. Canvas is sized to viewport dimensions and uses `drawImage` for each frame.

3. **Scroll Binding** — GSAP ScrollTrigger pins the canvas container and maps scroll progress (0–1) to frame index (0–N-1). As the user scrolls, the corresponding frame is drawn.

4. **Label Animation** — Annotation labels are positioned absolutely over the canvas. Each label has a `threshold` value (0–1) determining when it fades in. Leader lines connect labels to target points on the frame.

5. **Edge Color Sampling** — The `sampleEdgeColor` function reads pixel data from frame edges to set the container background, ensuring seamless letterboxing.

---

## 5. Data Flow

### Project Data

All project metadata is defined in `client/src/data/projects.ts` as a typed array of `ProjectData` objects. Each object contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | URL slug and lookup key |
| `title` | `string` | Full project title |
| `subtitle` | `string` | Company and context |
| `category` | `string` | Engineering discipline |
| `description` | `string` | Short description for cards |
| `longDescription` | `string` | Detailed description for detail page |
| `tags` | `string[]` | Skill tags |
| `stats` | `{ label, value }[]` | Key metrics |
| `labels` | `ProjectLabel[]` | Exploded view annotations |
| `color` | `string` | Card accent color |
| `accentColor` | `string` | Secondary accent |
| `hasAnimation` | `boolean` | Whether exploded view frames exist |

Frame URLs are stored separately in `client/src/data/frameUrlsIndex.ts` to keep the main data file readable. Each project's frames are a `readonly string[]` of CloudFront CDN URLs.

### Design Tokens

Design tokens flow from CSS custom properties through Tailwind to components:

```
index.css (CSS custom properties in :root and .dark)
  ├── @theme inline (maps CSS vars to Tailwind utility classes)
  └── design-tokens.ts (TypeScript typed exports for programmatic use)
        └── Components consume via Tailwind classes OR TypeScript imports
```

### State Management

Two React Contexts manage global state:

**ThemeContext** — Light/dark mode. Reads from localStorage, falls back to system preference. Syncs to `document.documentElement` class list and localStorage on change.

**JellyModeContext** — Jelly on/off. Defaults to `true` for new visitors. Syncs to `jelly-mode` class on `document.documentElement` and localStorage on change.

Both contexts use inline scripts in `index.html` to apply stored state before React mounts, preventing flash of wrong state.

---

## 6. Device Adaptation Strategy

The portfolio implements a three-tier device adaptation strategy:

### Tier 1: Desktop with Mouse

Full feature set enabled:
- Jelly spring physics at 60 fps
- Custom cursor (dot + ring)
- Magnetic hover effects
- Spline 3D scene in hero
- Full text reveal animations
- Idle wobble on all cards

### Tier 2: Tablet / Desktop without Mouse

Reduced interaction layer:
- Jelly cards render with static tilt (no RAF loop)
- No custom cursor
- No magnetic effects
- Spline 3D still loads (viewport >= 768px)
- Text reveals simplified to fade-in
- No idle wobble

### Tier 3: Mobile (< 768px)

Minimal interaction layer:
- No jelly physics
- No custom cursor
- No magnetic effects
- No Spline 3D (5.6 MB saved)
- Simple fade-in entrances
- Hamburger navigation with slide-out drawer
- Touch-optimized tap targets

### Detection Mechanism

Device tier is determined by two hooks:

1. **`useFineHover`** — Evaluates `(hover: hover) and (pointer: fine)`. Returns `true` for Tier 1, `false` for Tiers 2 and 3.
2. **`useSplineGating`** — Evaluates viewport width >= 768px. Returns `shouldRender: true` for Tiers 1 and 2, `false` for Tier 3.

The `AnimationProvider` combines these signals with `prefers-reduced-motion` to provide a unified context that all animation components consume.

---

## 7. CSS Architecture

### Theme Variables

All colors are defined as CSS custom properties in `index.css` using OKLCH values. Two blocks define the light (`:root`) and dark (`.dark`) themes. Tailwind's `@theme inline` block maps these variables to utility classes.

### Jelly Mode Styles

The `.jelly-mode` class on `document.documentElement` activates jelly-specific CSS:
- `.jelly-section-bg` — Adds a subtle caustic overlay to section backgrounds
- Card hover states use different transitions when jelly is active
- Background atmosphere effects are only visible in jelly mode

### Tailwind Customizations

Several Tailwind defaults are customized for this project:
- `.container` is auto-centered with responsive padding
- `.flex` has `min-width: 0` and `min-height: 0` by default
- Button `outline` variant uses transparent background

---

## 8. Build and Bundle

The project uses **Vite 6** for development and production builds.

**Development:** Port 3000, hot module replacement, instant updates.

**Production:** Static bundle to `dist/public/` with code splitting, tree shaking, and content-hashed filenames. The Spline runtime (~5.6 MB) is loaded via dynamic import and only fetched on desktop viewports.

**Key optimization:** GSAP plugins (ScrollTrigger, SplitText, DrawSVGPlugin) are registered at the component level rather than globally, enabling tree shaking of unused plugins on pages that don't need them.
