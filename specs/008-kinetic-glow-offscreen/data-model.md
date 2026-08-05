# Data Model & Technical Specs: Kinetic Glow Offscreen Buffer & Bezier Curve Optimization

## 1. Offscreen Buffer Canvas Data Structures

### Canvas State Context (`KineticStringsCanvas.tsx`)
```typescript
interface OffscreenBufferState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scaleFactor: number; // Const 0.25
  width: number;       // Math.ceil(mainWidth * 0.25)
  height: number;      // Math.ceil(mainHeight * 0.25)
}
```

### Main Canvas Rendering Pipeline
```text
┌───────────────────────────────────────────────────────────┐
│ 1. RAF Animation Loop Trigger (GSAP Ticker)                │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 2. Offscreen Canvas (0.25x RAM Canvas)                    │
│    - ClearRect(0, 0, width*0.25, height*0.25)             │
│    - Compute String Coordinates (Y-Step = 10px Bezier)    │
│    - Render Thick Glow Stroke (lineWidth = 6px ~ 12px)    │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ 3. Main Canvas (1.0x Screen Display Canvas)               │
│    - ClearRect(0, 0, mainWidth, mainHeight)               │
│    - Set ctx.imageSmoothingEnabled = true                 │
│    - ctx.drawImage(offscreenCanvas, 0, 0, mainW, mainH)   │
│    - Render Sharp Core String (lineWidth = 1px, 1.0x)     │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Bezier Curve Algorithm Specification

### Mathematical Point Interpolation
Cho chuỗi điểm uốn sóng $P_0, P_1, P_2, \dots, P_n$ cách nhau khoảng $\Delta Y = 10px$:
- Với mỗi nấc $i$ từ $0$ đến $n-1$:
  - $P_i = (x_i, y_i)$
  - $P_{i+1} = (x_{i+1}, y_{i+1})$
  - Point Control: $C_i = P_i$
  - End Point: $M_i = \left(\frac{x_i + x_{i+1}}{2}, \frac{y_i + y_{i+1}}{2}\right)$
- Cú pháp lệnh Canvas 2D:
  ```javascript
  ctx.quadraticCurveTo(x_i, y_i, (x_i + x_next) / 2, (y_i + y_next) / 2);
  ```

---

## 3. CSS Radial Glow Layer Spec (`ParallaxSides.tsx`)

### Layout DOM Tree Replacement
```html
<!-- Replaced Lottie Container with Hardware-Accelerated Dual Glow Divs -->
<div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
  <!-- Left Cyan Glow Accent -->
  <div 
    className="absolute top-0 left-0 w-[30vw] h-full opacity-60 mix-blend-screen pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 0% 50%, rgba(0, 242, 255, 0.25) 0%, transparent 70%)',
      willChange: 'transform',
      transform: 'translateZ(0)'
    }}
  />

  <!-- Right Magenta Glow Accent -->
  <div 
    className="absolute top-0 right-0 w-[30vw] h-full opacity-60 mix-blend-screen pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 100% 50%, rgba(255, 0, 127, 0.25) 0%, transparent 70%)',
      willChange: 'transform',
      transform: 'translateZ(0)'
    }}
  />
</div>
```
