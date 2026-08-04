"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScrollStore } from "../lib/store/useScrollStore";

interface Particle {
  y: number;
  baseSpeed: number;
  cluster: "left" | "right";
  stringIndex: number;
}

export function KineticStringsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const getMargins = () => {
      const isMobile = window.innerWidth < 768;
      const ratio = isMobile ? 0.04 : 0.08;
      return { left: window.innerWidth * ratio, right: window.innerWidth * (1 - ratio) };
    };
    let margins = getMargins();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      margins = getMargins();
    };
    window.addEventListener("resize", handleResize);

    // ------------------------------------------------------------------
    // VẬT LÝ DÂY ĐÀN HARMONIC N = 1, 2, 3, 4, 5 (Vừa vặn, tinh tế):
    // 1. Cấp họa âm Harmonic Order N = 1, 2, 3, 4, 5 (Vừa đủ 1 - 5 bụng sóng).
    // 2. Chiều cao sóng Amplitude (60px -> 20px).
    // 3. Tụ chặt 2 điểm mút tại Y=0 và Y=height 100%.
    // ------------------------------------------------------------------
    const STRING_COUNT = 5;
    const stringDefs = Array.from({ length: STRING_COUNT }).map((_, i) => {
      const harmonicOrder = i + 1; // N = 1, 2, 3, 4, 5 chuẩn đét
      return {
        harmonicOrder,
        amplitude: 60 - i * 10,                            // Chiều cao sóng vừa vặn (60px -> 20px)
        spatialFrequency: (Math.PI * harmonicOrder) / height, // Tần số Harmonic N = 1..5
        temporalSpeed: 1 + i * 0.4,                         // Tốc độ nhịp rung âm thanh mượt
        phaseOffset: (i * Math.PI) / 3,
        xOffset: (i - 2) * 12,
      };
    });

    // ------------------------------------------------------------------
    // LERP STATE
    // ------------------------------------------------------------------
    let ampLerp    = 1;
    let collapseX  = 0;
    let glowLerp   = 1;
    const LERP_IN  = 0.05;
    const LERP_OUT = 0.02;

    // ------------------------------------------------------------------
    // PARTICLES (100% Trắng tinh)
    // ------------------------------------------------------------------
    const MAX_PER_CLUSTER = 5;
    const particles: Particle[] = [];
    for (const cluster of ["left", "right"] as const) {
      for (let i = 0; i < MAX_PER_CLUSTER; i++) {
        particles.push({
          y: (height / MAX_PER_CLUSTER) * i + Math.random() * 60,
          baseSpeed: 0.3 + Math.random() * 0.15,
          cluster,
          stringIndex: i % STRING_COUNT,
        });
      }
    }

    let time = 0;

    // ------------------------------------------------------------------
    // HÀM TÍNH TOÁN X DÂY ĐÀN HARMONIC N = 1..5
    // ------------------------------------------------------------------
    const getStringX = (
      baseX: number,
      idx: number,
      y: number,
      t: number,
      amp: number,
      collapse: number
    ): number => {
      const def = stringDefs[idx];

      const clampedY = Math.max(0, Math.min(height, y));
      // Bóp nút dây đàn tại 2 đầu (Fixed End Conditions): sin((Y/H)*PI) luôn = 0 tại Y=0 và Y=H
      const fixedEndEnvelope = Math.sin((clampedY / height) * Math.PI);

      // Dao động sóng dây đàn N = 1..5
      const wave = Math.sin(clampedY * def.spatialFrequency + t * def.temporalSpeed + def.phaseOffset);

      const effectiveXOffset = def.xOffset * (1 - collapse) * fixedEndEnvelope;
      const effectiveAmp = def.amplitude * amp * fixedEndEnvelope;

      return baseX + effectiveXOffset + wave * effectiveAmp;
    };

    // ------------------------------------------------------------------
    // RENDER SỢI DÂY ĐÀN
    // ------------------------------------------------------------------
    const drawNeonString = (
      baseX: number,
      idx: number,
      t: number,
      amp: number,
      collapse: number,
      glowMultiplier: number
    ) => {
      const brightness = 1 - idx * 0.12;

      ctx.beginPath();
      for (let y = 0; y <= height; y += 4) {
        const x = getStringX(baseX, idx, y, t, amp, collapse);
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // ── HÀO QUANG TRẮNG SÁNG DÂY ĐÀN ──
      if (glowMultiplier > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * glowMultiplier * brightness})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgb(255, 255, 255)";
        ctx.shadowBlur = 45 * glowMultiplier;
        ctx.stroke();
        ctx.restore();
      }

      // ── CORE TRẮNG CƯỚC SẮC LẸM ──
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * brightness})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
    };

    // ------------------------------------------------------------------
    // RENDER LOOP
    // ------------------------------------------------------------------
    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      const velocity = useScrollStore.getState().velocity;
      const absVel = Math.abs(velocity);
      const isTension = absVel > 0.08;

      const lerpSpeed = isTension ? LERP_IN : LERP_OUT;
      const target = isTension ? 0 : 1;

      ampLerp   += (target - ampLerp)   * lerpSpeed;
      collapseX += ((isTension ? 1 : 0) - collapseX) * lerpSpeed;
      glowLerp  += (target - glowLerp)  * lerpSpeed;

      ampLerp   = Math.max(0, Math.min(1, ampLerp));
      collapseX = Math.max(0, Math.min(1, collapseX));
      glowLerp  = Math.max(0, Math.min(1, glowLerp));

      for (const cluster of ["left", "right"] as const) {
        const baseX = cluster === "left" ? margins.left : margins.right;
        for (let i = STRING_COUNT - 1; i >= 0; i--) {
          drawNeonString(baseX, i, time, ampLerp, collapseX, glowLerp);
        }
      }

      // ── PARTICLES ──
      const M = 1.8;
      for (const p of particles) {
        const baseX = p.cluster === "left" ? margins.left : margins.right;
        const dotSpeed = p.baseSpeed - velocity * M;
        p.y += dotSpeed;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        const px = getStringX(baseX, p.stringIndex, p.y, time, ampLerp, collapseX);
        const dotAlpha = glowLerp * 0.7 + 0.3;

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        ctx.beginPath();
        ctx.arc(px, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dotAlpha * 0.9})`;
        ctx.shadowColor = "rgb(255, 255, 255)";
        ctx.shadowBlur = 25 * dotAlpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, p.y, 4, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fill();

        ctx.restore();
      }
    };

    gsap.ticker.add(render);
    return () => {
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(render);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 10 }}
    />
  );
}
