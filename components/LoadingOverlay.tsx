"use client";

import { useEffect, useState } from 'react';
import gsap from 'gsap';

export function LoadingOverlay({ onLoaded }: { onLoaded: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Preload the spritesheet
    const img = new Image();
    img.src = '/png/spritesheet.png';
    
    const handleLoadComplete = () => {
      // Small delay just to ensure smooth transition and give React time to paint
      setTimeout(() => {
        gsap.to('.loading-overlay', {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            setLoading(false);
            onLoaded();
          }
        });
      }, 500);
    };

    img.onload = handleLoadComplete;
    
    // Fallback if image fails or takes too long (timeout after 5 seconds just in case)
    img.onerror = handleLoadComplete;
    const fallbackTimeout = setTimeout(handleLoadComplete, 5000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [onLoaded]);

  if (!loading) return null;

  return (
    <div className="loading-overlay fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="text-white/50 tracking-widest text-sm uppercase animate-pulse mb-4">
        Loading Exhibition
      </div>
      <div className="w-48 h-px bg-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/50 w-full animate-[shimmer_1.5s_infinite] -translate-x-full" 
             style={{ animationName: 'shimmer' }} />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
