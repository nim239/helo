# Feature Specification: YouTube Background Stream & NDA Placeholder System

**Feature Directory**: `specs/007-youtube-background-stream`
**Created**: 2026-08-05
**Status**: Draft
**Note**: Temporary solution until dedicated non-YouTube CDN video streaming infrastructure is deployed.

---

## Executive Summary

This specification defines the integration of YouTube background video streaming and NDA protected placeholders for all 24 exhibition frames defined in `link.md`. YouTube iFrames will be heavily styled, parameter-injected, and scaled (125%) to completely strip all YouTube branding, watermarks, player controls, and interactive elements. For protected/classified items (10 NDA frames), a specialized Cyberpunk Glassmorphism `NDAPlaceholder` with canvas noise and classified tags will render in lieu of video content.

---

## User Scenarios

### User Story 1 - Stealth YouTube Background Streaming (Priority: P1)

As a visitor reviewing the exhibition, I want public video frames (e.g., Frame 1, 3-15) to stream high-definition 4K/8K background video via YouTube without seeing any YouTube logos, controls, titles, or player overlays, so that the experience feels like a native high-performance video engine.

**Acceptance Scenarios**:
1. **Given** a public catalog frame with a `youtubeId`, **When** the section enters view, **Then** an invisible, scaled (125%), muted, looping YouTube iFrame plays in the background behind dark overlay filters (`multiply` blend mode).
2. **Given** the YouTube background player, **When** inspecting pointer interactions, **Then** all mouse/touch events pass directly through (`pointer-events: none`) to underlying site controls.

---

### User Story 2 - Cyberpunk NDA Classified Placeholder (Priority: P1)

As a visitor scrolling to an NDA-protected project (Frames 2, 16-24), I want to see a striking Cyberpunk Glassmorphism placeholder card displaying `[ CLASSIFIED CONTENT ]` and tech tags over a procedural ambient noise canvas instead of an empty video player.

**Acceptance Scenarios**:
1. **Given** an NDA protected frame (`isNDA === true`), **When** rendered, **Then** `NDAPlaceholder` renders with `[ CLASSIFIED CONTENT ]` tag, glassmorphism border, subtle blur, and procedural noise background.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a digitized JSON data model (`data/catalog.json`) representing all 24 frames from `link.md`.
- **FR-002**: System MUST extract YouTube IDs from `link.md` URLs (e.g., `k4LPUgM94U8`, `AvFzF1Lgzog`, `ZkR-JyxodD0`, `iFN6DvXk04Y`, `HBBrgEnOBUc`, etc.).
- **FR-003**: System MUST construct `VideoBackground` component with query params: `autoplay=1&mute=1&controls=0&loop=1&playlist={youtubeId}&playsinline=1&rel=0&enablejsapi=1`.
- **FR-004**: System MUST apply CSS scaling (125%) and `overflow: hidden` on the container to push YouTube watermarks/logos completely outside the visible viewport.
- **FR-005**: System MUST apply a dark overlay mask with `mix-blend-mode: multiply` over the video to obscure video compression artifacts.
- **FR-006**: System MUST render `NDAPlaceholder` with `[ CLASSIFIED CONTENT ]` glassmorphism card for all 10 NDA frames.

---

## Success Criteria *(mandatory)*

- **SC-001**: 0% visible YouTube branding (no logo, no control bar, no title header).
- **SC-002**: 100% of 24 catalog frames correctly map to either public `VideoBackground` or `NDAPlaceholder`.
- **SC-003**: Performance remains at 60+ FPS without CPU/GPU stuttering from iframe background rendering.
