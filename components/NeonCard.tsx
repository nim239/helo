"use client";

import { VideoBackground } from "./VideoBackground";
import { NDAPlaceholder } from "./NDAPlaceholder";

export interface NeonCardProps {
  label?: string;
  accent?: string;
  index?: number;
  width?: string | number;
  height?: string | number;
  rotation?: number;
  src?: string;
  poster?: string;
  youtubeId?: string;
  isNDA?: boolean;
  frameId?: number;
  artist?: string;
  techTag?: string;
}

export function NeonCard({
  label,
  accent = "#00F2FF",
  index = 0,
  width = "100%",
  height = "100%",
  rotation = 0,
  src,
  poster,
  youtubeId,
  isNDA = false,
  frameId,
  artist,
  techTag,
}: NeonCardProps) {
  // If frame is NDA Protected, render Cyberpunk NDAPlaceholder
  if (isNDA) {
    return (
      <div style={{ width, height, transform: rotation ? `rotate(${rotation}deg)` : undefined }}>
        <NDAPlaceholder
          id={frameId}
          title={label}
          artist={artist}
          techTag={techTag || label}
        />
      </div>
    );
  }

  const gradients = [
    `radial-gradient(ellipse at 30% 40%, ${accent}22 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, #FF007F18 0%, transparent 60%)`,
    `radial-gradient(ellipse at 60% 30%, #FF007F22 0%, transparent 60%), radial-gradient(ellipse at 40% 70%, #00FF8818 0%, transparent 60%)`,
    `radial-gradient(ellipse at 50% 50%, #0066FF22 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, ${accent}18 0%, transparent 50%)`,
  ];

  return (
    <div
      className="relative rounded-lg border border-white/10 overflow-hidden group transition-transform duration-300 hover:scale-[1.02]"
      style={{
        width,
        height,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        background: gradients[index % 3],
        boxShadow: `0 0 20px ${accent}15`,
      }}
    >
      {/* YouTube Background Stream */}
      {youtubeId ? (
        <VideoBackground youtubeId={youtubeId} />
      ) : src ? (
        <video
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
      ) : null}

      {/* SVG Noise Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <filter id={`noise-${index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise-${index})`} />
      </svg>

      {/* Chromatic Aberration Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-[#00F2FF] blur-[1px] translate-x-[2px]" />
        <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-[#FF007F] blur-[1px] -translate-x-[2px]" />
        <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-[#00F2FF] blur-[1px] translate-x-[1px]" />
      </div>

      {/* Glow Center Orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-[14px] animate-pulse pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
        }}
      />

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: accent, opacity: 0.6 }} />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: accent, opacity: 0.6 }} />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: accent, opacity: 0.6 }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: accent, opacity: 0.6 }} />

      {/* Label Tag */}
      {label && (
        <div
          className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.2em] uppercase z-10"
          style={{ color: accent, textShadow: `0 0 8px ${accent}80` }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
