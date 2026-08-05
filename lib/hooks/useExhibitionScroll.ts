"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';

export function useExhibitionScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const setPhase = useScrollStore((state) => state.setPhase);
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const setVelocity = useScrollStore((state) => state.setVelocity);

  useEffect(() => {
    const sectionHeight = window.innerHeight;
    const initialOffset = sectionHeight * 3;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 4.5, // Smooth slow motion (3~6s range)
      // easeInOutCubic: Easy-in Easy-out mượt mà chuẩn triển lãm
      easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 0.6, // Giảm tốc độ vuốt màn hình mobile (nặng & đầm)
      wheelMultiplier: 0.8, // Giảm tốc độ cuộn chuột desktop
      infinite: true, // NATIVE INFINITE SCROLL
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

    // GSAP Ticker Sync
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

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

    // Visibility handler (Fix Lỗi 3: switch app)
    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) { killSnap(); }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ============================================================
    // SCROLL EVENT: Progress + Snap
    // ============================================================
    lenis.on('scroll', ({ scroll, velocity, direction }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      // Progress (0 to 1 based on 6 real sections)
      setScrollProgress(scroll / (currentH * 6));
      setVelocity(velocity);

      // Phase transitions
      if (Math.abs(velocity) > 0.1) {
        if (state.currentPhase !== 'SCROLLING') {
          setPhase('SCROLLING');
          startScrollY = scroll;
        }
        killSnap(); // Nếu user đang cuộn thì hủy mọi snap
      } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
        setPhase('IDLE');
      }

      // ============================================================
      // SNAP: trigger when velocity settles near zero
      // ============================================================
      if (Math.abs(velocity) < 1.0 && !lenis.isStopped) {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          if (!isDocumentVisible) return;
          const s = useScrollStore.getState();
          if (!s.isIntroComplete) return;
          if (Math.abs(lenis.velocity) > 0.5) return; // still moving

          const scrollRatio = lenis.scroll / currentH;
          const targetSection = Math.round(scrollRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 10) {
            dbg(`SNAP ${Math.round(lenis.scroll)} → ${Math.round(targetSection)}`);
            lenis.scrollTo(targetSection, {
              duration: 2.5,
              easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
              lock: false,
              onComplete: () => {
                dbg(`SNAP DONE ${Math.round(targetSection)}`);
                startScrollY = targetSection;
              }
            });
          }
        }, 200);
      }
    });

    // ============================================================
    // TOUCH: Kill snap + đảm bảo Lenis đang chạy
    // ============================================================
    const handleTouch = () => {
      dbg(`TOUCH! stopped=${lenis.isStopped}`);
      killSnap();
      setPhase('SCROLLING');
      startScrollY = lenis.scroll;
      // Đảm bảo Lenis luôn chạy khi user chạm (chỉ khi đã qua intro)
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
  }, [setPhase, setScrollProgress, setVelocity]);

  return lenisRef;
}
