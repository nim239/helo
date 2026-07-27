# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Tích hợp hệ thống Zdog.js trên HTML5 Canvas 2D thay thế cho Parallax hình ảnh tĩnh, kết nối trực tiếp với gia tốc cuộn (`velocity`) từ Lenis Scroll thông qua GSAP Ticker để tạo hiệu ứng quay 3D và biến dạng vật lý (Squash & Stretch) mà không gây tụt FPS hay can thiệp WebGL.

## Technical Context

**Language/Version**: TypeScript 5+ / Next.js 16 (App Router)

**Primary Dependencies**: `zdog` (^1.3.3), `lenis` (^1.3.25), `gsap` (^3.15.0), `zustand` (^5.0.14)

**Storage**: N/A

**Testing**: Manual Validation via DevTools & Mobile Device testing (`quickstart.md`)

**Target Platform**: Web Browsers (Desktop & Mobile Retina Display)

**Project Type**: Web Application / Interactive Exhibition Engine

**Performance Goals**: 60 - 144 FPS ổn định khi cuộn liên tục

**Constraints**: Không sử dụng WebGL/Three.js, không sử dụng SVG Renderer, duy trì 1 vòng lặp RAF duy nhất (GSAP Ticker), không lưu state cuộn vào React State.

**Scale/Scope**: 2 Canvas tĩnh ở 2 bên màn hình (Side Art)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Vision Principle**: Ưu tiên tính nghệ thuật, motion và trải nghiệm cuộn không gian.
- [x] **Performance Principles (FPS là Linh hồn)**: Không sử dụng WebGL/Three.js, dùng trọn vẹn Canvas 2D.
- [x] **1 RAF duy nhất**: Đồng bộ Zdog thông qua GSAP Ticker, không tạo `requestAnimationFrame` song song.
- [x] **Transient State Architecture**: Đọc dữ liệu `velocity` trực tiếp từ Zustand store (`useScrollStore.getState()`) bên trong Ticker.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/
└── ParallaxSides.tsx    # Nơi tích hợp thẻ Canvas 2D và logic Zdog Illustration + Lenis Ticker

store/
└── useScrollStore.ts    # Store Zustand cung cấp velocity và progress cho Zdog
```

**Structure Decision**: Cập nhật trực tiếp vào component `ParallaxSides.tsx` hiện có, giữ nguyên kiến trúc Anchor Layout để không làm xáo trộn hệ thống trang bị triển lãm.

## Complexity Tracking

> **No Constitution Check violations. All design decisions strictly adhere to Performance and Architecture Principles.**

