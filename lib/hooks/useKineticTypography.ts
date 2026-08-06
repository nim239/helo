"use client";

import { useScrollStore } from '../store/useScrollStore';
import { useRef, useEffect } from 'react';

export function useKineticTypography() {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    // Physics state
    let currentScale = 1;
    let currentStroke = 0;
    
    // Smooth lerp function (like side art particles)
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateLoop = () => {
      const state = useScrollStore.getState();
      const absVel = Math.abs(state.velocity);
      
      // Target values based on velocity
      const targetScaleX = 1 + Math.min(absVel * 0.015, 0.2);
      // We use text-stroke to thicken the text without causing layout reflow/width shifts
      const targetStroke = Math.min(absVel * 0.04, 1.5); // max 1.5px stroke
      
      // Different lerp speeds for thickening (fast) vs relaxing (slow)
      const factor = targetScaleX > currentScale ? 0.15 : 0.05;
      
      currentScale = lerp(currentScale, targetScaleX, factor);
      currentStroke = lerp(currentStroke, targetStroke, factor);

      if (elementRef.current) {
        // Apply GPU accelerated transform and non-layout-shifting stroke
        elementRef.current.style.transform = `scaleX(${currentScale})`;
        
        // For elements that might have gradient text, stroke color can be inherited or explicit
        // Using "currentcolor" allows it to blend with gradients/white text natively
        elementRef.current.style.webkitTextStroke = `${currentStroke}px currentcolor`;
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return {
    ref: elementRef as React.RefObject<unknown>,
    style: {
      transformOrigin: 'center center',
      display: 'inline-block',
      willChange: 'transform, -webkit-text-stroke',
      // Base stroke to allow smooth transition
      WebkitTextStroke: '0px currentcolor',
    } as React.CSSProperties,
  };
}
