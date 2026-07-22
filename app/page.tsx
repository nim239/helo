"use client";

import { useEffect, useState } from 'react';
import sectionsData from '../data/sections.json';
import { Section } from '../components/Section';
import { SpriteAnimation } from '../components/SpriteAnimation';
import { HorizontalMarquee } from '../components/HorizontalMarquee';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ParallaxSides } from '../components/ParallaxSides';
import { useExhibitionScroll } from '../lib/hooks/useExhibitionScroll';
import { useViewportSync } from '../lib/hooks/useViewportSync';

export default function Exhibition() {
  const [mounted, setMounted] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  // Apply our custom hooks
  useViewportSync();
  useExhibitionScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a black screen until client-side layout is ready
    return <main className="bg-black min-h-screen w-full"></main>;
  }

  // The 6 Real Sections
  const realSections = sectionsData;
  
  // Clone 3 from the end to put at the top (Index 0, 1, 2)
  const topClones = realSections.slice(-3).map(s => ({ ...s, isClone: true, key: `clone-top-${s.id}` }));
  
  // Clone 3 from the start to put at the bottom (Index 9, 10, 11)
  const bottomClones = realSections.slice(0, 3).map(s => ({ ...s, isClone: true, key: `clone-bot-${s.id}` }));

  // Combined array: 12 sections total
  const exhibitionBuffer = [
    ...topClones, 
    ...realSections.map(s => ({ ...s, isClone: false, key: `real-${s.id}` })), 
    ...bottomClones
  ];

  return (
    <main className="relative w-full bg-black text-white selection:bg-white/20">
      {!assetsLoaded && <LoadingOverlay onLoaded={() => setAssetsLoaded(true)} />}
      <ParallaxSides />
      <SpriteAnimation startIntro={assetsLoaded} />
      
      {exhibitionBuffer.map((section) => (
        <Section key={section.key} id={section.key} isClone={section.isClone}>
          {section.layout === 'horizontal-marquee' ? (
            <div className="w-full h-full flex flex-col justify-center relative">
              <h2 className="text-2xl md:text-5xl font-bold tracking-tighter absolute top-12 md:top-24 left-12 md:left-24 z-10 pointer-events-none mix-blend-difference">{section.title}</h2>
              <HorizontalMarquee 
                items={section.items || []} 
                direction={(section.marquee?.direction as 'left' | 'right') || 'left'} 
                speed={(section.marquee?.speed || 1.0) * 0.05} // Scale JSON speed to reasonable pixel/ms value
              />
              {section.isClone && (
                <span className="absolute bottom-12 right-12 z-10 text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-widest pointer-events-none">Buffer Clone</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-4">{section.title}</h2>
              <p className="text-white/50 text-sm tracking-widest uppercase mb-8">Layout: {section.layout}</p>
              {section.isClone ? (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-widest">Buffer Clone</span>
              ) : (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full uppercase tracking-widest">Real Node</span>
              )}
            </div>
          )}
        </Section>
      ))}
    </main>
  );
}
