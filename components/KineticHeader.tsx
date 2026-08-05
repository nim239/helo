"use client";

import { useRef, useEffect } from 'react';
import { useScrollStore } from '../lib/store/useScrollStore';

// Math lerp function
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

interface KineticHeaderProps {
  text1: string;
  text2: string;
}

export function KineticHeader({ text1 = "CGI", text2 = "SHOWCASE" }: KineticHeaderProps) {
  const word1Ref = useRef<HTMLHeadingElement>(null);
  const word2Ref = useRef<HTMLHeadingElement>(null);

  // SMOOTH VELOCITY STORAGE (Damping physics)
  const smoothV = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateLoop = () => {
      if (!word1Ref.current || !word2Ref.current) return;

      const state = useScrollStore.getState();
      
      // Raw velocity (noisy, jumpy)
      const rawV = Math.min(Math.abs(state.velocity) * 0.15, 1.0); 

      // DAMPING MAGIC
      // smoothV chases rawV by 10% each frame (0.1)
      smoothV.current = lerp(smoothV.current, rawV, 0.1); 

      const vNorm = smoothV.current;

      // Interpolation for Word 1 (Expands)
      const w1Weight = lerp(400, 900, vNorm);
      const w1Stretch = lerp(100, 150, vNorm);

      // Interpolation for Word 2 (Contracts inversely)
      const w2Weight = lerp(400, 100, vNorm);
      const w2Stretch = lerp(100, 50, vNorm);

      // Inject directly into DOM bypassing React render overhead
      word1Ref.current.style.fontVariationSettings = `"wght" ${w1Weight}, "wdth" ${w1Stretch}`;
      word2Ref.current.style.fontVariationSettings = `"wght" ${w2Weight}, "wdth" ${w2Stretch}`;

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    // BÍ KÍP 3: THÊM CSS CHỐNG GIẬT LAYOUT
    // - whitespace-nowrap: prevents wrapping when expanding
    // - backface-hidden & transform-gpu: forces hardware acceleration layer
    <div className="flex w-full justify-between items-center overflow-hidden">
      <h2 
        ref={word1Ref} 
        className="text-[12vw] leading-none uppercase font-black tracking-tighter whitespace-nowrap backface-hidden transform-gpu origin-left"
        style={{ fontVariationSettings: '"wght" 400, "wdth" 100' }}
      >
        <span className="bg-gradient-to-r from-[#00F2FF] via-[#FF007F] to-[#0066FF] bg-clip-text text-transparent">
          {text1}
        </span>
      </h2>
      <h2 
        ref={word2Ref} 
        className="text-[12vw] leading-none uppercase font-black tracking-tighter whitespace-nowrap backface-hidden transform-gpu origin-right text-right text-white"
        style={{ fontVariationSettings: '"wght" 400, "wdth" 100' }}
      >
        {text2}
      </h2>
    </div>
  );
}
