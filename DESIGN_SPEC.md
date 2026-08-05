# LIVE CODE DESIGN SPECIFICATION

This specification is generated exactly from the current live codebase (`src/app/`, `components/`, and `data/sections.json`). It represents the ground truth for designers.

## 1. LIVE DESIGN SYSTEM

### Colors & Variables (Global CSS / Tailwind)
- **Background**: `--background: #000000` (Pure Black)
- **Foreground**: `--foreground: #ffffff` (Pure White)
- **Neon Colors (Kinetic Strings)**:
  - Electric Cyan: `rgb(0, 242, 255)`
  - Neon Magenta: `rgb(255, 0, 127)`
  - Laser Blue: `rgb(0, 102, 255)`
  - Royal Violet: `rgb(178, 0, 255)`
  - Emerald Mint: `rgb(0, 255, 136)`
  - Hot Crimson Pink: `rgb(255, 0, 85)`
  - Sky Blue: `rgb(0, 191, 255)`
  - Neon Orange Red: `rgb(255, 60, 0)`
  - Electric Purple: `rgb(210, 0, 255)`
- **HackerMode HUD**: `#22c55e` (Tailwind `green-500`) and `#4ade80` (Tailwind `green-400`)

### Typography (Global CSS)
- **Sans-serif Base**: `--font-sans` (`var(--font-geist-sans)`)
- **Monospace Base**: `--font-mono` (`var(--font-geist-mono)`)

### Layout Constraints (Global CSS)
- **Section Height**: `--section-height: 100dvh`
- **Scrolling Rules**:
  - `overflow-x: hidden`
  - `overscroll-behavior: none` (Prevents iOS/Mac bounce)
  - `touch-action: pan-y`
  - Scrollbars are entirely hidden (`::-webkit-scrollbar { display: none; }`)

---

## 2. ACTIVE HUD OVERLAYS & GLOBAL COMPONENTS

### Enter Overlay (`EnterOverlay.tsx`)
- **Initial State**: A `90vmin` circular button with a 2px stroke (`rgba(255,255,255,0.8)` initially, transitioning to `rgba(255,255,255,0.1)`).
- **Lottie Element**: Inside the circle, plays `/lotie/hitmebabyonemoretime.json` using SVG renderer.
- **Placeholder Logo**: Displays "**N**" at `top-8` center (`text-2xl`, `font-bold`, `tracking-widest`).

### Hacker Mode HUD (`HackerMode.tsx`)
- **Trigger**: `Shift + H`
- **Positioning**: Fixed overlay spanning the entire viewport (`inset-0`), content aligned bottom-left (`flex-col justify-end p-8`).
- **Typography & Color**: `font-mono`, `text-green-500` (`#22c55e`), pulsating ASCII text in `text-green-400` (`#4ade80`).
- **Live Text Strings**:
  - `SYSTEM: ONLINE`
  - `SCROLL ENGINE: [currentPhase]`
  - `VIRTUAL PROGRESS: [0.00% - 100.00%]`
  - `RAF FPS: [e.g., 60]`

### Background Grid (`BackgroundGrid.tsx`)
- **Visual**: Linear gradient intersecting lines rendering at `7vw` tile sizes (`rgba(255, 255, 255, 0.04)`). Scroll-driven parallax with `speed = 0.2`.

### Parallax Sides (`ParallaxSides.tsx`)
- **Corners**: Lottie Sparkles (`/lotie/Sparkles.json`) at top-left & top-right, blended with `mix-blend-screen`.
- **Side Glows**: Lottie gradients (`/lotie/gradient_glow.json`) running along the absolute left/right edges, blending `mix-blend-screen`.

### Kinetic Strings Canvas (`KineticStringsCanvas.tsx`)
- **Positioning**: Global background layer (via `layout.tsx`).
- **Structure**: 2 independent clusters (Left & Right) of 3 harmonic strings each.
- **Line Widths**: Central string is razor-thin `0.8px` solid white; nested blur glows range from `1.0px` to `2.8px`.

---

## 3. LIVE 6-SECTION LAYOUT SPEC (`page.tsx` + `sections.json`)

The experience is driven by Lenis infinite scroll (`useExhibitionScroll`). The 6 real sections are wrapped, with the 1st section cloned at the bottom as a buffer to seamlessly loop.

### Section 1: Intro (Welcome)
- **ID**: `intro`
- **Layout Mode**: `fullscreen-video`
- **Typography**: `text-4xl md:text-7xl font-bold tracking-tighter` (String: **"Welcome"**)
- **Parallax Mapping**: `foreground: 1.2`, `background: 0.8`
- **Media**: `intro.webm` / `intro-poster.webp`

### Section 2: Director's Reel
- **ID**: `reel`
- **Layout Mode**: `fullscreen-video`
- **Typography**: `text-4xl md:text-7xl font-bold tracking-tighter mb-4` (String: **"Director's Reel"**)
- **Media**: `reel.webm` / `reel-poster.webp`

### Section 3: CGI Showcase
- **ID**: `work-a`
- **Layout Mode**: `fullscreen-video`
- **Typography**: `text-4xl md:text-7xl font-bold tracking-tighter mb-4` (String: **"CGI Showcase"**)
- **Media**: `work-a.webm` / `work-a-poster.webp`

### Section 4: Motion Work
- **ID**: `work-b`
- **Layout Mode**: `horizontal-marquee`
- **Typography**: `text-2xl md:text-5xl font-bold tracking-tighter absolute top-12 md:top-24 left-12 md:left-24 z-10 pointer-events-none mix-blend-difference` (String: **"Motion Work"**)
- **Behavior**: Scrolls **left** (`direction: "left"`, speed: `1.0 * 0.05`).
- **Media Assets**: 
  - `b-shot01.webm` (`/videos/work-b/01.webp`)
  - `b-shot02.webm` (`/videos/work-b/02.webp`)
  - `b-shot03.webm` (`/videos/work-b/03.webp`)

### Section 5: Commercials
- **ID**: `work-c`
- **Layout Mode**: `horizontal-marquee`
- **Typography**: Same absolute positioning & mix-blend-difference as Section 4 (String: **"Commercials"**)
- **Behavior**: Scrolls **right** (`direction: "right"`, speed: `0.8 * 0.05`).
- **Media Assets**: 
  - `c-shot01.webm` (`/videos/work-c/01.webp`)
  - `c-shot02.webm` (`/videos/work-c/02.webp`)
  - `c-shot03.webm` (`/videos/work-c/03.webp`)

### Section 6: Contact
- **ID**: `contact`
- **Layout Mode**: `interactive-scene`
- **Typography**: `text-4xl md:text-7xl font-bold tracking-tighter mb-4` (String: **"Contact"**)

---

## 4. GRAPHIC ASSET REQUIREMENTS

To perfectly replace placeholder media, designers must output assets matching these technical constraints:

1. **Preload Sprite Sequence (`EnterOverlay.tsx`)**
   - **Count**: Exactly 120 frames.
   - **Format**: `.webp`
   - **Naming**: `cubi_00000.webp` to `cubi_00119.webp` and `cubi_glow_00000.webp` to `cubi_glow_00119.webp`.
   - **Path**: `/sprite_cubi/cubi/` and `/sprite_cubi/cubi_glow/`.

2. **Lottie Animations (`EnterOverlay`, `ParallaxSides`)**
   - `hitmebabyonemoretime.json`: Used for Enter Button. Must support `svg` renderer and `preserveAspectRatio: 'xMidYMid meet'`. Timeline expects key segments: Jump (0-118) and Idle (119-199).
   - `Sparkles.json`: Canvas renderer, looping background corner sparkles.
   - `gradient_glow.json`: Canvas renderer, looping side gradients.

3. **Video Content (`sections.json`)**
   - **Codec**: `.webm` (for alpha / optimized web playback).
   - **Fallbacks**: `.webp` static posters.
   - **Containers**: Must fit either `fullscreen-video` layout containers (100dvh covers) or `horizontal-marquee` scroll tracks.
