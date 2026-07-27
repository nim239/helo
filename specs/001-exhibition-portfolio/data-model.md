# Data Model: Exhibition Portfolio

## 1. Exhibition Data Model Configuration (Static JSON)
Located at: `data/sections.json`

This structure enforces a unified `layout` system with nested array items for marquees.

### Entity: Section
- `id` (string): Unique identifier for the section.
- `title` (string): Display title of the section.
- `layout` (string): Defines the rendering component (e.g., `"fullscreen-video"`, `"horizontal-marquee"`).
- `parallax` (object, optional): Configuration for 2.5D Parallax.
  - `foreground` (number): Parallax speed multiplier for foreground layers (e.g., `1.2`).
  - `background` (number): Parallax speed multiplier for background layers (e.g., `0.8`).
- `mediaType` (string, optional): Type of primary media (e.g., `"video"`, `"image"`).
- `src` (string, optional): URL to the media asset on the CDN.
- `poster` (string, optional): URL to the static fallback poster image.
- `marquee` (object, optional): Configuration for auto-scrolling track.
  - `direction` (string): e.g., `"left"`.
  - `speed` (number): e.g., `0.8`.
  - `pauseOnHover` (boolean): Usually `false`.
  - `infinite` (boolean): `true`.
- `items` (array, optional): Nested media items for horizontal marquees.
  - `id` (string): Unique ID for the media item.
  - `mediaType` (string): `"video"` or `"image"`.
  - `src` (string): URL to the media asset on the CDN.
  - `poster` (string, optional): URL to the static fallback poster image.

## 2. Transient State Architecture (Zustand Store)

This store manages scroll coordinates, snapping, and teleportation logic outside the React render cycle.

### Entity: ExhibitionState
- `currentPhase` (string): Current state of the exhibition.
  - Enum: `IDLE`, `SCROLLING`, `TELEPORTING`, `SNAPPING`, `DWELLING`.
- `scrollProgress` (number): Normalized or absolute scroll value synchronized directly from Lenis.
- `snapTarget` (number | null): The target scroll `y` coordinate when snapping to a section.
- `teleportCooldown` (boolean): Prevents snap/dwell events immediately after a teleport. True for 500ms after a teleport.

### State Transitions (Machine)
- **IDLE -> SCROLLING**: On user scroll. Cancels active snaps.
- **SCROLLING -> TELEPORTING**: On crossing virtual loop boundary. Triggers teleport math.
- **TELEPORTING -> SCROLLING**: Math executes, cooldown starts.
- **SCROLLING -> SNAPPING**: `onScrollEnd` (vel ~0) OUTSIDE cooldown.
- **SNAPPING -> IDLE**: Lerp completes.
- **IDLE -> DWELLING**: Scroll stopped >= 400ms. Marquee pauses, auto-plays center video.
- **DWELLING -> SCROLLING**: User resumes scrolling. Marquee track resumes.
