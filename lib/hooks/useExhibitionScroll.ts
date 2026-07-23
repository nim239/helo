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
    let isSnapping = false; // Cờ theo dõi trạng thái programatic snap
    let isReady = false;

    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) {
        clearTimeout(snapTimeout); // Fix Lỗi 3.1: Đóng băng snap khi ẩn app
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Teleport and State Logic
    lenis.on('scroll', ({ scroll, velocity, direction }: { scroll: number, velocity: number, direction: number }) => {
      const state = useScrollStore.getState();
      const currentH = window.innerHeight;

      // Fix Lỗi 1: Trình duyệt ép scrollY = 0 lúc mới load hoặc bị kéo văng lên đỉnh khi chưa xong intro
      if (!isReady) {
        if (Math.abs(scroll - initialOffset) < 5) {
          isReady = true;
        } else {
          lenis.scrollTo(initialOffset, { immediate: true });
          return;
        }
      }

      // Update normalized progress
      const maxScroll = currentH * 11; // 12 sections total
      setScrollProgress(scroll / maxScroll);

      // Handle Phase transitions based on velocity
      if (Math.abs(velocity) > 0.1) {
        if (!isSnapping && state.currentPhase !== 'SCROLLING' && state.currentPhase !== 'TELEPORTING') {
          setPhase('SCROLLING');
          startScrollY = scroll; // Fix Lỗi 3.2: Chỉ lưu tọa độ khi NGƯỜI DÙNG thực sự vuốt
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
          if (!isDocumentVisible) return; // Fix Lỗi 3.1: Không snap nếu app đang bị ẩn
          
          const currentState = useScrollStore.getState();
          if (currentState.teleportCooldownActive || !currentState.isIntroComplete) return;
          
          // BẢO VỆ ANDROID CHROME: Hủy snap nếu momentum cuộn tự nhiên vẫn đang chạy
          if (Math.abs(lenis.velocity) > 0.1) return;

          // Fix Lỗi 3.2: Chỉ snap nếu vuốt một đoạn đủ dài (vài ba pixel rác thì bỏ qua)
          if (Math.abs(lenis.scroll - startScrollY) < 5) return;

          // Forward-Only Snapping (Constitution Rule 6)
          if (direction === -1) return;
          
          const scrollRatio = lenis.scroll / currentH;
          // Fix Lỗi 1: BẪY INFINITE SNAP. Tránh việc sai số dấu phẩy động 0.0001 làm Math.ceil đẩy target lên mãi mãi
          const safeRatio = Math.abs(scrollRatio - Math.round(scrollRatio)) < 0.01 
            ? Math.round(scrollRatio) 
            : scrollRatio;
            
          const targetSection = Math.ceil(safeRatio) * currentH;

          if (Math.abs(lenis.scroll - targetSection) > 5) {
            isSnapping = true;
            lenis.scrollTo(targetSection, {
              duration: 1.8,
              easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
              onComplete: () => { 
                isSnapping = false; 
                startScrollY = targetSection; // Fix Lỗi 3.2: Đặt lại mốc bảo vệ sau khi snap thành công
              }
            });
          }
        }, 250); // Tăng delay lên 250ms để đợi momentum kết thúc hẳn
      }
    });

    // Fix LỖI 2: Liệt Touch trên Vercel. Kỹ thuật "Khóa mõm window.scrollTo":
    // Dùng Public API của Lenis để ép nó hủy animation, nhưng chặn đứng lệnh window.scrollTo nội bộ của nó
    // để trình duyệt Android không bị cướp cò dẫn đến liệt Touch.
    const handleTouch = () => {
      clearTimeout(snapTimeout);
      isSnapping = false;
      setPhase('SCROLLING');
      startScrollY = window.scrollY; // Cập nhật mốc vuốt ngay lập tức
      
      if (lenisRef.current) {
        const originalScrollTo = window.scrollTo;
        window.scrollTo = () => {}; // Tạm thời khóa mõm
        
        // Gọi lệnh scrollTo(immediate) để Lenis tự xóa mọi trạng thái animation nội suy
        lenisRef.current.scrollTo(window.scrollY, { immediate: true });
        
        window.scrollTo = originalScrollTo; // Trả lại bình thường ngay tắp lự
      }
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('pointerdown', handleTouch, { passive: true });

    return () => {
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
