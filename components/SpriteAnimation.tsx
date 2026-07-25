"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../lib/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;

interface SpriteAnimationProps {
  startIntro?: boolean;
}

export function SpriteAnimation({ startIntro = false }: SpriteAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const baseImgRef = useRef<HTMLImageElement>(null);
  const glowImgRef = useRef<HTMLImageElement>(null);
  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    const baseEl = baseImgRef.current;
    const glowEl = glowImgRef.current;
    if (!wrapperEl || !baseEl || !glowEl) return;

    if (!startIntro) {
      gsap.set(wrapperEl, { opacity: 0 });
      return;
    }

    // --- KHỞI TẠO IMAGE SEQUENCE (CACHE IN RAM) ---
    // 💡 LƯU Ý CHO USER: ĐƯỜNG DẪN ẢNH VÀ ĐỊNH DẠNG (SRC)
    const baseImages: string[] = [];
    const glowImages: string[] = [];
    
    for (let i = 0; i < FRAME_COUNT; i++) {
      const idx = i.toString().padStart(5, '0');
      baseImages.push(`/sprite_cubi/cubi/cubi_${idx}.png`);
      glowImages.push(`/sprite_cubi/cubi_glow/cubi_glow_${idx}.png`);
    }

    let scrollTriggerInst: ScrollTrigger | null = null;
    const state = { frame: 0 };
    let lastFrame = -1;

    // Rendering Loop via DOM src swap (GPU Hardware Accelerated)
    // Tránh dùng Canvas drawImage vì 1080x1080 sẽ ép CPU tính toán pixel quá nặng gây tụt FPS
    const renderFrame = () => {
      const frameIndex = Math.floor(state.frame) % FRAME_COUNT;
      if (frameIndex !== lastFrame) {
        baseEl.src = baseImages[frameIndex];
        glowEl.src = glowImages[frameIndex];
        lastFrame = frameIndex;
      }
    };

    renderFrame();

    const getTrajectory = (scrollY: number) => {
      const currentW = wrapperEl.offsetWidth || 200;
      const currentH = wrapperEl.offsetHeight || 200;
      const cX = window.innerWidth / 2 - currentW / 2;
      const cY = window.innerHeight / 2 - currentH / 2;

      const cycleLength = window.innerHeight * 6;
      const progressCycle = scrollY / cycleLength;
      
      const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (window.innerWidth * 0.35);
      const moveY = Math.sin(progressCycle * Math.PI * 2 * 4) * (window.innerHeight * 0.25);
      
      const spriteP = (progressCycle * 12) % 1;
      const frame = spriteP * (FRAME_COUNT - 1);

      return { x: cX + moveX, y: cY + moveY, frame };
    };

    const getCenterPos = () => {
      const currentW = wrapperEl.offsetWidth || 200;
      const currentH = wrapperEl.offsetHeight || 200;
      return {
        x: window.innerWidth / 2 - currentW / 2,
        y: window.innerHeight / 2 - currentH / 2,
      };
    };

    const initialScrollY = 0; 
    const START_POINT_SPRITE = getTrajectory(initialScrollY);
    const centerPos = getCenterPos();

    gsap.set(wrapperEl, {
      x: centerPos.x,
      y: centerPos.y,
      scale: 2.5,
      opacity: 1,
    });

    if (!isIntroComplete) {
      const tl = gsap.timeline({
        onComplete: () => {
          completeIntro();
          initScrollJourney();
        }
      });

      tl.to(state, {
        frame: FRAME_COUNT * 2 - 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: renderFrame,
      }, 0);

      tl.to(wrapperEl, {
        scale: 1,
        x: START_POINT_SPRITE.x,
        y: START_POINT_SPRITE.y,
        duration: 2.2,
        ease: 'power3.inOut',
      }, 0);
    } else {
      gsap.set(wrapperEl, { scale: 1, x: START_POINT_SPRITE.x, y: START_POINT_SPRITE.y, opacity: 1 });
      initScrollJourney();
    }

    function initScrollJourney() {
      scrollTriggerInst = ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0,
        onUpdate: (self) => {
          const scrollY = self.scroll();
          const stateData = getTrajectory(scrollY);
          
          state.frame = stateData.frame;
          renderFrame();

          gsap.set(wrapperEl, { x: stateData.x, y: stateData.y });
        },
      });
    }

    return () => {
      if (scrollTriggerInst) {
        scrollTriggerInst.kill();
      }
      gsap.killTweensOf(state);
      gsap.killTweensOf(wrapperEl);
    };
  }, [startIntro, completeIntro, isIntroComplete]);

  return (
    <div
      id="cube-sprite-wrapper"
      ref={wrapperRef}
      className="fixed top-0 left-0 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] z-[60] pointer-events-none"
    >
      <img
        ref={baseImgRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        alt=""
      />
      <img
        ref={glowImgRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-plus-lighter"
        alt=""
      />
    </div>
  );
}

