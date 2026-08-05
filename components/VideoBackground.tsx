"use client";

import React from "react";

interface VideoBackgroundProps {
  youtubeId: string;
  overlayOpacity?: string;
  className?: string;
}

export function VideoBackground({
  youtubeId,
  overlayOpacity = "bg-black/60",
  className = "",
}: VideoBackgroundProps) {
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

  return (
    <div
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* Scaled iFrame Container (125% scale to crop YouTube watermark & controls) */}
      <div className="absolute -top-[12.5%] -left-[12.5%] w-[125%] h-[125%] pointer-events-none">
        <iframe
          src={embedUrl}
          title="Exhibition Video Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full h-full border-0 pointer-events-none scale-125 object-cover"
        />
      </div>

      {/* Dark Overlay with Multiply Blend Mode to hide compression artifacts */}
      <div
        className={`absolute inset-0 ${overlayOpacity} mix-blend-multiply pointer-events-none z-10`}
      />

      {/* Subtle Noise Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none z-10 opacity-70" />
    </div>
  );
}
