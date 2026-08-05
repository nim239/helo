"use client";

import React, { useState, useEffect, useRef } from "react";

interface VideoBackgroundProps {
  youtubeId: string;
  overlayOpacity?: string;
  className?: string;
  disabled?: boolean;
}

export function VideoBackground({
  youtubeId,
  overlayOpacity = "bg-black/60",
  className = "",
  disabled = false,
}: VideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    // Aggressive performance fallback for Mobile & Weak PCs
    const isMobile = window.matchMedia("(any-pointer: coarse)").matches;
    const isWeakPC = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    
    if (isMobile || isWeakPC) {
      setIsLiteMode(true);
      // If lite mode is enabled, we don't need to mount the IntersectionObserver for the iframe
      // We just show the high-res thumbnail statically.
      return;
    }

    // Viewport Intersection Observer: Only load iframe when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [disabled]);

  if (!youtubeId) return null;

  // Embed query params to neutralize YouTube UI
  const embedParams = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: youtubeId,
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
    iv_load_policy: "3",
    disablekb: "1",
    modestbranding: "1",
  }).toString();

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?${embedParams}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* High-res Thumbnail Fallback (Lightweight GPU cost) */}
      <img
        src={thumbnailUrl}
        alt="Video Stream Thumbnail"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isVisible && !disabled ? "opacity-30" : "opacity-80"
        }`}
      />

      {/* Scaled iFrame Container — ONLY mounted when in viewport AND device is powerful enough */}
      {isVisible && !disabled && !isLiteMode && (
        <div className="absolute -top-[12.5%] -left-[12.5%] w-[125%] h-[125%] pointer-events-none">
          <iframe
            src={embedUrl}
            title="Exhibition Video Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0 pointer-events-none scale-125 object-cover opacity-90 transition-opacity duration-500"
          />
        </div>
      )}

      {/* Dark Overlay with Multiply Blend Mode to hide compression artifacts */}
      <div
        className={`absolute inset-0 ${overlayOpacity} mix-blend-multiply pointer-events-none z-10`}
      />

      {/* Subtle Noise Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none z-10 opacity-70" />
    </div>
  );
}
