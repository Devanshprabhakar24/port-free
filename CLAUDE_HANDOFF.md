# Claude Handoff: Cinematic Solar Portfolio

I am building a cinematic space-themed portfolio in React + TypeScript + Vite where scrolling feels like flying through a solar system.

## Product Intent

- The page should feel alive from the first viewport, not static.
- Scrolling down must feel like moving forward through space.
- Planets and stars should respond continuously to scroll, not only at section snap points.
- Motion should be dramatic but still keep text/content readable.

## Core Behavior I Want

1. 8-planet system logic:
   - 4 section planets (hero, about, projects, contact)
   - 4 supporting orbiters always visible in the world
2. Foreground rule:
   - The focused section planet should have the strongest visual depth and presence.
3. Directional rule:
   - Scroll down = stronger forward push toward camera.
   - Scroll up = reverse direction but still smooth/cinematic.
4. Background rule:
   - Multi-layer stars and nebula must move with clear parallax depth separation.
   - Faster scroll should produce velocity streak feeling.

## Technical Context

- Stack: React 19, TypeScript, Vite 8, Framer Motion, GSAP/ScrollTrigger, Lenis, Zustand.
- Build is currently passing.
- Earlier dev confusion came from multiple occupied ports and wrong working directory launches.

## Files That Matter Most

- src/components/PlanetSystem/PlanetSystem.tsx
- src/components/Background/Background.tsx
- src/components/Planet/Planet.tsx
- src/store/cinematicDepthStore.ts
- src/hooks/useScrollProgress.ts
- src/layout/MainLayout.tsx

## Current Architecture Summary

- PlanetSystem orchestrates 8 planets and computes depth/position from section depth + global scroll progress.
- Background renders far/mid/near star layers plus nebula and velocity streak behavior.
- Planet component converts depth into visual styling (scale, opacity, blur/glow).
- Zustand store tracks cinematic depths by section.

## What I Need You (Claude) To Improve

1. Make forward depth on downward scroll unmistakable without jitter.
2. Tighten synchronization between starfield motion and planet depth shifts.
3. Improve section-to-section continuity so it feels like one long flight.
4. Recommend better easing curves and depth math (z translation, opacity, blur, glow) for stronger perception.
5. Keep performance stable on desktop and mobile.

## Constraints

- Preserve reduced-motion and mobile fallbacks.
- Keep implementation maintainable (no overly complex animation state machine unless truly necessary).
- Prefer deterministic math tied to scroll progress over random motion.

## Acceptance Criteria

1. Users immediately perceive forward travel in space when scrolling down.
2. Depth hierarchy is obvious at all times (foreground vs midground vs background).
3. Planet and star motions feel coordinated, not independent.
4. No runtime errors; production build stays green.

## Optional Deliverable Format I Prefer

Please return:

1. A short diagnosis of current motion weaknesses.
2. Concrete parameter recommendations (with exact numeric ranges).
3. Proposed code-level changes by file.
4. A small tuning checklist for final visual polish.
