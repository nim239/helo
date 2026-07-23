import { create } from 'zustand';

type ScrollPhase = 'IDLE' | 'SCROLLING' | 'SNAPPING';

interface ScrollState {
  currentPhase: ScrollPhase;
  scrollProgress: number; // 0 to 1
  velocity: number;
  isIntroComplete: boolean;
  completeIntro: () => void;
  setPhase: (phase: ScrollPhase) => void;
  setScrollProgress: (progress: number) => void;
  setVelocity: (velocity: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  currentPhase: 'IDLE',
  scrollProgress: 0,
  velocity: 0,
  isIntroComplete: false,
  
  completeIntro: () => set({ isIntroComplete: true }),
  setPhase: (phase) => set({ currentPhase: phase }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setVelocity: (v) => set({ velocity: v }),
}));
