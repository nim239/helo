"use client";

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import lottie, { AnimationItem } from 'lottie-web';
import { useAppStore } from '../lib/store/useAppStore';

export function EnterOverlay() {
  const { hasEntered, isAssetsLoaded, setEntered, setGyroEnabled, setAudioEnabled, setAssetsLoaded, setLogoSettled } = useAppStore();
  const circleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGCircleElement>(null);
  const bgCircleRef = useRef<SVGCircleElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieInstRef = useRef<AnimationItem | null>(null);

  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    // Initialize Lottie
    if (lottieContainerRef.current && !lottieInstRef.current) {
      lottieInstRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lotie/hitmebabyonemoretime.json',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
        }
      });
    }

    let simulatedProgress = { val: 0 };

    // Trim path animation
    const updatePath = () => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        pathRef.current.style.strokeDashoffset = (len - (len * simulatedProgress.val) / 100).toString();
      }
    };

    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = len.toString();
      pathRef.current.style.strokeDashoffset = len.toString();
    }

    // Start Preloading Engine in background
    const assetsToLoad: string[] = [];
    for (let i = 0; i < 120; i++) {
      const idx = i.toString().padStart(5, '0');
      assetsToLoad.push(`/sprite_cubi/cubi/cubi_${idx}.webp`);
      assetsToLoad.push(`/sprite_cubi/cubi_glow/cubi_glow_${idx}.webp`);
    }

    let isCompleted = false;

    const finishLoading = () => {
      if (isCompleted) return;
      isCompleted = true;

      gsap.killTweensOf(simulatedProgress);

      gsap.to(simulatedProgress, {
        val: 100,
        duration: 0.3,
        ease: 'power2.inOut',
        onUpdate: updatePath,
        onComplete: () => {
          setAssetsLoaded(true);
          if (circleRef.current) {
            if (pathRef.current) {
              pathRef.current.style.strokeDasharray = 'none';
              pathRef.current.style.strokeDashoffset = '0';
            }

            gsap.to([pathRef.current, bgCircleRef.current], {
              strokeWidth: 1,
              stroke: 'rgba(255,255,255,0.1)',
              duration: 1.2,
              ease: 'power3.inOut'
            });

            gsap.to(circleRef.current, {
              width: '90vmin',
              height: '90vmin',
              duration: 1.2,
              ease: 'power3.inOut',
            });

            if (lottieContainerRef.current) {
              gsap.to(lottieContainerRef.current, { opacity: 1, duration: 0.8, delay: 0.2 });
            }
            if (lottieInstRef.current) {
              lottieInstRef.current.loop = true;
              lottieInstRef.current.playSegments([119, 199], true);
            }
          }
        }
      });
    };

    // Smooth loading progress tween (Guaranteed smooth 100% completion in 1.8s max)
    gsap.to(simulatedProgress, {
      val: 100,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: updatePath,
      onComplete: finishLoading
    });

    // Non-blocking batched preloader (INP < 50ms)
    let completedCount = 0;
    const totalAssets = assetsToLoad.length;
    let batchIndex = 0;
    const BATCH_SIZE = 12;

    const loadNextBatch = () => {
      const end = Math.min(batchIndex + BATCH_SIZE, totalAssets);
      for (; batchIndex < end; batchIndex++) {
        const img = new Image();
        img.src = assetsToLoad[batchIndex];
        const onDone = () => {
          completedCount++;
          if (completedCount >= totalAssets) {
            finishLoading();
          }
        };
        img.onload = onDone;
        img.onerror = onDone;
      }
      if (batchIndex < totalAssets) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 16);
        }
      }
    };

    loadNextBatch();

    return () => {
      gsap.killTweensOf(simulatedProgress);
      if (lottieInstRef.current) {
        lottieInstRef.current.destroy();
        lottieInstRef.current = null;
      }
    };
  }, [setAssetsLoaded]);

  const handleEnter = async () => {
    if (!isAssetsLoaded || isEntering) return;
    setIsEntering(true);

    // Stop pulsing if any
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

    // Play Jump segment (frames 0 to 118) for 2 seconds
    if (lottieInstRef.current) {
      lottieInstRef.current.loop = false;
      lottieInstRef.current.playSegments([0, 118], true);
    }

    // Wait 2 seconds before continuing with intro
    gsap.delayedCall(2, () => {
      setEntered(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setLogoSettled(true);
          if (circleRef.current) {
            circleRef.current.style.pointerEvents = 'none';
          }
        }
      });

      // Fade out circle in place (no flying up)
      tl.to(circleRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1.0,
        ease: 'power2.inOut'
      });

      // Fade in placeholder "N" logo
      tl.to(logoRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, "-=0.4");

      // Fade out background
      tl.to(containerRef.current, {
        backgroundColor: 'rgba(0,0,0,0)',
        duration: 1.0,
        ease: 'power2.inOut'
      }, "-=1.2");
    });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[90] flex items-center justify-center bg-black text-white pointer-events-none">

      {/* Circle Button */}
      <button
        ref={circleRef}
        onClick={handleEnter}
        data-magnet="true"
        className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-transparent transition-colors
          ${isAssetsLoaded && !isEntering ? 'pointer-events-auto cursor-pointer hover:bg-white/5' : 'pointer-events-none'}
        `}
        aria-label="Enter Experience"
      >
        <div ref={lottieContainerRef} className="absolute w-[50vmin] h-[50vmin] opacity-0 pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle
            ref={bgCircleRef}
            cx="50" cy="50" r="48"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            ref={pathRef}
            cx="50" cy="50" r="48"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
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
