"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../lib/store/useScrollStore';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [isFinePointer, setIsFinePointer] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);

  // Ref to bypass React closures inside requestAnimationFrame
  const stateRef = useRef({ isIdle: false, isHovering: false, isClicking: false });

  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 }); // Inertia position (outer)
  const vel = useRef({ x: 0, y: 0 }); // Spring velocity for outer circle
  const dotPos = useRef({ x: -100, y: -100 }); // High-speed inertia position (inner dot)

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
    const IDLE_DELAY_MS = 500; // 2.5s không di chuột sẽ rơi vào chế độ lơ lửng khiêu khích

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      if (stateRef.current.isIdle) {
        stateRef.current.isIdle = false;
        setIsIdle(false);
      }
      idleTimeout = setTimeout(() => {
        stateRef.current.isIdle = true;
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

      resetIdleTimer();
    };

    const handleMouseDown = () => {
      stateRef.current.isClicking = true;
      setIsClicking(true);
    };
    const handleMouseUp = () => {
      stateRef.current.isClicking = false;
      setIsClicking(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magnetEl = target.closest('[data-magnet="true"]') as HTMLElement;
      if (magnetEl) {
        stateRef.current.isHovering = true;
        setIsHovering(true);
        magnetTarget = magnetEl;
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-magnet="true"]')) {
        stateRef.current.isHovering = false;
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
    let idleAngle = 0;

    const renderLoop = () => {
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      // Magnet Active Mode
      if (magnetTarget && stateRef.current.isHovering) {
        const rect = magnetTarget.getBoundingClientRect();
        magnetPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        targetX = magnetPos.x;
        targetY = magnetPos.y;
      }
      // Idle / Provocation Mode: Tự động lơ lửng & trôi về tâm sprite (chỉ khi đã qua intro)
      else if (stateRef.current.isIdle && useScrollStore.getState().isIntroComplete) {
        let spriteX = window.innerWidth / 2;
        let spriteY = window.innerHeight / 2;
        const spriteEl = document.getElementById('cube-sprite-wrapper');

        if (spriteEl) {
          const rect = spriteEl.getBoundingClientRect();
          spriteX = rect.left + rect.width / 2;
          spriteY = rect.top + rect.height / 2;
        }

        idleAngle += 0.02;
        const breatheX = Math.cos(idleAngle) * 20;
        const breatheY = Math.sin(idleAngle * 1.5) * 15;

        // Điểm đích là vị trí của cube cộng dao động
        targetX = spriteX + breatheX;
        targetY = spriteY + breatheY;
      }

      // Thay thế Lerp (Ease-Out) bằng Spring Physics (Ease-In-Out hữu cơ chuẩn Hiến Pháp)
      const dt = gsap.ticker.deltaRatio();
      const stiffness = stateRef.current.isIdle ? 0.002 : 0.25; // Lực kéo về đích
      const damping = stateRef.current.isIdle ? 0.95 : 0.45;    // Ma sát (chống overshoot)

      // Gia tốc tăng dần (Ease-in)
      vel.current.x += (targetX - pos.current.x) * stiffness * dt;
      vel.current.y += (targetY - pos.current.y) * stiffness * dt;

      // Ma sát giảm dần (Ease-out)
      vel.current.x *= Math.pow(damping, dt);
      vel.current.y *= Math.pow(damping, dt);

      // Cập nhật vị trí
      pos.current.x += vel.current.x * dt;
      pos.current.y += vel.current.y * dt;

      xSet(pos.current.x);
      ySet(pos.current.y);

      // Inner Dot Physics: 
      if (stateRef.current.isIdle) {
        // Nội suy mượt mà (Lerp) để từ từ trôi về tâm vòng ngoài, tránh bị giật cục (Teleport)
        const idleDotDt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio());
        dotPos.current.x += (pos.current.x - dotPos.current.x) * idleDotDt;
        dotPos.current.y += (pos.current.y - dotPos.current.y) * idleDotDt;
      } else {
        // Bắt dính tức thì (0 lag) nhưng render trong RAF để đảm bảo mượt 144Hz V-Sync, không bị rách hình.
        dotPos.current.x = mouse.current.x;
        dotPos.current.y = mouse.current.y;
      }

      xDotSet(dotPos.current.x);
      yDotSet(dotPos.current.y);

      // Render via GSAP ticker
    };

    gsap.ticker.add(renderLoop);

    // Cleanup
    return () => {
      document.body.style.cursor = '';
      clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      gsap.ticker.remove(renderLoop);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference hidden md:block">
      {/* Outer Circle Wrapper (GSAP Translate ONLY, NO CSS TRANSITIONS) */}
      <div ref={cursorRef} className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center">
        {/* Visual Outer Circle (Tailwind Size/Scale/Color, WITH CSS TRANSITIONS) */}
        <div
          className={`absolute rounded-full border border-white transition-all duration-500 ease-out flex items-center justify-center
            ${isHovering ? 'w-16 h-16 bg-white/20 scale-150 border-white/80' : 'w-12 h-12'}
            ${isClicking ? 'scale-90 bg-white/40' : ''}
            ${isIdle ? 'w-16 h-16 bg-white/10 animate-pulse scale-125 border-dashed border-white/60' : ''}
          `}
        />
      </div>

      {/* Inner Dot Wrapper (GSAP Translate ONLY, NO CSS TRANSITIONS) */}
      <div ref={dotRef} className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center">
        {/* Visual Inner Dot (Tailwind Size/Scale/Color, WITH CSS TRANSITIONS) */}
        <div
          className={`absolute w-3 h-3 bg-white rounded-full transition-all duration-200
            ${isHovering ? 'scale-[0.5]' : 'scale-100'}
            ${isIdle ? 'scale-150 bg-cyan-300 shadow-[0_0_8px_#06b6d4]' : ''}
          `}
        />
      </div>
    </div>
  );
}
