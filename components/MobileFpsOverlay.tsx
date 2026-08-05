"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * MobileFpsOverlay
 * Kích hoạt: Tap 5 lần liên tiếp (trong 2.5s) vào vùng logo "N" (top-center).
 * Hiển thị: FPS counter real-time với màu gradient ngay dưới chữ N trên header.
 */

const GRADIENT = "linear-gradient(135deg, #00F2FF 0%, #FF007F 50%, #0066FF 100%)";
const TAP_COUNT_REQUIRED = 5;
const TAP_WINDOW_MS = 2500;

export function MobileFpsOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCountRef = useRef<number>(0);

  // FPS Measurement Loop
  useEffect(() => {
    if (!isVisible) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const measure = (now: number) => {
      frameCountRef.current++;
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(measuredFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(measure);
    };

    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    rafRef.current = requestAnimationFrame(measure);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isVisible]);

  // Tap Handler
  const handleTap = useCallback(() => {
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);

    if (tapCountRef.current >= TAP_COUNT_REQUIRED) {
      setIsVisible(prev => !prev);
      tapCountRef.current = 0;
      setTapCount(0);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      return;
    }

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      setTapCount(0);
    }, TAP_WINDOW_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  // FPS color
  const fpsColor = fps >= 50 ? "#00FF88" : fps >= 30 ? "#FFD700" : "#FF4444";
  const barPct = Math.min(100, Math.round((fps / 120) * 100));

  return (
    <>
      {/* Invisible Tap Zone - covers "N" area at top center */}
      <div
        id="fps-tap-zone"
        aria-label="Tap 5 times to toggle FPS overlay"
        onPointerUp={handleTap}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] md:hidden"
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: tapCount > 0
            ? `radial-gradient(circle, rgba(0,242,255,${(tapCount * 0.06).toFixed(2)}) 0%, transparent 70%)`
            : "transparent",
          transition: "background 0.15s ease",
          touchAction: "manipulation",
          userSelect: "none",
        }}
      />

      {/* Tap Progress Dots */}
      {tapCount > 0 && (
        <div className="fixed top-[92px] left-1/2 -translate-x-1/2 z-[201] flex gap-1.5 md:hidden pointer-events-none">
          {Array.from({ length: TAP_COUNT_REQUIRED }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-150"
              style={{
                background: i < tapCount ? GRADIENT : "rgba(255,255,255,0.2)",
                boxShadow: i < tapCount ? "0 0 6px rgba(0,242,255,0.7)" : "none",
                transform: i < tapCount ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}

      {/* FPS Panel */}
      {isVisible && (
        <div
          id="mobile-fps-overlay"
          className="fixed z-[199] md:hidden pointer-events-none"
          style={{
            top: "108px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="relative flex flex-col items-center px-4 py-2 rounded-xl"
            style={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              minWidth: "112px",
              boxShadow: "0 0 20px rgba(0,242,255,0.15), 0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {/* Gradient top accent line */}
            <div
              className="absolute top-0 left-3 right-3 h-[1px] rounded-full"
              style={{ background: GRADIENT }}
            />

            {/* FPS Number */}
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span
                className="font-mono font-black text-3xl leading-none tabular-nums"
                style={{
                  color: fpsColor,
                  textShadow: `0 0 14px ${fpsColor}90`,
                  transition: "color 0.4s ease, text-shadow 0.4s ease",
                }}
              >
                {fps}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase self-end mb-0.5">
                FPS
              </span>
            </div>

            {/* Progress Bar */}
            <div
              className="mt-2 w-full h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barPct}%`,
                  background: GRADIENT,
                  boxShadow: "0 0 6px rgba(0,242,255,0.5)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Label */}
            <div className="font-mono text-[8px] tracking-[0.3em] text-white/25 uppercase mt-1 mb-0.5">
              REAL-TIME
            </div>
          </div>
        </div>
      )}
    </>
  );
}
