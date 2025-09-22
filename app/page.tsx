"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import ContentBlock from '@/app/components/ContentBlock';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const contentData = [
  { id: 1, key: 'block-1', number: 1, text: 'This is the first block', backgroundColor: '#f0f0f0' },
  { id: 2, key: 'block-2', number: 2, text: 'This is the second block', backgroundColor: '#e0e0e0' },
  { id: 3, key: 'block-3', number: 3, text: 'This is the third block', backgroundColor: '#d0d0d0' },
  { id: 4, key: 'block-4', number: 4, text: 'This is the fourth block', backgroundColor: '#c0c0c0' },
  { id: 5, key: 'block-5', number: 5, text: 'This is the fifth block', backgroundColor: '#b0b0b0' },
  { id: 6, key: 'block-6', number: 6, text: 'This is the sixth block', backgroundColor: '#a0a0a0' },
];

const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_COUNT = 120;
const COLS = 120;
const ROWS = 1;
const NUM_ITEMS = 600;

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      ScrollTrigger.refresh();
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowHeight === 0) return;

    const ctx = gsap.context(() => {
      window.scrollTo(0, 0); // Force scroll to top on refresh

      const mainEl = mainRef.current;
      const spriteEl = spriteRef.current;
      if (!mainEl || !spriteEl) return;



      const smoother = ScrollSmoother.create({
        wrapper: mainEl,
        content: mainEl.querySelector('#smooth-content'),
        smooth: 4,
        effects: true,
        smoothTouch: 2.5,
        ease: "power2.inOut"
      });

      smoother.paused(true);

      const spriteImage = new Image();
      spriteImage.src = SPRITE_SHEET_PATH;
      spriteImage.onload = () => {
        const frameContentWidth = spriteEl.offsetWidth;
        const frameContentHeight = spriteEl.offsetHeight;
        spriteEl.style.backgroundImage = `url(${SPRITE_SHEET_PATH})`;
        spriteEl.style.backgroundSize = `${frameContentWidth * COLS}px ${frameContentHeight * ROWS}px`;

        const updateFrame = gsap.quickSetter(spriteEl, "backgroundPosition");
        const state = { frame: 0 };

        const renderSpriteFrame = () => {
          const frameIndex = Math.floor(state.frame);
          const col = frameIndex % COLS;
          const xPos = -col * frameContentWidth;
          updateFrame(`${xPos}px 0px`);
        };

        // Define horizontal animation for the sprite


        const scrollTriggerInstance = ScrollTrigger.create({
            trigger: mainEl,
            start: 'top top',
            end: 'max',
            scrub: true,
            scroller: mainEl,
            onUpdate: (self) => {
                const loopDistance = windowHeight * 4; // Each loop is 4 screen heights
                const progressInLoop = (self.scroll() / loopDistance) % 1;

                // Decouple sprite animation speed from flying speed
                const spriteProgress = (progressInLoop * 2) % 1; // Loops twice as fast
                state.frame = spriteProgress * (FRAME_COUNT - 1);
                renderSpriteFrame();

                // Horizontal movement speed remains unchanged, based on original progressInLoop
                const maxHorizontalMovement = window.innerWidth - spriteEl.offsetWidth;
                const ease = gsap.parseEase("power2.inOut");
                
                let xProgress = progressInLoop * 2; // Scale to 0-2 for ping-pong
                if (xProgress > 1) {
                    xProgress = 2 - xProgress; // Reverse direction for 1-2 range
                }
                const easedXProgress = ease(xProgress);
                const targetX = maxHorizontalMovement * easedXProgress;

                gsap.set(spriteEl, { x: targetX }); // Directly set x position
            }
        });

        const introTl = gsap.timeline({
          onUpdate: renderSpriteFrame,
          onComplete: () => {
            smoother.paused(false);
            if (scrollTriggerInstance) {
              scrollTriggerInstance.enable();
            }

            ScrollTrigger.refresh();
          }
        });
        introTl.to(state, { frame: FRAME_COUNT - 1, duration: 4, ease: "none" });
      };
    }, mainRef);

    return () => ctx.revert();
  }, [windowHeight]);

  const allItems = Array.from({ length: NUM_ITEMS }, (_, index) => {
    const item = contentData[index % contentData.length];
    return (
      <ContentBlock
        key={index}
        number={item.number}
        text={item.text}
        backgroundColor={item.backgroundColor}
        dataIndex={index}
      />
    );
  });

  return (
    <>
      <div ref={mainRef} id="smooth-wrapper">
        <div id="smooth-content">
          {allItems}
        </div>
      </div>
      <div ref={spriteRef} className="sprite-animation top-0 left-0 w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] z-[100] pointer-events-none" style={{ position: 'fixed', backgroundRepeat: 'no-repeat' }}></div>
    </>
  );
}