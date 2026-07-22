"use client";

import { useEffect, useLayoutEffect } from 'react';

export function useViewportSync() {
  useLayoutEffect(() => {
    const updateViewportHeight = () => {
      // Use clientHeight/innerHeight to get precise pixel values without address bar interference
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--section-height', `${vh}px`);
    };

    // Initial set
    updateViewportHeight();

    // Debounce resize events to prevent React/DOM thrashing
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewportHeight, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
}
