"use client";

import React, { useRef, useEffect, useState } from 'react';

interface MediaVideoProps {
  id: string;
  src: string;
  poster?: string;
  className?: string;
}

export function MediaVideo({ id, src, poster, className = "" }: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // We use Intersection Observer to detect when the video container enters/leaves the viewport
    // This is crucial for our Rule of 3 VRAM flush strategy.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        root: null, // viewport
        rootMargin: '100px 100px', // Pre-load slightly before entering viewport
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      // Re-attach src if it was stripped
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented, or video is still loading
          console.warn(`[${id}] Autoplay prevented:`, error);
        });
      }
    } else {
      // Deep VRAM Flush logic (Rule of 3)
      // When the video leaves the viewport, we pause it, remove the source, and call .load()
      // This forces the browser to discard the decoded frame buffer from VRAM.
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }, [isVisible, src, id]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 
        The poster image acts as a visual placeholder during the 1-2 frames 
        it takes for the video to re-attach its src and play when entering viewport.
      */}
      {poster && (
        <img 
          src={poster} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}
      
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        // We explicitly do NOT autoPlay here because we control it via JS logic
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Text overlay for demonstration purposes */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none mix-blend-difference">
        <span className="text-white/30 text-xs font-mono uppercase tracking-widest">{id}</span>
      </div>
    </div>
  );
}
