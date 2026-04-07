"use client";

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/components/Section';
import { sections } from '@/data/sections';

gsap.registerPlugin(ScrollTrigger);

const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_COUNT = 120;
const COLS = 120;

// Clone 2 sections đầu ở cuối và 2 sections cuối ở đầu để loop mượt 2 chiều
const loopSections = [
  ...sections.slice(-2).map(s => ({ ...s, id: s.id - 100 })), // Clone last 2 at start
  ...sections,
  ...sections.slice(0, 2).map(s => ({ ...s, id: s.id + 100 })), // Clone first 2 at end
];

export default function Home() {
  const spriteRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const vh = window.innerHeight;
    const offset = 2 * vh; // Chiều cao của 2 sections clone ở đầu
    const loopEnd = (sections.length + 2) * vh;
    const loopStart = 2 * vh;

    const lenis = new Lenis({
      duration: 2.2, // Tăng nhẹ thời gian để cảm nhận rõ ease
      easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // Cubic Ease In Out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0, // Giữ tỷ lệ 1:1 cho cảm giác tự nhiên
    });

    lenisRef.current = lenis;

    // Khởi tạo vị trí ở section 1 thật (bỏ qua 2 section clone đầu)
    lenis.scrollTo(offset, { immediate: true });

    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      // Teleport khi cuộn xuống cuối (chạm vào bản clone của section 1)
      if (scroll >= loopEnd) {
        lenis.scrollTo(scroll - (sections.length * vh), { immediate: true });
      }
      // Teleport khi cuộn lên đầu (chạm vào bản clone của section cuối)
      if (scroll <= 0) {
        lenis.scrollTo(scroll + (sections.length * vh), { immediate: true });
      }
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Sprite Logic
  useEffect(() => {
    const spriteEl = spriteRef.current;
    if (!spriteEl) return;

    const spriteImage = new Image();
    spriteImage.src = SPRITE_SHEET_PATH;
    spriteImage.onload = () => {
      const w = spriteEl.offsetWidth;
      const h = spriteEl.offsetHeight;
      spriteEl.style.backgroundImage = `url(${SPRITE_SHEET_PATH})`;
      spriteEl.style.backgroundSize = `${w * COLS}px ${h}px`;

      const state = { frame: 0 };
      const updateFrame = gsap.quickSetter(spriteEl, 'backgroundPosition');

      const render = () => {
        const col = Math.floor(state.frame) % COLS;
        updateFrame(`${-col * w}px 0px`);
      };

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          // Sprite frames animation loop
          const spriteP = (p * 12) % 1;
          state.frame = spriteP * (FRAME_COUNT - 1);
          render();

          // Sprite horizontal movement (ping-pong)
          const maxX = window.innerWidth - spriteEl.offsetWidth;
          let xP = (p * 6) % 2;
          if (xP > 1) xP = 2 - xP;
          gsap.set(spriteEl, { x: maxX * gsap.parseEase('sine.inOut')(xP) });
        },
      });

      // Intro animation
      gsap.to(state, {
        frame: FRAME_COUNT - 1,
        duration: 2,
        ease: 'power2.out',
        onUpdate: render,
      });
    };
  }, []);

  return (
    <main className="relative select-none overflow-hidden">
      {/* Background Overlay for Exhibition Vibe */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      <div className="flex flex-col">
        {loopSections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>

      <div
        ref={spriteRef}
        className="fixed top-1/2 -translate-y-1/2 left-0 w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] z-[60] pointer-events-none bg-no-repeat"
      />
      
      {/* UI Elements */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] mix-blend-difference pointer-events-none">
        <div className="w-[1px] h-12 bg-white/20 animate-pulse" />
      </div>
    </main>
  );
}
