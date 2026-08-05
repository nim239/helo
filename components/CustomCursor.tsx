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

  const fpsCircleRef = useRef<SVGCircleElement>(null);
  const fpsTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // -------------------------------------------------------------
    // 1. MOBILE EXTERMINATION (Pointer Fine Check)
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 2. IDLE MAGNET SYSTEM (Idle/Provocation Timer)
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 3. EVENT LISTENERS
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
    // 4. REAL-TIME FPS & INERTIA RENDER LOOP
    // -------------------------------------------------------------
    let idleAngle = 0;
    let lastFrameTime = performance.now();
    let smoothedFps = 60;

    const CIRCUMFERENCE = 2 * Math.PI * 26; // ~163.36px for r=26

    const renderLoop = () => {
      const now = performance.now();
      const deltaMs = now - lastFrameTime;
      lastFrameTime = now;

      // ── Real-Time FPS Calculation ──
      if (deltaMs > 0) {
        const instantFps = 1000 / deltaMs;
        smoothedFps += (instantFps - smoothedFps) * 0.08; // Damping smooth
      }

      // Clamp FPS at 100 max (100 FPS = 100% full circle)
      const clampedFps = Math.min(100, Math.max(0, smoothedFps));
      const fpsRatio = clampedFps / 100;
      const strokeOffset = CIRCUMFERENCE * (1 - fpsRatio);

      // Update FPS SVG Ring DOM & Dynamic Color directly
      if (fpsCircleRef.current) {
        fpsCircleRef.current.style.strokeDashoffset = `${strokeOffset}px`;

        if (smoothedFps < 30) {
          fpsCircleRef.current.style.stroke = "#FEF08A"; // Soft light yellow
        } else if (smoothedFps < 60) {
          fpsCircleRef.current.style.stroke = "#86EFAC"; // Soft light green
        } else {
          fpsCircleRef.current.style.stroke = "url(#cursorFpsGradient)"; // Brand gradient
        }
      }

      // Update FPS HUD Text DOM directly
      if (fpsTextRef.current) {
        fpsTextRef.current.textContent = `${Math.round(smoothedFps)}`;
      }

      // ── Pointer Inertia & Magnet Physics ──
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
      {/* Outer Cursor Wrapper - Replaced 2nd ring with unified FPS Dash Ring */}
      <div ref={cursorRef} className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center">
        {/* Real-Time FPS SVG Progress Ring (Single primary outer cursor ring) */}
        <svg
          className={`absolute w-16 h-16 pointer-events-none -rotate-90 transition-transform duration-300 ease-out
            ${isHovering ? 'scale-150' : 'scale-100'}
            ${isClicking ? 'scale-90' : ''}
            ${isIdle ? 'scale-125' : ''}
          `}
          viewBox="0 0 64 64"
        >
          <defs>
            <linearGradient id="cursorFpsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FF" />
              <stop offset="50%" stopColor="#FF007F" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>
          </defs>

          {/* Subtle background track */}
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Real-time FPS progress ring */}
          <circle
            ref={fpsCircleRef}
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="url(#cursorFpsGradient)"
            strokeWidth="2.5"
            strokeDasharray="163.36"
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>

        {/* FPS Counter Numeric HUD Tag */}
        <div className="absolute left-7 top-0 transform -translate-y-1/2 flex items-center gap-1 font-mono text-[9px] tracking-wider text-white bg-black/70 px-1.5 py-0.5 rounded border border-white/20 pointer-events-none shadow-md">
          <span ref={fpsTextRef}>60</span>
          <span className="text-[7px] text-white/50">FPS</span>
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
