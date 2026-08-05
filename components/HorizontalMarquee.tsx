"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useMarqueeStore } from '../lib/store/useMarqueeStore';
import { MediaVideo } from './MediaVideo';
import { useScrollStore } from '../lib/store/useScrollStore';

import { NeonCard } from './NeonCard';

interface MarqueeItem {
  id: string;
  label?: string;
  accent?: string;
  mediaType?: string;
  src?: string;
  poster?: string;
  youtubeId?: string;
  isNDA?: boolean;
  frameId?: number;
  artist?: string;
  techTag?: string;
}

interface HorizontalMarqueeProps {
  items: MarqueeItem[];
  direction?: 'left' | 'right';
  speed?: number; // pixels per ms
}

export function HorizontalMarquee({ items, direction = 'left', speed = 0.1 }: HorizontalMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Clone items to ensure we fill the screen
  const repeatedItems = [...items, ...items, ...items];

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let trackWidth = 0;
    
    // Resize Observer to keep Modulo Math accurate
    const observer = new ResizeObserver(() => {
      trackWidth = track.scrollWidth / 3;
    });
    observer.observe(track);

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
        xOffset = -safeDistance;
      } else {
        xOffset = -trackWidth + safeDistance;
      }
      
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
        className="flex flex-row flex-nowrap items-center h-[280px] gap-6 px-4"
        style={{ width: 'max-content' }}
      >
        {repeatedItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            className="w-[420px] h-[280px] shrink-0 pointer-events-auto"
          >
            <NeonCard
              label={item.label || item.id}
              accent={item.accent || (direction === 'left' ? '#00F2FF' : '#FF007F')}
              index={idx}
              width="100%"
              height="100%"
              src={item.src}
              poster={item.poster}
              youtubeId={item.youtubeId}
              disableYoutubeIframe={true}
              isNDA={item.isNDA}
              frameId={item.frameId}
              artist={item.artist}
              techTag={item.techTag}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
