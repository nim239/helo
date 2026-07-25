"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../lib/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const COLS = 120;

interface SpriteAnimationProps {
  startIntro?: boolean;
}

export function SpriteAnimation({ startIntro = false }: SpriteAnimationProps) {
  const spriteRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<HTMLDivElement>(null);
  const glowLayerRef = useRef<HTMLDivElement>(null);
  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  useEffect(() => {
    const spriteEl = spriteRef.current;
    const baseEl = baseLayerRef.current;
    const glowEl = glowLayerRef.current;
    if (!spriteEl || !baseEl || !glowEl) return;

    // Wait until startIntro is true to begin anything
    if (!startIntro) {
      // Hide initially or set initial position
      gsap.set(spriteEl, { opacity: 0 });
      return;
    }

    let scrollTriggerInst: ScrollTrigger | null = null;
    
    const state = { frame: 0 };
    const updateFrameBase = gsap.quickSetter(baseEl, 'backgroundPosition');
    const updateFrameGlow = gsap.quickSetter(glowEl, 'backgroundPosition');

    const renderFrame = () => {
      const col = Math.floor(state.frame) % COLS;
      const xPercent = (col / (COLS - 1)) * 100;
      const pos = `${xPercent}% 0%`;
      updateFrameBase(pos);
      updateFrameGlow(pos);
    };

    // Function to calculate exact Lissajous coordinate for any given scroll offset
    // To ensure perfect teleportation, the math MUST loop exactly over 6 sections (the real exhibition length).
    const getTrajectory = (scrollY: number) => {
      const currentW = spriteEl.offsetWidth || 100;
      const currentH = spriteEl.offsetHeight || 100;
      const cX = window.innerWidth / 2 - currentW / 2;
      const cY = window.innerHeight / 2 - currentH / 2;

      const cycleLength = window.innerHeight * 6;
      const progressCycle = scrollY / cycleLength; // 1.0 = exactly 6 sections
      
      const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (window.innerWidth * 0.35); // 3 loops per 6 sections
      const moveY = Math.sin(progressCycle * Math.PI * 2 * 4) * (window.innerHeight * 0.25); // 4 loops per 6 sections
      
      // Calculate sprite frame (loop 12 times per 6 sections)
      const spriteP = (progressCycle * 12) % 1;
      const frame = spriteP * (FRAME_COUNT - 1);
      
      return { x: cX + moveX, y: cY + moveY, frame };
    };

    const getCenterPos = () => {
      const currentW = spriteEl.offsetWidth || 100;
      const currentH = spriteEl.offsetHeight || 100;
      return {
        x: window.innerWidth / 2 - currentW / 2,
        y: window.innerHeight / 2 - currentH / 2,
      };
    };

    // The start point is determined by the trajectory math at initial scroll position
    const initialScrollY = 0; // Section 1 (Index 0)
    
    // CONFIGURATION: Base target position for the Sprite Intro End
    const START_POINT_SPRITE = getTrajectory(initialScrollY);
    
    const centerPos = getCenterPos();

    // Initial Intro State
    gsap.set(spriteEl, {
      x: centerPos.x,
      y: centerPos.y,
      scale: 2.5,
      opacity: 1,
    });

    if (!isIntroComplete) {
      // --- PHASE A: Cinematic Intro ---
      const tl = gsap.timeline({
        onComplete: () => {
          completeIntro();
          initScrollJourney();
        }
      });

      // Play 2 full loops of the sprite (240 frames)
      tl.to(state, {
        frame: FRAME_COUNT * 2 - 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: renderFrame,
      }, 0);

      // Simultaneously animate scale and position to the EXACT Start Point calculated above
      tl.to(spriteEl, {
        scale: 1,
        x: START_POINT_SPRITE.x,
        y: START_POINT_SPRITE.y,
        duration: 2.2,
        ease: 'power3.inOut',
      }, 0);
    } else {
      // If intro was already complete (e.g. HMR or returning), jump straight to scroll journey
      gsap.set(spriteEl, { scale: 1, x: START_POINT_SPRITE.x, y: START_POINT_SPRITE.y, opacity: 1 });
      initScrollJourney();
    }

    function initScrollJourney() {
      // --- PHASE B: Scroll-driven Journey ---
      scrollTriggerInst = ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0, // Direct sync for maximum responsiveness with Lenis
        onUpdate: (self) => {
          const scrollY = self.scroll(); // Get exact scroll Y in pixels
          
          const stateData = getTrajectory(scrollY);
          
          // 1. Sprite Frames
          state.frame = stateData.frame;
          renderFrame();

          // 2. Trajectory Math 
          gsap.set(spriteEl, { x: stateData.x, y: stateData.y });
        },
      });
    }

    return () => {
      if (scrollTriggerInst) {
        scrollTriggerInst.kill();
      }
      gsap.killTweensOf(state);
      gsap.killTweensOf(spriteEl);
    };
  }, [startIntro, completeIntro, isIntroComplete]);

  return (
    <div
      id="cube-sprite"
      ref={spriteRef}
      className="fixed top-0 left-0 w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] z-[60] pointer-events-none"
    >
      <div 
        ref={baseLayerRef}
        className="absolute inset-0 w-full h-full bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url('/sprite_cubi/cubi.webp')`, backgroundSize: `${COLS * 100}% 100%` }}
      />
      <div 
        ref={glowLayerRef}
        className="absolute inset-0 w-full h-full bg-no-repeat pointer-events-none mix-blend-plus-lighter"
        style={{ backgroundImage: `url('/sprite_cubi/cubi_glow.webp')`, backgroundSize: `${COLS * 100}% 100%` }}
      />
    </div>
  );
}

