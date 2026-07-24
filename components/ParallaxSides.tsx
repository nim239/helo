"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import sectionsData from '../data/sections.json';

const exhibitionBuffer = [
  ...sectionsData.map((s) => ({ ...s, key: `parallax-0-${s.id}` })),
  ...sectionsData.map((s) => ({ ...s, key: `parallax-1-${s.id}` })),
  ...sectionsData.map((s) => ({ ...s, key: `parallax-2-${s.id}` })),
  ...sectionsData.map((s) => ({ ...s, key: `parallax-3-${s.id}` })),
  ...sectionsData.map((s) => ({ ...s, key: `parallax-4-${s.id}` })),
];

export function ParallaxSides() {
  const fgLeftRef = useRef<HTMLDivElement>(null);
  const fgRightRef = useRef<HTMLDivElement>(null);
  const bgLeftRef = useRef<HTMLDivElement>(null);
  const bgRightRef = useRef<HTMLDivElement>(null);

  const fgLeftWrapRef = useRef<HTMLDivElement>(null);
  const fgRightWrapRef = useRef<HTMLDivElement>(null);
  const bgLeftWrapRef = useRef<HTMLDivElement>(null);
  const bgRightWrapRef = useRef<HTMLDivElement>(null);

  // Ref instead of state — zero React re-renders on resize
  const sectionHeightRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const updateSize = () => { sectionHeightRef.current = window.innerHeight; };
    window.addEventListener('resize', updateSize);

    const FG_SPEED = 7 / 6;
    const BG_SPEED = 5 / 6;

    // Gyro stored in plain object refs — no React state, no re-renders
    const gyro = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      gyro.targetX = (e.gamma / 90) * 150;
      gyro.targetY = (e.beta / 90) * 150;
    };
    window.addEventListener('deviceorientation', handleOrientation);

    // ONE unified GSAP ticker — runs in sync with Lenis, replaces both
    // the old raw requestAnimationFrame loop AND the ScrollTrigger.onUpdate.
    // This eliminates the dual-RAF conflict that was competing with Lenis.
    const unifiedTicker = () => {
      const scrollY = window.scrollY;
      const maxH = sectionHeightRef.current * 6;

      const fgY = gsap.utils.wrap(-maxH, 0, -scrollY * FG_SPEED);
      const bgY = gsap.utils.wrap(-maxH, 0, -scrollY * BG_SPEED);

      // Direct style mutations — no gsap.set() overhead, pure GPU compositing
      if (fgLeftRef.current) fgLeftRef.current.style.transform = `translate3d(0,${fgY}px,0)`;
      if (fgRightRef.current) fgRightRef.current.style.transform = `translate3d(0,${fgY}px,0)`;
      if (bgLeftRef.current) bgLeftRef.current.style.transform = `translate3d(0,${bgY}px,0)`;
      if (bgRightRef.current) bgRightRef.current.style.transform = `translate3d(0,${bgY}px,0)`;

      // Gyro lerp — skip DOM writes entirely when gyro is idle
      const gyroActive = Math.abs(gyro.targetX) > 0.5 || Math.abs(gyro.x) > 0.5;
      if (gyroActive) {
        gyro.x += (gyro.targetX - gyro.x) * 0.05;
        gyro.y += (gyro.targetY - gyro.y) * 0.05;
        const gx12 = gyro.x * 1.2, gy15 = gyro.y * 1.5;
        const gx03 = gyro.x * 0.3, gy05 = gyro.y * 0.5;
        if (fgLeftWrapRef.current)  fgLeftWrapRef.current.style.transform  = `translate3d(${gx12}px,${gy15}px,0)`;
        if (fgRightWrapRef.current) fgRightWrapRef.current.style.transform = `translate3d(${gx12}px,${gy15}px,0)`;
        if (bgLeftWrapRef.current)  bgLeftWrapRef.current.style.transform  = `translate3d(${gx03}px,${gy05}px,0)`;
        if (bgRightWrapRef.current) bgRightWrapRef.current.style.transform = `translate3d(${gx03}px,${gy05}px,0)`;
      }
    };

    gsap.ticker.add(unifiedTicker);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('deviceorientation', handleOrientation);
      gsap.ticker.remove(unifiedTicker);
    };
  }, []);

  const renderLayers = (isForeground: boolean, align: 'left' | 'right') => {
    return exhibitionBuffer.map((section, idx) => {
      let scaleClass = '';
      if (isForeground && align === 'left') scaleClass = 'scale-y-[-1]';
      if (isForeground && align === 'right') scaleClass = '-scale-x-100 scale-y-[-1]';
      if (!isForeground && align === 'right') scaleClass = '-scale-x-100';

      const opacityClass = isForeground ? 'opacity-80' : 'opacity-30';

      return (
        <div
          key={section.key + idx}
          className="w-full relative flex items-center justify-center overflow-hidden"
          style={{ height: '100vh' }}
        >
          <img
            src="/paralax/ref_paralax_1.png"
            alt=""
            aria-hidden="true"
            className={`w-full h-full object-cover mix-blend-screen ${scaleClass} ${opacityClass}`}
          />
        </div>
      );
    });
  };

  return (
    <>
      {/* Background Layers (z=0) */}
      <div ref={bgLeftWrapRef} className="fixed top-0 left-0 h-screen z-[0] pointer-events-none overflow-hidden will-change-transform w-[28vw] md:w-[18vw] lg:w-[14vw]">
        <div ref={bgLeftRef} className="w-full will-change-transform">
          {renderLayers(false, 'left')}
        </div>
      </div>
      <div ref={bgRightWrapRef} className="fixed top-0 right-0 h-screen z-[0] pointer-events-none overflow-hidden will-change-transform w-[28vw] md:w-[18vw] lg:w-[14vw]">
        <div ref={bgRightRef} className="w-full will-change-transform">
          {renderLayers(false, 'right')}
        </div>
      </div>

      {/* Foreground Layers (z=50, below Sprite z=60) */}
      <div ref={fgLeftWrapRef} className="fixed top-0 left-0 h-screen z-[50] pointer-events-none overflow-hidden mix-blend-screen will-change-transform w-[30vw] md:w-[20vw] lg:w-[15vw]">
        <div ref={fgLeftRef} className="w-full will-change-transform">
          {renderLayers(true, 'left')}
        </div>
      </div>
      <div ref={fgRightWrapRef} className="fixed top-0 right-0 h-screen z-[50] pointer-events-none overflow-hidden mix-blend-screen will-change-transform w-[30vw] md:w-[20vw] lg:w-[15vw]">
        <div ref={fgRightRef} className="w-full will-change-transform">
          {renderLayers(true, 'right')}
        </div>
      </div>
    </>
  );
}
