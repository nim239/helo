 "use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother'; // Keep ScrollTrigger for ScrollSmoother integration
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Keep ScrollTrigger for ScrollSmoother integration
import ContentBlock from '@/app/components/ContentBlock';

gsap.registerPlugin(ScrollSmoother, ScrollTrigger); // Register both plugins

const contentData = [
  { id: 1, key: 'block-1', number: 1, text: 'This is the first block', backgroundColor: '#f0f0f0' },
  { id: 2, key: 'block-2', number: 2, text: 'This is the second block', backgroundColor: '#e0e0e0' },
  { id: 3, key: 'block-3', number: 3, text: 'This is the third block', backgroundColor: '#d0d0d0' },
  { id: 4, key: 'block-4', number: 4, text: 'This is the fourth block', backgroundColor: '#c0c0c0' },
  { id: 5, key: 'block-5', number: 5, text: 'This is the fifth block', backgroundColor: '#b0b0b0' },
  { id: 6, key: 'block-6', number: 6, text: 'This is the sixth block', backgroundColor: '#a0a0a0' },
];

// Constants for Sprite Sheet Animation
const SPRITE_SHEET_PATH = '/png/spritesheet.png';
const FRAME_CONTENT_WIDTH = 300; // Width of the content within a frame
const FRAME_CONTENT_HEIGHT = 300; // Height of the content within a frame
const FRAME_COUNT = 120; // Total number of frames
const COLS = 120; // Number of columns in the sprite sheet (horizontal)
const ROWS = 1; // Number of rows in the sprite sheet (horizontal)
const PADDING_SIZE = 0; // No padding around frames

const SPRITE_WIDTH_EFFECTIVE = FRAME_CONTENT_WIDTH + 2 * PADDING_SIZE; // 300 + 0 = 300
const SPRITE_HEIGHT_EFFECTIVE = FRAME_CONTENT_HEIGHT + 2 * PADDING_SIZE; // 300 + 0 = 300

const maxNodes = 60; // Maximum number of nodes to keep in the DOM

export default function Home() {
  const initialLoadCount = 12; // Initial number of blocks to load
  const batchSize = 6; // Number of blocks to add in each batch

  const [displayedItems, setDisplayedItems] = useState(() => {
    const initialItems = [];
    for (let i = 0; i < initialLoadCount; i++) {
      initialItems.push({ ...contentData[i % contentData.length], dataIndex: i });
    }
    return initialItems;
  });
  const [nextIndex, setNextIndex] = useState(initialLoadCount); // Global counter for the next block's index

  const main = useRef(null);
  const scrollPos = useRef(0); // To track scroll position for looping
  const blockRefs = useRef<Array<HTMLElement | null>>([]); // To store refs to content blocks for height calculation

  const loadMoreItems = useCallback(() => {
    setDisplayedItems((prevItems) => {
      const newItems = [];
      for (let i = 0; i < batchSize; i++) {
        const newBlockIndex = nextIndex + i;
        newItems.push({ ...contentData[newBlockIndex % contentData.length], dataIndex: newBlockIndex });
      }
      setNextIndex((prevIndex) => prevIndex + batchSize);

      let updatedItems = [...prevItems, ...newItems];
      console.log('loadMoreItems: nextIndex before update', nextIndex, 'updatedItems.length before recycling', updatedItems.length);

      // Implement DOM recycling
      if (updatedItems.length > maxNodes) {
        const itemsToRemoveCount = updatedItems.length - maxNodes;
        const itemsToRemove = updatedItems.slice(0, itemsToRemoveCount);
        let removedItemsHeight = 0;

        itemsToRemove.forEach(item => {
          const ref = blockRefs.current[item.dataIndex];
          if (ref) {
            removedItemsHeight += ref.offsetHeight || 0;
            delete blockRefs.current[item.dataIndex]; // Remove the ref entry
          }
        });

        // Adjust scroll position to compensate for removed items
        const smoother = ScrollSmoother.get();
        if (smoother) {
          smoother.scrollTo(smoother.scrollTrigger.scroll() - removedItemsHeight, false);
        }

        updatedItems = updatedItems.slice(itemsToRemoveCount);
        console.log('loadMoreItems: updatedItems.length after recycling', updatedItems.length, 'removedItemsHeight', removedItemsHeight);
      }

      return updatedItems;
    });
  }, [nextIndex, batchSize]);

  const handleScroll = useCallback(() => {
    console.log('handleScroll called');
    const smoother = ScrollSmoother.get(); // Get the latest smoother instance
    console.log('handleScroll: smoother', smoother);
    if (smoother) {
      const currentScroll = smoother.scrollTrigger.scroll();
      const maxScroll = ScrollTrigger.maxScroll(smoother.wrapper());
      const preloadThreshold = 600; // pixels from the bottom to start loading more items

      console.log('handleScroll: currentScroll', currentScroll, 'maxScroll', maxScroll, 'preloadThreshold', preloadThreshold);

      if (maxScroll - currentScroll < preloadThreshold) {
        console.log('handleScroll: Calling loadMoreItems');
        loadMoreItems();
      }
    }
  }, [loadMoreItems]);

  useEffect(() => {
    const spriteAnimationElement = document.querySelector('.sprite-animation') as HTMLElement;
    if (!spriteAnimationElement) return;

    spriteAnimationElement.style.backgroundImage = `url(${SPRITE_SHEET_PATH})`;
    spriteAnimationElement.style.backgroundSize = `${(COLS * SPRITE_WIDTH_EFFECTIVE / FRAME_CONTENT_WIDTH) * 100}% ${(ROWS * SPRITE_HEIGHT_EFFECTIVE / FRAME_CONTENT_HEIGHT) * 100}%`;

    const updateFrame = gsap.quickSetter(spriteAnimationElement, "backgroundPosition");
    const state = { frame: 0 };

    const spriteImage = new Image();
    spriteImage.onload = () => {
      console.log('spriteImage.onload callback executed');
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
      });

      ScrollTrigger.addEventListener('scrollEnd', handleScroll);

      const spriteScrollTrigger = ScrollTrigger.create({
        trigger: "#smooth-content",
        start: "top top",
        end: "max",
        scrub: true, // Always scrub, but disable/enable the ScrollTrigger itself
        scroller: smoother.wrapper(),
        onUpdate: (self) => {
          console.log('spriteScrollTrigger onUpdate: self.progress', self.progress);
          state.frame = Math.floor(self.progress * (FRAME_COUNT - 1));
          const frameIndex = Math.floor(state.frame);
          const col = frameIndex % COLS;
          const row = Math.floor(frameIndex / COLS);
          const xPos = -col * SPRITE_WIDTH_EFFECTIVE;
          const yPos = -row * SPRITE_HEIGHT_EFFECTIVE;
          updateFrame(`${xPos}px ${yPos}px`);
        },
      });
      spriteScrollTrigger.disable(); // Disable initially

      // Intro auto-play
      const introTl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => {
          const frameIndex = Math.floor(state.frame);
          const col = frameIndex % COLS;
          const row = Math.floor(frameIndex / COLS);
          const xPos = -col * SPRITE_WIDTH_EFFECTIVE;
          const yPos = -row * SPRITE_HEIGHT_EFFECTIVE;
          updateFrame(`${xPos}px ${yPos}px`);
        },
        onComplete: () => {
          console.log('introTl onComplete: enabling spriteScrollTrigger');
          state.frame = 0;
          const col = 0;
          const row = 0;
          const xPos = -col * SPRITE_WIDTH_EFFECTIVE;
          const yPos = -row * SPRITE_HEIGHT_EFFECTIVE;
          updateFrame(`${xPos}px ${yPos}px`);
          spriteScrollTrigger.enable(); // Enable scrubbing after intro
        },
      });

      introTl.to(state, {
        frame: FRAME_COUNT - 1,
        duration: 4,
        onComplete: () => {
          console.log('introTl.to onComplete: enabling spriteScrollTrigger');
          state.frame = 0;
          const col = 0;
          const row = 0;
          const xPos = -col * SPRITE_WIDTH_EFFECTIVE;
          const yPos = -row * SPRITE_HEIGHT_EFFECTIVE;
          updateFrame(`${xPos}px ${yPos}px`);
          spriteScrollTrigger.enable(); // Enable scrubbing after intro
        },
      });

      return () => {
        smoother.wrapper().removeEventListener('scroll', handleScroll);
        spriteScrollTrigger.kill(); // Kill the ScrollTrigger on cleanup
      };
    };
    spriteImage.onerror = () => {
      console.error('Failed to load sprite sheet:', SPRITE_SHEET_PATH);
    };
    spriteImage.src = SPRITE_SHEET_PATH;

    return () => {
      ScrollSmoother.get()?.kill();
      gsap.globalTimeline.clear();
    };
  }, []);

  return (
    <>
      <div id="smooth-wrapper" style={{ overflow: 'hidden' }}>
        <div id="smooth-content">
          <main ref={main} className="min-h-screen">
            {displayedItems.map((block, index) => (
              <ContentBlock
                key={block.dataIndex}
                number={block.number}
                text={block.text}
                backgroundColor={block.backgroundColor}
                dataIndex={block.dataIndex}
                ref={(el) => { blockRefs.current[block.dataIndex] = el; }}
              />
            ))}
          </main>
        </div>
      </div>
      <div className="sprite-animation fixed top-0 left-0 w-[300px] h-[300px] z-50 pointer-events-none" style={{ backgroundRepeat: 'no-repeat' }}></div>
    </>
  );
}
