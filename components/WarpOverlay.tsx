import React, { useEffect, useRef, useState } from 'react';
import { useScrollStore } from '../lib/store/useScrollStore';
import { SpriteAnimation } from './SpriteAnimation';

const WARP_PARTICLE_COUNT = 300;
const WARP_CULL_METHOD: 'opacity' | 'display' = 'opacity'; // Dùng opacity để có transition mượt

interface Particle {
  type: 'line' | 'square' | 'circle';
  x: number;
  y: number;
  speed: number;
  size: number;
  length: number; // for lines
  color: string;
  alpha: number;
}

export function WarpOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isWarpingRef = useRef(false);
  const cullTargetRef = useRef<HTMLElement | null>(null);
  const originalDisplayRef = useRef<string>('');
  const overlayAlphaRef = useRef(0);
  
  // T014: Dynamic LOD based on FPS
  const [lodCount, setLodCount] = useState(WARP_PARTICLE_COUNT);

  const initParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    const count = Math.min(WARP_PARTICLE_COUNT, lodCount);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(width, height));
    }
    particlesRef.current = particles;
  };

  const createParticle = (width: number, height: number): Particle => {
    const isPrimary = Math.random() > 0.6;
    const color = isPrimary 
      ? `hsl(${200 + Math.random() * 40}, 100%, ${60 + Math.random() * 40}%)`
      : `hsl(${320 + Math.random() * 40}, 100%, ${60 + Math.random() * 40}%)`;

    const rand = Math.random();
    let type: 'line' | 'square' | 'circle' = 'line';
    if (rand > 0.85) type = 'square';
    else if (rand > 0.7) type = 'circle';

    return {
      type,
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 10 + Math.random() * 30, // Base vertical speed
      size: type === 'line' ? 1 + Math.random() * 3 : 3 + Math.random() * 15,
      length: 50 + Math.random() * 200, // Trail length for lines
      color,
      alpha: 0.3 + Math.random() * 0.7,
    };
  };

  const wrapParticle = (p: Particle, width: number, height: number, velocitySign: number) => {
    // If moving UP (velocitySign > 0), wrap to bottom
    if (velocitySign > 0) {
      p.y = height + p.length + Math.random() * 100;
    } else {
      // If moving DOWN, wrap to top
      p.y = -p.length - Math.random() * 100;
    }
    p.x = Math.random() * width;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // T011: alpha=false for speed
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    cullTargetRef.current = document.getElementById('sections-wrapper');
    initParticles(width, height);

    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min(time - lastTime, 32); // Clamp dt to avoid huge jumps
      lastTime = time;

      const state = useScrollStore.getState();
      const isWarping = state.currentPhase === 'WARPING';
      const warpPool = state.warpPool;
      const velocitySign = state.velocity >= 0 ? 1 : -1;
      
      // Dynamic LOD update
      setLodCount(prev => {
        if (state.fps < 40 && prev > 100) return prev - 50;
        if (state.fps > 55 && prev < WARP_PARTICLE_COUNT) return prev + 10;
        return prev;
      });

      // LERPS
      const targetAlpha = isWarping ? 1 : 0;
      overlayAlphaRef.current += (targetAlpha - overlayAlphaRef.current) * 0.06;

      // DOM Culling - Pure Opacity Method (No Layout Jumps)
      if (isWarping && !isWarpingRef.current) {
        isWarpingRef.current = true;
        if (cullTargetRef.current) {
          cullTargetRef.current.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          void cullTargetRef.current.offsetWidth; // Force reflow
          cullTargetRef.current.style.opacity = '0';
          cullTargetRef.current.style.pointerEvents = 'none';
        }
      } else if (!isWarping && isWarpingRef.current) {
        isWarpingRef.current = false;
        if (cullTargetRef.current) {
          cullTargetRef.current.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          void cullTargetRef.current.offsetWidth; // Force reflow
          cullTargetRef.current.style.opacity = '1';
          cullTargetRef.current.style.pointerEvents = '';
          
          setTimeout(() => {
            if (cullTargetRef.current && !isWarpingRef.current) {
              cullTargetRef.current.style.transition = '';
            }
          }, 800);
        }
      }

      // Draw background
      const alpha = overlayAlphaRef.current;
      if (alpha <= 0.01) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Trailing effect for warp speed
      const trailAlpha = isWarping ? 0.3 : 0.6;
      ctx.fillStyle = `rgba(0, 0, 8, ${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Speed multiplier based on warp pool (T005)
      // When velocity is positive (scroll down), particles fly UP (negative Y)
      const speedMult = (isWarping ? 2.0 : 0.5) + warpPool * 3.0;
      const currentCount = Math.min(particlesRef.current.length, lodCount);
      
      for (let i = 0; i < currentCount; i++) {
        const p = particlesRef.current[i];
        
        // Di chuyển dọc theo trục Y ngược hướng scroll
        // velocitySign > 0 (cuộn xuống) -> bay LÊN (-Y)
        p.y -= p.speed * speedMult * velocitySign * (dt / 16);

        // Wrap around màn hình
        if (velocitySign > 0 && p.y < -p.length - 50) {
          wrapParticle(p, width, height, velocitySign);
        } else if (velocitySign < 0 && p.y > height + p.length + 50) {
          wrapParticle(p, width, height, velocitySign);
        }

        const opacity = p.alpha * alpha;
        ctx.fillStyle = p.color.replace(')', `, ${opacity})`);
        ctx.strokeStyle = p.color.replace(')', `, ${opacity})`);

        if (p.type === 'line') {
          ctx.beginPath();
          // Đầu đường line
          ctx.moveTo(p.x, p.y);
          // Đuôi đường line kéo dài theo hướng ngược lại
          ctx.lineTo(p.x, p.y + p.length * velocitySign);
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else if (p.type === 'square') {
          // Block 2D
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        } else if (p.type === 'circle') {
          // Circle 2D
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      // Restore DOM on unmount
      if (cullTargetRef.current && isWarpingRef.current) {
        cullTargetRef.current.style.opacity = '1';
        cullTargetRef.current.style.pointerEvents = '';
        cullTargetRef.current.style.transition = '';
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 40, // Đặt dưới Cubi (z-50) để Cubi luôn nổi lên trên Warp scene
        // Canvas itself always mounted, alpha handled via JS ctx.fillStyle
      }}
    />
  );
}
