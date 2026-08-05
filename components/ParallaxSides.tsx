"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import lottie, { AnimationItem } from 'lottie-web';
import { useScrollStore } from '../lib/store/useScrollStore';

export function ParallaxSides() {
  const leftSparkleRef = useRef<HTMLDivElement>(null);
  const rightSparkleRef = useRef<HTMLDivElement>(null);
  const leftGlowRef = useRef<HTMLDivElement>(null);
  const rightGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !leftSparkleRef.current ||
      !rightSparkleRef.current ||
      !leftGlowRef.current ||
      !rightGlowRef.current
    ) return;

    // Cap DPR at 1.5 — retina 2x/3x screen không cần full res cho FX canvas
    const dpr = Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1);

    const commonConfig = {
      renderer: 'canvas' as const,
      loop: true,
      autoplay: true,
      rendererSettings: {
        clearCanvas: true,
        progressiveLoad: true,   // Load frames on demand, không load hết 1 lần
        hideOnTransparent: true,
        dpr,
      },
    };

    const leftSparkle: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: leftSparkleRef.current,
      path: '/lotie/Sparkles.json',
    });

    const rightSparkle: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: rightSparkleRef.current,
      path: '/lotie/Sparkles.json',
    });

    const leftGlow: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: leftGlowRef.current,
      path: '/lotie/gradient_glow.json',
    });

    const rightGlow: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: rightGlowRef.current,
      path: '/lotie/gradient_glow.json',
    });

    const instances = [leftSparkle, rightSparkle, leftGlow, rightGlow];

    // ─── THROTTLED SPEED UPDATER ────────────────────────────────────────────
    // Only write setSpeed() when velocity delta > threshold.
    // Avoids calling setSpeed() 165× per second when idle (velocity ≈ 0).
    let lastSpeed = 1.0;
    let frameCount = 0;
    const THROTTLE_FRAMES = 4; // update every 4 frames (~41ms at 165fps) 
    const SPEED_THRESHOLD = 0.05;

    const renderLoop = () => {
      // Throttle: skip 3 out of 4 frames
      frameCount = (frameCount + 1) % THROTTLE_FRAMES;
      if (frameCount !== 0) return;

      const velocity = useScrollStore.getState().velocity || 0;
      const absVelocity = Math.abs(velocity);
      const targetSpeed = Math.min(3.0, Math.max(1.0, 1.0 + absVelocity * 0.02));

      // Only write to Lottie if speed actually changed meaningfully
      if (Math.abs(targetSpeed - lastSpeed) < SPEED_THRESHOLD) return;
      lastSpeed = targetSpeed;

      for (let i = 0; i < instances.length; i++) {
        instances[i]?.setSpeed(targetSpeed);
      }
    };

    gsap.ticker.add(renderLoop);

    return () => {
      gsap.ticker.remove(renderLoop);
      for (let i = 0; i < instances.length; i++) {
        instances[i]?.destroy();
      }
    };
  }, []);

  return (
    <>
      {/* 1. Sparkles Lottie ở 2 góc trên (Fixed, scale 20%) */}
      <div className="fixed top-2 left-2 w-32 h-32 md:w-48 md:h-48 z-[45] pointer-events-none mix-blend-screen scale-20 origin-top-left">
        <div ref={leftSparkleRef} className="w-full h-full opacity-80" />
      </div>

      <div className="fixed top-2 right-2 w-32 h-32 md:w-48 md:h-48 z-[45] pointer-events-none mix-blend-screen scale-20 origin-top-right">
        <div ref={rightSparkleRef} className="w-full h-full opacity-80" />
      </div>

      {/* 2. Gradient Glow Lottie ép sát mép ngoài */}
      <div className="fixed top-1/2 left-0 h-[100vw] w-[100vh] z-[40] pointer-events-none mix-blend-screen -rotate-90 -translate-y-1/2 -translate-x-[48vh] origin-center">
        <div ref={leftGlowRef} className="w-full h-full opacity-100 scale-x-150 scale-y-110" />
      </div>

      <div className="fixed top-1/2 right-0 h-[100vw] w-[100vh] z-[40] pointer-events-none mix-blend-screen rotate-90 -translate-y-1/2 translate-x-[48vh] origin-center">
        <div ref={rightGlowRef} className="w-full h-full opacity-100 scale-x-150 scale-y-110" />
      </div>
    </>
  );
}
