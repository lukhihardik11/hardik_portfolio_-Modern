# Important Functions & Hooks Reference

This document provides a technical reference for the most critical functions, hooks, spring physics systems, and utilities in the Modern portfolio.

---

## 1. Custom React Hooks

### `useFineHover`

**Location:** `client/src/hooks/useFineHover.ts`

A performance-gating hook that detects if the user's device supports fine pointer interactions (like a mouse) and hover states.

```typescript
export function useFineHover(): boolean
```

**How it works:** It evaluates the CSS media query `(hover: hover) and (pointer: fine)`. It caches the result at the module scope to prevent redundant evaluations and sets up a `MediaQueryList` listener to update state if device capabilities change (e.g., attaching a Bluetooth mouse to an iPad).

**Usage:** Used extensively in `JellyMaterialCard.tsx` to disable heavy `requestAnimationFrame` spring physics on touch devices, preventing scroll lag and sticky hover states on mobile.

---

### `useSplineGating`

**Location:** `client/src/hooks/useSplineGating.ts`

A dual-gating hook that controls the loading of the heavy Spline 3D scene in the Hero section.

```typescript
export function useSplineGating(): {
  shouldRender: boolean;
  hasTimedOut: boolean;
  isLoaded: boolean;
  onSplineReady: () => void;
}
```

**How it works:**

1. **Viewport Gate:** Checks if the window width is >= 768px. If not, `shouldRender` is false, preventing the 5.6 MB Spline download on mobile devices.
2. **Timeout Gate:** Starts a configurable timer. If `onSplineReady` is not called before the timer expires, `hasTimedOut` becomes true, triggering a graceful fallback to a static gradient.

**Risk mitigation:** The timer only starts when `isDesktop && !isLoaded`. If the user resizes below 768px during load, cleanup clears the timer. Timer ref is properly cleared in all paths (success, timeout, unmount).

---

### `useScrollReveal`

**Location:** `client/src/hooks/useScrollReveal.ts`

A hook that creates GSAP ScrollTrigger instances for scroll-triggered entrance animations.

```typescript
export function useScrollReveal<T extends HTMLElement>(options?: ScrollRevealOptions): RefObject<T>
```

**How it works:** Returns a ref to attach to any HTML element. When the element enters the viewport (configurable threshold), it triggers a GSAP animation with the specified direction, distance, duration, and easing. Cleans up ScrollTrigger instances on unmount.

---

### `usePersistFn`

**Location:** `client/src/hooks/usePersistFn.ts`

A stable callback reference hook that replaces `useCallback` to reduce cognitive load.

```typescript
export function usePersistFn<T extends noop>(fn: T): T
```

**How it works:** Stores the latest function in a ref and returns a stable wrapper function that always calls the latest version. Unlike `useCallback`, it never needs a dependency array and never causes re-renders due to callback identity changes.

---

### `useComposition`

**Location:** `client/src/hooks/useComposition.ts`

Tracks IME (Input Method Editor) composition state for text inputs.

```typescript
export function useComposition(): { isComposing: boolean; handlers: CompositionHandlers }
```

**Usage:** Prevents premature form submission during CJK text input by tracking `compositionstart` and `compositionend` events.

---

### `useMobile`

**Location:** `client/src/hooks/useMobile.tsx`

A responsive breakpoint hook that detects mobile viewport width.

```typescript
export function useIsMobile(): boolean
```

**How it works:** Uses `window.matchMedia` to check against the mobile breakpoint (768px) and updates on resize. Returns `true` when the viewport is below the breakpoint.

---

## 2. Spring Physics Engine

### `stepSpring` Function

**Location:** `client/src/components/JellyMaterialCard.tsx`

The core physics simulation function that advances a spring by one time step.

```typescript
function stepSpring(s: SpringState, target: number, c: SpringConfig, dt: number): SpringState
```

**How it works:** Implements the spring-mass-damper equation:

```
acceleration = (-stiffness * displacement - damping * velocity) / mass
velocity += acceleration * dt
position += velocity * dt
```

Where `displacement = current_value - target_value`. Returns a new `SpringState` with updated `value` and `velocity`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `SpringState` | Current spring state (`{ value, velocity }`) |
| `target` | `number` | Target value the spring is attracted to |
| `c` | `SpringConfig` | Physics parameters (`{ stiffness, damping, mass }`) |
| `dt` | `number` | Time delta in seconds (typically 0.016 for 60 fps) |

### Five-Channel Spring System

Each `JellyMaterialCard` maintains five independent spring channels:

| Channel | Target | Stiffness | Damping | Purpose |
|---------|--------|-----------|---------|---------|
| `tiltX` | `REST_TILT_X` (3°) | 120 | 12 | Forward/backward tilt |
| `tiltY` | `REST_TILT_Y` (-1.5°) | 120 | 12 | Left/right tilt |
| `wiggle` | 0° | 100 | 10 | Z-axis rotation (wobble) |
| `scale` | 1.0 | 150 | 14 | Uniform scale (squash/stretch) |
| `depth` | 0px | 100 | 12 | Z-axis translation |

### Value Clamping

After each spring step, values are clamped to prevent runaway rotation:

```typescript
// Clamp tilt channels to ±15 degrees
tiltX = Math.max(-15, Math.min(15, tiltX));
tiltY = Math.max(-15, Math.min(15, tiltY));

// Clamp wiggle to ±12 degrees
wiggle = Math.max(-12, Math.min(12, wiggle));

// Clamp scale to 0.85–1.15
scale = Math.max(0.85, Math.min(1.15, scale));
```

### Impulse Events

| Event | Channels Affected | Magnitude | Description |
|-------|-------------------|-----------|-------------|
| Hover Enter | tiltX, tiltY | Low | Gentle tilt toward cursor position |
| Hover Move | tiltX, tiltY | Low | Continuous tilt tracking cursor |
| Hover Leave | tiltX, tiltY | Medium | Snap back to resting tilt |
| Click Press | scale, depth | High | Squash (scale down) + push forward |
| Click Release | scale, depth, wiggle | High | Bounce back with wobble burst |
| Scroll Into View | wiggle, tiltX | Medium | Entrance wobble animation |
| Idle Wobble | tiltX, tiltY, wiggle | Very Low | Subtle breathing (only when at rest) |

---

## 3. Animation Components

### `TextReveal`

**Location:** `client/src/components/animation/TextReveal.tsx` (189 lines)

Wraps heading elements and uses GSAP SplitText to split text into characters, words, or lines, then staggers their entrance with scroll-triggered animations.

```typescript
interface TextRevealProps {
  children: ReactNode;
  mode?: "lines" | "words" | "chars" | "fade";
  className?: string;
  style?: CSSProperties;
}
```

**Critical implementation detail:** Uses a two-container architecture to prevent React reconciliation errors. SplitText replaces React-managed text nodes with character/word/line `<div>`s. When `jellyMode` toggles and React re-renders, it would fail trying to reconcile against the SplitText-modified DOM. The solution uses a hidden container for React reconciliation and a visible container for SplitText manipulation.

---

### `ScrollReveal`

**Location:** `client/src/components/animation/ScrollReveal.tsx` (195 lines)

Generic scroll-triggered entrance animation for arbitrary elements.

```typescript
interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  stagger?: number;
  className?: string;
}
```

**How it works:** Creates a GSAP ScrollTrigger that watches for the element to enter the viewport. On trigger, animates from the specified direction with configurable distance, duration, and child stagger. Respects `AnimationProvider` context for touch and reduced-motion detection.

---

### `SectionWipe`

**Location:** `client/src/components/animation/SectionWipe.tsx` (77 lines)

Cinematic section transitions using CSS `clip-path` animations.

```typescript
interface SectionWipeProps {
  children: ReactNode;
  mode?: "inset" | "circle" | "diagonal";
}
```

**Modes:**
- `inset`: Wipe from center outward using `clip-path: inset()`
- `circle`: Circular reveal from center using `clip-path: circle()`
- `diagonal`: Diagonal wipe from left using `clip-path: polygon()`

---

### `Magnetic`

**Location:** `client/src/components/animation/Magnetic.tsx` (58 lines)

Makes child elements subtly follow the cursor within their bounds.

```typescript
interface MagneticProps {
  children: ReactNode;
  strength?: number;  // 0.1 = subtle, 0.5 = strong
  className?: string;
}
```

**How it works:** Uses `gsap.quickTo` for performant cursor-following. On mouse move within the element bounds, the element translates toward the cursor position scaled by `strength`. On mouse leave, snaps back to origin with elastic easing. Disabled on touch devices via `AnimationProvider` context.

---

### `CustomCursor`

**Location:** `client/src/components/animation/CustomCursor.tsx` (112 lines)

Replaces the default cursor with a physics-smoothed dot-and-ring.

**How it works:** Renders two elements — a small dot and a larger ring — that follow the mouse with different `gsap.quickTo` durations (dot is faster, ring lags behind). The ring expands on hover over interactive elements. Only active on non-touch desktop devices.

---

### `AnimationProvider`

**Location:** `client/src/components/animation/AnimationProvider.tsx` (97 lines)

Context provider that detects device capabilities and provides animation configuration to all child components.

```typescript
interface AnimationContext {
  isTouch: boolean;        // ScrollTrigger.isTouch detection
  reducedMotion: boolean;  // prefers-reduced-motion media query
  isMobile: boolean;       // Viewport width < 768px
}
```

---

## 4. Exploded View System

### `ProjectExplodedView`

**Location:** `client/src/components/ProjectExplodedView.tsx` (616 lines)

The scroll-driven frame sequence player used on project detail pages.

**Pipeline:**

1. **Frame Preloading:** Fetches frame URL array from `frameUrlsIndex.ts` and preloads all images. Shows progress indicator during loading.
2. **Canvas Rendering:** Frames are drawn to an HTML5 `<canvas>` for performance. Canvas is sized to viewport dimensions.
3. **Scroll Binding:** GSAP ScrollTrigger pins the canvas container and maps scroll progress (0–1) to frame index (0–N-1).
4. **Label Animation:** Annotation labels positioned absolutely over the canvas. Each label has a `threshold` (0–1) controlling when it fades in during scroll.

### `sampleEdgeColor`

**Location:** `client/src/components/ProjectExplodedView.tsx`

Dynamically samples the dominant background color from image edges.

```typescript
function sampleEdgeColor(img: HTMLImageElement, hasBlackBorders?: boolean): string
```

**How it works:** Draws the image to an offscreen canvas and reads pixel data along outer edges. Averages RGB values to determine dominant color. Used to set container background so letterboxing blends seamlessly with the frame.

---

## 5. Context Providers

### `ThemeProvider`

**Location:** `client/src/contexts/ThemeContext.tsx`

Manages light/dark mode state with localStorage persistence.

```typescript
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

**How it works:** Reads initial theme from localStorage (falling back to system preference via `prefers-color-scheme`). Applies the corresponding class to `document.documentElement`. An inline script in `index.html` applies the stored theme before React mounts to prevent flash of wrong theme.

---

### `JellyModeProvider`

**Location:** `client/src/contexts/JellyModeContext.tsx`

Manages the Jelly Mode toggle state.

```typescript
interface JellyModeContextType {
  jellyMode: boolean;
  toggleJellyMode: () => void;
}
```

**Behavioral contract:**
- **Default:** ON (jelly is the signature feature — new visitors see it first).
- **ON:** Adds `jelly-mode` class to `document.documentElement`. All `JellyMaterialCard` instances activate spring physics.
- **OFF:** Removes `jelly-mode` class. Cards render with simple hover transitions.
- **Persistence:** Stores preference in localStorage with try/catch for private browsing.
- **Flash prevention:** Inline script in `index.html` applies stored jelly state before React mounts.

---

## 6. Utility Functions

### `cn`

**Location:** `client/src/lib/utils.ts`

Tailwind class merging utility combining `clsx` and `tailwind-merge`.

```typescript
export function cn(...inputs: ClassValue[]): string
```

**Usage:** Used throughout all components to conditionally compose Tailwind classes without conflicts. `tailwind-merge` ensures that conflicting utilities (e.g., `p-4` and `p-8`) resolve correctly.

---

### Design Tokens

**Location:** `client/src/lib/design-tokens.ts`

TypeScript exports of design token values for programmatic use in components. Mirrors the CSS custom properties in `index.css`.

```typescript
export const spacing: Record<number, string>;    // 8px grid (4px to 128px)
export const shadows: Record<string, string>;     // sm, md, lg
export const durations: Record<string, string>;   // fast (150ms), normal (300ms), slow (500ms)
export const tracking: Record<string, string>;    // hero (-0.03em) to mono (0.2em)
export const sectionIds: readonly string[];       // Navigation anchor IDs
```

---

## 7. WebGPU Anchors System (Experimental)

**Location:** `client/src/components/anchors/lib/` (630 lines total)

An experimental WebGPU-based cross-section renderer. Not currently active in the main rendering pipeline but provides infrastructure for future GPU-accelerated visualizations.

| File | Lines | Purpose |
|------|-------|---------|
| `crossSectionCPU.ts` | 187 | CPU fallback for cross-section rendering when WebGPU is unavailable |
| `crossSectionShader.wgsl.ts` | 117 | WGSL shader for real-time cross-section visualization |
| `toggleShader.wgsl.ts` | 120 | WGSL shader for animated toggle transitions |
| `spring.ts` | 97 | Spring physics primitives (shared with JellyMaterialCard) |
| `gpu.ts` | 67 | WebGPU device initialization and capability detection |
| `opticalFunctions.ts` | 42 | Optical simulation helpers (refraction indices, caustic calculations) |
