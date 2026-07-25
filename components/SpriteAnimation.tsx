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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapperEl || !canvasEl) return;
    
    const ctx = canvasEl.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Wait until startIntro is true to begin anything
    if (!startIntro) {
      gsap.set(wrapperEl, { opacity: 0 });
      return;
    }

    // --- KHỞI TẠO IMAGE SEQUENCE ---
    // 💡 LƯU Ý CHO USER: ĐƯỜNG DẪN ẢNH VÀ ĐỊNH DẠNG (SRC)
    // Nếu anh nén ảnh thành webp thì đổi đuôi .png bên dưới thành .webp nhé
    const baseImages: HTMLImageElement[] = [];
    const glowImages: HTMLImageElement[] = [];
    
    for (let i = 0; i < FRAME_COUNT; i++) {
      const idx = i.toString().padStart(5, '0');
      
      const baseImg = new Image();
      baseImg.src = `/sprite_cubi/cubi/cubi_${idx}.png`;
      baseImages.push(baseImg);
      
      const glowImg = new Image();
      glowImg.src = `/sprite_cubi/cubi_glow/cubi_glow_${idx}.png`;
      glowImages.push(glowImg);
    }

    let scrollTriggerInst: ScrollTrigger | null = null;
    const state = { frame: 0 };

    // Rendering Loop via Canvas
    const renderFrame = () => {
      const frameIndex = Math.floor(state.frame) % FRAME_COUNT;
      
      // Xóa khung hình cũ
      ctx.clearRect(0, 0, 1080, 1080);
      
      // Vẽ ảnh Base (Lớp dưới)
      ctx.globalCompositeOperation = 'source-over';
      const baseImg = baseImages[frameIndex];
      if (baseImg && baseImg.complete && baseImg.naturalWidth !== 0) {
        ctx.drawImage(baseImg, 0, 0, 1080, 1080);
      }

      // Vẽ ảnh Glow (Lớp trên - Blend Mode ADD)
      ctx.globalCompositeOperation = 'lighter'; // 'lighter' in canvas acts exactly like Screen/Add
      const glowImg = glowImages[frameIndex];
      if (glowImg && glowImg.complete && glowImg.naturalWidth !== 0) {
        ctx.drawImage(glowImg, 0, 0, 1080, 1080);
      }
    };

    // Ensure first frame is drawn initially once ready
    if (baseImages[0].complete) {
      renderFrame();
    } else {
      baseImages[0].onload = renderFrame;
    }

    const getTrajectory = (scrollY: number) => {
      const currentW = wrapperEl.offsetWidth || 100;
      const currentH = wrapperEl.offsetHeight || 100;
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
      const currentW = wrapperEl.offsetWidth || 100;
      const currentH = wrapperEl.offsetHeight || 100;
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
      className="fixed top-0 left-0 w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] z-[60] pointer-events-none"
    >
      <canvas 
        ref={canvasRef}
        width={1080}
        height={1080}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

