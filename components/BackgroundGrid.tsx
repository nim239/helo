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
    let tileSize = window.innerWidth * 0.05; // 5vw

    const updateSize = () => {
      tileSize = window.innerWidth * 0.05;
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
      className="fixed top-0 left-0 w-full z-[-1] pointer-events-none will-change-transform"
      style={{
        height: 'calc(100vh + 5vw)', // Bù thêm 5vw height để khi translate -5vw ko bị hở chân
        backgroundImage: `
          linear-gradient(to right, #2c2c2c 1px, transparent 1px),
          linear-gradient(to bottom, #2c2c2c 1px, transparent 1px)
        `,
        backgroundSize: '5vw 5vw', // 1/20 width
        backgroundPosition: 'center top',
      }}
    />
  );
}
