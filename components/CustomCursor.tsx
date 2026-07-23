"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 }); // inertia position

  useEffect(() => {
    // Hide native cursor for devices with mouse
    document.body.style.cursor = 'none';
    
    // Quick setter for performance
    const xSet = gsap.quickSetter(cursorRef.current, 'x', 'px');
    const ySet = gsap.quickSetter(cursorRef.current, 'y', 'px');
    const xDotSet = gsap.quickSetter(dotRef.current, 'x', 'px');
    const yDotSet = gsap.quickSetter(dotRef.current, 'y', 'px');

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // Dot follows instantly
      xDotSet(e.clientX);
      yDotSet(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Hover detection (Magnet effect perfectly centered)
    let magnetPos: { x: number, y: number } | null = null;
    let magnetTarget: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magnetEl = target.closest('[data-magnet="true"]') as HTMLElement;
      if (magnetEl) {
        setIsHovering(true);
        magnetTarget = magnetEl;
      }
    };
    
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-magnet="true"]')) {
        setIsHovering(false);
        magnetTarget = null;
        magnetPos = null;
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    // Inertia loop
    let raf: number;
    const renderLoop = () => {
      if (magnetTarget && isHovering) {
        const rect = magnetTarget.getBoundingClientRect();
        magnetPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      } else {
        magnetPos = null;
      }

      const targetX = magnetPos ? magnetPos.x : mouse.current.x;
      const targetY = magnetPos ? magnetPos.y : mouse.current.y;

      // Lerp cursor position
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      pos.current.x += (targetX - pos.current.x) * dt;
      pos.current.y += (targetY - pos.current.y) * dt;
      
      xSet(pos.current.x);
      ySet(pos.current.y);
      
      raf = requestAnimationFrame(renderLoop);
    };
    raf = requestAnimationFrame(renderLoop);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference hidden md:block">
      {/* Outer Circle (Inertia) */}
      <div 
        ref={cursorRef} 
        className={`absolute top-0 left-0 -ml-6 -mt-6 rounded-full border border-white transition-all duration-300 ease-out flex items-center justify-center
          ${isHovering ? 'w-16 h-16 bg-white/20 scale-150' : 'w-12 h-12'}
          ${isClicking ? 'scale-90 bg-white/40' : ''}
        `}
      >
        {/* CD Countdown Arc could go here via SVG stroke-dasharray if needed */}
      </div>
      
      {/* Inner Dot (Instant) */}
      <div 
        ref={dotRef} 
        className="absolute top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full transition-transform duration-100"
        style={{ transform: isHovering ? 'scale(0.5)' : 'scale(1)' }}
      />
    </div>
  );
}
