"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store/useAppStore';

export function EnterOverlay() {
  const { hasEntered, setEntered, setGyroEnabled, setAudioEnabled } = useAppStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (hasEntered) {
      setShow(false);
    }
  }, [hasEntered]);

  const handleEnter = async () => {
    // 1. Audio setup
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        setAudioEnabled(true);
      }
    } catch (e) {
      console.warn("Audio Context failed to start", e);
    }

    // 2. Gyroscope setup (iOS 13+ requires permission)
    if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setGyroEnabled(true);
        } else {
          console.warn("Gyroscope permission denied, falling back to touch parallax.");
        }
      } catch (e) {
        console.warn("Gyroscope permission request failed", e);
      }
    } else {
      // Non-iOS 13+ devices
      setGyroEnabled(true);
    }

    setEntered(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black text-white">
      {/* Circle Button placed 20% from top */}
      <button 
        onClick={handleEnter}
        className="absolute top-[20%] w-32 h-32 rounded-full border border-white/20 hover:border-white/50 transition-colors bg-transparent flex items-center justify-center cursor-pointer overflow-hidden"
        aria-label="Enter Experience"
      >
        {/* Placeholder for Logo later */}
      </button>
    </div>
  );
}
