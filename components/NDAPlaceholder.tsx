"use client";

import React, { useEffect, useRef } from "react";

interface NDAPlaceholderProps {
  id?: number;
  title?: string;
  artist?: string;
  techTag?: string;
  className?: string;
}

export function NDAPlaceholder({
  id = 0,
  title = "Protected Project",
  artist = "NDA Confidential",
  techTag = "🔒 Real-Time Notch FX Engine",
  className = "",
}: NDAPlaceholderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render ambient procedural noise background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    let animId: number;

    const renderNoise = () => {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 25;
        data[i] = noise * 0.2;     // R
        data[i + 1] = noise * 0.8; // G (Cyan accent)
        data[i + 2] = noise * 1.0; // B
        data[i + 3] = 40;          // Alpha
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    };

    renderNoise();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[260px] flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-md p-6 select-none ${className}`}
    >
      {/* Background procedural noise canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      />

      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Red/Cyan Security Border Glow */}
      <div className="absolute inset-0 rounded-xl border border-[#FF007F]/30 shadow-[inset_0_0_30px_rgba(255,0,127,0.1)] pointer-events-none" />

      {/* Center Glassmorphism Badge */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6 py-4 rounded-lg border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#FF007F] animate-ping" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF007F] uppercase font-bold">
            RESTRICTED ACCESS
          </span>
        </div>

        {/* Main Tag */}
        <h3 className="font-mono text-sm md:text-base font-black tracking-[0.2em] text-white uppercase mb-2 bg-black/50 px-4 py-1.5 rounded border border-[#00F2FF]/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
          [ CLASSIFIED CONTENT ]
        </h3>

        {/* Frame Title & Artist */}
        <div className="font-sans font-bold text-xs text-white/80 mt-1">
          {title}
        </div>
        <div className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
          {artist}
        </div>

        {/* Tech Tag */}
        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#00F2FF] bg-[#00F2FF]/10 px-3 py-1 rounded-full border border-[#00F2FF]/30">
          <span>⚡</span>
          <span>{techTag}</span>
        </div>
      </div>

      {/* Frame Identifier */}
      {id > 0 && (
        <div className="absolute top-3 left-4 font-mono text-[10px] tracking-widest text-white/30 uppercase">
          FRAME {id < 10 ? `0${id}` : id} / 24 — NDA
        </div>
      )}

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00F2FF]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00F2FF]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#00F2FF]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00F2FF]/60 pointer-events-none" />
    </div>
  );
}
