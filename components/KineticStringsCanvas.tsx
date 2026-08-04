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
    // BẢNG MÀU CHROMA SEPARATION (SIÊU RỰC RỠ CHUẨN ẢNH 2 - NEON ECLIPSE)
    // ------------------------------------------------------------------
    const CHROMA_PAIRS = [
      { left: { r: 0, g: 242, b: 255 },  right: { r: 255, g: 0, b: 127 } },   // Electric Cyan <-> Neon Magenta
      { left: { r: 0, g: 102, b: 255 },  right: { r: 178, g: 0, b: 255 } },   // Laser Blue <-> Royal Violet
      { left: { r: 0, g: 255, b: 136 },  right: { r: 255, g: 0, b: 85 } },    // Emerald Mint <-> Hot Crimson Pink
      { left: { r: 0, g: 191, b: 255 },  right: { r: 255, g: 60, b: 0 } },    // Sky Blue <-> Neon Orange Red
      { left: { r: 0, g: 242, b: 255 },  right: { r: 210, g: 0, b: 255 } },   // Cyan <-> Electric Purple
    ];

    // ------------------------------------------------------------------
    // RENDER SỢI DÂY ĐÀN VỚI TAPERED SPINDLE GRADIENT (60+ FPS)
    // ------------------------------------------------------------------
    const drawNeonString = (
      baseX: number,
      idx: number,
      t: number,
      amp: number,
      collapse: number,
      glowMultiplier: number
    ) => {
      const chroma = CHROMA_PAIRS[idx % CHROMA_PAIRS.length];

      // Hàm phụ trợ vẽ đường sóng với offset theo trục X (Chroma Shift)
      const drawWavePath = (offsetX: number) => {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 4) {
          const x = getStringX(baseX, idx, y, t, amp, collapse) + offsetX;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };

      // Tạo Linear Gradient Tapered Spindle: Căng mọng ở giữa, vuốt nhọn hoắt 2 đầu (0% hình viên thuốc!)
      const createSpindleGradient = (
        r: number,
        g: number,
        b: number,
        maxAlpha: number,
        phaseOffset: number
      ) => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        const stops = 16; // 16 điểm dừng dọc màn hình
        const speed = 0.12 + idx * 0.025; // Chạy chậm lại mượt mà, thong thả

        for (let s = 0; s <= stops; s++) {
          const u = s / stops;
          // Math.PI * 2.0 -> Chỉ đúng 1 chùm chớp dash duy nhất trên toàn bộ dây
          const phase = (u - t * speed + phaseOffset) * Math.PI * 2.0;
          const wave = Math.max(0, Math.sin(phase));
          // pow(3.5) bóp nhọn 2 đuôi sóng: tâm căng mọng (1.0), 2 đầu vuốt sắc lẹm về 0 (tuột mất dáng viên thuốc)
          const taper = Math.pow(wave, 3.5);
          grad.addColorStop(u, `rgba(${r}, ${g}, ${b}, ${maxAlpha * taper})`);
        }
        return grad;
      };

      // ── HÀO QUANG TAPERED SPINDLES DI CHUYỂN DỌC DÂY (0% TRẮNG - 100% NEON SATURATED - 60+ FPS) ──
      if (glowMultiplier > 0.02) {
        ctx.save();
        // Dùng 'source-over' để màu Neon giữ trọn 100% độ bão hòa, tuyệt đối KHÔNG bị ngả trắng/bợt màu
        ctx.globalCompositeOperation = "source-over";

        const gradLeft1  = createSpindleGradient(chroma.left.r, chroma.left.g, chroma.left.b, 0.95 * glowMultiplier, 0);
        const gradRight1 = createSpindleGradient(chroma.right.r, chroma.right.g, chroma.right.b, 0.95 * glowMultiplier, 0.35); // So le nhịp Trái - Phải

        // ── LỚP 1: Deep Chroma Corona (Blur 16px - Offset -2.2px / +2.2px - Siêu mảnh) ──
        ctx.filter = `blur(${Math.round(16 * glowMultiplier)}px)`;

        drawWavePath(-2.2);
        ctx.strokeStyle = gradLeft1;
        ctx.lineWidth = 2.8;
        ctx.stroke();

        drawWavePath(2.2);
        ctx.strokeStyle = gradRight1;
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // ── LỚP 2: Medium Chroma Halo (Blur 7px - Offset -1.3px / +1.3px - Siêu mảnh) ──
        const gradLeft2  = createSpindleGradient(chroma.left.r, chroma.left.g, chroma.left.b, 1.0 * glowMultiplier, 0);
        const gradRight2 = createSpindleGradient(chroma.right.r, chroma.right.g, chroma.right.b, 1.0 * glowMultiplier, 0.35);

        ctx.filter = `blur(${Math.round(7 * glowMultiplier)}px)`;

        drawWavePath(-1.3);
        ctx.strokeStyle = gradLeft2;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        drawWavePath(1.3);
        ctx.strokeStyle = gradRight2;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // ── LỚP 3: Intense Chroma Core Glow (Blur 2.5px - Offset -0.6px / +0.6px - Siêu mảnh) ──
        const gradLeft3  = createSpindleGradient(chroma.left.r, chroma.left.g, chroma.left.b, 1.0 * glowMultiplier, 0);
        const gradRight3 = createSpindleGradient(chroma.right.r, chroma.right.g, chroma.right.b, 1.0 * glowMultiplier, 0.35);

        ctx.filter = `blur(${Math.round(2.5 * glowMultiplier)}px)`;

        drawWavePath(-0.6);
        ctx.strokeStyle = gradLeft3;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        drawWavePath(0.6);
        ctx.strokeStyle = gradRight3;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.restore();
      }

      // ── LỚP 4: CORE DÂY TRẮNG SIÊU MẢNH SẮC LẸM (0.8px - Filter = none) ──
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      drawWavePath(0);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
      ctx.lineWidth = 0.8; // Nét mảnh nhỏ nhất có thể như tơ sợi lăng kính
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

      // ── PARTICLES (100% sắc độ neon, không bị ngả trắng) ──
      const M = 1.8;
      for (const p of particles) {
        const baseX = p.cluster === "left" ? margins.left : margins.right;
        const dotSpeed = p.baseSpeed - velocity * M;
        p.y += dotSpeed;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        const px = getStringX(baseX, p.stringIndex, p.y, time, ampLerp, collapseX);
        const dotAlpha = glowLerp * 0.8 + 0.2;
        const chroma = CHROMA_PAIRS[p.stringIndex % CHROMA_PAIRS.length];

        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        // Lớp Glow xa Trái - Phải (-2px / +2px)
        ctx.filter = `blur(${Math.round(14 * dotAlpha)}px)`;
        ctx.beginPath();
        ctx.arc(px - 2.0, p.y, 4.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${chroma.left.r}, ${chroma.left.g}, ${chroma.left.b}, ${dotAlpha * 0.85})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px + 2.0, p.y, 4.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${chroma.right.r}, ${chroma.right.g}, ${chroma.right.b}, ${dotAlpha * 0.85})`;
        ctx.fill();

        // Lớp Glow sát hạt (tuyệt đối không dùng trắng, dùng sắc màu neon bão hòa)
        ctx.filter = `blur(${Math.round(5 * dotAlpha)}px)`;
        ctx.beginPath();
        ctx.arc(px, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${chroma.left.r}, ${chroma.left.g}, ${chroma.left.b}, ${dotAlpha * 1.0})`;
        ctx.fill();

        // Core chấm trắng nét căng
        ctx.filter = "none";
        ctx.beginPath();
        ctx.arc(px, p.y, 3.0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        filter:
          "drop-shadow(0 0 16px rgba(0, 242, 255, 0.4)) drop-shadow(0 0 38px rgba(255, 0, 127, 0.35))",
      }}
    />
  );
}
