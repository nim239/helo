"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import sectionsData from '../data/sections.json';

gsap.registerPlugin(ScrollTrigger);

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

  const sectionHeightRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    sectionHeightRef.current = window.innerHeight;
    const updateSize = () => { sectionHeightRef.current = window.innerHeight; };
    window.addEventListener('resize', updateSize);

    const fgSpeed = 7 / 6;
    const bgSpeed = 5 / 6;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: 0,
      onUpdate: (self) => {
        const scrollY = self.scroll();
        const maxH = window.innerHeight * 6; // Height of 1 full cycle of real sections

        // Compute wrapped Y positions to create a seamless infinite marquee
        const rawFgY = -scrollY * fgSpeed;
        const rawBgY = -scrollY * bgSpeed;

        const fgY = gsap.utils.wrap(-maxH, 0, rawFgY);
        const bgY = gsap.utils.wrap(-maxH, 0, rawBgY);

        gsap.set(fgLeftRef.current, { y: fgY });
        gsap.set(fgRightRef.current, { y: fgY });

        gsap.set(bgLeftRef.current, { y: bgY });
        gsap.set(bgRightRef.current, { y: bgY });
      }
    });

    let gyroX = 0;
    let gyroY = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const targetX = (e.gamma / 90) * 150;
      const targetY = (e.beta / 90) * 150;

      gyroX += (targetX - gyroX) * 0.1;
      gyroY += (targetY - gyroY) * 0.1;
    };

    const renderGyro = () => {
      // Dùng chung GSAP ticker với ScrollTrigger để xoá lỗi 2 RAF song song!
      gsap.set(fgLeftWrapRef.current, { x: gyroX * 1.2, y: gyroY * 1.5 });
      gsap.set(fgRightWrapRef.current, { x: gyroX * 1.2, y: gyroY * 1.5 });
      gsap.set(bgLeftWrapRef.current, { x: gyroX * 0.3, y: gyroY * 0.5 });
      gsap.set(bgRightWrapRef.current, { x: gyroX * 0.3, y: gyroY * 0.5 });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    gsap.ticker.add(renderGyro);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('deviceorientation', handleOrientation);
      gsap.ticker.remove(renderGyro);
      trigger.kill();
    };
  }, []);

  const renderLayers = (isForeground: boolean, align: 'left' | 'right') => {
    return exhibitionBuffer.map((section, idx) => {
      let scaleClass = '';
      if (isForeground && align === 'left') scaleClass = 'scale-y-[-1]';
      if (isForeground && align === 'right') scaleClass = '-scale-x-100 scale-y-[-1]';
      if (!isForeground && align === 'right') scaleClass = '-scale-x-100';
      if (!isForeground && align === 'left') scaleClass = '';

      // Anchor point: Bên trái căn phải (object-right), Bên phải căn trái (object-left)
      const objectAlign = align === 'left' ? 'object-right' : 'object-left';
      const flexAlign = align === 'left' ? 'justify-end' : 'justify-start';

      return (
        <div
          key={section.key + idx}
          className={`w-full relative flex items-center ${flexAlign} overflow-visible`}
          style={{ height: '100vh' }}
        >
          <img
            src="/paralax/ref_paralax_1.png"
            alt="Parallax Render"
            className={`h-full w-auto max-w-none object-cover ${objectAlign} mix-blend-screen ${scaleClass} opacity-100`}
          />
        </div>
      );
    });
  };

  return (
    <>
      {/* Background Layers (Z-index 0) */}
      {/* Mobile: vạch vàng ok (left-[-10vw] w-[50vw]) | Desktop: vạch xanh (left-[-22vw] w-[28vw] -> inner edge tại +6vw, phần đỏ xé lề bay ra ngoài) */}
      <div ref={bgLeftWrapRef} className="fixed top-0 left-[-10vw] md:left-[-22vw] h-[100vh] z-[0] pointer-events-none overflow-visible will-change-transform w-[50vw] md:w-[28vw]">
        <div ref={bgLeftRef} className="w-full will-change-transform">
          {renderLayers(false, 'left')}
        </div>
      </div>
      <div ref={bgRightWrapRef} className="fixed top-0 right-[-10vw] md:right-[-22vw] h-[100vh] z-[0] pointer-events-none overflow-visible will-change-transform w-[50vw] md:w-[28vw]">
        <div ref={bgRightRef} className="w-full will-change-transform">
          {renderLayers(false, 'right')}
        </div>
      </div>

      {/* Foreground Layers (Z-index 50) */}
      {/* Mobile: vạch vàng ok (left-[-15vw] w-[55vw]) | Desktop: vạch xanh (left-[-24vw] w-[32vw] -> inner edge tại +8vw) */}
      <div ref={fgLeftWrapRef} className="fixed top-0 left-[-15vw] md:left-[-24vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen will-change-transform w-[55vw] md:w-[32vw]">
        <div ref={fgLeftRef} className="w-full will-change-transform">
          {renderLayers(true, 'left')}
        </div>
      </div>
      <div ref={fgRightWrapRef} className="fixed top-0 right-[-15vw] md:right-[-24vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen will-change-transform w-[55vw] md:w-[32vw]">
        <div ref={fgRightRef} className="w-full will-change-transform">
          {renderLayers(true, 'right')}
        </div>
      </div>
    </>
  );
}
