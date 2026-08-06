"use client";

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useMarqueeStore } from '../lib/store/useMarqueeStore';
import { NeonCard } from './NeonCard';

interface MarqueeItem {
  id: string;
  label?: string;
  accent?: string;
  mediaType?: string;
  src?: string;
  imageSrc?: string;
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
    const container = containerRef.current;
    if (!track || !container) return;

    let trackWidth = 0;
    let isVisible = false;
    let tickerActive = false;

    // Resize Observer to keep Modulo Math accurate
    const observer = new ResizeObserver(() => {
      trackWidth = track.scrollWidth / 3;
    });
    observer.observe(track);

    // RAF Loop
    const ticker = () => {
      if (!isVisible || trackWidth <= 0) return;

      const globalState = useMarqueeStore.getState();
      const now = performance.now();
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

    // IntersectionObserver to pause GSAP ticker when Marquee is offscreen
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;

      if (isVisible && !tickerActive) {
        gsap.ticker.add(ticker);
        tickerActive = true;
      } else if (!isVisible && tickerActive) {
        gsap.ticker.remove(ticker);
        tickerActive = false;
      }
    }, { threshold: 0.01 });

    io.observe(container);

    return () => {
      observer.disconnect();
      io.disconnect();
      if (tickerActive) {
        gsap.ticker.remove(ticker);
      }
    };
  }, [direction, speed]);

  return (
    <div ref={containerRef} className="relative z-10 w-full h-full overflow-hidden flex items-center portrait:items-end portrait:pb-[10vh] pointer-events-none">
      <div 
        ref={trackRef} 
        className="flex flex-row flex-nowrap items-center h-[280px] portrait:h-[128vw] gap-4 md:gap-6 px-4"
        style={{ width: 'max-content', willChange: 'transform' }}
      >
        {repeatedItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            className="w-[420px] h-[280px] portrait:w-[72vw] portrait:h-[128vw] shrink-0 pointer-events-auto"
          >
            <NeonCard
              label={item.label || item.id}
              accent={item.accent || (direction === 'left' ? '#00F2FF' : '#FF007F')}
              index={idx}
              width="100%"
              height="100%"
              src={item.src}
              imageSrc={item.imageSrc}
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
