# Feature Specification: Integrate Figma Make AI Section Layouts & Decorations

**Feature Directory**: `specs/005-integrate-figma-sections`
**Created**: 2026-08-05
**Status**: Draft
**Input**: `@e:\web_2026\helo\layout_figmamakeAI tao bảo ai figma vẽ thêm trang trí cho nội dung các section ở đây / mày bê các nội dung trong từng section vào project chính được không ?`

---

## Executive Summary

This specification defines the migration of rich UI layouts, section decorations, typography hierarchies, custom card components (CGI placeholders with chromatic aberration & scanlines), 3D glass cubes, marquee items, and interactive contact terminal UI created in `layout_figmamakeAI` into the primary exhibition portfolio codebase (`helo`). The objective is to elevate the visual polish of each section while maintaining full compatibility with the existing Lenis infinite scroll engine, Kinetic Strings background canvas, and Next.js React architecture.

---

## User Scenarios### User Story 1 - Decorated Hero & Intro Section with Kinetic NimVFX Headline (Priority: P1)

As a visitor loading the exhibition site, I want the Intro section to display a high-impact kinetic hero layout featuring the brand headline "NimVFX" (where "VFX" is bold with a 3-color gradient `#00F2FF` → `#FF007F` → `#0066FF`), technical metadata tags ("NimVFX — 2026", "MOTION DESIGN / CGI / DIRECTION"), and a scroll indicator, integrated with the existing 3D Cubi character sprite engine (`SpriteAnimation`), so that I am immediately immersed in a high-end cyberpunk aesthetic. Furthermore, all section titles MUST feature dynamic weight expansion / distortion driven by scroll velocity.

**Why this priority**: The Intro section is the primary entry point and sets the brand identity and kinetic typography benchmark for the entire exhibition experience.

**Independent Test**: Can be tested by loading the home screen after completing the preloader and verifying that the Intro section renders the gradient "VFX" headline, kinetic scroll velocity weight distortion, 3D Cubi character sprite, metadata overlays, and scroll line indicator without layout shifting.

**Acceptance Scenarios**:
1. **Given** the preloader has finished, **When** viewing Section 1 (Intro), **Then** the primary headline "NimVFX" renders with gradient accent on bold "VFX" (`#00F2FF` → `#FF007F` → `#0066FF`).
2. **Given** any section title on the page, **When** the user scrolls rapidly, **Then** typography dynamically expands/thickens in weight and horizontal scale proportional to absolute scroll velocity (`useScrollStore.getState().velocity`).
3. **Given** Section 1 is active, **When** inspecting top-left and bottom-center, **Then** metadata tag "NimVFX — 2026" and vertical animated scroll bar render properly alongside the 3D Cubi sprite.

---

### User Story 2 - Cinematic Reel & Asymmetric CGI Bento Grid (Priority: P2)

As a creative director reviewing the portfolio, I want Section 2 ("Director's Reel") to showcase a 16:9 cinematic framed player with chromatic aberration scanline details, technical metadata (Duration, 4K UHD, ProRes 4444, H.265), and Section 3 ("CGI Showcase") to present a 6-item asymmetric bento grid (`1.4fr 1fr 1fr`) with slight rotational tilts and neon card borders.

**Why this priority**: Showcases the core creative work and technical production values of the director.

**Independent Test**: Can be tested by scrolling to Section 2 & 3 and verifying that the cinematic 16:9 player renders with correct metadata bar and the CGI bento grid displays 5 distinct tilted cards with neon borders and label tags.

**Acceptance Scenarios**:
1. **Given** the user scrolls to Section 2 ("Director's Reel"), **When** the section enters view, **Then** a 16:9 frame displays custom corner brackets, scanlines, blur glow orb, play icon button, and bottom metadata row ("DURATION: 03:42 | FORMAT: 4K UHD | CODEC: H.265").
2. **Given** the user scrolls to Section 3 ("CGI Showcase"), **When** viewing the grid, **Then** 5 bento items ("GLASS FLUID SIM", "NEON GEOMETRY", "PARTICLE STORM", "ABSTRACT ARCH", "DATA VIZ") are arranged in a 2-row asymmetric layout with subtle angular rotations (-0.5deg to 0.3deg) and neon card styling.

---

### User Story 3 - Infinite Motion & Commercials Marquees (Priority: P2)

As a site visitor, I want Section 4 ("Motion Work") and Section 5 ("Commercials") to display rich marquee cards with client badges (Nike, Netflix, Coachella, Apple, Samsung, Adidas), neon cards, and mix-blend titles, scrolling endlessly in opposite directions.

**Why this priority**: High-energy showcase of commercial client work.

**Independent Test**: Can be tested by scrolling to Section 4 and 5 and verifying continuous leftward and rightward marquee motion with populated cards.

**Acceptance Scenarios**:
1. **Given** Section 4 ("Motion Work"), **When** rendered, **Then** cards scroll leftward continuously with neon accent cards for Nike x NimVFX, Netflix, and Coachella.
2. **Given** Section 5 ("Commercials"), **When** rendered, **Then** cards scroll rightward continuously with neon accent cards for Apple, Samsung, and Adidas.
3. **Given** both marquee sections, **When** text overlays are viewed over passing cards, **Then** section titles use `mix-blend-difference` to maintain contrast and apply velocity-based weight expansion during scrolling.

---

### User Story 4 - Interactive Contact Section with Particle Canvas & Magnetic Button (Priority: P3)

As a potential client wanting to get in touch, I want Section 6 ("Contact") to incorporate the full standalone design from `contact/src/ContactPage.tsx`, featuring a 3-color gradient headline "Let's connect.", an interactive magnetic button with rotating inner rings and cursor glow, an ambient 60-particle canvas field with distance line connections, a mouse-following 600px radial glow, a massive stroked background letterform "NIM", and top/bottom HUD bars with a live GMT+7 clock.

**Why this priority**: Delivers a memorable, interactive finale that converts visitor interest into contact actions.

**Independent Test**: Can be tested by navigating to Section 6, moving the mouse over the canvas and magnetic button, and verifying particle connections, magnetic button attraction, and live clock updates.

**Acceptance Scenarios**:
1. **Given** Section 6 ("Contact"), **When** rendered, **Then** an interactive `MagneticButton` floats in the center with 2 concentric rotating inner rings and cursor-tracking spring physics.
2. **Given** Section 6 is active, **When** the cursor moves across the viewport, **Then** an ambient 60-particle canvas field draws connecting light segments between nearby particles (< 120px) and a 600px radial follow-glow moves with the mouse.
3. **Given** Section 6 is active, **When** inspecting the background, **Then** a massive stroked background letterform "NIM" (`clamp(320px, 40vw, 560px)`) renders with 1px white outline opacity (`0.04`).
4. **Given** Section 6 is active, **When** inspecting top and bottom HUD bars, **Then** a real-time GMT+7 clock updates every second alongside copyright and metadata strings.

---

### Edge Cases

- **Small Viewport / Mobile Screens**: How does the asymmetric 6-card CGI bento grid handle narrow widths? (MUST collapse into a single-column or scrollable stack on viewports < 768px).
- **Reduced Motion Settings**: How does the Particle Field behave if CSS animations are disabled? (Should remain gracefully static without breaking layout).
- **Missing Asset / Video Failures**: How do card placeholders behave if media fails to load? (Falls back smoothly to procedural noise + chromatic aberration SVG filter card).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update Section 1 (Intro) hero headline to "NimVFX" with bold gradient styling on "VFX" (`#00F2FF` → `#FF007F` → `#0066FF`).
- **FR-002**: System MUST implement a scroll-velocity hook/utility that applies dynamic font weight expansion and horizontal scale distortion (`font-variation-settings` / `transform: scaleX(...)`) to all section headlines based on `useScrollStore.getState().velocity`.
- **FR-003**: System MUST implement a reusable `CGIPlaceholder` / `NeonCard` component (`components/NeonCard.tsx`) featuring SVG noise filters, chromatic aberration line overlays, scanlines, glow orbs, and corner brackets.
- **FR-004**: System MUST update Section 2 ("Director's Reel") to embed the 16:9 cinematic container with bottom metadata row and play overlay.
- **FR-005**: System MUST update Section 3 ("CGI Showcase") to render the 5-item asymmetric bento grid layout with subtle rotational transforms and technical label tags.
- **FR-006**: System MUST update Section 4 ("Motion Work") and Section 5 ("Commercials") marquee cards in `data/sections.json` and `HorizontalMarquee.tsx` to render rich `NeonCard` items with client badges.
- **FR-007**: System MUST integrate the full `ContactPage.tsx` experience into Section 6 ("Contact"), including `MagneticButton`, `ParticleField` canvas, mouse follow-glow, stroked "NIM" background letterform, and GMT+7 live clock top/bottom bars.
- **FR-008**: System MUST preserve all existing Lenis scroll snapping, infinite loop buffer clones, Kinetic Strings Canvas background, and 3D Cubi SpriteAnimation.

---

### Key Entities

- **Section Layout Configuration**: Extended JSON data model in `data/sections.json` supporting metadata tags, bento item arrays, client badges, and accent color definitions.
- **Neon Card Props**: Data structure containing label, accent color (`#00F2FF`, `#FF007F`, `#00FF88`, `#0066FF`), media src/poster, and rotation angle.
- **Kinetic Typography State**: Scroll velocity metric (`Math.abs(velocity)`) controlling font-weight/scale distortion factors.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visual section decorations from `layout_figmamakeAI` and `contact/src/ContactPage.tsx` (NimVFX headline, velocity typography stretch, Reel frame, CGI Bento grid, Marquee cards, Magnetic Contact Button, Particle Canvas) are fully integrated into the primary application.
- **SC-002**: Application maintains a consistent **60+ FPS** rendering speed during scrolling with zero layout jank or re-render stutters.
- **SC-003**: All interactive elements (magnetic button, play icon, terminal/contact links, hover effects) respond to touch and pointer input within < 50ms.
- **SC-004**: Layout seamlessly adapts across screen sizes from 360px mobile viewports up to 4K desktop displays.mobile viewports up to 4K desktop displays.

---

## Assumptions

- **Component Architecture**: All imported components will be implemented using React TypeScript TSX components matching Next.js 15 app router standards.
- **Styling Strategy**: CSS styling will utilize Tailwind CSS classes combined with scoped CSS module/global tokens matching the established project design system in `globals.css`.
- **Zero Third-Party 3D Dependency**: The 3D Glass Cube relies purely on CSS 3D transforms (`transform-style: preserve-3d`), requiring no Three.js or heavy WebGL libraries.
