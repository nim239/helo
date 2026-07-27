"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function BackgroundGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const speed = 0.2;
    let tileSize = window.innerWidth * 0.07; // 7vw

    const updateSize = () => {
      tileSize = window.innerWidth * 0.07;
    };
    window.addEventListener('resize', updateSize);

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: 0,
      onUpdate: (self) => {
        const scrollY = self.scroll();

        // GPU Accelerated translate3d thay vì backgroundPosition (giúp ko bị trigger Paint)
        const rawY = -scrollY * speed;
        // Lặp vô tận (wrap) trong khoảng 1 ô lưới (5vw)
        const y = gsap.utils.wrap(-tileSize, 0, rawY);

        gsap.set(el, { y });
      }
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="fixed top-0 left-0 w-full z-[0] pointer-events-none will-change-transform"
      style={{
        height: 'calc(100vh + 7vw)', // Bù thêm 7vw height để khi translate -7vw ko bị hở chân
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '7vw 7vw', // 1/14 width
        backgroundPosition: 'center top',
      }}
    />
  );
}
