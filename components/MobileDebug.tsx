"use client";

import { useEffect, useState } from 'react';

/**
 * Debug overlay hiển thị trên mobile để chẩn đoán lỗi liệt touch.
 * Xóa component này sau khi fix xong bug.
 */
export function MobileDebug() {
  const [log, setLog] = useState<string[]>([]);
  const [touchCount, setTouchCount] = useState(0);

  useEffect(() => {
    const addLog = (msg: string) => {
      setLog(prev => [...prev.slice(-8), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    // Track touch events
    const onTouchStart = (e: TouchEvent) => {
      setTouchCount(prev => prev + 1);
      addLog(`TOUCH (${e.touches.length} finger) target=${(e.target as HTMLElement)?.tagName}.${(e.target as HTMLElement)?.className?.split(' ')[0] || ''}`);
    };

    // Track scroll
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const diff = window.scrollY - lastScroll;
      if (Math.abs(diff) > 50) {
        addLog(`SCROLL Δ${Math.round(diff)}px → ${Math.round(window.scrollY)}px`);
      }
      lastScroll = window.scrollY;
    };

    // Track Lenis state via custom event (injected from useExhibitionScroll)
    const onLenisDebug = (e: CustomEvent) => {
      addLog(e.detail);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('lenis-debug' as any, onLenisDebug as EventListener);

    return () => {
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('lenis-debug' as any, onLenisDebug as EventListener);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/90 text-green-400 text-[10px] font-mono p-2 max-h-[30vh] overflow-y-auto"
      style={{ pointerEvents: 'none' }}
    >
      <div className="text-yellow-400 mb-1">🔍 DEBUG | Touches: {touchCount}</div>
      {log.map((l, i) => (
        <div key={i} className="opacity-80">{l}</div>
      ))}
    </div>
  );
}
