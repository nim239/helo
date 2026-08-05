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

const SCALE = 0.25;

export function KineticStringsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // T012: OffscreenCanvas detection
    const supportsOffscreen =
      typeof OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in HTMLCanvasElement.prototype;

    if (supportsOffscreen) {
      console.log("[KineticStrings] OffscreenCanvas Worker active");
      let worker: Worker;
      let width = window.innerWidth;
      let height = window.innerHeight;

      try {
        worker = new Worker(
          new URL("../lib/workers/kinetic-strings.worker.ts", import.meta.url),
          { type: "module" }
        );

        const offscreenCanvas = canvas.transferControlToOffscreen();
        
        // Init
        worker.postMessage(
          { type: "INIT", canvas: offscreenCanvas, width, height },
          [offscreenCanvas]
        );

        // Relay velocity every GSAP tick
        const velocityRelay = () => {
          const velocity = useScrollStore.getState().velocity;
          worker.postMessage({ type: "FRAME", velocity });
        };
        gsap.ticker.add(velocityRelay);

        // Resize
        let resizeRafId: number | null = null;
        const handleResize = () => {
          if (resizeRafId !== null) return;
          resizeRafId = requestAnimationFrame(() => {
            resizeRafId = null;
            width = window.innerWidth;
            height = window.innerHeight;
            worker.postMessage({ type: "RESIZE", width, height });
          });
        };
        window.addEventListener("resize", handleResize, { passive: true });

        // Visibility
        const handleVisibility = () => {
          worker.postMessage({ type: "VISIBILITY", visible: !document.hidden });
        };
        document.addEventListener("visibilitychange", handleVisibility, { passive: true });

        // Cleanup
        return () => {
          gsap.ticker.remove(velocityRelay);
          window.removeEventListener("resize", handleResize);
          document.removeEventListener("visibilitychange", handleVisibility);
          if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
          worker.terminate();
        };
      } catch (err) {
        console.warn("[KineticStrings] Worker init failed, falling back to main thread:", err);
        // Fallback continues below if we had a setup for it, but since transferControlToOffscreen
        // neuters the canvas, we can't easily fallback if it fails AFTER transfer.
        // Usually `new Worker` fails immediately before transfer if unsupported.
      }
    }

    // ------------------------------------------------------------------
    // FALLBACK PATH: MAIN THREAD (US3)
    // ------------------------------------------------------------------
    if (!supportsOffscreen) {
      console.log("[KineticStrings] Fallback to Main Thread render");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen Buffer Canvas (0.25x RAM Canvas for Glow Rasterization)
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    if (offscreenCtx) {
      offscreenCanvas.width = Math.ceil(width * SCALE);
      offscreenCanvas.height = Math.ceil(height * SCALE);
    }

    const getMargins = () => {
      const isMobile = window.innerWidth < 768;
      const ratio = isMobile ? 0.04 : 0.08;
      return { left: window.innerWidth * ratio, right: window.innerWidth * (1 - ratio) };
    };
    let margins = getMargins();

    // Debounced resize to avoid thrashing
    let resizeRafId: number | null = null;
    const handleResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        if (offscreenCtx) {
          offscreenCanvas.width = Math.ceil(width * SCALE);
          offscreenCanvas.height = Math.ceil(height * SCALE);
        }
        margins = getMargins();
        // Rebuild stringDefs with new height
        for (let i = 0; i < STRING_COUNT; i++) {
          const harmonicOrder = i + 1;
          stringDefs[i].spatialFrequency = (Math.PI * harmonicOrder) / height;
        }
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const STRING_COUNT = 3;
    const stringDefs = Array.from({ length: STRING_COUNT }).map((_, i) => {
      const harmonicOrder = i + 1;
      return {
        harmonicOrder,
        amplitude: 65 - i * 14,
        spatialFrequency: (Math.PI * harmonicOrder) / height,
        temporalSpeed: 1 + i * 0.4,
        phaseOffset: (i * Math.PI) / 3,
        xOffset: (i - 1) * 14,
      };
    });

    let ampLerp = 1;
    let collapseX = 0;
    let glowLerp = 1;
    const LERP_IN = 0.05;
    const LERP_OUT = 0.02;

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

    const getStringX = (
      baseX: number,
      idx: number,
      y: number,
      t: number,
      amp: number,
      collapse: number,
      isLeft: boolean = true
    ): number => {
      const def = stringDefs[idx];
      const clampedY = Math.max(0, Math.min(height, y));
      const fixedEndEnvelope = Math.sin((clampedY / height) * Math.PI);

      const clusterFreqMult = isLeft ? 1.0 : 1.25;
      const clusterSpeedMult = isLeft ? 1.0 : 0.82;
      const clusterPhase = isLeft ? 0 : Math.PI * 0.9;

      const wave = Math.sin(
        clampedY * def.spatialFrequency * clusterFreqMult +
          t * def.temporalSpeed * clusterSpeedMult +
          def.phaseOffset +
          clusterPhase
      );

      const effectiveXOffset = def.xOffset * (1 - collapse) * fixedEndEnvelope;
      const effectiveAmp = def.amplitude * amp * fixedEndEnvelope * (isLeft ? 1.0 : 0.88);

      return baseX + effectiveXOffset + wave * effectiveAmp;
    };

    const CHROMA_PAIRS = [
      { left: { r: 0, g: 242, b: 255 }, right: { r: 255, g: 0, b: 127 } },
      { left: { r: 0, g: 102, b: 255 }, right: { r: 178, g: 0, b: 255 } },
      { left: { r: 0, g: 255, b: 136 }, right: { r: 255, g: 0, b: 85 } },
      { left: { r: 0, g: 191, b: 255 }, right: { r: 255, g: 60, b: 0 } },
      { left: { r: 0, g: 242, b: 255 }, right: { r: 210, g: 0, b: 255 } },
    ];

    const maxPoints = Math.ceil(window.innerHeight / 10) + 2;
    const pointsCache: { x: number; y: number }[] = Array.from({ length: maxPoints }, () => ({ x: 0, y: 0 }));

    const drawWavePathBezier = (
      targetCtx: CanvasRenderingContext2D,
      baseX: number,
      idx: number,
      t: number,
      amp: number,
      collapse: number,
      isLeft: boolean,
      offsetX: number,
      scale: number = 1.0
    ) => {
      targetCtx.beginPath();
      const Y_STEP = 10;
      let pointCount = 0;

      for (let y = 0; y <= height; y += Y_STEP) {
        const x = getStringX(baseX, idx, y, t, amp, collapse, isLeft) + offsetX;
        pointsCache[pointCount].x = x * scale;
        pointsCache[pointCount].y = y * scale;
        pointCount++;
      }
      if (height % Y_STEP !== 0) {
        const x = getStringX(baseX, idx, height, t, amp, collapse, isLeft) + offsetX;
        pointsCache[pointCount].x = x * scale;
        pointsCache[pointCount].y = height * scale;
        pointCount++;
      }

      if (pointCount === 0) return;

      targetCtx.moveTo(pointsCache[0].x, pointsCache[0].y);

      for (let i = 1; i < pointCount - 1; i++) {
        const xc = (pointsCache[i].x + pointsCache[i + 1].x) / 2;
        const yc = (pointsCache[i].y + pointsCache[i + 1].y) / 2;
        targetCtx.quadraticCurveTo(pointsCache[i].x, pointsCache[i].y, xc, yc);
      }

      if (pointCount > 1) {
        const last = pointsCache[pointCount - 1];
        targetCtx.lineTo(last.x, last.y);
      }
    };

    const createSpindleGradient = (
      targetCtx: CanvasRenderingContext2D,
      gradHeight: number,
      idx: number,
      isLeft: boolean,
      r: number,
      g: number,
      b: number,
      maxAlpha: number,
      phaseOffset: number
    ) => {
      const grad = targetCtx.createLinearGradient(0, 0, 0, gradHeight);
      const stops = 16;
      const speed = (0.12 + idx * 0.025) * (isLeft ? 1.0 : 0.76);
      const clusterDashPhase = isLeft ? 0 : 0.55;

      for (let s = 0; s <= stops; s++) {
        const u = s / stops;
        const phase = (u - time * speed + phaseOffset + clusterDashPhase) * Math.PI * 2.0;
        const wave = Math.max(0, Math.sin(phase));
        const taper = Math.pow(wave, 3.5);
        grad.addColorStop(u, `rgba(${r}, ${g}, ${b}, ${maxAlpha * taper})`);
      }
      return grad;
    };

    let isPageVisible = !document.hidden;
    const handleVisibility = () => {
      isPageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility, { passive: true });

    const render = () => {
      if (!isPageVisible) return;

      time += 0.007;

      ctx.clearRect(0, 0, width, height);

      if (offscreenCtx) {
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      }

      const velocity = useScrollStore.getState().velocity;
      const absVel = Math.abs(velocity);
      const isTension = absVel > 0.08;

      const lerpSpeed = isTension ? LERP_IN : LERP_OUT;
      const target = isTension ? 0 : 1;

      ampLerp += (target - ampLerp) * lerpSpeed;
      collapseX += ((isTension ? 1 : 0) - collapseX) * lerpSpeed;
      glowLerp += (target - glowLerp) * lerpSpeed;

      ampLerp = Math.max(0, Math.min(1, ampLerp));
      collapseX = Math.max(0, Math.min(1, collapseX));
      glowLerp = Math.max(0, Math.min(1, glowLerp));

      const IS_GLOW_ENABLED = false;
      if (offscreenCtx && IS_GLOW_ENABLED && glowLerp > 0.02) {
        offscreenCtx.save();
        offscreenCtx.globalCompositeOperation = "source-over";

        for (const cluster of ["left", "right"] as const) {
          const baseX = cluster === "left" ? margins.left : margins.right;
          const isLeft = cluster === "left";

          for (let i = STRING_COUNT - 1; i >= 0; i--) {
            const chroma = CHROMA_PAIRS[(i + (isLeft ? 0 : 2)) % CHROMA_PAIRS.length];
            const targetH = offscreenCanvas.height;

            const gradLeft1 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.left.r, chroma.left.g, chroma.left.b, 0.95 * glowLerp, 0);
            const gradRight1 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.right.r, chroma.right.g, chroma.right.b, 0.95 * glowLerp, 0.35);

            offscreenCtx.filter = `blur(${Math.round(16 * glowLerp * SCALE)}px)`;

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, -2.2, SCALE);
            offscreenCtx.strokeStyle = gradLeft1;
            offscreenCtx.lineWidth = 2.5;
            offscreenCtx.stroke();

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, 2.2, SCALE);
            offscreenCtx.strokeStyle = gradRight1;
            offscreenCtx.lineWidth = 2.5;
            offscreenCtx.stroke();

            const gradLeft2 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.left.r, chroma.left.g, chroma.left.b, 1.0 * glowLerp, 0);
            const gradRight2 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.right.r, chroma.right.g, chroma.right.b, 1.0 * glowLerp, 0.35);

            offscreenCtx.filter = `blur(${Math.round(7 * glowLerp * SCALE)}px)`;

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, -1.3, SCALE);
            offscreenCtx.strokeStyle = gradLeft2;
            offscreenCtx.lineWidth = 1.6;
            offscreenCtx.stroke();

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, 1.3, SCALE);
            offscreenCtx.strokeStyle = gradRight2;
            offscreenCtx.lineWidth = 1.6;
            offscreenCtx.stroke();

            const gradLeft3 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.left.r, chroma.left.g, chroma.left.b, 1.0 * glowLerp, 0);
            const gradRight3 = createSpindleGradient(offscreenCtx, targetH, i, isLeft, chroma.right.r, chroma.right.g, chroma.right.b, 1.0 * glowLerp, 0.35);

            offscreenCtx.filter = `blur(${Math.round(2.5 * glowLerp * SCALE)}px)`;

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, -0.6, SCALE);
            offscreenCtx.strokeStyle = gradLeft3;
            offscreenCtx.lineWidth = 1.0;
            offscreenCtx.stroke();

            drawWavePathBezier(offscreenCtx, baseX, i, time, ampLerp, collapseX, isLeft, 0.6, SCALE);
            offscreenCtx.strokeStyle = gradRight3;
            offscreenCtx.lineWidth = 1.0;
            offscreenCtx.stroke();
          }
        }
        offscreenCtx.restore();

        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(offscreenCanvas, 0, 0, width, height);
      }

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";

      for (const cluster of ["left", "right"] as const) {
        const baseX = cluster === "left" ? margins.left : margins.right;
        const isLeft = cluster === "left";

        for (let i = STRING_COUNT - 1; i >= 0; i--) {
          drawWavePathBezier(ctx, baseX, i, time, ampLerp, collapseX, isLeft, 0, 1.0);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      ctx.restore();

      const M = 1.8;
      for (const p of particles) {
        const isLeft = p.cluster === "left";
        const baseX = isLeft ? margins.left : margins.right;
        const dotSpeed = p.baseSpeed - velocity * M;
        p.y += dotSpeed;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        const px = getStringX(baseX, p.stringIndex, p.y, time, ampLerp, collapseX, isLeft);

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
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
      document.removeEventListener("visibilitychange", handleVisibility);
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
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
        zIndex: 1,
        filter: "none",
      }}
    />
  );
}
