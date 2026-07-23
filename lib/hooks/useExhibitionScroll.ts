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

    // Teleport and State Logic
    lenis.on('scroll', ({ scroll, velocity, direction }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      // Update normalized progress
      const maxScroll = currentH * 11; // 12 sections total
      setScrollProgress(scroll / maxScroll);

      // Handle Phase transitions based on velocity
      if (Math.abs(velocity) > 0.1) {
        if (state.currentPhase !== 'SCROLLING' && state.currentPhase !== 'TELEPORTING') {
          setPhase('SCROLLING');
        }
        clearTimeout(snapTimeout);
      } else if (Math.abs(velocity) <= 0.1 && state.currentPhase === 'SCROLLING') {
        setPhase('IDLE');
      }

      // Teleport boundaries based on Spec
      if (scroll >= currentH * 9) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          const target = scroll - (currentH * 6);
          lenis.scrollTo(target, { immediate: true });
        }
      }

      if (scroll <= currentH * 2) {
        if (!state.teleportCooldownActive) {
          triggerTeleport();
          const target = scroll + (currentH * 6);
          lenis.scrollTo(target, { immediate: true });
        }
      }

      // Scroll Snap Logic
      if (Math.abs(velocity) < 0.5) {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          const currentState = useScrollStore.getState();
          if (currentState.teleportCooldownActive || !currentState.isIntroComplete) return;
          
          // BẢO VỆ ANDROID CHROME: Hủy snap nếu momentum cuộn tự nhiên vẫn đang chạy
          if (Math.abs(lenis.velocity) > 0.1) return;

          // Forward-Only Snapping (Constitution Rule 6)
          // Chỉ snap xuống dưới (forward), không bao giờ snap ngược lên trên.
          if (direction === -1) return; // Nếu đang cuộn ngược lên, hủy snap.
          
          const scrollRatio = lenis.scroll / currentH;
          const targetSection = Math.ceil(scrollRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 5) {
            lenis.scrollTo(targetSection, {
              duration: 1.8, // Giảm từ 7.5s xuống 1.8s để tránh treo luồng cuộn trên Android
              easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            });
          }
        }, 250); // Tăng delay lên 250ms để đợi momentum kết thúc hẳn
      }
    });

    // BẢO VỆ ANDROID CHROME: Cho phép người dùng chạm để ngắt ngang animation
    const handleTouch = () => {
      clearTimeout(snapTimeout);
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      unsubscribe();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, [setPhase, setScrollProgress, triggerTeleport]);

  return lenisRef;
}
