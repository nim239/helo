# Tasks: Inverse Kinetic Typography

**Feature**: Inverse Kinetic Typography (`006-inverse-kinetic-typography`)
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Phase 1: Core Component

- [x] T001 Create `components/KineticHeader.tsx` implementing the zero-sum math, `smoothV` damping, and CSS hardware acceleration per user's exact specification.

---

## Phase 2: Integration

- [x] T002 Update `app/page.tsx` Section 2 ("Director's Reel") to use `<KineticHeader text1="DIRECTOR'S" text2="REEL" />`.
- [x] T003 Update `app/page.tsx` Section 3 ("CGI Showcase") to use `<KineticHeader text1="CGI" text2="SHOWCASE" />`.

---

## Phase 3: Verification

- [x] T004 Verify zero layout jitter and syrupy smooth font variation interpolation during rapid scrolling.
