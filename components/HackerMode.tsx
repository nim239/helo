"use client";

import { useEffect, useState } from 'react';
import { useScrollStore } from '../lib/store/useScrollStore';

const asciiArt = `
    __  __________    ____ 
   / / / / ____/ /   / __ \\
  / /_/ / __/ / /   / / / /
 / __  / /___/ /___/ /_/ / 
/_/ /_/_____/_____/\\____/  
`;

export function HackerMode() {
  const [active, setActive] = useState(false);
  const scrollProgress = useScrollStore(state => state.scrollProgress);
  const currentPhase = useScrollStore(state => state.currentPhase);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Shift + H
      if (e.shiftKey && e.key.toLowerCase() === 'h') {
        setActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 text-green-500 font-mono p-8 pointer-events-none flex flex-col justify-end">
      <pre className="text-xs md:text-sm mb-8 animate-pulse text-green-400">
        {asciiArt}
      </pre>
      <div className="space-y-2 text-sm uppercase tracking-widest border-t border-green-500/30 pt-4">
        <div><span className="opacity-50">SYSTEM:</span> ONLINE</div>
        <div><span className="opacity-50">SCROLL ENGINE:</span> {currentPhase}</div>
        <div><span className="opacity-50">VIRTUAL PROGRESS:</span> {(scrollProgress * 100).toFixed(2)}%</div>
        <div><span className="opacity-50">RAF FPS:</span> ~60 (LOCKED)</div>
      </div>
    </div>
  );
}
