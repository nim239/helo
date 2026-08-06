"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../lib/store/useScrollStore';

// ============================================================
// DOM CULLING METHOD (T013) — toggle to benchmark FPS
// 'display' = display:none (unrender completely, best FPS)
// 'opacity' = opacity:0 (visual only, still paints)
// ============================================================
const WARP_CULL_METHOD: 'opacity' | 'display' = 'display';

// ============================================================
// WARP PARTICLE SYSTEM
// ============================================================
const MAX_PARTICLES = 120;
const MIN_STREAK_LENGTH = 20;
const MAX_STREAK_LENGTH = 140;

interface WarpParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  hue: number;  // 180-280 (cyan→indigo)
  life: number; // 0-1
  speed: number;
}

function spawnParticle(p: WarpParticle, width: number, height: number, velocitySign: number): void {
  p.x = Math.random() * width;
  // Spawn at bottom edge when scrolling down (particles fly up), top edge when scrolling up
  p.y = velocitySign > 0 ? height + 20 : -20;
  p.vx = (Math.random() - 0.5) * 2;
  p.vy = velocitySign > 0 ? -(8 + Math.random() * 16) : (8 + Math.random() * 16);
  p.length = MIN_STREAK_LENGTH + Math.random() * (MAX_STREAK_LENGTH - MIN_STREAK_LENGTH);
  p.alpha = 0.4 + Math.random() * 0.6;
  p.hue = 180 + Math.random() * 100; // cyan to violet
  p.life = 1.0;
  p.speed = 0.008 + Math.random() * 0.012;
}

function createParticlePool(): WarpParticle[] {
  return Array.from({ length: MAX_PARTICLES }, () => ({
    x: 0, y: 0, vx: 0, vy: 0,
    length: 60, alpha: 0, hue: 200,
    life: 0, speed: 0.01,
  }));
}

export function WarpOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayAlphaRef = useRef<number>(0);
  const particlesRef = useRef<WarpParticle[]>(createParticlePool());
  const cullTargetRef = useRef<HTMLElement | null>(null);
  const originalDisplayRef = useRef<string>('');
  const isWarpingRef = useRef<boolean>(false);
  const smoothedFpsRef = useRef<number>(60);
  const lastFrameTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find sections culling target (T013)
    const sectionsWrapper = document.getElementById('sections-wrapper') ||
      document.querySelector('main') as HTMLElement ||
      document.querySelector('[data-sections]') as HTMLElement;
    cullTargetRef.current = sectionsWrapper;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Initialize all particles as dead (life=0)
    particlesRef.current.forEach(p => { p.life = 0; p.alpha = 0; });

    const renderLoop = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // FPS smoothing for LOD
      if (delta > 0) {
        const instantFps = 1000 / delta;
        smoothedFpsRef.current += (instantFps - smoothedFpsRef.current) * 0.05;
      }

      const state = useScrollStore.getState();
      const isWarping = state.currentPhase === 'WARPING';
      const velocity = state.velocity;
      const warpPool = state.warpPool;

      // Overlay fade in/out (T025: 300ms transition)
      const targetAlpha = isWarping ? 1 : 0;
      overlayAlphaRef.current += (targetAlpha - overlayAlphaRef.current) * 0.06;

      // DOM culling (T013)
      if (isWarping && !isWarpingRef.current) {
        // Entering warp
        isWarpingRef.current = true;
        if (cullTargetRef.current) {
          if (WARP_CULL_METHOD === 'display') {
            originalDisplayRef.current = cullTargetRef.current.style.display;
            cullTargetRef.current.style.display = 'none';
          } else {
            cullTargetRef.current.style.opacity = '0';
            cullTargetRef.current.style.pointerEvents = 'none';
          }
        }
      } else if (!isWarping && isWarpingRef.current) {
        // Exiting warp
        isWarpingRef.current = false;
        if (cullTargetRef.current) {
          if (WARP_CULL_METHOD === 'display') {
            cullTargetRef.current.style.display = originalDisplayRef.current;
          } else {
            cullTargetRef.current.style.opacity = '';
            cullTargetRef.current.style.pointerEvents = '';
          }
        }
      }

      const alpha = overlayAlphaRef.current;
      if (alpha < 0.01) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      // Background — deep space (fade in/out)
      ctx.fillStyle = `rgba(0, 0, 8, ${alpha * 0.95})`;
      ctx.fillRect(0, 0, width, height);

      // LOD: scale particle count by FPS health
      const fps = smoothedFpsRef.current;
      const lodCount = Math.max(20, Math.floor((fps / 60) * MAX_PARTICLES));
      const velocitySign = velocity >= 0 ? 1 : -1;

      // Update & draw particles
      const particles = particlesRef.current;
      for (let i = 0; i < lodCount; i++) {
        const p = particles[i];

        // Respawn dead particles (T011)
        if (p.life <= 0 && isWarping) {
          spawnParticle(p, width, height, velocitySign);
        }
        if (p.life <= 0) continue;

        // Update
        p.life -= p.speed;
        p.x += p.vx;
        p.y += p.vy;

        const drawAlpha = p.alpha * p.life * alpha;
        if (drawAlpha < 0.01) continue;

        // Draw speed line streak (T012)
        const tailX = p.x - p.vx * (p.length / Math.abs(p.vy));
        const tailY = p.y - p.vy * (p.length / Math.abs(p.vy));

        const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 0)`);
        grad.addColorStop(0.5, `hsla(${p.hue}, 100%, 80%, ${drawAlpha * 0.6})`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 95%, ${drawAlpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Warp intensity vignette at high warp pool
      if (warpPool > 0.7 && alpha > 0.5) {
        const vigAlpha = ((warpPool - 0.7) / 0.3) * 0.3 * alpha;
        const vig = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.9);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, `rgba(0, 200, 255, ${vigAlpha})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);
      }
    };

    gsap.ticker.add(renderLoop);

    return () => {
      gsap.ticker.remove(renderLoop);
      window.removeEventListener('resize', handleResize);
      // Restore DOM on unmount
      if (cullTargetRef.current && isWarpingRef.current) {
        if (WARP_CULL_METHOD === 'display') {
          cullTargetRef.current.style.display = originalDisplayRef.current;
        } else {
          cullTargetRef.current.style.opacity = '';
          cullTargetRef.current.style.pointerEvents = '';
        }
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 90,
        // Canvas itself always mounted, alpha handled via JS ctx.fillStyle
      }}
    />
  );
}
