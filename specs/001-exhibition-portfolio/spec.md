# Feature Specification: Exhibition Portfolio & Scroll Engine

**Feature Branch**: `001-exhibition-portfolio`  
**Created**: 2026-07-22  
**Status**: Draft  
**Input**: User description: "Add CDN and WebM specifications for native video hosting."

## Clarifications

### Session 2026-07-22
- Q: The specification lacks the exact JSON data structure for sections featuring a Horizontal Auto-Marquee. How should the media items for a marquee be structured in the data model? → A: Use a nested array structure with a unified `layout` property (e.g. `layout: "horizontal-marquee"`). Each marquee item represents an independent artwork entity inside an `items` array.
- Q: Where will the JSON configuration data for the entire exhibition be stored and loaded from? → A: Local Static JSON (`data/sections.json`) bundled with Next.js (SSG).

## Architecture & Layout Overview *(mandatory)*

### 1. Section Hierarchy & Clone Layout (Buffer Expansion)
DOM Structure (3-Section Buffer for over-scroll protection):
```text
├── Clone Section 4' (Index 0)
├── Clone Section 5' (Index 1)
├── Clone Section 6' (Index 2)
│
├── Section 1: INTRO (Index 3)
├── Section 2: REEL (Index 4)
├── Section 3: WORK A (Index 5)
├── Section 4: WORK B (Index 6)
├── Section 5: WORK C (Index 7)
├── Section 6: CONTACT (Index 8)
│
├── Clone Section 1' (Index 9)
├── Clone Section 2' (Index 10)
└── Clone Section 3' (Index 11)
```

### 2. Scroll Container Strategy
**Use browser native document scroll. Lenis wraps window scrolling.**
- **Forbidden**: Custom overflow scroll containers.

### 3. Coordinate System & Sync (CSS Variable Strategy)
- JS measures exact `window.innerHeight` (with debounce) and writes to CSS variable `var(--section-height)`. All CSS layouts MUST use this variable to sync JS math with CSS layouts, avoiding Safari layout shifts.

### 4. Non-Interactive Exhibition Rule (Core UX)
The interface behaves like a physical museum. **"Look but don't touch"**.
- **Rule**: Entire exhibition contents (video, sprite, 3D canvas) render and animate purely based on scroll progress or auto-timelines.
- **Forbidden**: Play/pause buttons, click-to-expand, hover-to-reveal, drag-to-rotate, or any pointer interaction on artwork.
- **Exception (Section 6 - CONTACT)**: The contact section is the ONLY place where click interaction is permitted.
- **Video Elements**: MUST force `muted` and explicitly omit `controls`. Fallback for playback failure is strict static poster.
  - **Strict Mute Policy**: Audio playback is STRICTLY PROHIBITED globally on all video elements to prevent twin-audio bugs when real and clone sections overlap. If global background music is required in the future, it MUST be implemented as a single, centralized top-level `<audio>` element. Individual videos must never be unmuted.
- **3D Elements (R3F)**: `OrbitControls` or manual drag/rotate MUST be completely disabled.

### 5. Zustand Transient State Architecture (120fps Target)
**CRITICAL: Bypassing React Render Cycle for Physics & Re-render Clash Protection**.
- **Zustand Store**: Holds `currentPhase`, `teleportCooldown`, `snapTarget`, and `scrollProgress`.
- **Transient Updates**: The store operates outside the React lifecycle. Lenis `onScroll` writes data directly to Zustand.
- **DOM Mutations**: Math evaluation reads from Zustand synchronously. DOM updates use direct ref mutations (`ref.current.style.transform`), bypassing React reconciliation entirely.
- **Global Re-render Clash Protection**: If React is forced to re-render (e.g., window resize debounced `--section-height` update), the Virtual DOM will wipe out transient inline styles. 
  - **Solution**: The system MUST implement `useLayoutEffect` to read the latest Zustand values and re-inject them into the Real DOM immediately before browser paint, or strictly isolate transient components via `React.memo`. This rule applies to **ALL** ref-mutated elements (marquee tracks, sections, parallax layers).

### 6. Horizontal Auto-Marquee Media Cluster (Work 2 & 3 Scenarios)

**Description**: Specific sections (e.g., Work 2, Work 3) feature a horizontal infinite auto-scrolling ticker (Marquee) of 3-10 videos intersecting the primary vertical infinite scroll. 
**Interaction Model (UPDATED POST-MVP PIVOT): Zero manual interaction. The track moves continuously at a constant speed, regardless of user scroll state.** No hover-to-play, no tap-to-toggle, no dragging. Videos play continuously when in viewport.
*Reason for change*: The original "Dwell-to-Play" (stopping the marquee when the user stops scrolling) resulted in a poor, disjointed UX that felt unresponsive ("trải nghiệm dừng chuột dừng trôi như cứt").

**Layout & Animation Strategy**:
- **Mechanism**: The horizontal track moves continuously via a dedicated RAF loop using CSS `transform: translate3d(x, 0, 0)`.
- **Scroll Isolation**: No manual horizontal dragging exists at all. Lenis native vertical momentum remains 100% uninterrupted; the marquee never intercepts touch/wheel events.

**Always-Playing Rule (Desktop + Mobile, single code path)**:
- **Trigger condition**: Videos auto-play whenever they intersect with the viewport via `IntersectionObserver`.
- **Marquee motion**: The marquee continuously calculates its position via `(performance.now() * speed) % trackWidth`. It never pauses.
  - **Float Precision Protection**: To prevent float precision loss, the system MUST use `performance.now()` for time delta calculations, wrapped in a modulo operator based on track width:
    `((performance.now() - baseTimestamp - totalPausedDuration) * speed) % originalTrackWidth`.
  - **Modulo DOM Duplication (Seam Snap Prevention)**: To ensure modulo seamless looping without visual snapping when `translateX` resets, the Marquee DOM MUST physically duplicate its inner node list (e.g., `[A,B,C] -> [A,B,C, A,B,C]`). 
  - **Dynamic Track Width**: The `originalTrackWidth` MUST NOT be measured once on mount. It MUST be continuously monitored via a `ResizeObserver` attached to the original node set to account for image/font lazy loading and breakpoint layout shifts.

### 7. Asset Hosting & CDN Strategy (Media Optimization)
- **Native Video Only**: MUST use native HTML5 `<video>` tags. Embeds from YouTube, Vimeo, or other iframe-based providers are strictly forbidden, as they break VRAM flushing and Dwell-to-Play logic.
- **Format & Hosting**: Video assets MUST be served in `.webm` format (with `.mp4` as fallback) for extreme compression efficiency.
- **Free CDN Architecture**: To achieve instant byte-range requests without buffering, videos MUST be hosted on a Free-Tier CDN optimized for media delivery (e.g., Supabase Storage, Cloudinary, or Firebase Storage). Direct hosting in the Next.js `public` folder is discouraged for massive video assets to save Vercel bandwidth.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Exhibition Loop & Velocity Preservation (Priority: P1)
**Velocity Preservation**: Use native Lenis API / fake wheel events. Do not hack `.velocity`.
**Teleport Math**:
- Down: When `scrollY >= sectionHeight * 9` -> teleport to `scrollY - (sectionHeight * 6)`.
- Up: When `scrollY <= sectionHeight * 2` -> teleport to `scrollY + (sectionHeight * 6)`.

---

### User Story 2 - Unified Dwell-to-Play Marquee Rule (Priority: P2)
**Interaction Model: Zero manual interaction.** 

**Trigger Condition**: `(marquee section intersects viewport) AND (Lenis vertical scroll velocity < 0.1px/frame) AND (Duration >= 400ms sustained) AND (Teleport Cooldown is INACTIVE)`.
- **On trigger**: Horizontal track momentum pauses. The video closest to the horizontal center automatically calls `.play()`. 
- **On resume**: The instant vertical scroll velocity rises above threshold again, the playing video pauses/reverts, and horizontal track resumes.

---

### User Story 3 - Marquee VRAM Optimization (Rule of 3) (Priority: P3)
**Aggressive IO Performance Rules**:
- **Rule of 3 (Physical Nodes)**: Max 3 `<video>` elements active at any time. This limit applies to the **physical DOM nodes**, treating duplicated DOM elements in the seam as entirely independent entities.
- **Vertical-First IO Verification**: The Rule of 3 IO MUST strictly verify Vertical Intersection first. Videos inside a Marquee (Real or Clone) are ONLY allowed to mount if their parent section is actively intersecting the vertical viewport. 
- **Safe Dwell-Unmount Sync**: When a section rapidly exits the vertical viewport, the Vertical-First IO force-unmount MUST execute synchronously BEFORE or simultaneously with the Zustand `DWELLING -> false` transition.
- **Safari VRAM Flush**: Videos scrolling out of bounds MUST be aggressively purged from memory via `videoNode.removeAttribute('src'); videoNode.load();`.
  - **CRITICAL - Flash Prevention**: The `<video>` element MUST have a persistent `poster` attribute defined in HTML to prevent a 1-frame black flash upon `.load()`.
- **Least-Visible Formula**: The video displaced/unmounted to satisfy the Rule of 3 is strictly defined as the video whose absolute horizontal distance from the viewport's center axis is the largest.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Render 6 main sections + 6 clones using Native Document Scroll.
- **FR-002**: Apply JS-calculated `--section-height` to sync CSS layouts. Protect ALL transient inline styles from React VDOM wipes using `useLayoutEffect`.
- **FR-003**: Wrap `video.play()` in `try/catch`. Force ALL videos globally to be completely `muted` and omit `controls`. Audio playback is strictly forbidden.
- **FR-004**: Calculate snap targets targeting section centers via Lenis native `scrollTo`.
- **FR-005**: Execute force-visibility checks on media immediately after a teleport.
- **FR-006**: Implement Horizontal Auto-Marquee using modulo-safe time-based calculation `((performance.now() - baseTimestamp - totalPausedDuration) * speed) % originalTrackWidth`. The DOM must be physically doubled `[A,B,C, A,B,C]` and `originalTrackWidth` monitored via `ResizeObserver`.
- **FR-007**: Enforce Unified Dwell-to-Play triggered purely by Lenis resting (<0.1px/frame for >= 400ms) with a strict condition that `teleportCooldown` must be inactive.
- **FR-008**: Enforce Rule of 3 for horizontal marquee videos with Vertical-First IO verification. Treat DOM duplicates as independent entities. Execute deep VRAM flush (`removeAttribute('src')` + `.load()`) for off-screen videos. Ensure IO unmount logic executes before `DWELLING` state transitions to prevent null ref crashes.
- **FR-009**: Teleport transitions MUST immediately force-kill any active `DWELLING` state and force-pause any playing Dwell videos.
- **FR-010**: All media MUST use native HTML5 `<video>` tags serving `.webm`/`.mp4` formats. Iframe embeds are explicitly forbidden. Assets MUST be pulled from a Free-Tier CDN (Supabase/Cloudinary/Firebase) to ensure direct byte-range requests and preserve Vercel bandwidth.

### Accessibility Rules
- **prefers-reduced-motion**: Disable sprite animations and parallax. Maintain infinite loop navigation.
- **Screen Reader Blackhole**: All Clone Sections MUST have `aria-hidden="true"`.

---

## Key Entities & Data Models *(mandatory)*

### Exhibition Data Model Configuration
The JSON structure enforces a unified `layout` system with nested array items for marquees. Stored as Local Static JSON (e.g. `data/sections.json`).
```json
[
  {
    "id": "reel",
    "title": "Director's Reel",
    "layout": "fullscreen-video",
    "parallax": {
      "foreground": 1.2,
      "background": 0.8
    },
    "mediaType": "video",
    "src": "/projects/reel/preview.webm",
    "poster": "/projects/reel/cover.webp"
  },
  {
    "id": "work-b",
    "title": "Motion Work",
    "layout": "horizontal-marquee",
    "marquee": {
      "direction": "left",
      "speed": 0.8,
      "pauseOnHover": false,
      "infinite": true
    },
    "items": [
      {
        "id": "shot01",
        "mediaType": "video",
        "src": "/projects/work-b/01.webm",
        "poster": "/projects/work-b/01.webp"
      },
      {
        "id": "shot02",
        "mediaType": "image",
        "src": "/projects/work-b/02.webp"
      }
    ]
  }
]
```

### Scroll State Machine Transitions (Zustand Store)
| Current State | Trigger Event | Next State | Action / Condition |
|---------------|---------------|------------|--------------------|
| `IDLE` | User scrolls (Wheel/Touch) | `SCROLLING` | Cancel active snap lerps. Marquee resumes. |
| `SCROLLING` | Cross boundary | `TELEPORTING` | Instant math teleport, start 500ms cooldown. |
| `TELEPORTING` | Instant math executes | `SCROLLING` | Force media IO check (try/catch `play()`). |
| `SCROLLING` | `onScrollEnd` IN Cooldown | `IDLE` | Bypass snap lerp, reset state to prevent deadlock. |
| `IDLE` | Cooldown expires AND Velocity ~0 | `SNAPPING` | Re-evaluate nearest section, trigger snap lerp. |
| `SCROLLING` | `onScrollEnd` (Velocity ~0) | `SNAPPING` | Must be OUTSIDE 500ms teleport cooldown. |
| `SNAPPING` | Snap lerp completes | `IDLE` | Update URL hash (replaceState). |
| `IDLE` | `Duration >= 400ms` AND `Cooldown == FALSE` | `DWELLING` | Marquee pauses. Center video auto-plays. |
| `DWELLING` | User resumes scroll (`vel > threshold`) | `SCROLLING` | Marquee video pauses, track resumes momentum. |
| `DWELLING` | Edge case: Teleport bounds crossed | `TELEPORTING` | Force-kill DWELLING, force-pause video, start teleport. |
