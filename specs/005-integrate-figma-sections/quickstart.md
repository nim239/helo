# Quickstart & Verification Guide: Integrate Figma Sections

## 1. Setup & Local Dev Server
```bash
npm run dev
```

## 2. Verification Checklist

### Section 1: Intro (NimVFX Hero)
- [ ] Load page after preloader completes.
- [ ] Verify primary headline renders **NimVFX** with bold gradient accent on **VFX**.
- [ ] Verify 3D CSS Glass Cube rotates smoothly on the right side.
- [ ] Verify metadata tag reads `NimVFX — 2026`.

### Section 2: Director's Reel
- [ ] Scroll to Section 2.
- [ ] Verify 16:9 cinematic container with corner brackets, scanlines, blur orb, play button, and bottom metadata row ("DURATION: 03:42 | FORMAT: 4K UHD | CODEC: H.265").

### Section 3: CGI Showcase
- [ ] Scroll to Section 3.
- [ ] Verify 5-item asymmetric bento grid layout with slight rotation angles and neon cards ("GLASS FLUID SIM", "NEON GEOMETRY", "PARTICLE STORM", "ABSTRACT ARCH", "DATA VIZ").

### Section 4 & 5: Marquees
- [ ] Scroll through Section 4 (Motion Work) and Section 5 (Commercials).
- [ ] Verify endless left and right marquee tracks populated with rich `NeonCard` items and client badges (Nike x NimVFX, Netflix, Coachella, Apple, Samsung, Adidas).
- [ ] Verify typography distorts dynamically with scroll velocity.

### Section 6: Contact
- [ ] Scroll to Section 6.
- [ ] Verify headline "Let's connect." with gradient accent.
- [ ] Verify `MagneticButton` reacts to cursor hovering with glowing concentric rings.
- [ ] Verify ambient 60-particle canvas field draws connection lines between nearby particles (< 120px).
- [ ] Verify massive stroked background letterform "NIM" and live GMT+7 clock.

### Post-Integration Cleanup Verification
- [ ] Run cleanup command: `Remove-Item -Recurse -Force layout_figmamakeAI, contact`
- [ ] Verify project builds clean (`npm run build`).
