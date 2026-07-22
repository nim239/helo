"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import sectionsData from '../data/sections.json';

gsap.registerPlugin(ScrollTrigger);

const exhibitionBuffer = [
  ...sectionsData.slice(3, 6).map((s) => ({ ...s, key: `clone-top-${s.id}` })),
  ...sectionsData.map((s) => ({ ...s, key: `real-${s.id}` })),
  ...sectionsData.slice(0, 3).map((s) => ({ ...s, key: `clone-bottom-${s.id}` })),
];

export function ParallaxSides() {
  const fgLeftRef = useRef<HTMLDivElement>(null);
  const fgRightRef = useRef<HTMLDivElement>(null);
  const bgLeftRef = useRef<HTMLDivElement>(null);
  const bgRightRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState(0);

  useEffect(() => {
    setSectionHeight(window.innerHeight);
    const updateSize = () => setSectionHeight(window.innerHeight);
    window.addEventListener('resize', updateSize);

    // Speed constants must be perfect fractions of 6 to guarantee seamless teleport!
    // 6 * speed MUST = Integer. 
    // Target 1.2 -> 7/6 (1.1666)
    // Target 0.8 -> 5/6 (0.8333)
    const fgSpeed = 7 / 6; 
    const bgSpeed = 5 / 6; 

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: 0,
      onUpdate: (self) => {
        const scrollY = self.scroll();
        // The exhibition loop starts at 3 * window.innerHeight. 
        // We must anchor the parallax zero-point to this baseline to ensure initial alignment.
        const baseline = window.innerHeight * 3;
        
        const fgY = -(scrollY - baseline) * fgSpeed - baseline;
        const bgY = -(scrollY - baseline) * bgSpeed - baseline;
        
        gsap.set(fgLeftRef.current, { y: fgY });
        gsap.set(fgRightRef.current, { y: fgY });
        
        gsap.set(bgLeftRef.current, { y: bgY });
        gsap.set(bgRightRef.current, { y: bgY });
      }
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      trigger.kill();
    };
  }, []);

  const renderLayers = (isForeground: boolean, align: 'left' | 'right') => {
    return exhibitionBuffer.map((section, idx) => {
      // Different visuals for foreground vs background
      const bgColor = isForeground ? 'bg-white/10' : 'bg-white/5';
      const border = align === 'left' ? 'border-r' : 'border-l';
      
      return (
        <div 
          key={section.key + idx} 
          className={`w-full flex items-center justify-center border-white/10 ${bgColor} ${border}`}
          style={{ height: sectionHeight ? `${sectionHeight}px` : '100vh' }}
        >
          <span className="text-white/20 text-xs font-mono rotate-90 whitespace-nowrap">
            {isForeground ? 'FG 1.2x' : 'BG 0.8x'} - {section.id}
          </span>
        </div>
      );
    });
  };

  return (
    <>
      {/* Background Layers (Z-index 0) */}
      <div className="fixed top-0 left-0 w-[15vw] h-[100vh] z-[0] pointer-events-none overflow-visible">
        <div ref={bgLeftRef} className="w-full will-change-transform">
          {renderLayers(false, 'left')}
        </div>
      </div>
      <div className="fixed top-0 right-0 w-[15vw] h-[100vh] z-[0] pointer-events-none overflow-visible">
        <div ref={bgRightRef} className="w-full will-change-transform">
          {renderLayers(false, 'right')}
        </div>
      </div>

      {/* Foreground Layers (Z-index 50, below Sprite which is 60) */}
      <div className="fixed top-0 left-0 w-[15vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen">
        <div ref={fgLeftRef} className="w-full will-change-transform">
          {renderLayers(true, 'left')}
        </div>
      </div>
      <div className="fixed top-0 right-0 w-[15vw] h-[100vh] z-[50] pointer-events-none overflow-visible mix-blend-screen">
        <div ref={fgRightRef} className="w-full will-change-transform">
          {renderLayers(true, 'right')}
        </div>
      </div>
    </>
  );
}
