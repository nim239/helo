"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useMarqueeStore } from '../lib/store/useMarqueeStore';
import { MediaVideo } from './MediaVideo';
import { useScrollStore } from '../lib/store/useScrollStore';

interface MarqueeItem {
  id: string;
  mediaType: string;
  src: string;
  poster: string;
}

interface HorizontalMarqueeProps {
  items: MarqueeItem[];
  direction?: 'left' | 'right';
  speed?: number; // pixels per ms
}

export function HorizontalMarquee({ items, direction = 'left', speed = 0.1 }: HorizontalMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Clone items to ensure we fill the screen (minimum 3 copies of the array)
  // In a real app, calculate based on item width and screen width, here we brute force 3 loops
  const repeatedItems = [...items, ...items, ...items];

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let trackWidth = 0;
    
    // Resize Observer to keep Modulo Math accurate
    const observer = new ResizeObserver(() => {
      // We calculate the width of ONE set of items. 
      // Assuming all items have equal width, trackWidth = (total width) / 3
      trackWidth = track.scrollWidth / 3;
    });
    observer.observe(track);

    const dirMultiplier = direction === 'left' ? -1 : 1;

    // RAF Loop
    const ticker = (time: number, deltaTime: number, frame: number) => {
      const globalState = useMarqueeStore.getState();
      const now = performance.now();

      if (trackWidth <= 0) return;

      const baseTimestamp = globalState.baseTimestamp;
      
      const rawDistance = (now - baseTimestamp) * speed;
      const safeDistance = rawDistance % trackWidth;
      
      let xOffset = 0;
      if (direction === 'left') {
        xOffset = -safeDistance; // 0 to -trackWidth
      } else {
        xOffset = -trackWidth + safeDistance; // -trackWidth to 0
      }
      
      // Direct DOM mutation for max FPS, bypassing React
      track.style.transform = `translate3d(${xOffset}px, 0, 0)`;
    };

    gsap.ticker.add(ticker);

    return () => {
      observer.disconnect();
      gsap.ticker.remove(ticker);
    };
  }, [direction, speed]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden flex items-center pointer-events-none">
      <div 
        ref={trackRef} 
        className="flex flex-row flex-nowrap items-center h-[50vh] gap-8 px-4"
        style={{ width: 'max-content' }}
      >
        {repeatedItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            className="w-[60vw] md:w-[40vw] h-full shrink-0 bg-white/5 flex items-center justify-center relative overflow-hidden"
          >
            {item.mediaType === 'video' ? (
              <MediaVideo id={item.id} src={item.src} poster={item.poster} />
            ) : (
              <span className="text-white/20 text-xs text-center px-4">Unsupported Media</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
