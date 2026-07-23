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
type ScrollPhase = 'IDLE' | 'SCROLLING' | 'SNAPPING';

interface ScrollState {
  currentPhase: ScrollPhase;
  scrollProgress: number; // 0 to 1
  velocity: number;
  isIntroComplete: boolean;
  completeIntro: () => void;
  setPhase: (phase: ScrollPhase) => void;
  setScrollProgress: (progress: number) => void;
  setVelocity: (velocity: number) => void;
}
```
