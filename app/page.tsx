 "use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContentBlock from '@/app/components/ContentBlock';

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

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
const FRAME_COUNT = 120; // Total number of frames
const COLS = 120; // Number of columns in the sprite sheet (horizontal)
const ROWS = 1; // Number of rows in the sprite sheet (horizontal)
const PADDING_SIZE = 0; // No padding around frames

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
  const [nextIndex, setNextIndex] = useState(initialLoadCount);
  const [isLoading, setIsLoading] = useState(false);

  const main = useRef(null);
  const virtualScroll = useRef(0);
  const totalRecycledHeight = useRef(0);
  const blockRefs = useRef<Array<HTMLElement | null>>([]);

  const loadMoreItems = useCallback(() => {
    setIsLoading(true);
    setDisplayedItems((prevItems) => {
      const newItems = [];
      for (let i = 0; i < batchSize; i++) {
        const newBlockIndex = nextIndex + i;
        newItems.push({ ...contentData[newBlockIndex % contentData.length], dataIndex: newBlockIndex });
      }
      setNextIndex((prevIndex) => prevIndex + batchSize);

      let updatedItems = [...prevItems, ...newItems];
      console.log('loadMoreItems: nextIndex before update', nextIndex, 'updatedItems.length before recycling', updatedItems.length);

      if (updatedItems.length > maxNodes) {
        const itemsToRemoveCount = updatedItems.length - maxNodes;
        const itemsToRemove = updatedItems.slice(0, itemsToRemoveCount);
        let removedItemsHeight = 0;

        itemsToRemove.forEach(item => {
          const ref = blockRefs.current[item.dataIndex];
          if (ref) {
            removedItemsHeight += ref.offsetHeight || 0;
            delete blockRefs.current[item.dataIndex];
          }
        });

        totalRecycledHeight.current += removedItemsHeight;
        const smoother = ScrollSmoother.get();
        if (smoother) {
          smoother.scrollTo(smoother.scrollTrigger.scroll() - removedItemsHeight, false);
        }

        updatedItems = updatedItems.slice(itemsToRemoveCount);
        console.log('loadMoreItems: updatedItems.length after recycling', updatedItems.length, 'removedItemsHeight', removedItemsHeight);
      }

      return updatedItems;
    });
  }, [nextIndex, batchSize, setIsLoading]);

  // Create stable refs for functions and state needed in the scroll handler
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const loadMoreItemsRef = useRef(loadMoreItems);
  loadMoreItemsRef.current = loadMoreItems;

  // Create a stable scroll handler that doesn't change on re-renders
  const handleScroll = useCallback(() => {
    if (isLoadingRef.current) return;
    
    const smoother = ScrollSmoother.get();
    if (smoother) {
      const currentScroll = smoother.scrollTrigger.scroll();
      const maxScroll = ScrollTrigger.maxScroll(smoother.wrapper());
      const preloadThreshold = 600;

      if (maxScroll - currentScroll < preloadThreshold) {
        loadMoreItemsRef.current();
      }
    }
  }, []); // Empty dependency array ensures this function is stable

  useEffect(() => {
    const spriteAnimationElement = document.querySelector('.sprite-animation') as HTMLElement;
    if (!spriteAnimationElement) return;

    let smoother: ScrollSmoother | null = null;
    let spriteScrollTrigger: ScrollTrigger | null = null;
    let introTl: gsap.core.Timeline | null = null;

    const setupAnimation = () => {
      const frameContentWidth = spriteAnimationElement.offsetWidth;
      const frameContentHeight = spriteAnimationElement.offsetHeight;
      const spriteWidthEffective = frameContentWidth + 2 * PADDING_SIZE;
      const spriteHeightEffective = frameContentHeight + 2 * PADDING_SIZE;

      spriteAnimationElement.style.backgroundImage = `url(${SPRITE_SHEET_PATH})`;
      spriteAnimationElement.style.backgroundSize = `${frameContentWidth * COLS}px ${frameContentHeight * ROWS}px`;

      const updateFrame = gsap.quickSetter(spriteAnimationElement, "backgroundPosition");
      const state = { frame: 0 };

      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        smoothTouch: true,
      });

      ScrollTrigger.addEventListener('scrollEnd', handleScroll);

      spriteScrollTrigger = ScrollTrigger.create({
        trigger: "#smooth-content",
        start: "top top",
        end: "max",
        scrub: true,
        scroller: smoother.wrapper(),
        onUpdate: (self) => {
          virtualScroll.current = self.scroll() + totalRecycledHeight.current;

          const loopDistance = window.innerHeight * 4;
          const progress = (virtualScroll.current % loopDistance) / loopDistance;
          const wrappedProgress = progress < 0 ? 1 + progress : progress;

          state.frame = Math.floor(wrappedProgress * (FRAME_COUNT - 1));
          const frameIndex = Math.floor(state.frame);
          const col = frameIndex % COLS;
          const row = Math.floor(frameIndex / COLS);
          const xPos = -col * spriteWidthEffective;
          const yPos = -row * spriteHeightEffective;
          updateFrame(`${xPos}px ${yPos}px`);
        },
      });
      if (spriteScrollTrigger) {
        spriteScrollTrigger.disable();
      }

      introTl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => {
          const frameIndex = Math.floor(state.frame);
          const col = frameIndex % COLS;
          const row = Math.floor(frameIndex / COLS);
          const xPos = -col * spriteWidthEffective;
          const yPos = -row * spriteHeightEffective;
          updateFrame(`${xPos}px ${yPos}px`);
        },
        onComplete: () => {
          console.log('introTl onComplete: enabling spriteScrollTrigger');
          spriteScrollTrigger?.enable();
        },
      });

      introTl.to(state, {
        frame: FRAME_COUNT - 1,
        duration: 4,
      });
    };

    const cleanup = () => {
      ScrollTrigger.removeEventListener('scrollEnd', handleScroll);
      smoother?.kill();
      spriteScrollTrigger?.kill();
      introTl?.kill();
      gsap.globalTimeline.clear();
    };

    const handleResize = () => {
      cleanup();
      setupAnimation();
    };

    const spriteImage = new Image();
    spriteImage.onload = () => {
      console.log('spriteImage.onload callback executed');
      setupAnimation();
      window.addEventListener('resize', handleResize);
    };
    spriteImage.onerror = () => {
      console.error('Failed to load sprite sheet:', SPRITE_SHEET_PATH);
    };
    spriteImage.src = SPRITE_SHEET_PATH;

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    setIsLoading(false);
  }, [displayedItems]);

  return (
    <>
      <div id="smooth-wrapper" style={{ overflow: 'hidden' }}>
        <div id="smooth-content">
          <main ref={main} className="min-h-screen">
            {displayedItems.map((block) => (
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
      <div className="sprite-animation top-0 left-0 w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] z-50 pointer-events-none" style={{ position: 'fixed', backgroundRepeat: 'no-repeat' }}></div>
    </>
  );
}
