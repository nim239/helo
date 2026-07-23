import { create } from 'zustand';

interface AppState {
  hasEntered: boolean;
  gyroEnabled: boolean;
  audioEnabled: boolean;
  setEntered: (entered: boolean) => void;
  setGyroEnabled: (enabled: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasEntered: false,
  gyroEnabled: false,
  audioEnabled: false,
  setEntered: (entered) => set({ hasEntered: entered }),
  setGyroEnabled: (enabled) => set({ gyroEnabled: enabled }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
}));
