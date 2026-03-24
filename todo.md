# Master Prompt Implementation Todo

## Phase 1: GSAP Foundation
- [ ] Install gsap with all premium plugins (ScrollTrigger, ScrollSmoother, SplitText, DrawSVG, MorphSVG, Flip, CustomEase)
- [ ] Create AnimationProvider context with gsap.matchMedia() for desktop/mobile/reduced-motion
- [ ] Create ScrollSection wrapper component
- [ ] Create TextReveal component (SplitText wrapper)
- [ ] Create Magnetic component (gsap.quickTo hover)
- [ ] Create CustomCursor component (dot + ring with mix-blend-mode: difference)
- [ ] Register all plugins in main entry

## Phase 2: Hero Section (Techniques: Sticky pinning, Text reveals, Parallax, Scale/zoom, Section wipes)
- [ ] Sticky pin hero for 300% viewport scroll
- [ ] SplitText character/word/line reveal on name
- [ ] Parallax depth layers (bg/mid/fg at different speeds)
- [ ] Scroll-driven opacity cascade on subtitle/description
- [ ] Section wipe transition to About
- [ ] Premium typography (not Inter, deliberate font pairing)
- [ ] CTA magnetic hover effects

## Phase 3: About + Experience (Techniques: Text reveals, SVG drawing, Stagger reveals, Counter animations, Sticky pinning)
- [ ] About section heading SplitText reveal
- [ ] Scroll-driven counter animations for stats (synced to scroll position)
- [ ] About cards stagger reveal with ScrollTrigger.batch()
- [ ] Experience timeline with SVG path drawing on scroll (DrawSVG)
- [ ] Experience items stagger reveal
- [ ] Experience section sticky pinning
- [ ] Philosophy quote cinematic reveal

## Phase 4: Projects (Techniques: Horizontal scroll, Scale/zoom, Stagger reveals, Magnetic hover, Canvas sequence)
- [ ] Horizontal scroll gallery (vertical scroll drives horizontal movement)
- [ ] Project cards scale-up on scroll approach
- [ ] Nested ScrollTriggers with containerAnimation
- [ ] Magnetic hover on project cards
- [ ] Mobile: convert to vertical stack via matchMedia()

## Phase 5: Skills + Education + Contact (Techniques: SVG drawing, Stagger reveals, Counter animations, Text reveals, Magnetic hover)
- [ ] Skills progress bars animated with scroll-driven counters
- [ ] Skills cards 2D wave stagger from grid
- [ ] Education cards stagger reveal
- [ ] Contact section text reveal
- [ ] Contact CTA magnetic hover
- [ ] Section wipe transitions between sections

## Phase 6: Jelly Material System
- [ ] Jelly OFF = subtle premium (calm, tactile, refined, lightly animated)
- [ ] Jelly ON = expressive controlled (physical, richer material depth, stronger interaction)
- [ ] Dense groups (tags, pills, badges) stay calm in both modes
- [ ] Standalone elements get richer hover in ON mode
- [ ] Desktop: full interaction path with richer response
- [ ] Touch devices: lighter visual-only path
- [ ] No full-screen compositor-heavy overlays on mobile
- [ ] No fragile backdrop-filter stacks on mobile
- [ ] Progressive enhancement only where provably safe

## Phase 7: Anti-AI-Made Polish
- [ ] Break generic spacing patterns - use authored asymmetric spacing
- [ ] Vary radii and shadows - not uniform machine-generated feel
- [ ] Section structures feel unique, not templated
- [ ] Motion feels authored, not like a Tailwind animation library
- [ ] Typography decisions feel picked by taste, not algorithm
- [ ] Every element has an articulable "why"

## Phase 8: Responsive + Accessibility
- [ ] gsap.matchMedia() for all animations (desktop/mobile/reduced-motion)
- [ ] prefers-reduced-motion: reduce → instant states only, no animations
- [ ] Mobile intentionally designed, not desktop-shrunk
- [ ] Touch/coarse pointer: no sticky hover, no expensive continuous loops
- [ ] Light/dark mode toggle stable and glitch-free
- [ ] Jelly toggle stable under rapid toggling
