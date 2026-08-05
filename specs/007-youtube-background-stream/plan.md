# Implementation Plan: YouTube Background Stream & NDA Placeholder System

**Feature Directory**: `specs/007-youtube-background-stream`
**Spec**: [spec.md](spec.md)

---

## 1. Data Preparation (Phase 1)
- Create `data/catalog.json` with 24 frame objects parsed from `link.md`:
  - `id`: 1 to 24
  - `title`: Track / Performance title
  - `artist`: Artist / Client name
  - `techTag`: Tech tag description (e.g., "12K Panoramic LED Canvas", "Real-Time Notch FX Engine")
  - `isNDA`: boolean
  - `youtubeId`: string or null
  - `youtubeIdRaw`: string or null (for secondary raw visual)

## 2. Component Development (Phase 2)
- **`components/VideoBackground.tsx`**:
  - Encapsulates YouTube iframe embed logic.
  - Injects `autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0`.
  - CSS scale: `scale-[1.25]` with absolute centering to push logo off-screen.
  - Overlay mask: `bg-black/60 mix-blend-multiply` to elevate foreground text.
  - `pointer-events-none` on container.
- **`components/NDAPlaceholder.tsx`**:
  - Rendered when `isNDA === true`.
  - Displays `[ CLASSIFIED CONTENT ]` Cyberpunk Glassmorphism badge.
  - Includes technical metadata tag, border glow, and canvas background.

## 3. Assembly & Routing (Phase 3)
- Integrate catalog lookup into `app/page.tsx` or `components/Section.tsx`.
- Allow sections to switch dynamically between `VideoBackground` and `NDAPlaceholder` based on `isNDA`.

## Verification Plan
1. Check `localhost:3005` on Reel and Bento sections.
2. Confirm YouTube watermark/controls are 100% invisible.
3. Confirm NDA frames render `NDAPlaceholder` with `[ CLASSIFIED CONTENT ]`.
