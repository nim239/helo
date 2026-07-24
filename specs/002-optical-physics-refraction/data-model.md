# Data Model & Shader Uniforms

## Transient State (Zustand)

```typescript
interface ScrollState {
  // Existing fields...
  scrollY: number;
  scrollVelocity: number; // New field tracking scroll speed
}
```

## Custom ShaderMaterial Uniforms

```glsl
uniform sampler2D u_beautyMap;     // The RGB beauty pass
uniform sampler2D u_normalMap;     // The XYZ normal data for refraction
uniform sampler2D u_alphaMap;      // The opacity mask
uniform sampler2D u_backgroundMap; // The DOM background texture
uniform float u_aberration;        // Chromatic aberration intensity (linked to scrollVelocity)
uniform float u_time;              // For any continuous micro-animations if needed
```
