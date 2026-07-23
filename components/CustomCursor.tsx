"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  
  const [isFinePointer, setIsFinePointer] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 }); // Inertia position

  useEffect(() => {
    // -------------------------------------------------------------
    // 1. MOBILE EXTERMINATION (Pointer Fine Check)
    // -------------------------------------------------------------
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    if (!finePointerQuery.matches) {
      setIsFinePointer(false);
      return; // Tiêu diệt toàn bộ event listener & RAF loop trên thiết bị cảm ứng
    }

    setIsFinePointer(true);
    document.body.style.cursor = 'none';

    // GSAP quickSetters để update DOM trực tiếp (Bypass React Re-render)
    const xSet = gsap.quickSetter(cursorRef.current, 'x', 'px');
    const ySet = gsap.quickSetter(cursorRef.current, 'y', 'px');
    const xDotSet = gsap.quickSetter(dotRef.current, 'x', 'px');
    const yDotSet = gsap.quickSetter(dotRef.current, 'y', 'px');

    let magnetPos: { x: number; y: number } | null = null;
    let magnetTarget: HTMLElement | null = null;

    // -------------------------------------------------------------
    // 2. IDLE MAGNET SYSTEM (Idle/Provocation Timer)
    // -------------------------------------------------------------
    let idleTimeout: NodeJS.Timeout;
    const IDLE_DELAY_MS = 2500; // 2.5s không di chuột sẽ rơi vào chế độ lơ lửng khiêu khích

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      setIsIdle(false);
      idleTimeout = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_DELAY_MS);
    };

    // Khởi tạo timer ban đầu
    resetIdleTimer();

    // -------------------------------------------------------------
    // 3. EVENT LISTENERS (Mouse Movements & Magnet Detection)
    // -------------------------------------------------------------
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      xDotSet(e.clientX);
      yDotSet(e.clientY);

      resetIdleTimer();
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    // -------------------------------------------------------------
    // 4. INERTIA & OPTICAL RENDER LOOP (144Hz Smoothness)
    // -------------------------------------------------------------
    let raf: number;
    let idleAngle = 0;

    const renderLoop = (time: number) => {
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      // Magnet Active Mode
      if (magnetTarget && isHovering) {
        const rect = magnetTarget.getBoundingClientRect();
        magnetPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        targetX = magnetPos.x;
        targetY = magnetPos.y;
      } 
      // Idle / Provocation Mode: Tự động lơ lửng & trôi về tâm màn hình (khối 3D Cubi)
      else if (isIdle) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        idleAngle += 0.02;
        const breatheX = Math.cos(idleAngle) * 20;
        const breatheY = Math.sin(idleAngle * 1.5) * 15;

        // Trôi dạt 70% về tâm màn hình + dao động nhịp thở
        targetX = pos.current.x + (centerX - pos.current.x) * 0.03 + breatheX * 0.1;
        targetY = pos.current.y + (centerY - pos.current.y) * 0.03 + breatheY * 0.1;
      }

      // Physics Lerp (Inertia)
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      pos.current.x += (targetX - pos.current.x) * dt;
      pos.current.y += (targetY - pos.current.y) * dt;
      
      xSet(pos.current.x);
      ySet(pos.current.y);

      // Nếu đang Idle và ở tâm, Dot cũng trôi nhịp nhàng
      if (isIdle) {
        xDotSet(pos.current.x);
        yDotSet(pos.current.y);
      }
      
      raf = requestAnimationFrame(renderLoop);
    };

    raf = requestAnimationFrame(renderLoop);

    // Cleanup
    return () => {
      document.body.style.cursor = '';
      clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(raf);
    };
  }, [isIdle, isHovering]);

  if (!isFinePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference hidden md:block">
      {/* Outer Circle (Inertia, Magnet & Idle Breathe) */}
      <div 
        ref={cursorRef} 
        className={`absolute top-0 left-0 -ml-6 -mt-6 rounded-full border border-white transition-all duration-500 ease-out flex items-center justify-center
          ${isHovering ? 'w-16 h-16 bg-white/20 scale-150 border-white/80' : 'w-12 h-12'}
          ${isClicking ? 'scale-90 bg-white/40' : ''}
          ${isIdle ? 'w-16 h-16 bg-white/10 animate-pulse scale-125 border-dashed border-white/60' : ''}
        `}
      />
      
      {/* Inner Dot (Instant / Idle Drift) */}
      <div 
        ref={dotRef} 
        className={`absolute top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full transition-transform duration-200
          ${isHovering ? 'scale-[0.5]' : 'scale-100'}
          ${isIdle ? 'scale-150 bg-cyan-300 shadow-[0_0_8px_#06b6d4]' : ''}
        `}
      />
    </div>
  );
}
