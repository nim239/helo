'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../lib/store/useAppStore';
import { useScrollStore } from '../lib/store/useScrollStore';

export const CurtainsTransition = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const deepLinkTarget = useAppStore(state => state.deepLinkTarget);
  const hasEntered = useAppStore(state => state.hasEntered);
  const isIntroComplete = useScrollStore(state => state.isIntroComplete);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Only trigger if we have a deep link, we have entered, and the 120-frame intro animation is fully complete
    if (!deepLinkTarget || !hasEntered || !isIntroComplete || isRevealed) return;
    if (!leftCurtainRef.current || !rightCurtainRef.current || !containerRef.current) return;

    // Split the curtains over 5.0 seconds
    const tl = gsap.timeline({
      onComplete: () => {
        setIsRevealed(true);
      }
    });

    tl.to(leftCurtainRef.current, {
      xPercent: -100,
      duration: 5.0,
      ease: 'power4.inOut'
    }, 0)
    .to(rightCurtainRef.current, {
      xPercent: 100,
      duration: 5.0,
      ease: 'power4.inOut'
    }, 0);

  }, [deepLinkTarget, hasEntered, isIntroComplete, isRevealed]);

  // If there's no deep link, we don't render curtains at all
  if (!deepLinkTarget) return null;
  
  // Once revealed, we don't need to block pointer events or render heavy black divs anymore
  if (isRevealed) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-40 pointer-events-none flex"
    >
      <div 
        ref={leftCurtainRef} 
        className="h-full w-1/2 bg-black origin-left"
      />
      <div 
        ref={rightCurtainRef} 
        className="h-full w-1/2 bg-black origin-right"
      />
    </div>
  );
};
