# Phase 1 Data Model: Section Layout & Component Props

## 1. `sections.json` Schema Extension

```json
{
  "id": "string",
  "title": "string",
  "subtitle": "string (optional)",
  "layout": "fullscreen-video | horizontal-marquee | cgi-bento-grid | contact-interactive",
  "mediaType": "video | image",
  "src": "string (URL)",
  "poster": "string (URL)",
  "bentoItems": [
    {
      "id": "string",
      "label": "string",
      "accent": "#00F2FF | #FF007F | #00FF88 | #0066FF",
      "rotation": "number (deg)"
    }
  ],
  "marquee": {
    "direction": "left | right",
    "speed": "number"
  },
  "items": [
    {
      "id": "string",
      "label": "string",
      "accent": "string",
      "mediaType": "video",
      "src": "string",
      "poster": "string"
    }
  ]
}
```

## 2. Component Contracts & Interfaces

### `NeonCardProps`
- `label`: string
- `accent`: string (Hex color)
- `index`: number
- `width`?: string | number
- `height`?: string | number
- `rotation`?: number

### `MagneticButtonProps`
- `label`: string
- `onClick`: () => void
- `accent`?: string

### `ParticleFieldProps`
- `count`?: number (default: 60)
- `maxDistance`?: number (default: 120)
