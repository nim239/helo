# Research & Decisions: Exhibition Portfolio

## Phase 0: Clarifications & Best Practices

All unknown variables have been clarified directly with the user via `/speckit-clarify` during the specification phase.

### Decision 1: Data Model Architecture
- **Decision**: Use a unified `layout` property with a nested `items` array for horizontal marquees.
- **Rationale**: A marquee section is a collection of independent visual works. Keeping items as a nested array allows dynamic rendering, lazy loading, and individual media control without modifying core section components.
- **Alternatives considered**: Flat array with relational IDs (rejected due to excessive complexity for a static portfolio).

### Decision 2: Data Source & SSG
- **Decision**: Store exhibition data as a Local Static JSON (`data/sections.json`) and bundle via Next.js Static Site Generation (SSG).
- **Rationale**: Portfolio content is not frequently updated. SSG guarantees zero-latency first load and avoids external DB queries during runtime.
- **Alternatives considered**: Headless CMS (rejected as overkill for current scope).

### Decision 3: Media Hosting & CDN
- **Decision**: Use Free Tier CDN (Supabase, Firebase, or Cloudinary) serving native `.webm` files.
- **Rationale**: Next.js `public` folder hosting consumes Vercel bandwidth heavily. Iframe embeds (YouTube/Vimeo) break VRAM garbage collection. Direct CDN storage provides byte-range requests and complete JS DOM control for `video.load()` flushes.
- **Alternatives considered**: YouTube/Vimeo embeds (rejected, breaks IO and autoplay policies).

### Decision 4: Zustand Transient State for Physics
- **Decision**: Store high-frequency physics variables (`scrollProgress`, `teleportCooldown`, `baseTimestamp`) in Zustand and bypass React `useContext`/`useState`.
- **Rationale**: Avoids React reconciliation storms. Ensures 120fps CSS variable updates.
- **Alternatives considered**: React Context (rejected due to re-render cascade).
