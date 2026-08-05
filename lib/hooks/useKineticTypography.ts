"use client";

import { useScrollStore } from '../store/useScrollStore';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function useKineticTypography() {
  const velocity = useScrollStore((state) => state.velocity);
  
  // Use a ref to hold the smoothed values
  const smoothedRef = useRef({ scaleX: 1, fontWeight: 700 });
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const absVel = Math.abs(velocity);
    
    // Calculate target values similarly to particle speed logic
    // Smooth, gentle curve instead of linear jumping
    const targetScaleX = 1 + Math.min(absVel * 0.015, 0.2);
    const targetWeight = Math.min(900, Math.round(700 + Math.min(absVel * 80, 200)));

    if (elementRef.current) {
      // Use GSAP for buttery smooth interpolation, mimicking the canvas particles
      gsap.to(smoothedRef.current, {
        scaleX: targetScaleX,
        fontWeight: targetWeight,
        duration: 0.8, // Slow, syrupy ease
        ease: "power2.out",
        onUpdate: () => {
          if (elementRef.current) {
            elementRef.current.style.transform = `scaleX(${smoothedRef.current.scaleX})`;
            elementRef.current.style.fontWeight = `${Math.round(smoothedRef.current.fontWeight)}`;
          }
        }
      });
    }
  }, [velocity]);

  return {
    ref: elementRef as React.RefObject<any>,
    style: {
      transformOrigin: 'center center', // Changed to center
      display: 'inline-block', // Ensure transform applies correctly
      willChange: 'transform, font-weight'
    } as React.CSSProperties,
  };
}
