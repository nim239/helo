import { create } from 'zustand';

type ScrollPhase = 'IDLE' | 'SCROLLING' | 'SNAPPING' | 'WARPING';

interface ScrollState {
  currentPhase: ScrollPhase;
  scrollProgress: number; // 0 to 1
  velocity: number;
  warpPool: number; // 0 to 1 — throttled sync from RAF ref (~6fps)
  isIntroComplete: boolean;
  completeIntro: () => void;
  setPhase: (phase: ScrollPhase) => void;
  setScrollProgress: (progress: number) => void;
  setVelocity: (velocity: number) => void;
  setWarpPool: (v: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  currentPhase: 'IDLE',
  scrollProgress: 0,
  velocity: 0,
  warpPool: 0,
  isIntroComplete: false,

  completeIntro: () => set({ isIntroComplete: true }),
  setPhase: (phase) => set({ currentPhase: phase }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setVelocity: (v) => set({ velocity: v }),
  setWarpPool: (v) => set({ warpPool: v }),
}));
