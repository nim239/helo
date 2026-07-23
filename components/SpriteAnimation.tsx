"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../lib/store/useScrollStore';

gsap.registerPlugin(ScrollTrigger);

const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_COUNT = 120;
const COLS = 120;

interface SpriteAnimationProps {
  startIntro?: boolean;
}

export function SpriteAnimation({ startIntro = false }: SpriteAnimationProps) {
  const spriteRef = useRef<HTMLDivElement>(null);
  const completeIntro = useScrollStore((state) => state.completeIntro);
  const isIntroComplete = useScrollStore((state) => state.isIntroComplete);

  useEffect(() => {
    const spriteEl = spriteRef.current;
    if (!spriteEl) return;

    // Wait until startIntro is true to begin anything
    if (!startIntro) {
      // Hide initially or set initial position
      gsap.set(spriteEl, { opacity: 0 });
      return;
    }

    let scrollTriggerInst: ScrollTrigger | null = null;
    
    // We already have the image cached by LoadingOverlay
    const w = spriteEl.offsetWidth;
    const h = spriteEl.offsetHeight;
    spriteEl.style.backgroundImage = `url(${SPRITE_SHEET_PATH})`;
    spriteEl.style.backgroundSize = `${w * COLS}px ${h}px`;

    const state = { frame: 0 };
    const updateFrame = gsap.quickSetter(spriteEl, 'backgroundPosition');

    const renderFrame = () => {
      const col = Math.floor(state.frame) % COLS;
      updateFrame(`${-col * w}px 0px`);
    };

    // Calculate layout coordinates
    const centerX = window.innerWidth / 2 - w / 2;
    const centerY = window.innerHeight / 2 - h / 2;
    
    // Function to calculate exact Lissajous coordinate for any given scroll offset
    // To ensure perfect teleportation, the math MUST loop exactly over 6 sections (the real exhibition length).
    const getTrajectory = (scrollY: number) => {
      const cycleLength = window.innerHeight * 6;
      const progressCycle = scrollY / cycleLength; // 1.0 = exactly 6 sections
      
      const moveX = Math.sin(progressCycle * Math.PI * 2 * 3) * (window.innerWidth * 0.35); // 3 loops per 6 sections
      const moveY = Math.sin(progressCycle * Math.PI * 2 * 4) * (window.innerHeight * 0.25); // 4 loops per 6 sections
      
      // Calculate sprite frame (loop 12 times per 6 sections)
      const spriteP = (progressCycle * 12) % 1;
      const frame = spriteP * (FRAME_COUNT - 1);
      
      return { x: centerX + moveX, y: centerY + moveY, frame };
    };

    // The start point is determined by the trajectory math at initial scroll position
    const initialScrollY = window.innerHeight * 3; // Section 1 (Index 3)
    
    // CONFIGURATION: Base target position for the Sprite Intro End
    const START_POINT_SPRITE = getTrajectory(initialScrollY);
    
    // Initial Intro State
    gsap.set(spriteEl, {
      x: centerX,
      y: centerY,
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
      ref={spriteRef}
      className="fixed top-0 left-0 w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] z-[60] pointer-events-none bg-no-repeat"
    />
  );
}
