"use client";

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../lib/store/useAppStore';

export function EnterOverlay() {
  const { hasEntered, isAssetsLoaded, setEntered, setGyroEnabled, setAudioEnabled, setAssetsLoaded, setLogoSettled } = useAppStore();
  const circleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let simulatedProgress = { val: 0 };
    
    // Trim path animation
    const tl = gsap.timeline({
      onUpdate: () => {
        if (pathRef.current) {
          const len = pathRef.current.getTotalLength();
          pathRef.current.style.strokeDashoffset = (len - (len * simulatedProgress.val) / 100).toString();
        }
      },
      onComplete: () => {
        setAssetsLoaded(true);
        // Make it pulse slightly when ready
        gsap.to(circleRef.current, {
          scale: 1.05,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }
    });

    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = len.toString();
      pathRef.current.style.strokeDashoffset = len.toString();
    }

    // Start Preloading Engine (240 Frames Image Sequence)
    const assetsToLoad: string[] = [];
    
    // 💡 LƯU Ý CHO USER: ĐƯỜNG DẪN ẢNH VÀ ĐỊNH DẠNG (SRC)
    // Nếu sau này nén ảnh thành .webp, chỉ cần đổi đuôi '.png' thành '.webp' ở 2 dòng push bên dưới.
    // Số lượng 120 frames cho mỗi layer.
    for (let i = 0; i < 120; i++) {
      const idx = i.toString().padStart(5, '0');
      assetsToLoad.push(`/sprite_cubi/cubi/cubi_${idx}.png`);
      assetsToLoad.push(`/sprite_cubi/cubi_glow/cubi_glow_${idx}.png`);
    }
    
    // We animate progress to at least 90% while waiting for network
    tl.to(simulatedProgress, {
      val: 90,
      duration: 2.5,
      ease: 'power2.out'
    });

    const loadPromises = assetsToLoad.map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Always resolve to prevent infinite lock
      });
    });

    Promise.all(loadPromises).then(() => {
      // Once 100% loaded in RAM, push timeline to 100% immediately
      gsap.to(simulatedProgress, {
        val: 100,
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate: tl.vars.onUpdate,
        onComplete: tl.vars.onComplete
      });
    });

  }, [setAssetsLoaded]);

  const handleEnter = async () => {
    if (!isAssetsLoaded) return; // Can't click until loaded

    // Stop pulsing
    gsap.killTweensOf(circleRef.current);

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

    // 2. Gyroscope setup
    if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setGyroEnabled(true);
        } else {
          console.warn("Gyroscope permission denied.");
        }
      } catch (e) {
        console.warn("Gyroscope permission request failed", e);
      }
    } else {
      setGyroEnabled(true);
    }

    setEntered(true);

    // Move circle up and scale down
    const tl = gsap.timeline({
      onComplete: () => {
        setLogoSettled(true);
        if (circleRef.current) {
          circleRef.current.style.pointerEvents = 'none';
        }
      }
    });

    // Move circle up and scale down
    tl.to(circleRef.current, {
      y: '-35vh', // Move to top (adjust based on center)
      scale: 0.5,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.inOut'
    });

    // Fade in placeholder "N" logo
    tl.to(logoRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, "-=0.4");

    // Fade out background so we can see the exhibition, but keep the container mounted
    tl.to(containerRef.current, {
      backgroundColor: 'rgba(0,0,0,0)',
      duration: 1.0,
      ease: 'power2.inOut'
    }, "-=1.2");
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[90] flex items-center justify-center bg-black text-white pointer-events-none">
      
      {/* Circle Button */}
      <button 
        ref={circleRef}
        onClick={handleEnter}
        data-magnet="true"
        className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-transparent transition-colors
          ${isAssetsLoaded ? 'pointer-events-auto cursor-pointer hover:bg-white/5' : 'pointer-events-none'}
        `}
        aria-label="Enter Experience"
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2"
          />
          <circle 
            ref={pathRef}
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="rgba(255,255,255,0.8)" 
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Placeholder Logo that appears at the top */}
      <div 
        ref={logoRef}
        className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 text-2xl font-bold tracking-widest text-white z-[70] pointer-events-none"
      >
        N
      </div>
    </div>
  );
}
