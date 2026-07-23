import { create } from 'zustand';

interface AppState {
  isAssetsLoaded: boolean;
  hasEntered: boolean;
  isLogoSettled: boolean;
  gyroEnabled: boolean;
  audioEnabled: boolean;
  deepLinkTarget: string | null;
  setAssetsLoaded: (val: boolean) => void;
  setEntered: (val: boolean) => void;
  setLogoSettled: (val: boolean) => void;
  setGyroEnabled: (val: boolean) => void;
  setAudioEnabled: (val: boolean) => void;
  setDeepLinkTarget: (target: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAssetsLoaded: false,
  hasEntered: false,
  isLogoSettled: false,
  gyroEnabled: false,
  audioEnabled: false,
  deepLinkTarget: null,
  setAssetsLoaded: (val) => set({ isAssetsLoaded: val }),
  setEntered: (val) => set({ hasEntered: val }),
  setLogoSettled: (val) => set({ isLogoSettled: val }),
  setGyroEnabled: (val) => set({ gyroEnabled: val }),
  setAudioEnabled: (val) => set({ audioEnabled: val }),
  setDeepLinkTarget: (target) => set({ deepLinkTarget: target }),
}));
