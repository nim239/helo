"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import lottie, { AnimationItem } from 'lottie-web';
import { useScrollStore } from '../lib/store/useScrollStore';

export function ParallaxSides() {
  // Temporarily hidden for performance testing
  return null;
  const leftSparkleRef = useRef<HTMLDivElement>(null);
  const rightSparkleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leftSparkleRef.current || !rightSparkleRef.current) return;

    // Cap DPR at 1.5 — retina 2x/3x screen không cần full res cho FX canvas
    const dpr = Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1);

    const commonConfig = {
      renderer: 'canvas' as const,
      loop: true,
      autoplay: true,
      rendererSettings: {
        clearCanvas: true,
        progressiveLoad: true,
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

    const instances = [leftSparkle, rightSparkle];

    // ─── THROTTLED SPEED UPDATER ────────────────────────────────────────────
    let lastSpeed = 1.0;
    let frameCount = 0;
    const THROTTLE_FRAMES = 4; // update every 4 frames (~41ms at 165fps) 
    const SPEED_THRESHOLD = 0.05;

    const renderLoop = () => {
      frameCount = (frameCount + 1) % THROTTLE_FRAMES;
      if (frameCount !== 0) return;

      const velocity = useScrollStore.getState().velocity || 0;
      const absVelocity = Math.abs(velocity);
      const targetSpeed = Math.min(3.0, Math.max(1.0, 1.0 + absVelocity * 0.02));

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
      <div className="fixed top-2 left-2 w-32 h-32 md:w-48 md:h-48 z-[45] pointer-events-none scale-20 origin-top-left">
        <div ref={leftSparkleRef} className="w-full h-full opacity-80" />
      </div>

      <div className="fixed top-2 right-2 w-32 h-32 md:w-48 md:h-48 z-[45] pointer-events-none scale-20 origin-top-right">
        <div ref={rightSparkleRef} className="w-full h-full opacity-80" />
      </div>

      {/* 2. GPU Hardware-Accelerated Dual Side Radial Glow Divs */}
      <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
        {/* Left Cyan Glow Accent */}
        <div 
          className="absolute top-0 left-0 w-[30vw] h-full opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0% 50%, rgba(0, 242, 255, 0.25) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />

        {/* Right Magenta Glow Accent */}
        <div 
          className="absolute top-0 right-0 w-[30vw] h-full opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 100% 50%, rgba(255, 0, 127, 0.25) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
      </div>
    </>
  );
}
