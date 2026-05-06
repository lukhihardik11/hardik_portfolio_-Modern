# Contributing Guide

This document establishes the code style, conventions, branching strategy, and collaboration workflow for the Modern portfolio project. All contributors — human or AI agent — must follow these guidelines to maintain project integrity.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Branching Strategy](#branching-strategy)
3. [Commit Conventions](#commit-conventions)
4. [Code Style](#code-style)
5. [Component Conventions](#component-conventions)
6. [CSS & Styling Rules](#css--styling-rules)
7. [Animation Guidelines](#animation-guidelines)
8. [Performance Rules](#performance-rules)
9. [File Naming & Organization](#file-naming--organization)
10. [TypeScript Standards](#typescript-standards)
11. [Testing & Verification](#testing--verification)
12. [Pull Request Process](#pull-request-process)
13. [AI Agent Instructions](#ai-agent-instructions)
14. [Forbidden Patterns](#forbidden-patterns)

---

## Getting Started

### Prerequisites

- Node.js 22.x or later
- pnpm 9+ (required — do not use npm or yarn)
- A modern browser with DevTools for visual verification

### Setup

```bash
gh repo clone lukhihardik11/hardik_portfolio_-Modern
cd hardik_portfolio_-Modern
pnpm install
pnpm run dev
```

The dev server starts on `http://localhost:3000`. Verify the site loads correctly, jelly cards animate, and no console errors appear before making changes.

### Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Start dev server with HMR |
| `pnpm run build` | Production build to `dist/public/` |
| `pnpm run check` | TypeScript type checking (no emit) |
| `pnpm run format` | Format all files with Prettier |

---

## Branching Strategy

The `main` branch is the **stable, deployed branch**. It represents the latest verified checkpoint.

### Rules

1. **Never commit directly to `main`.** All changes must go through a feature branch and pull request.
2. **Branch naming:** Use the format `<type>/<short-description>` (e.g., `feat/add-testimonials`, `fix/jelly-card-flip`, `docs/update-readme`).
3. **One concern per branch.** Do not bundle unrelated changes in a single branch.
4. **Rebase before PR.** Keep a clean linear history by rebasing on `main` before opening a pull request.

### Branch Types

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features or sections | `feat/add-blog-section` |
| `fix/` | Bug fixes | `fix/mobile-nav-overflow` |
| `refactor/` | Code restructuring without behavior change | `refactor/extract-spring-utils` |
| `docs/` | Documentation updates | `docs/add-changelog` |
| `perf/` | Performance improvements | `perf/lazy-load-spline` |
| `style/` | Visual/CSS changes only | `style/adjust-dark-mode-contrast` |

---

## Commit Conventions

This project uses **Conventional Commits** format. Every commit message must follow this structure:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | Adding new functionality |
| `fix` | Fixing a bug |
| `refactor` | Restructuring code without changing behavior |
| `style` | CSS/visual changes, formatting |
| `docs` | Documentation changes |
| `perf` | Performance improvements |
| `chore` | Build config, dependencies, tooling |
| `test` | Adding or updating tests |

### Scope

Use the component or system name: `jelly`, `hero`, `nav`, `projects`, `animation`, `exploded-view`, `theme`, `a11y`.

### Examples

```
feat(projects): add seventh project card for Octolapse
fix(jelly): clamp wiggle spring to prevent upside-down text
refactor(animation): extract TextReveal into standalone module
style(hero): increase CTA button contrast in dark mode
docs(readme): update deployment instructions for Cloudflare Pages
perf(exploded-view): defer frame preloading until section enters viewport
```

---

## Code Style

### Formatting

Prettier handles all formatting. Run `pnpm run format` before committing. The project uses these Prettier defaults:

- **Print width:** 80 characters (soft wrap for readability)
- **Semicolons:** Yes
- **Quotes:** Double quotes for JSX, single quotes for imports
- **Trailing commas:** ES5 style
- **Tab width:** 2 spaces
- **Bracket spacing:** Yes

### General Principles

1. **Readability over cleverness.** Write code that a new contributor can understand in one pass. Avoid nested ternaries, obscure bitwise operations, or overly abstract patterns.

2. **Explicit over implicit.** Name variables and functions descriptively. Prefer `const cardTiltAngle = 3` over `const a = 3`.

3. **Colocation over separation.** Keep related code together. A component's types, helpers, and constants should live in the same file unless they are shared across multiple components.

4. **Composition over inheritance.** Use React composition patterns (children, render props, hooks) rather than class hierarchies or HOCs.

5. **Immutability by default.** Use `const` for all declarations. Use spread operators or `structuredClone` for object updates. Never mutate props or state directly.

---

## Component Conventions

### File Structure

Every component file follows this internal structure:

```typescript
// 1. Imports (external libraries first, then internal)
import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { useJellyMode } from "@/contexts/JellyModeContext";

// 2. Types and interfaces
interface MyComponentProps {
  title: string;
  variant?: "default" | "compact";
  className?: string;
  children?: React.ReactNode;
}

// 3. Constants (component-specific)
const ANIMATION_DURATION = 0.6;
const REST_TILT = 3;

// 4. Helper functions (pure, no hooks)
function calculateOffset(index: number, total: number): number {
  return (index / total) * 100;
}

// 5. Component definition (named export)
export function MyComponent({ title, variant = "default", className, children }: MyComponentProps) {
  // hooks first
  // derived state
  // effects
  // handlers
  // render
}
```

### Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `JellyMaterialCard` |
| Props interfaces | PascalCase + `Props` suffix | `JellyMaterialCardProps` |
| Hooks | camelCase with `use` prefix | `useFineHover` |
| Constants | UPPER_SNAKE_CASE | `REST_TILT_X` |
| Event handlers | camelCase with `handle` prefix | `handleMouseEnter` |
| Boolean props | camelCase with `is`/`has`/`should` prefix | `isActive`, `hasAnimation` |
| CSS class utilities | kebab-case | `jelly-section-bg` |
| Files | PascalCase for components, camelCase for utilities | `HeroSection.tsx`, `useFineHover.ts` |

### Props Design

1. **Always accept `className`** on wrapper components to allow external styling overrides.
2. **Use discriminated unions** for variant props instead of multiple booleans.
3. **Default props** in the destructuring signature, not via `defaultProps`.
4. **Spread remaining props** to the root element when building primitives: `{...rest}`.

### Component Size Guidelines

| Lines | Action |
|-------|--------|
| < 150 | Single file, no splitting needed |
| 150–400 | Consider extracting helper functions or sub-components |
| 400–800 | Must have clear internal sections with comment headers |
| > 800 | Must be justified (e.g., `JellyMaterialCard.tsx` at 825 lines contains a complete physics engine that cannot be meaningfully split) |

---

## CSS & Styling Rules

### Tailwind First

All styling uses Tailwind utility classes. Custom CSS is only permitted for:

- CSS custom properties (design tokens in `index.css`)
- Complex animations that cannot be expressed as utilities
- Third-party library overrides
- Pseudo-element content that requires `::before`/`::after`

### Color Usage

1. **Always use semantic tokens** (`bg-background`, `text-foreground`, `border-border`) rather than raw color values.
2. **Never hardcode hex/rgb/hsl values** in component files. If a new color is needed, add it to `index.css` as a CSS custom property first.
3. **OKLCH format only** for new color definitions in `index.css`. Do not use HSL or RGB.
4. **Contrast requirement:** All text-background combinations must meet WCAG AA (4.5:1 for body text, 3:1 for large text).

### Spacing

Use the 4px grid system via Tailwind spacing utilities (`p-1` = 4px, `p-2` = 8px, etc.). Avoid arbitrary values like `p-[13px]` unless pixel-perfect alignment with an external asset requires it.

### Responsive Design

1. **Mobile-first.** Write base styles for mobile, then add `md:` and `lg:` breakpoints.
2. **Breakpoints:** `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).
3. **No horizontal scroll.** Every layout must be tested at 375px width minimum.
4. **Touch targets:** Minimum 44x44px for all interactive elements on mobile.

### Dark Mode

1. Use the `.dark` class strategy (applied to `<html>` element).
2. When adding new surfaces, always define both light and dark variants in `index.css`.
3. Test both themes after every visual change.

---

## Animation Guidelines

### GSAP Usage

1. **Register plugins at component level**, not globally. This enables tree shaking.
2. **Always clean up** ScrollTrigger instances and timelines in `useEffect` return functions.
3. **Use `gsap.context()`** to scope animations and enable bulk cleanup.
4. **Respect reduced motion:** Check `AnimationProvider` context before creating animations.

```typescript
// Correct pattern
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(ref.current, { opacity: 0, y: 30, duration: 0.6 });
  });
  return () => ctx.revert();
}, []);
```

### Spring Physics Rules

The custom spring engine in `JellyMaterialCard.tsx` has specific safety constraints:

1. **Never increase clamp values** without extensive testing across all card instances. Current limits: tilt ±15°, wiggle ±12°, scale 0.85–1.15.
2. **Idle wobble impulses** must only apply when spring velocity is below threshold. This prevents accumulation.
3. **New spring channels** must include value clamping from the start.
4. **Test on real devices** — the headless browser does not accurately represent spring settling behavior.

### Motion Principles

| Principle | Implementation |
|-----------|---------------|
| Direction matches reading flow | Elements enter from below (scroll direction) |
| Stagger creates narrative | Child elements delay 50–100ms between each |
| Duration is short | 300–500ms for entrances, 150–300ms for micro-interactions |
| Easing is physical | Use `power2.out` for entrances, `elastic.out` for bounces |
| Exit is faster than enter | Exit animations at 60–80% of entrance duration |

---

## Performance Rules

### Mandatory Practices

1. **GPU compositing for animations.** Any element that animates must use `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.

2. **No layout thrashing.** Never read DOM measurements (e.g., `getBoundingClientRect()`) inside a `requestAnimationFrame` loop that also writes to the DOM.

3. **Lazy load heavy dependencies.** Spline, large data files, and optional features must use dynamic `import()`.

4. **Image optimization.** All images must be WebP format, served from CDN. Never commit images to the repository.

5. **Bundle awareness.** Before adding a new dependency, check its bundle size at [bundlephobia.com](https://bundlephobia.com). Dependencies over 50 KB gzipped require justification.

### Device Gating

When adding new interactive features:

1. Check `useFineHover()` before enabling hover-dependent physics.
2. Check `useSplineGating().shouldRender` before loading heavy 3D content.
3. Check `AnimationProvider` context for `reducedMotion` before creating scroll animations.

---

## File Naming & Organization

### Directory Rules

| Directory | Contains | Naming |
|-----------|----------|--------|
| `pages/` | Route-level components (one per route) | PascalCase: `ProjectPage.tsx` |
| `components/` | Reusable UI components | PascalCase: `JellyMaterialCard.tsx` |
| `components/ui/` | shadcn/ui primitives | kebab-case: `button.tsx`, `card.tsx` |
| `components/animation/` | GSAP animation wrappers | PascalCase: `TextReveal.tsx` |
| `contexts/` | React context providers | PascalCase: `ThemeContext.tsx` |
| `hooks/` | Custom React hooks | camelCase with `use` prefix: `useFineHover.ts` |
| `data/` | Static data and content | camelCase: `projects.ts` |
| `lib/` | Pure utility functions | camelCase: `utils.ts` |

### When to Create a New File

- A helper function is used by 2+ components → move to `lib/`
- A hook is used by 2+ components → move to `hooks/`
- A sub-component exceeds 100 lines and has a clear single responsibility → extract to `components/`
- A data structure is referenced by 2+ files → move to `data/`

---

## TypeScript Standards

### Strict Mode

The project uses `"strict": true` in `tsconfig.json`. All code must pass strict type checking. Run `pnpm run check` before committing.

### Type Preferences

1. **Use `interface` for component props** and object shapes that may be extended.
2. **Use `type` for unions, intersections, and utility types.**
3. **Never use `any`.** Use `unknown` with type narrowing if the type is truly unknown.
4. **Avoid type assertions** (`as`). If you need one, add a comment explaining why.
5. **Export types** alongside their components for consumer use.

### Patterns

```typescript
// Prefer interface for props
interface CardProps {
  title: string;
  variant?: "default" | "compact";
}

// Prefer type for unions
type Theme = "light" | "dark";
type SpringChannel = "tiltX" | "tiltY" | "wiggle" | "scale" | "depth";

// Prefer const assertions for static data
const SPRING_CONFIG = {
  stiffness: 120,
  damping: 12,
  mass: 1.0,
} as const;

// Prefer satisfies for type-checked object literals
const projects = [...] satisfies ProjectData[];
```

---

## Testing & Verification

### Before Every PR

1. **Type check passes:** `pnpm run check` returns no errors.
2. **Build succeeds:** `pnpm run build` completes without warnings.
3. **Visual verification:** Manually check the affected sections in both light and dark mode.
4. **Mobile check:** Verify at 375px width — no horizontal scroll, no text overflow.
5. **Jelly mode:** Test with jelly ON and OFF — both modes must render correctly.
6. **Console clean:** No unexpected errors or warnings in browser DevTools.

### Visual QA Checklist

| Check | How to Verify |
|-------|---------------|
| Text readable against background | Inspect contrast in both themes |
| Cards not flipped/rotated excessively | Wait 10 seconds after page load, verify all cards are upright |
| Nav links scroll to correct sections | Click each nav item, verify scroll target |
| Project pages load with content | Navigate to each `/project/:id` route |
| Mobile nav accessible | Test hamburger menu at 375px |
| External links open in new tab | Verify `target="_blank"` on LinkedIn, email, resume |

---

## Pull Request Process

### Opening a PR

1. Ensure your branch is rebased on latest `main`.
2. Run the full verification checklist above.
3. Write a clear PR description with:
   - **What** changed (feature, fix, refactor)
   - **Why** it was needed
   - **How** to test it (specific steps)
   - **Screenshots** for any visual changes (both themes, mobile + desktop)

### Review Criteria

PRs will be evaluated on:

1. **Does it follow the design philosophy?** Material realism, progressive enhancement, performance-first.
2. **Does it maintain visual consistency?** Uses existing tokens, follows typography hierarchy, respects spacing system.
3. **Is it accessible?** Keyboard navigable, sufficient contrast, semantic HTML.
4. **Is it performant?** No layout thrashing, GPU-composited animations, lazy-loaded heavy assets.
5. **Is it type-safe?** No `any`, no type assertions without justification.

### Merging

Only the repository owner merges PRs into `main`. Squash merging is preferred to maintain a clean commit history.

---

## AI Agent Instructions

If you are an AI agent (Manus, Cursor, Copilot, etc.) working on this project, follow these additional rules:

### Before Making Changes

1. **Read this file first.** Understand the conventions before writing code.
2. **Read `docs/ARCHITECTURE.md`** to understand the component structure and provider stack.
3. **Read `docs/DESIGN_PHILOSOPHY.md`** to understand the visual principles.
4. **Check `docs/FUNCTIONS.md`** before implementing new hooks or utilities — the pattern may already exist.

### During Development

1. **Never commit directly to `main`.** Create a feature branch.
2. **Never force push to `main`.** Only force push to your own feature branches.
3. **Never delete or rename existing components** without explicit user approval.
4. **Never increase spring clamp values** in `JellyMaterialCard.tsx` without testing.
5. **Never add images to the repository.** Upload to CDN and reference by URL.
6. **Never install dependencies over 50 KB** without user approval.
7. **Always run `pnpm run check`** after changes to verify type safety.

### Design Decisions

When making visual decisions:

- **Does this reinforce or dilute the design philosophy?** If it dilutes, do not proceed.
- **Avoid AI slop:** No excessive centered layouts, no purple gradients, no uniform rounded corners, no Inter font.
- **Use existing tokens.** Do not invent new colors, spacing values, or font sizes without adding them to the design system first.
- **Match the existing quality bar.** Look at `JellyMaterialCard.tsx` and `HeroSection.tsx` as reference for the expected level of craft.

### Communication

After completing work, provide:
- A summary of what changed and why
- Which files were modified
- Any deferred items or known limitations
- Screenshots if visual changes were made

---

## Forbidden Patterns

The following patterns are explicitly banned from this codebase:

| Pattern | Why | Alternative |
|---------|-----|-------------|
| `any` type | Defeats TypeScript's purpose | Use `unknown` with narrowing |
| `!important` in CSS | Breaks cascade predictability | Use more specific selectors or Tailwind's `!` prefix sparingly |
| Inline styles for layout | Unmaintainable, not responsive | Use Tailwind utilities |
| `setTimeout` for animation sequencing | Unreliable timing, not cancellable | Use GSAP timelines |
| `document.querySelector` in components | Bypasses React's rendering model | Use refs (`useRef`) |
| Nested ternaries | Unreadable | Use early returns or `if/else` |
| Default exports | Harder to refactor, no auto-import | Use named exports |
| `react-toastify` | Conflicts with existing toast system | Use `sonner` (already installed) |
| `@radix-ui/react-toast` | Redundant with sonner | Use `sonner` |
| Images in `client/public/` | Causes deployment timeouts | Upload to CDN, reference by URL |
| `npm` or `yarn` commands | Package manager mismatch | Use `pnpm` exclusively |
| Class components | Legacy pattern | Use function components with hooks |
| `useEffect` for derived state | Unnecessary re-renders | Use `useMemo` or compute inline |
| Mutating refs in render | Race conditions | Mutate refs only in effects or handlers |

---

## Questions?

If you are unsure about a convention or need clarification, open a GitHub issue with the `question` label. For design decisions that affect the overall aesthetic, always consult the repository owner before proceeding.
