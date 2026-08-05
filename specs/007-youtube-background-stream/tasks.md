# Tasks: YouTube Background Stream & NDA Placeholder System

**Feature**: YouTube Background Stream & NDA Placeholder System (`007-youtube-background-stream`)
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Phase 1: Data Preparation

- [x] T001 Create `data/catalog.json` containing structured data for all 24 frames from `link.md` (id, title, artist, techTag, isNDA, youtubeId, youtubeIdRaw).

---

## Phase 2: Component Development

- [x] T002 Create `components/VideoBackground.tsx` to handle YouTube iframe embed, URL parameter injection, 125% zoom clipping, and dark overlay mask.
- [x] T003 Create `components/NDAPlaceholder.tsx` to render Cyberpunk Glassmorphism `[ CLASSIFIED CONTENT ]` badge with procedural noise canvas and tech tags.

---

## Phase 3: Assembly & Routing

- [x] T004 Update `components/NeonCard.tsx` and `app/page.tsx` to render `VideoBackground` or `NDAPlaceholder` based on frame `isNDA` flag.
- [x] T005 Verify zero visible YouTube branding, smooth video playback, and clean NDA placeholder rendering.
