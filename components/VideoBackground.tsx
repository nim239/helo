"use client";

import React from "react";

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
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  if (!youtubeId) return null;
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&vq=hd1080`;

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Force YouTube Player API to switch to HD 1080p / Highest Quality
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "setPlaybackQuality", args: ["hd1080"] }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "setPlaybackQuality", args: ["highres"] }),
          "*"
        );
      } catch (e) {
        // Silently catch postMessage restriction if any
      }
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      {!disabled ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="Background Video"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350vh] min-w-[177.78vh] aspect-video max-w-none pointer-events-none border-0"
          allow="autoplay; encrypted-media"
          onLoad={handleIframeLoad}
        />
      ) : (
        <img
          src={thumbnailUrl}
          alt="Video Stream Placeholder"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          loading="lazy"
        />
      )}

      {/* Dark Overlay */}
      <div
        className={`absolute inset-0 ${overlayOpacity} pointer-events-none z-10`}
      />

      {/* Subtle Noise Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none z-10 opacity-70" />
    </div>
  );
}
