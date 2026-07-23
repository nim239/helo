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
    // Determine section height dynamically
    const sectionHeight = window.innerHeight;

    // Initial start at Section 1 (Index 3, bypassing the 3 clones at the top)
    const initialOffset = sectionHeight * 3;

    // Ensure browser doesn't try to restore scroll position and mess up our Buffer math
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    lenisRef.current = lenis;

    // Force immediate scroll to Section 1 (Real) before anything renders
    window.scrollTo(0, initialOffset);

    // Wait for the DOM to be fully populated so Lenis doesn't clamp to 0
    requestAnimationFrame(() => {
      // One more RAF to ensure layout is calculated
      requestAnimationFrame(() => {
        lenis.resize(); // Force Lenis to measure new DOM height
        lenis.scrollTo(initialOffset, { immediate: true });

        // Initially lock scroll until Intro finishes
        if (!useScrollStore.getState().isIntroComplete) {
          lenis.stop();
        }
      });
    });

    // Subscribe to store to unlock scroll when Intro is done
    const unsubscribe = useScrollStore.subscribe((state) => {
      if (state.isIntroComplete) {
        lenis.start();
      }
    });

    // GSAP Ticker Sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    let snapTimeout: ReturnType<typeof setTimeout>;
    let startScrollY = initialOffset;
    let isDocumentVisible = true;
    let isSnapping = false;
    let isReady = false;
    let snapTween: gsap.core.Tween | null = null; // GSAP tween thay thế lenis.scrollTo(animated)

    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) {
        clearTimeout(snapTimeout);
        if (snapTween) { snapTween.kill(); snapTween = null; isSnapping = false; }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Teleport and State Logic
    lenis.on('scroll', ({ scroll, velocity, direction }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      // Chặn scroll ở vị trí sai lúc load
      if (!isReady) {
        if (Math.abs(scroll - initialOffset) < 5) {
          isReady = true;
        } else {
          lenis.scrollTo(initialOffset, { immediate: true });
          return;
        }
      }

      // Update normalized progress
      const maxScroll = currentH * 11;
      setScrollProgress(scroll / maxScroll);

      // Handle Phase transitions based on velocity
      if (Math.abs(velocity) > 0.1) {
        if (!isSnapping && state.currentPhase !== 'SCROLLING' && state.currentPhase !== 'TELEPORTING') {
          setPhase('SCROLLING');
          startScrollY = scroll;
        }
        clearTimeout(snapTimeout);
      } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
        setPhase('IDLE');
      }

      // Teleport boundaries (immediate only — no animation state involved)
      if (scroll >= currentH * 9) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          lenis.scrollTo(scroll - (currentH * 6), { immediate: true });
        }
      }
      if (scroll <= currentH * 2) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          lenis.scrollTo(scroll + (currentH * 6), { immediate: true });
        }
      }

      // ============================================================
      // SNAP LOGIC: Dùng GSAP tween thay vì lenis.scrollTo(animated)
      // Lenis KHÔNG BAO GIỜ vào trạng thái animated → KHÔNG BAO GIỜ khóa Touch
      // ============================================================
      if (Math.abs(velocity) < 0.5) {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          if (!isDocumentVisible) return;
          const currentState = useScrollStore.getState();
          if (currentState.teleportCooldownActive || !currentState.isIntroComplete) return;
          if (Math.abs(lenis.velocity) > 0.1) return;
          if (Math.abs(lenis.scroll - startScrollY) < 5) return;
          if (direction === -1) return; // Forward-Only Snapping

          const scrollRatio = lenis.scroll / currentH;
          const safeRatio = Math.abs(scrollRatio - Math.round(scrollRatio)) < 0.01
            ? Math.round(scrollRatio)
            : scrollRatio;
          const targetSection = Math.ceil(safeRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 5) {
            isSnapping = true;
            // Kill bất kỳ snap cũ nào đang chạy
            if (snapTween) { snapTween.kill(); }

            // GSAP tween proxy object, mỗi frame gọi lenis.scrollTo(immediate)
            // → Lenis chỉ thấy "ai đó nhảy scroll", KHÔNG vào trạng thái animated
            const proxy = { y: lenis.scroll };
            snapTween = gsap.to(proxy, {
              y: targetSection,
              duration: 1.8,
              ease: 'power3.inOut',
              onUpdate: () => {
                lenis.scrollTo(proxy.y, { immediate: true });
              },
              onComplete: () => {
                isSnapping = false;
                startScrollY = targetSection;
                snapTween = null;
              },
            });
          }
        }, 250);
      }
    });

    // ============================================================
    // TOUCH HANDLER: Chỉ cần gsap.kill() — 100% đáng tin cậy
    // Không chọc vào Lenis internal state, không hack window.scrollTo
    // ============================================================
    const handleTouch = () => {
      clearTimeout(snapTimeout);
      if (snapTween) {
        snapTween.kill();
        snapTween = null;
      }
      isSnapping = false;
      setPhase('SCROLLING');
      startScrollY = lenis.scroll;
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('pointerdown', handleTouch, { passive: true });

    return () => {
      if (snapTween) { snapTween.kill(); }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('pointerdown', handleTouch);
      unsubscribe();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, [setPhase, setScrollProgress, triggerTeleport]);

  return lenisRef;
}
