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

  // T018: Larger ring refs (r=32, up from r=26)
  const fpsCircleRef = useRef<SVGCircleElement>(null);
  const fpsTextRef = useRef<HTMLSpanElement>(null);
  // T019: Warp gauge ring
  const warpCircleRef = useRef<SVGCircleElement>(null);
  // T021: Warp percentage text
  const warpTextRef = useRef<HTMLSpanElement>(null);
  const warpLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 1. MOBILE EXTERMINATION (Pointer Fine Check)
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    if (!finePointerQuery.matches) {
      setIsFinePointer(false);
      return;
    }

    setIsFinePointer(true);
    document.body.style.cursor = 'none';

    // GSAP quickSetters
    const xSet = gsap.quickSetter(cursorRef.current, 'x', 'px');
    const ySet = gsap.quickSetter(cursorRef.current, 'y', 'px');
    const xDotSet = gsap.quickSetter(dotRef.current, 'x', 'px');
    const yDotSet = gsap.quickSetter(dotRef.current, 'y', 'px');

    let magnetPos: { x: number; y: number } | null = null;
    let magnetTarget: HTMLElement | null = null;

    // 2. IDLE MAGNET SYSTEM
    let idleTimeout: NodeJS.Timeout;
    const IDLE_DELAY_MS = 500;

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

    resetIdleTimer();

    // 3. EVENT LISTENERS
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

    // 4. REAL-TIME FPS, WARP GAUGE & INERTIA RENDER LOOP
    // T018: Updated for larger ring r=32
    const R = 32;
    const CIRCUMFERENCE = 2 * Math.PI * R;       // ~201.06
    const HALF_CIRC = CIRCUMFERENCE / 2;          // ~100.53 — half arc for each gauge

    let idleAngle = 0;
    let lastFrameTime = performance.now();
    let smoothedFps = 60;
    let lastWarpBurst = false;

    const renderLoop = () => {
      const now = performance.now();
      const deltaMs = now - lastFrameTime;
      lastFrameTime = now;

      // FPS Calculation
      if (deltaMs > 0) {
        const instantFps = 1000 / deltaMs;
        smoothedFps += (instantFps - smoothedFps) * 0.08;
      }

      // T018: FPS ring — top half only (max 100fps = half circle)
      const clampedFps = Math.min(100, Math.max(0, smoothedFps));
      const fpsRatio = clampedFps / 100;
      // Offset: full CIRC = hidden, HALF = empty top arc, 0 = full top arc
      const fpsOffset = HALF_CIRC * (1 - fpsRatio) + HALF_CIRC; // starts at bottom (hidden half)

      if (fpsCircleRef.current) {
        fpsCircleRef.current.style.strokeDashoffset = `${fpsOffset}px`;
        if (smoothedFps < 30) {
          fpsCircleRef.current.style.stroke = "#FEF08A";
        } else if (smoothedFps < 60) {
          fpsCircleRef.current.style.stroke = "#86EFAC";
        } else {
          fpsCircleRef.current.style.stroke = "url(#cursorFpsGradient)";
        }
      }
      if (fpsTextRef.current) {
        fpsTextRef.current.textContent = `${Math.round(smoothedFps)}`;
      }

      // T019 + T020: Warp gauge — bottom half
      const warpPool = useScrollStore.getState().warpPool;
      const isWarping = useScrollStore.getState().currentPhase === 'WARPING';
      const warpRatio = Math.min(1, Math.max(0, warpPool));
      // Warp arc fills from bottom going clockwise (opposite half from FPS)
      const warpOffset = HALF_CIRC * (1 - warpRatio); // 0 = full bottom arc

      if (warpCircleRef.current) {
        warpCircleRef.current.style.strokeDashoffset = `${warpOffset}px`;
        // T020: Dynamic color + pulse
        let warpColor: string;
        if (warpPool < 0.3) {
          warpColor = '#00F2FF';
        } else if (warpPool < 0.8) {
          warpColor = '#FF8C00';
        } else {
          warpColor = '#FF003C';
        }
        warpCircleRef.current.style.stroke = warpColor;

        // T020: Burst animation on warp trigger
        if (isWarping && !lastWarpBurst) {
          lastWarpBurst = true;
          if (cursorRef.current) {
            gsap.fromTo(cursorRef.current,
              { scale: 1 },
              { scale: 1.6, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }
            );
          }
        } else if (!isWarping) {
          lastWarpBurst = false;
        }
      }

      // T021: Warp percentage text
      if (warpTextRef.current) {
        warpTextRef.current.textContent = `${Math.round(warpPool * 100)}`;
      }

      // Pointer Inertia & Magnet Physics
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      if (magnetTarget && stateRef.current.isHovering) {
        const rect = magnetTarget.getBoundingClientRect();
        magnetPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        targetX = magnetPos.x;
        targetY = magnetPos.y;
      }

      const dt = gsap.ticker.deltaRatio();
      const stiffness = stateRef.current.isIdle ? 0.002 : 0.25;
      const damping = stateRef.current.isIdle ? 0.95 : 0.45;

      vel.current.x += (targetX - pos.current.x) * stiffness * dt;
      vel.current.y += (targetY - pos.current.y) * stiffness * dt;

      vel.current.x *= Math.pow(damping, dt);
      vel.current.y *= Math.pow(damping, dt);

      pos.current.x += vel.current.x * dt;
      pos.current.y += vel.current.y * dt;

      xSet(pos.current.x);
      ySet(pos.current.y);

      if (stateRef.current.isIdle) {
        const idleDotDt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio());
        dotPos.current.x += (pos.current.x - dotPos.current.x) * idleDotDt;
        dotPos.current.y += (pos.current.y - dotPos.current.y) * idleDotDt;
      } else {
        dotPos.current.x = mouse.current.x;
        dotPos.current.y = mouse.current.y;
      }

      xDotSet(dotPos.current.x);
      yDotSet(dotPos.current.y);
    };

    gsap.ticker.add(renderLoop);

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
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden hidden md:block">
      {/* T018: Enlarged outer cursor wrapper — w-20 h-20 (up from w-16 h-16) */}
      <div ref={cursorRef} className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center">
        {/* T018+T019: Split ring — FPS top half + Warp bottom half */}
        <svg
          className={`absolute w-20 h-20 pointer-events-none -rotate-90 transition-transform duration-300 ease-out
            ${isHovering ? 'scale-150' : 'scale-100'}
            ${isClicking ? 'scale-90' : ''}
            ${isIdle ? 'scale-125' : ''}
          `}
          viewBox="0 0 80 80"
        >
          <defs>
            <linearGradient id="cursorFpsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FF" />
              <stop offset="50%" stopColor="#FF007F" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>
          </defs>

          {/* Background track — full circle */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="rgba(255, 255, 255, 0.10)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* FPS gauge — top half arc (r=32, CIRCUMFERENCE~201, halfCirc~100.5) */}
          {/* dasharray=halfCirc totalCirc: only top half visible when rotated */}
          <circle
            ref={fpsCircleRef}
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="url(#cursorFpsGradient)"
            strokeWidth="3"
            strokeDasharray={`${Math.PI * 32} ${2 * Math.PI * 32}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* T019: Warp gauge — bottom half arc (rotate 180° to flip to bottom) */}
          <circle
            ref={warpCircleRef}
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#00F2FF"
            strokeWidth="3"
            strokeDasharray={`${Math.PI * 32} ${2 * Math.PI * 32}`}
            strokeDashoffset={`${Math.PI * 32}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(180deg)', transformOrigin: '40px 40px' }}
          />
        </svg>

        {/* FPS Counter HUD — top-right of ring */}
        <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[9px] tracking-wider text-white bg-black/70 px-1.5 py-0.5 rounded border border-white/20 pointer-events-none shadow-md">
          <span ref={fpsTextRef}>60</span>
          <span className="text-[7px] text-white/50">FPS</span>
        </div>

        {/* T021: Warp gauge HUD — bottom-right of ring */}
        <div className="absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 flex items-center gap-1 font-mono text-[9px] tracking-wider text-white bg-black/70 px-1.5 py-0.5 rounded border border-white/20 pointer-events-none shadow-md">
          <span ref={warpTextRef}>0</span>
          <span className="text-[7px] text-[#00F2FF]/70">WP</span>
        </div>
      </div>

      {/* Inner Dot Wrapper */}
      <div ref={dotRef} className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center">
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
