import React, { useEffect, useRef, useState } from 'react';
import { useScrollStore } from '../store/useScrollStore';
import { SpriteAnimation } from './SpriteAnimation';

const WARP_PARTICLE_COUNT = 300;
const WARP_CULL_METHOD: 'opacity' | 'display' = 'opacity'; // Dùng opacity để có transition mượt

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  angle: number;
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
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (width / 2);
    
    const isPrimary = Math.random() > 0.6; // 40% blue, 60% cyan/pink
    const color = isPrimary 
      ? `hsl(${200 + Math.random() * 40}, 100%, ${60 + Math.random() * 40}%)`
      : `hsl(${320 + Math.random() * 40}, 100%, ${60 + Math.random() * 40}%)`;

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      z: Math.random() * 1000,
      speed: 15 + Math.random() * 35,
      size: 0.5 + Math.random() * 2,
      color,
      life: 1.0,
      maxLife: 0.5 + Math.random() * 1.5,
      angle
    };
  };

  const spawnParticle = (p: Particle, width: number, height: number, velocitySign: number) => {
    const distance = Math.random() * (width * 0.1); // Spawn near center
    p.x = Math.cos(p.angle) * distance;
    p.y = Math.sin(p.angle) * distance;
    p.z = 1000;
    p.life = p.maxLife;
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
      const trailAlpha = isWarping ? 0.2 : 0.6;
      ctx.fillStyle = `rgba(0, 0, 8, ${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Speed multiplier based on warp pool (T005)
      const speedMult = 1.0 + warpPool * 3.0;

      const currentCount = Math.min(particlesRef.current.length, lodCount);
      for (let i = 0; i < currentCount; i++) {
        const p = particlesRef.current[i];
        
        p.z -= p.speed * speedMult * velocitySign * (dt / 16);
        p.life -= 0.01 * (dt / 16);

        // Respawn dead particles (T011)
        if (p.life <= 0 && isWarping) {
          spawnParticle(p, width, height, velocitySign);
        }
        if (p.life <= 0) continue;

        // 3D to 2D projection
        const fov = 300;
        const scale = fov / Math.max(1, p.z);
        
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        // Don't draw if behind camera or out of bounds
        if (p.z < 1 || px < 0 || px > width || py < 0 || py > height) {
          if (isWarping) spawnParticle(p, width, height, velocitySign);
          continue;
        }

        // Draw particle trail (line)
        const prevScale = fov / Math.max(1, p.z + p.speed * speedMult * velocitySign);
        const prevPx = cx + p.x * prevScale;
        const prevPy = cy + p.y * prevScale;

        const size = p.size * scale;
        const opacity = Math.min(1, p.life / p.maxLife) * alpha;

        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = p.color.replace(')', `, ${opacity})`);
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
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
