# Implementation Plan: Inverse Kinetic Typography

**Feature Directory**: `specs/006-inverse-kinetic-typography`
**Spec**: [spec.md](spec.md)

---

## 1. Component Architecture

### `components/KineticHeader.tsx` (NEW)
- A reusable component that implements the zero-sum math and damping physics algorithm.
- Relies on `@studio-freight/react-lenis` (`useLenis`) to subscribe to scroll velocity at 165FPS without React renders.
- Takes props: `text1` (e.g., "CGI"), `text2` (e.g., "SHOWCASE"), and optional `className`.
- Implements `smoothV` ref with a `0.1` lerp factor for syrupy smooth, damped physics.

## 2. Integration

### `app/page.tsx`
- Replace existing static headers in Section 2 (Director's Reel) and Section 3 (CGI Showcase) with the new `<KineticHeader />`.
- Section 2: `<KineticHeader text1="DIRECTOR'S" text2="REEL" />`
- Section 3: `<KineticHeader text1="CGI" text2="SHOWCASE" />`
- Remove the older `useKineticTypography` usage for these specific split headers to utilize the new zero-sum flexbox layout.

## 3. CSS & Layout Guarantees
- Use `whitespace-nowrap`, `backface-hidden`, `transform-gpu`, `origin-left`, and `origin-right` as specified by the user to ensure layout stability and hardware acceleration.
- Flex container with `justify-between` and `w-full` to anchor the text strictly to the edges.

## Verification Plan
1. Check `localhost:3005` in browser.
2. Scroll rapidly and observe the text expanding/contracting inversely.
3. Verify that the total width of the container remains 100% constant and does not trigger horizontal layout shifts.
