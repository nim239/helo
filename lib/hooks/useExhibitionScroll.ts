"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';

// ============================================================
// WARP ENGINE CONSTANTS (T005)
// ============================================================
const WARP_GAIN = 0.001;       // Giảm mạnh độ nhạy (trước là 0.04 quá cao)
const WARP_FRICTION = 0.97;    // Phanh nhanh hơn một chút để dễ thoát warp (trước là 0.96)
const WARP_THRESHOLD = 0.85;   // Pool level to trigger WARPING
const WARP_EXIT_THRESHOLD = 0.01; // Pool level to exit WARPING (natural drain)
const WARP_ZUSTAND_SYNC_INTERVAL = 10; // Sync warpPool to Zustand every N frames (~6fps at 60fps)

// T026: Respect prefers-reduced-motion — skip warp accumulation entirely
const REDUCED_MOTION = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export function useExhibitionScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const setPhase = useScrollStore((state) => state.setPhase);
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const setVelocity = useScrollStore((state) => state.setVelocity);
  const setWarpPool = useScrollStore((state) => state.setWarpPool);

  // T005: warpPool lives as a ref — updated every frame (too fast for Zustand)
  const warpPoolRef = useRef<number>(0);
  const warpSyncFrameRef = useRef<number>(0);

  useEffect(() => {
    const sectionHeight = window.innerHeight;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.0,
      infinite: true,
    });

    lenisRef.current = lenis;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenis.resize();
        if (!useScrollStore.getState().isIntroComplete) {
          lenis.stop();
        }
      });
    });

    // Unlock scroll when Intro is done
    const unsubscribe = useScrollStore.subscribe((state) => {
      if (state.isIntroComplete && lenis.isStopped) {
        lenis.start();
      }
    });

    // Debug helper
    const dbg = (msg: string) => {
      try { window.dispatchEvent(new CustomEvent('lenis-debug', { detail: msg })); } catch (e) { }
    };

    let snapTimeout: ReturnType<typeof setTimeout>;
    let startScrollY = 0;
    let isDocumentVisible = true;

    const killSnap = () => {
      clearTimeout(snapTimeout);
    };

    // ============================================================
    // GSAP Ticker Sync & WARP ENGINE TICK
    // MANG ACCUMULATOR VÀO ĐÂY ĐỂ CHẠY LIÊN TỤC NGAY CẢ KHI DỪNG CUỘN
    // ============================================================
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);

      // T006: WARP POOL FRICTION ACCUMULATOR
      let newPool = warpPoolRef.current;
      if (!REDUCED_MOTION) {
        // Lấy vận tốc hiện tại của Lenis
        const velocity = lenis.velocity || 0;
        // Cắt bỏ phần vận tốc trễ của Lenis (chỉ tính lực khi user vuốt mạnh velocity > 15)
        const effectiveVelocity = Math.max(0, Math.abs(velocity) - 15);
        newPool += effectiveVelocity * WARP_GAIN;
        newPool *= WARP_FRICTION;
        newPool = Math.max(0, Math.min(1, newPool));
      }
      warpPoolRef.current = newPool;

      // T009: Throttled Zustand sync (~6fps at 60fps)
      warpSyncFrameRef.current++;
      if (warpSyncFrameRef.current >= WARP_ZUSTAND_SYNC_INTERVAL) {
        warpSyncFrameRef.current = 0;
        setWarpPool(newPool);
      }

      // T007: WARPING phase transitions
      const state = useScrollStore.getState();
      if (newPool >= WARP_THRESHOLD && state.currentPhase !== 'WARPING') {
        dbg(`WARP TRIGGER pool=${newPool.toFixed(2)}`);
        killSnap();
        setPhase('WARPING');
      } else if (newPool < WARP_EXIT_THRESHOLD && state.currentPhase === 'WARPING') {
        dbg(`WARP EXIT pool=${newPool.toFixed(2)}`);
        setPhase('IDLE');
        setWarpPool(0);
      }
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // T008: Visibility handler — reset warp on hidden + kill snap
    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) {
        killSnap();
        warpPoolRef.current = 0;
        setWarpPool(0);
        const currentState = useScrollStore.getState();
        if (currentState.currentPhase === 'WARPING') {
          setPhase('IDLE');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ============================================================
    // SCROLL EVENT: Progress + Snap (Chỉ xử lý phase scroll)
    // ============================================================
    lenis.on('scroll', ({ scroll, velocity }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      setScrollProgress(scroll / (currentH * 6));
      setVelocity(velocity);

      // Normal phase transitions (skip while WARPING)
      if (state.currentPhase !== 'WARPING') {
        if (Math.abs(velocity) > 0.1) {
          if (state.currentPhase !== 'SCROLLING') {
            setPhase('SCROLLING');
            startScrollY = scroll;
          }
          killSnap();
        } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
          setPhase('IDLE');
        }
      }

      // SNAP: skip if WARPING
      if (Math.abs(velocity) < 1.0 && !lenis.isStopped && state.currentPhase !== 'WARPING') {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          if (!isDocumentVisible) return;
          const s = useScrollStore.getState();
          if (!s.isIntroComplete) return;
          if (s.currentPhase === 'WARPING') return;
          if (Math.abs(lenis.velocity) > 0.5) return;

          const scrollRatio = lenis.scroll / currentH;
          const targetSection = Math.round(scrollRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 10) {
            dbg(`SNAP ${Math.round(lenis.scroll)} -> ${Math.round(targetSection)}`);
            lenis.scrollTo(targetSection, {
              duration: 3,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              lock: false,
              onComplete: () => {
                dbg(`SNAP DONE ${Math.round(targetSection)}`);
                startScrollY = targetSection;
              }
            });
          }
        }, 1000);
      }
    });

    // TOUCH: Kill snap + ensure Lenis running
    const handleTouch = () => {
      dbg(`TOUCH! stopped=${lenis.isStopped}`);
      killSnap();
      const currentState = useScrollStore.getState();
      if (currentState.currentPhase !== 'WARPING') {
        setPhase('SCROLLING');
      }
      startScrollY = lenis.scroll;
      if (lenis.isStopped && useScrollStore.getState().isIntroComplete) {
        lenis.start();
        dbg('FORCE lenis.start()');
      }
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('pointerdown', handleTouch, { passive: true });

    return () => {
      killSnap();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('pointerdown', handleTouch);
      unsubscribe();
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
    };
  }, [setPhase, setScrollProgress, setVelocity, setWarpPool]);

  return lenisRef;
}
