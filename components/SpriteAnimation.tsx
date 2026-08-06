"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../lib/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
// T015: Warp amplitude constants
const WARP_AMP_MIN = 0.12;    // Minimum amplitude multiplier during full warp (12% of original)
const WARP_AMP_LERP = 0.05;   // Lerp speed for amplitude transition
const WARP_DRIFT_MULT = 80;   // Y-axis drift multiplier (pixels per velocity unit, opposite direction)

interface SpriteAnimationProps {
  startIntro?: boolean;
}

export function SpriteAnimation({ startIntro = false }: SpriteAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const fallbackCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const baseImagesRef = useRef<HTMLImageElement[]>([]);
  const glowImagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0 });
  const scrollTriggerInstRef = useRef<ScrollTrigger | null>(null);
  // T015: Warp amplitude refs
  const warpAmpMultRef = useRef<number>(1.0);  // 1.0 = normal, ~0.12 = warp min
  const warpDriftYRef = useRef<number>(0);     // Y drift opposite to scroll

  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  // T017: Subscribe to warpPool for amplitude lerp (in GSAP ticker, no re-render)
  useEffect(() => {
    const ticker = () => {
      const { warpPool, currentPhase, velocity } = useScrollStore.getState();
      const isWarping = currentPhase === 'WARPING';
      // Target amplitude: lerp between 1.0 (normal) and WARP_AMP_MIN (warp)
      const targetAmp = isWarping
        ? Math.max(WARP_AMP_MIN, 1.0 - warpPool * (1.0 - WARP_AMP_MIN))
        : 1.0;
      warpAmpMultRef.current += (targetAmp - warpAmpMultRef.current) * WARP_AMP_LERP;
      // Drift Y opposite scroll direction
      warpDriftYRef.current = isWarping ? -velocity * WARP_DRIFT_MULT : 0;
    };
    gsap.ticker.add(ticker);
    return () => gsap.ticker.remove(ticker);
  }, []);

  // ============================================================================
  // HOOK 1: KHỞI TẠO CANVAS & WORKER (CHỈ CHẠY 1 LẦN KHI MOUNT ĐỂ PRELOAD ẢNH)
  // ============================================================================
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    // --- DYNAMIC CANVAS CREATION (FIX STRICT MODE) ---
    const canvasEl = document.createElement("canvas");
    canvasEl.width = 600;
    canvasEl.height = 600;
    canvasEl.className = "absolute top-0 left-0 w-full h-full object-contain pointer-events-none";
    wrapperEl.appendChild(canvasEl);

    // --- INIT WORKER ---
    const supportsOffscreen =
      typeof OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in HTMLCanvasElement.prototype;

    let worker: Worker | null = null;
    let fallbackCtx: CanvasRenderingContext2D | null = null;

    if (supportsOffscreen) {
      try {
        worker = new Worker(
          new URL("../lib/workers/sprite-animation.worker.ts", import.meta.url),
          { type: "module" }
        );
        workerRef.current = worker;
        const offscreenCanvas = canvasEl.transferControlToOffscreen();
        worker.postMessage(
          { type: "INIT", canvas: offscreenCanvas, width: 600, height: 600 },
          [offscreenCanvas]
        );
      } catch (e) {
        console.warn("[SpriteWorker] Init failed, fallback to main thread", e);
        worker = null;
        workerRef.current = null;
      }
    }

    if (!worker) {
      console.log("[SpriteWorker] Fallback to Main Thread render");
      try {
        fallbackCtx = canvasEl.getContext('2d', { alpha: true });
      } catch (e) {
        wrapperEl.removeChild(canvasEl);
        const newCanvasEl = document.createElement("canvas");
        newCanvasEl.width = 600;
        newCanvasEl.height = 600;
        newCanvasEl.className = "absolute top-0 left-0 w-full h-full object-contain pointer-events-none";
        wrapperEl.appendChild(newCanvasEl);
        fallbackCtx = newCanvasEl.getContext('2d', { alpha: true });
      }
      fallbackCtxRef.current = fallbackCtx;

      for (let i = 0; i < FRAME_COUNT; i++) {
        const idx = i.toString().padStart(5, '0');
        const bImg = new Image();
        bImg.decoding = 'async';
        bImg.src = `/sprite_cubi/cubi/cubi_${idx}.webp`;
        baseImagesRef.current.push(bImg);

        const gImg = new Image();
        gImg.decoding = 'async';
        gImg.src = `/sprite_cubi/cubi_glow/cubi_glow_${idx}.webp`;
        glowImagesRef.current.push(gImg);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (canvasEl && wrapperEl.contains(canvasEl)) {
        wrapperEl.removeChild(canvasEl);
      }
      baseImagesRef.current.forEach(img => { img.onload = null; img.src = ""; });
      glowImagesRef.current.forEach(img => { img.onload = null; img.src = ""; });
      baseImagesRef.current = [];
      glowImagesRef.current = [];
    };
  }, []); // CHỈ CHẠY 1 LẦN!

  // ============================================================================
  // HOOK 2: XỬ LÝ GSAP ANIMATION & SCROLL KHI startIntro THAY ĐỔI
  // ============================================================================
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    if (!startIntro) {
      gsap.set(wrapperEl, { opacity: 0 });
      return;
    }

    let lastRenderedFrame = -1;

    const renderFrame = () => {
      const state = stateRef.current;
      const worker = workerRef.current;
      const fallbackCtx = fallbackCtxRef.current;
      const baseImages = baseImagesRef.current;
      const glowImages = glowImagesRef.current;

      const frameIndex = Math.floor(state.frame) % FRAME_COUNT;
      if (frameIndex === lastRenderedFrame) return;

      if (worker) {
        worker.postMessage({ type: "FRAME", frame: state.frame });
        lastRenderedFrame = frameIndex;
        return;
      }

      // --- FALLBACK RENDER ---
      if (fallbackCtx && baseImages.length > 0) {
        let bImg = baseImages[frameIndex];
        let validIdx = frameIndex;
        while (validIdx > 0 && (!bImg || !bImg.complete || bImg.naturalWidth === 0)) {
          validIdx--;
          bImg = baseImages[validIdx];
        }

        if (bImg && bImg.complete && bImg.naturalWidth !== 0) {
          fallbackCtx.clearRect(0, 0, 600, 600);
          fallbackCtx.globalCompositeOperation = 'source-over';
          fallbackCtx.drawImage(bImg, 0, 0, 600, 600);

          const gImg = glowImages[validIdx];
          if (gImg && gImg.complete && gImg.naturalWidth !== 0) {
            fallbackCtx.globalCompositeOperation = 'lighter';
            fallbackCtx.drawImage(gImg, 0, 0, 600, 600);
          }
          lastRenderedFrame = frameIndex;
        }
      }
    };

    const getTrajectory = (scrollY: number) => {
      const currentW = wrapperEl.offsetWidth || 400;
      const currentH = wrapperEl.offsetHeight || 400;
      const cX = window.innerWidth / 2 - currentW / 2;
      const cY = window.innerHeight / 2 - currentH / 2;

      const cycleLength = window.innerHeight * 6;
      const progressCycle = scrollY / cycleLength;

      const ampMult = warpAmpMultRef.current;
      const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (window.innerWidth * 0.35) * ampMult;
      // T016: When warping, clamp to upper half of screen + drift Y opposite scroll
      const isWarping = useScrollStore.getState().currentPhase === 'WARPING';
      const moveY = Math.sin(progressCycle * Math.PI * 2 * 4 - Math.PI / 2) * (window.innerHeight * 0.25) * ampMult
        + (isWarping ? warpDriftYRef.current : 0);

      // Sprite frame speed stays natural (linked to scrollY as before)
      const spriteP = (progressCycle * 36) % 1;
      const frame = spriteP * (FRAME_COUNT - 1);

      const margin = 20;
      // When warping: constrain y to upper 50% of screen
      const yMax = isWarping ? window.innerHeight * 0.5 - currentH - margin : window.innerHeight - currentH - margin;
      const clampedX = Math.max(margin, Math.min(window.innerWidth - currentW - margin, cX + moveX));
      const clampedY = Math.max(margin, Math.min(yMax, cY + moveY));

      return { x: clampedX, y: clampedY, frame };
    };

    const getCenterPos = () => {
      const currentW = wrapperEl.offsetWidth || 400;
      const currentH = wrapperEl.offsetHeight || 400;
      const margin = 20;
      const x = window.innerWidth / 2 - currentW / 2;
      const y = window.innerHeight * 0.25 - currentH / 2;
      return {
        x: Math.max(margin, Math.min(window.innerWidth - currentW - margin, x)),
        y: Math.max(margin, Math.min(window.innerHeight - currentH - margin, y)),
      };
    };

    const START_POINT_SPRITE = getTrajectory(0);
    const centerPos = getCenterPos();

    gsap.set(wrapperEl, {
      x: centerPos.x,
      y: centerPos.y,
      scale: 2.0,
      opacity: 1,
    });

    if (!isIntroComplete) {
      const tl = gsap.timeline({
        onComplete: () => {
          completeIntro();
          initScrollJourney();
        }
      });

      tl.to(stateRef.current, {
        frame: FRAME_COUNT * 2 - 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: renderFrame,
      }, 0);

      tl.to(wrapperEl, {
        scale: 0.8,
        x: START_POINT_SPRITE.x,
        y: START_POINT_SPRITE.y,
        duration: 2.2,
        ease: 'power3.inOut',
      }, 0);
    } else {
      gsap.set(wrapperEl, { scale: 0.8, x: START_POINT_SPRITE.x, y: START_POINT_SPRITE.y, opacity: 1 });
      initScrollJourney();
    }

    function initScrollJourney() {
      scrollTriggerInstRef.current = ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0,
        onUpdate: (self) => {
          const scrollY = self.scroll();
          const stateData = getTrajectory(scrollY);

          stateRef.current.frame = stateData.frame;
          renderFrame();

          gsap.set(wrapperEl, { x: stateData.x, y: stateData.y });
        },
      });
    }

    return () => {
      if (scrollTriggerInstRef.current) {
        scrollTriggerInstRef.current.kill();
        scrollTriggerInstRef.current = null;
      }
      gsap.killTweensOf(stateRef.current);
      gsap.killTweensOf(wrapperEl);
    };
  }, [startIntro, completeIntro, isIntroComplete]);

  return (
    <div
      id="cube-sprite-wrapper"
      ref={wrapperRef}
      className="fixed top-0 left-0 w-[32vw] h-[32vw] max-w-[320px] max-h-[320px] z-[60] pointer-events-none opacity-0"
    />
  );
}
