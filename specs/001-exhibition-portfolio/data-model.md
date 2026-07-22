# Data Model: Exhibition Portfolio

This document defines the Local Static JSON schema (`data/sections.json`) that powers the exhibition engine.

## Base Section Model

Every section object in the exhibition array must conform to this interface:

```typescript
type LayoutType = 'fullscreen-video' | 'horizontal-marquee' | 'vertical-gallery' | 'interactive-scene';

interface Section {
  id: string;
  title: string;
  layout: LayoutType;
  parallax?: {
    foreground: number;
    background: number;
  };
}
```

## Marquee Layout Specifics

When `layout === 'horizontal-marquee'`, the section expands to include marquee configurations and a nested `items` array.

```typescript
interface MarqueeConfig {
  direction: 'left' | 'right';
  speed: number;
  pauseOnHover: boolean; // Note: Currently overridden by Non-Interactive Rule (false)
  infinite: boolean;
}

interface MarqueeMediaItem {
  id: string;
  mediaType: 'video' | 'image';
  src: string;        // CDN URL for .webm or .webp
  poster?: string;    // Mandatory if mediaType === 'video'
  caption?: string;
}

interface MarqueeSection extends Section {
  layout: 'horizontal-marquee';
  marquee: MarqueeConfig;
  items: MarqueeMediaItem[];
}
```

## Zustand State Models (Transient)

These states are maintained purely in memory during runtime and do not persist.

```typescript
// useScrollStore.ts
type Phase = 'IDLE' | 'SCROLLING' | 'TELEPORTING' | 'SNAPPING' | 'DWELLING';

interface ScrollState {
  currentPhase: Phase;
  teleportCooldownActive: boolean; // Evaluated dynamically based on timestamp
  lastTeleportTime: number;
  scrollProgress: number; // 0.0 to 1.0
  setPhase: (phase: Phase) => void;
  triggerTeleport: () => void;
}

// useMarqueeStore.ts
interface MarqueeState {
  baseTimestamp: number;      // performance.now() captured on mount
  totalPausedDuration: number; // Accumulated ms spent in DWELLING state
  isDwelling: boolean;
  addPauseDuration: (ms: number) => void;
}
```
