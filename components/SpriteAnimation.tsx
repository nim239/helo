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

    if (!startIntro) {
      gsap.set(wrapperEl, { opacity: 0 });
      return;
    }

    const ctx = canvasEl.getContext('2d', { alpha: true });
    if (!ctx) return;

    // --- GIAI ĐOẠN 3: TÍCH HỢP CANVAS RENDER ENGINE ---
    // Loại bỏ CSS Render, khởi tạo Image object trực tiếp trong RAM.
    const baseImages: HTMLImageElement[] = [];
    const glowImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const idx = i.toString().padStart(5, '0');

      const bImg = new Image();
      bImg.src = `/sprite_cubi/cubi/cubi_${idx}.webp`;
      baseImages.push(bImg);

      const gImg = new Image();
      gImg.src = `/sprite_cubi/cubi_glow/cubi_glow_${idx}.webp`;
      glowImages.push(gImg);
    }

    let scrollTriggerInst: ScrollTrigger | null = null;
    const state = { frame: 0 };
    let lastFrame = -1;

    // Vòng lặp Render (Render Loop)
    const renderFrame = () => {
      const frameIndex = Math.floor(state.frame) % FRAME_COUNT;

      if (frameIndex !== lastFrame) {
        // Clear canvas
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        // Vẽ Base (Layer 1)
        ctx.globalCompositeOperation = 'source-over';
        const bImg = baseImages[frameIndex];
        if (bImg && bImg.complete && bImg.naturalWidth !== 0) {
          ctx.drawImage(bImg, 0, 0, canvasEl.width, canvasEl.height);
        }

        // Vẽ Glow (Layer 2) - Kỹ thuật Additive Blending
        ctx.globalCompositeOperation = 'lighter';
        const gImg = glowImages[frameIndex];
        if (gImg && gImg.complete && gImg.naturalWidth !== 0) {
          ctx.drawImage(gImg, 0, 0, canvasEl.width, canvasEl.height);
        }

        lastFrame = frameIndex;
      }
    };

    // Đảm bảo render frame đầu tiên ngay khi ảnh đầu tiên load xong
    if (baseImages[0].complete && glowImages[0].complete) {
      renderFrame();
    } else {
      baseImages[0].onload = renderFrame;
    }

    const getTrajectory = (scrollY: number) => {
      const currentW = wrapperEl.offsetWidth || 400;
      const currentH = wrapperEl.offsetHeight || 400;
      const cX = window.innerWidth / 2 - currentW / 2;
      const cY = window.innerHeight / 2 - currentH / 2;

      const cycleLength = window.innerHeight * 6;
      const progressCycle = scrollY / cycleLength;

      const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (window.innerWidth * 0.35);
      const moveY = Math.sin(progressCycle * Math.PI * 2 * 4) * (window.innerHeight * 0.25);

      const spriteP = (progressCycle * 36) % 1; // tốc độ quay 
      const frame = spriteP * (FRAME_COUNT - 1);

      return { x: cX + moveX, y: cY + moveY, frame };
    };

    const getCenterPos = () => {
      const currentW = wrapperEl.offsetWidth || 400;
      const currentH = wrapperEl.offsetHeight || 400;
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

    // --- GIAI ĐOẠN 4: ĐO LƯỜNG & DỌN DẸP MEMORY LEAK ---
    return () => {
      if (scrollTriggerInst) {
        scrollTriggerInst.kill();
      }
      gsap.killTweensOf(state);
      gsap.killTweensOf(wrapperEl);

      // Garbage Collection Cleanup
      baseImages.forEach(img => {
        img.onload = null;
        img.src = "";
      });
      glowImages.forEach(img => {
        img.onload = null;
        img.src = "";
      });
      baseImages.length = 0;
      glowImages.length = 0;
    };
  }, [startIntro, completeIntro, isIntroComplete]);

  return (
    <div
      id="cube-sprite-wrapper"
      ref={wrapperRef}
      className="fixed top-0 left-0 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] z-[60] pointer-events-none"
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

