"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import lottie, { AnimationItem } from 'lottie-web';
import { useScrollStore } from '../lib/store/useScrollStore';

export function ParallaxSides() {
  // 4 Refs cho 2 bên (Trái & Phải) x 2 lớp (Sau: Sparkles, Trước: man running)
  const leftBackRef = useRef<HTMLDivElement>(null);
  const leftFrontRef = useRef<HTMLDivElement>(null);
  const rightBackRef = useRef<HTMLDivElement>(null);
  const rightFrontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !leftBackRef.current ||
      !leftFrontRef.current ||
      !rightBackRef.current ||
      !rightFrontRef.current
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

    // ==============================================================
    // 🎨 KHỞI TẠO 4 LOTTIE INSTANCES (FR-001, FR-002, FR-006)
    // ==============================================================
    // Bên Trái (Left Side Art)
    const leftBack: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: leftBackRef.current,
      path: '/lotie/Sparkles.json',
    });

    const leftFront: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: leftFrontRef.current,
      path: '/lotie/man running.json',
    });

    // Bên Phải (Right Side Art - duplicate 2 bên)
    const rightBack: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: rightBackRef.current,
      path: '/lotie/Sparkles.json',
    });

    const rightFront: AnimationItem = lottie.loadAnimation({
      ...commonConfig,
      container: rightFrontRef.current,
      path: '/lotie/man running.json',
    });

    const instances = [leftBack, leftFront, rightBack, rightFront];

    // ==============================================================
    // ⚙️ SPEED ACCELERATION ONLY PHYSICS (FR-003, FR-004)
    // ==============================================================
    const renderLoop = () => {
      // 1. Trích xuất gia tốc cuộn thời gian thực từ Lenis Store
      const velocity = useScrollStore.getState().velocity || 0;

      // 2. Tính tốc độ phát (Speed Acceleration Only):
      // Idle ở 1.0x, khi cuộn nhanh tăng tốc độ phát lên tối đa 3.0x
      const absVelocity = Math.abs(velocity);
      const targetSpeed = Math.min(3.0, Math.max(1.0, 1.0 + absVelocity * 0.02));

      // 3. Đồng bộ tốc độ phát cho cả 4 Lottie instances mà KHÔNG biến dạng hình học
      for (let i = 0; i < instances.length; i++) {
        const item = instances[i];
        if (item) {
          item.setSpeed(targetSpeed);
        }
      }
    };

    // Đồng bộ nhịp vào bộ đếm nhịp GSAP Ticker của triển lãm
    gsap.ticker.add(renderLoop);

    // ==============================================================
    // 🧹 CLEANUP BỘ NHỚ KHI UNMOUNT (FR-005)
    // ==============================================================
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
      <style>{`
        @media (max-width: 768px) {
          .mobile-scale-wrapper {
            transform: scale(0.6) !important;
          }
        }
      `}</style>

      {/* Left Art */}
      <div className="fixed top-0 left-[-15vw] md:left-[-10vw] lg:left-[-5vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen w-[50vw] md:w-[40vw]">
        <div className="w-full h-full origin-center mobile-scale-wrapper relative flex items-center justify-center">
          {/* Layer Phía Sau - Sparkles.json */}
          <div
            ref={leftBackRef}
            className="absolute inset-0 w-full h-full opacity-80 z-0 pointer-events-none"
          />
          {/* Layer Phía Trước - man running.json */}
          <div
            ref={leftFrontRef}
            className="absolute inset-0 w-full h-full opacity-100 z-10 pointer-events-none scale-50 origin-center"
          />
        </div>
      </div>

      {/* Right Art */}
      <div className="fixed top-0 right-[-15vw] md:right-[-10vw] lg:right-[-5vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen w-[50vw] md:w-[40vw]">
        <div className="w-full h-full origin-center mobile-scale-wrapper relative flex items-center justify-center">
          <div className="w-full h-full absolute inset-0 -scale-x-100">
            {/* Layer Phía Sau - Sparkles.json */}
            <div
              ref={rightBackRef}
              className="absolute inset-0 w-full h-full opacity-80 z-0 pointer-events-none"
            />
            {/* Layer Phía Trước - man running.json */}
            <div
              ref={rightFrontRef}
              className="absolute inset-0 w-full h-full opacity-100 z-10 pointer-events-none scale-50 origin-center"
            />
          </div>
        </div>
      </div>
    </>
  );
}
