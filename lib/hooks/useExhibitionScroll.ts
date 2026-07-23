"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';

export function useExhibitionScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const setPhase = useScrollStore((state) => state.setPhase);
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const triggerTeleport = useScrollStore((state) => state.triggerTeleport);

  useEffect(() => {
    const sectionHeight = window.innerHeight;
    const initialOffset = sectionHeight * 3;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 2.5,
      easing: (t) => 1 - Math.pow(1 - t, 4), // Quart Out cho đuôi ease-out dài hơn
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,         // ← QUAN TRỌNG: Lenis quản lý touch thay vì để native
      touchMultiplier: 1.5,    // ← Tăng độ nhạy touch
      wheelMultiplier: 1.0,
    });

    lenisRef.current = lenis;

    // Force initial position
    window.scrollTo(0, initialOffset);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenis.resize();
        lenis.scrollTo(initialOffset, { immediate: true });

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
      try { window.dispatchEvent(new CustomEvent('lenis-debug', { detail: msg })); } catch(e) {}
    };
    dbg(`INIT syncTouch=true offset=${initialOffset}`);

    let snapTimeout: ReturnType<typeof setTimeout>;
    let startScrollY = initialOffset;
    let isDocumentVisible = true;
    let snapTween: gsap.core.Tween | null = null;

    const killSnap = () => {
      clearTimeout(snapTimeout);
      if (snapTween) { snapTween.kill(); snapTween = null; }
    };

    // Visibility handler (Fix Lỗi 3: switch app)
    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) { killSnap(); }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ============================================================
    // SCROLL EVENT: Teleport + Progress + Snap
    // ============================================================
    lenis.on('scroll', ({ scroll, velocity, direction }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      // Progress
      setScrollProgress(scroll / (currentH * 11));

      // Phase transitions
      if (Math.abs(velocity) > 0.1) {
        if (state.currentPhase !== 'SCROLLING' && state.currentPhase !== 'TELEPORTING') {
          setPhase('SCROLLING');
          startScrollY = scroll;
        }
        killSnap(); // Nếu user đang cuộn thì hủy mọi snap
      } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
        setPhase('IDLE');
      }

      // Teleport boundaries
      if (scroll >= currentH * 9 && !state.teleportCooldownActive) {
        triggerTeleport();
        lenis.scrollTo(scroll - (currentH * 6), { immediate: true });
      }
      if (scroll <= currentH * 2 && !state.teleportCooldownActive) {
        triggerTeleport();
        lenis.scrollTo(scroll + (currentH * 6), { immediate: true });
      }

      // ============================================================
      // SNAP: GSAP tween proxy → lenis.scrollTo(immediate) mỗi frame
      // An toàn vì syncTouch=true → lenis.scrollTo(immediate) đi qua
      // virtual scroll, KHÔNG gọi window.scrollTo trực tiếp
      // ============================================================
      if (Math.abs(velocity) < 0.3 && !lenis.isStopped) {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          if (!isDocumentVisible) return;
          const s = useScrollStore.getState();
          if (s.teleportCooldownActive || !s.isIntroComplete) return;
          if (Math.abs(lenis.velocity) > 0.05) return;
          if (Math.abs(lenis.scroll - startScrollY) < 5) return;
          if (direction === -1) return; // Forward-Only

          const scrollRatio = lenis.scroll / currentH;
          const safeRatio = Math.abs(scrollRatio - Math.round(scrollRatio)) < 0.02
            ? Math.round(scrollRatio)
            : scrollRatio;
          const targetSection = Math.ceil(safeRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 5) {
            dbg(`SNAP ${Math.round(lenis.scroll)} → ${Math.round(targetSection)}`);
            
            if (snapTween) { snapTween.kill(); }
            const proxy = { y: lenis.scroll };
            snapTween = gsap.to(proxy, {
              y: targetSection,
              duration: 3,
              ease: 'power2.inOut',
              onUpdate: () => {
                lenis.scrollTo(proxy.y, { immediate: true });
              },
              onComplete: () => {
                dbg(`SNAP DONE ${Math.round(targetSection)}`);
                startScrollY = targetSection;
                snapTween = null;
              },
            });
          }
        }, 350);
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
      // Đảm bảo Lenis luôn chạy khi user chạm
      if (lenis.isStopped) {
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
  }, [setPhase, setScrollProgress, triggerTeleport]);

  return lenisRef;
}
