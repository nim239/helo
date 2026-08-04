"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import lottie, { AnimationItem } from 'lottie-web';
import { useScrollStore } from '../lib/store/useScrollStore';

export function ParallaxSides() {
  // Sparkles: Góc trên-trái và Góc trên-phải (Scale 20%)
  const leftSparkleRef = useRef<HTMLDivElement>(null);
  const rightSparkleRef = useRef<HTMLDivElement>(null);

  // Gradient Glow: Dính sát 2 bên mép viền
  const leftGlowRef = useRef<HTMLDivElement>(null);
  const rightGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !leftSparkleRef.current ||
      !rightSparkleRef.current ||
      !leftGlowRef.current ||
      !rightGlowRef.current
    ) {
      return;
    }

    const dpr = Math.max(1, typeof window !== 'undefined' ? window.devicePixelRatio : 1);

    const commonConfig = {
      renderer: 'canvas' as const,
      loop: true,
      autoplay: true,
      rendererSettings: {
        clearCanvas: true,
        progressiveLoad: false,
        hideOnTransparent: true,
        dpr,
      },
    };

    // Khởi tạo Lottie Sparkles ở 2 góc
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

    // Khởi tạo Lottie Gradient Glow 2 bên
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

    const renderLoop = () => {
      const velocity = useScrollStore.getState().velocity || 0;
      const absVelocity = Math.abs(velocity);
      const targetSpeed = Math.min(3.0, Math.max(1.0, 1.0 + absVelocity * 0.02));

      for (let i = 0; i < instances.length; i++) {
        const item = instances[i];
        if (item) {
          item.setSpeed(targetSpeed);
        }
      }
    };

    gsap.ticker.add(renderLoop);

    return () => {
      gsap.ticker.remove(renderLoop);
      for (let i = 0; i < instances.length; i++) {
        const item = instances[i];
        if (item) {
          item.destroy();
        }
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

      {/* 2. Gradient Glow Lottie ép sát mép ngoài (Đẩy mạnh offset ra 2 mép) */}

      {/* Mép TRÁI: Đẩy lùi sang trái -48vh để tơ glow áp sát dải dây */}
      <div className="fixed top-1/2 left-0 h-[100vw] w-[100vh] z-[40] pointer-events-none mix-blend-screen -rotate-90 -translate-y-1/2 -translate-x-[48vh] origin-center">
        <div ref={leftGlowRef} className="w-full h-full opacity-100 scale-x-150 scale-y-110" />
      </div>

      {/* Mép PHẢI: Đẩy lùi sang phải 48vh để tơ glow áp sát dải dây */}
      <div className="fixed top-1/2 right-0 h-[100vw] w-[100vh] z-[40] pointer-events-none mix-blend-screen rotate-90 -translate-y-1/2 translate-x-[48vh] origin-center">
        <div ref={rightGlowRef} className="w-full h-full opacity-100 scale-x-150 scale-y-110" />
      </div>
    </>
  );
}
