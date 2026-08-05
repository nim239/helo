# Feature Specification: Inverse Kinetic Typography

**Feature Directory**: `specs/006-inverse-kinetic-typography`
**Created**: 2026-08-05
**Status**: Draft

---

## Executive Summary

This specification defines the "Inverse Kinetic Typography" effect for section headers. The goal is to create a dynamic typography system driven by scroll velocity where a text block is split into two parts (e.g., "CGI" and "SHOWCASE"). As scroll velocity increases, Part 1 expands in weight (`wght`) and width (`wdth`), while Part 2 inversely contracts by the exact same proportion. This creates a zero-sum visual game where the total width of the container remains absolutely fixed, eliminating layout jitter while delivering a high-end, responsive kinetic feel.

---

## User Scenarios

### User Story 1 - Zero-Sum Kinetic Text Distortion (Priority: P1)

As a user scrolling through the exhibition, I want to see the two-part section titles react inversely to my scroll velocity, where one half thickens and stretches while the other thins and compresses, so that the overall text width remains perfectly stable and creates a premium "breathing" typographical effect.

**Independent Test**: Can be tested by scrolling rapidly on a section with an inverse kinetic title and observing that the bounding box of the title flex container never changes width, even as the individual words distort.

**Acceptance Scenarios**:
1. **Given** a two-part section title (e.g., "CGI SHOWCASE"), **When** the user scrolls down quickly, **Then** "CGI" increases to `wght` 900 and `wdth` 150, while "SHOWCASE" inversely decreases to `wght` 100 and `wdth` 50.
2. **Given** the scrolling text, **When** observing the layout, **Then** the outer flex container (`justify-content: space-between; width: 100%`) maintains a strict constant width without triggering reflows.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST utilize a Variable Font capable of independent 2-axis interpolation for both Weight (`wght`) and Width (`wdth`) (e.g., Inter Variable or PP Neue Montreal).
- **FR-002**: System MUST structure the section header as a CSS Flexbox container (`display: flex; justify-content: space-between; width: 100%;`) to enforce strict width constraints.
- **FR-003**: System MUST calculate a normalized raw velocity scalar: `rawV = min(|velocity| * factor, 1.0)`.
- **FR-004**: System MUST apply a Damping Physics Algorithm (Phuộc nhún) to smooth the velocity: `smoothV = lerp(smoothV, rawV, 0.1)`. This guarantees delayed, syrupy-smooth distortion curves.
- **FR-005**: System MUST apply a zero-sum lerp equation to Part 1 using the smoothed velocity: `Wght_1 = lerp(400, 900, smoothV)` and `Wdth_1 = lerp(100, 150, smoothV)`.
- **FR-006**: System MUST apply an inverse zero-sum lerp equation to Part 2: `Wght_2 = lerp(400, 100, smoothV)` and `Wdth_2 = lerp(100, 50, smoothV)`.
- **FR-007**: System MUST inject these font variation settings directly into the DOM nodes via a `requestAnimationFrame` loop or `useLenis` callback (bypassing React `useState`) to guarantee 165FPS performance without VDOM reconciliation overhead.
- **FR-008**: System MUST apply CSS hardware acceleration and layout locks to the text nodes: `whitespace-nowrap`, `backface-hidden`, `transform-gpu`, and explicit `origin-left`/`origin-right` to completely eliminate sub-pixel layout jitter.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The total computed width of the flex container remains 100% fixed (0px variance) across all velocity states.
- **SC-002**: Animation runs natively at 60-165FPS depending on device refresh rate, with absolutely zero React re-render lag or layout thrashing.
- **SC-003**: The visual effect clearly demonstrates a symmetrical expansion/contraction relationship between the two text parts.

---

## Assumptions

- **Variable Font Availability**: The project's existing font (`Geist` or similar) supports both `wght` and `wdth` axes, or an appropriate variable font will be loaded. If the current font lacks `wdth`, a compatible font MUST be provided or the algorithm adjusted.
- **Browser Support**: Target browsers fully support CSS `font-variation-settings`.
