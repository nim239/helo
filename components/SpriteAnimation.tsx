"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_COUNT = 120;
const COLS = 120;

export function SpriteAnimation() {
  const spriteRef = useRef<HTMLDivElement>(null);

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

      // Ensure ScrollTrigger ignores any React layout shifts
      const trigger = ScrollTrigger.create({
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

      return () => {
        trigger.kill();
      };
    };
  }, []);

  return (
    <div
      ref={spriteRef}
      className="fixed top-1/2 -translate-y-1/2 left-0 w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] z-[60] pointer-events-none bg-no-repeat"
    />
  );
}
