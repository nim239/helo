# Project Constitution: Exhibition Portfolio Engine

## 1. Vision Principle

This project is not a traditional website.
It is an interactive digital exhibition where motion, space, and artwork are the primary experience.

The implementation MUST prioritize:
- Visual storytelling
- Motion quality
- Immersive scrolling experience
- Artwork presentation over conventional UI patterns

---

## 2. Architecture Principles

### Exhibition Engine First

The application MUST be built as a reusable exhibition engine.

Content MUST be separated from rendering logic.

Adding a new artwork/project MUST NOT require modifying core components.

Required approach:

Data (SSG JSON) → Zustand Store → Renderer → Animation System → Presentation

---

## 3. Scroll Experience Principles

Scrolling is the primary navigation mechanism.

The system MUST prioritize:

1. Smooth continuous movement
2. Seamless infinite looping (Using DOM buffer cloning)
3. Stable velocity preservation (Native API teleportation)
4. Section-based viewing experience
5. Deadlock protection (Ensuring state machines always have a fallback escape route)
6. Forward-Only Snapping: Auto-snap MUST only target the next section downwards. Never force snap upwards.

Forbidden:
- Traditional page navigation dependency
- Hard page reload transitions
- Scroll-jacking that blocks user control

---

## 4. Performance Principles

60 - 120 FPS interaction is a core requirement.

All animation MUST prefer GPU compositing and bypass Virtual DOM overhead for physics.

Required:

- Transient State Architecture (Zustand) for scroll coordinates.
- Direct DOM Ref mutations in `requestAnimationFrame` (RAF).
- `useLayoutEffect` to protect transient inline styles from React re-renders.
- `transform` / `translate3d()` and `opacity` animation.

Forbidden:

- Using React `useState` or `useContext` for scroll-linked physics.
- Animating `top` or `left` properties.
- Forced layout recalculation inside scroll handlers.
- Heavy DOM manipulation during scrolling.

---

## 5. Content Data Principles

Exhibition content MUST be configuration-driven.

Required:

- Local Static JSON based section definitions (`data/sections.json`).
- Unified `layout` identifiers (e.g., `horizontal-marquee`, `fullscreen-video`) for routing data to correct renderers.
- Independent media metadata (nested `items` array for marquees).

Example:

```json
{
 "id": "work-b",
 "layout": "horizontal-marquee",
 "items": []
}
```

New projects should be added through data only.

---

## 6. Animation Principles

Motion is a primary design element.

Animation systems MUST:

- Have predictable timing synchronized to a unified ticker (GSAP).
- Support scroll-driven interaction.
- Avoid unnecessary effects.
- Preserve artistic intent.

Avoid:
- Random decorative animation
- Excessive transitions
- UI-like motion patterns

---

## 7. Asset Management Principles

Assets MUST be optimized before production and actively managed in memory (VRAM).

Required:

Images:
- WebP / AVIF

Video:
- Native HTML5 `<video>` elements.
- Optimized `.webm` with `.mp4` fallback.
- Streamed from Media-Optimized CDNs (Supabase, Firebase, Cloudinary) to save Vercel bandwidth.

Memory Management (Rule of 3):
- Max 3 active decoders.
- Off-screen videos MUST execute deep VRAM flush (`removeAttribute('src')` + `.load()`).

Forbidden:
- iframe embeds (YouTube/Vimeo).
- Audio tracks in individual videos (Strictly `muted`).

---

## 8. Accessibility Principles

The experience MUST remain usable.

Required:

- Semantic HTML sections.
- `prefers-reduced-motion` support.
- Screen Reader Blackholes (`aria-hidden="true"`) for cloned buffer sections.

Reduced motion mode MUST disable sprite animations and parallax, while maintaining infinite loop navigation and content access.

---

## 9. Technology Constraints

Approved:

Framework:
- Next.js 14+ (App Router)
- TypeScript

Animation & Physics:
- GSAP
- Lenis
- Zustand

Styling:
- TailwindCSS

Optional:
- React Three Fiber

Technology choices MUST serve the exhibition experience.

---

## 10. Code Quality Principles

Prefer:

- Small reusable components.
- Clear separation of concerns (Hooks vs UI).
- Typed data models.
- Predictable state machines for transition logic.

Avoid:

- Hardcoded project content.
- Feature-specific hacks.
- Duplicate animation logic.
