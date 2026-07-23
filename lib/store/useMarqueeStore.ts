import { create } from 'zustand';

interface MarqueeState {
  baseTimestamp: number;
  totalPausedDuration: number;
  isDwelling: boolean;
  addPauseDuration: (ms: number) => void;
  setIsDwelling: (status: boolean) => void;
}

// Ensure all marquees share the exact same base time and pause duration
// to stay perfectly synchronized visually across the entire exhibition.
export const useMarqueeStore = create<MarqueeState>((set) => ({
  baseTimestamp: typeof window !== 'undefined' ? performance.now() : 0,
  totalPausedDuration: 0,
  isDwelling: false,
  
  addPauseDuration: (ms) => set((state) => ({ 
    totalPausedDuration: state.totalPausedDuration + ms 
  })),
  
  setIsDwelling: (status) => set({ isDwelling: status }),
}));
