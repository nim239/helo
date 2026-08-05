# Feature Specification: Integrate Figma Make AI Section Layouts & Decorations

**Feature Directory**: `specs/005-integrate-figma-sections`
**Created**: 2026-08-05
**Status**: Draft
**Input**: `@e:\web_2026\helo\layout_figmamakeAI tao bảo ai figma vẽ thêm trang trí cho nội dung các section ở đây / mày bê các nội dung trong từng section vào project chính được không ?`

---

## Executive Summary

This specification defines the migration of rich UI layouts, section decorations, typography hierarchies, custom card components (CGI placeholders with chromatic aberration & scanlines), 3D glass cubes, marquee items, and interactive contact terminal UI created in `layout_figmamakeAI` into the primary exhibition portfolio codebase (`helo`). The objective is to elevate the visual polish of each section while maintaining full compatibility with the existing Lenis infinite scroll engine, Kinetic Strings background canvas, and Next.js React architecture.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decorated Hero & Intro Section (Priority: P1)

As a visitor loading the exhibition site, I want the Intro section to display a high-impact kinetic hero layout featuring gradient typography ("N2 ANTIGRAVITY"), technical metadata tags ("N2 ANTIGRAVITY — 2026", "MOTION DESIGN / CGI / DIRECTION"), a scroll indicator, and animated 3D CSS Glass Cubes floating in space, so that I am immediately immersed in a high-end cyberpunk aesthetic.

**Why this priority**: The Intro section is the primary entry point and sets the visual benchmark for the entire exhibition experience.

**Independent Test**: Can be tested by loading the home screen after completing the preloader and verifying that the Intro section renders the gradient "ANTI" headline, 3D rotating glass cube, metadata overlays, and scroll line indicator without layout shifting.

**Acceptance Scenarios**:
1. **Given** the preloader has finished, **When** viewing Section 1 (Intro), **Then** the primary headline "N2 ANTIGRAVITY" renders with gradient accent on "ANTI" (`#00F2FF` → `#FF007F` → `#0066FF`).
2. **Given** Section 1 is active, **When** inspecting the right side of the screen, **Then** a 3D rotating glass cube with glassmorphism gradients and inset cyan glows renders floating smoothly.
3. **Given** Section 1 is active, **When** inspecting top-left and bottom-center, **Then** metadata tag "N2 ANTIGRAVITY — 2026" and vertical animated scroll bar render properly.

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
1. **Given** Section 4 ("Motion Work"), **When** rendered, **Then** cards scroll leftward continuously with neon accent cards for Nike x N2, Netflix, and Coachella.
2. **Given** Section 5 ("Commercials"), **When** rendered, **Then** cards scroll rightward continuously with neon accent cards for Apple, Samsung, and Adidas.
3. **Given** both marquee sections, **When** text overlays are viewed over passing cards, **Then** section titles use `mix-blend-difference` to maintain contrast.

---

### User Story 4 - Interactive Terminal Contact Section (Priority: P3)

As a potential client wanting to get in touch, I want Section 6 ("Contact") to display a high-tech terminal panel ("N2-ANTIGRAVITY TERMINAL v2.6.0") with interactive hoverable link prompts (Email, Vimeo, Instagram, LinkedIn), a blinking cursor, and availability indicator.

**Why this priority**: Converts visitor interest into contact actions.

**Independent Test**: Can be tested by navigating to Section 6, hovering over contact links, and verifying color highlights and cursor animations.

**Acceptance Scenarios**:
1. **Given** Section 6 ("Contact"), **When** rendered, **Then** a terminal window displays title "N2-ANTIGRAVITY TERMINAL v2.6.0", interactive contact prompts with accent colors (`#00F2FF`, `#FF007F`, `#00FF88`, `#0066FF`), and a blinking terminal prompt cursor.
2. **Given** a user hovers over any contact link, **When** hovered, **Then** the link smoothly transitions color to match its designated accent color.

---

### Edge Cases

- **Small Viewport / Mobile Screens**: How does the asymmetric 6-card CGI bento grid handle narrow widths? (MUST collapse into a single-column or scrollable stack on viewports < 768px).
- **Reduced Motion Settings**: How does the 3D Glass Cube behave if CSS animations are disabled? (Should remain gracefully static without breaking layout).
- **Missing Asset / Video Failures**: How do card placeholders behave if media fails to load? (Falls back smoothly to procedural noise + chromatic aberration SVG filter card).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST integrate the Section 1 (Intro) visual layout into `components/Section.tsx` or dedicated sub-components, including headline gradient styling, metadata tags, and float indicators.
- **FR-002**: System MUST port the 3D CSS `GlassCube` component into a reusable Next.js component (`components/GlassCube.tsx`) with zero external 3D engine overhead.
- **FR-003**: System MUST implement a reusable `CGIPlaceholder` / `NeonCard` component (`components/NeonCard.tsx`) featuring SVG noise filters, chromatic aberration line overlays, scanlines, glow orbs, and corner brackets.
- **FR-004**: System MUST update Section 2 ("Director's Reel") to embed the 16:9 cinematic container with bottom metadata row and play overlay.
- **FR-005**: System MUST update Section 3 ("CGI Showcase") to render the 5-item asymmetric bento grid layout with subtle rotational transforms and technical label tags.
- **FR-006**: System MUST update Section 4 ("Motion Work") and Section 5 ("Commercials") marquee cards in `data/sections.json` and `HorizontalMarquee.tsx` to render rich `NeonCard` items with client badges.
- **FR-007**: System MUST update Section 6 ("Contact") to render the interactive terminal UI panel with hoverable contact prompts, blinking prompt cursor, and background orbital cube element.
- **FR-008**: System MUST preserve all existing Lenis scroll snapping, infinite loop buffer clones, Kinetic Strings Canvas background, and HackerMode HUD triggers.

---

### Key Entities

- **Section Layout Configuration**: Extended JSON data model in `data/sections.json` supporting metadata tags, bento item arrays, client badges, and accent color definitions.
- **Neon Card Props**: Data structure containing label, accent color (`#00F2FF`, `#FF007F`, `#0066FF`, `#00FF88`), media src/poster, and rotation angle.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visual section decorations from `layout_figmamakeAI` (Intro hero text, 3D Glass Cube, Reel cinematic frame, CGI Bento grid, Marquee cards, Contact Terminal) are fully integrated into the primary application.
- **SC-002**: Application maintains a consistent **60+ FPS** rendering speed during scrolling with zero layout jank or re-render stutters.
- **SC-003**: All interactive elements (play button, terminal links, hover effects) are responsive to touch and pointer input within < 50ms.
- **SC-004**: Layout seamlessly adapts across screen sizes from 360px mobile viewports up to 4K desktop displays.

---

## Assumptions

- **Component Architecture**: All imported components will be implemented using React TypeScript TSX components matching Next.js 15 app router standards.
- **Styling Strategy**: CSS styling will utilize Tailwind CSS classes combined with scoped CSS module/global tokens matching the established project design system in `globals.css`.
- **Zero Third-Party 3D Dependency**: The 3D Glass Cube relies purely on CSS 3D transforms (`transform-style: preserve-3d`), requiring no Three.js or heavy WebGL libraries.
