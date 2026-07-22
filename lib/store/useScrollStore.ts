import { create } from 'zustand';

export type Phase = 'IDLE' | 'SCROLLING' | 'TELEPORTING' | 'SNAPPING' | 'DWELLING';

interface ScrollState {
  currentPhase: Phase;
  teleportCooldownActive: boolean;
  lastTeleportTime: number;
  scrollProgress: number; // 0.0 to 1.0
  setPhase: (phase: Phase) => void;
  setScrollProgress: (progress: number) => void;
  triggerTeleport: () => void;
  clearCooldown: () => void;
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  currentPhase: 'IDLE',
  teleportCooldownActive: false,
  lastTeleportTime: 0,
  scrollProgress: 0,
  
  setPhase: (phase) => set({ currentPhase: phase }),
  
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  
  triggerTeleport: () => {
    set({ 
      currentPhase: 'TELEPORTING', 
      teleportCooldownActive: true,
      lastTeleportTime: performance.now()
    });
    
    // Automatically clear cooldown after 500ms to prevent deadlocks
    setTimeout(() => {
      get().clearCooldown();
    }, 500);
  },
  
  clearCooldown: () => {
    if (get().teleportCooldownActive) {
      set({ teleportCooldownActive: false });
    }
  }
}));
