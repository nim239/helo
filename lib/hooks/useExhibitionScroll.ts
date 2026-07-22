"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';

export function useExhibitionScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const setPhase = useScrollStore((state) => state.setPhase);
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const triggerTeleport = useScrollStore((state) => state.triggerTeleport);
  
  useEffect(() => {
    // Determine section height dynamically
    const sectionHeight = window.innerHeight;
    
    // Initial start at Section 1 (Index 3, bypassing the 3 clones at the top)
    const initialOffset = sectionHeight * 3;
    
    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    
    lenisRef.current = lenis;
    lenis.scrollTo(initialOffset, { immediate: true });
    
    // GSAP Ticker Sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    
    // Teleport and State Logic
    lenis.on('scroll', ({ scroll, velocity }: { scroll: number, velocity: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;
      
      // Update normalized progress
      const maxScroll = currentH * 11; // 12 sections total
      setScrollProgress(scroll / maxScroll);
      
      // Handle Phase transitions based on velocity
      if (Math.abs(velocity) > 0.1) {
        if (state.currentPhase !== 'SCROLLING' && state.currentPhase !== 'TELEPORTING') {
          setPhase('SCROLLING');
        }
      } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
        setPhase('IDLE');
      }

      // Teleport boundaries based on Spec
      // Down: When crossing into Clone 1' (index 9 -> scrollY >= sectionHeight * 9)
      if (scroll >= currentH * 9) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          const target = scroll - (currentH * 6);
          lenis.scrollTo(target, { immediate: true });
        }
      }
      
      // Up: When crossing up into Clone 6' (index 2 -> scrollY <= sectionHeight * 2)
      if (scroll <= currentH * 2) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          const target = scroll + (currentH * 6);
          lenis.scrollTo(target, { immediate: true });
        }
      }
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, [setPhase, setScrollProgress, triggerTeleport]);

  return lenisRef;
}
