"use client";

import { useScrollStore } from '../store/useScrollStore';

export function useKineticTypography() {
  const velocity = useScrollStore((state) => state.velocity);
  const absVel = Math.abs(velocity);

  // Dynamic scaleX distortion during high scroll velocity
  const scaleX = 1 + Math.min(absVel * 0.035, 0.3);
  // Dynamic font weight expansion
  const fontWeight = Math.min(900, Math.round(700 + Math.min(absVel * 120, 200)));

  return {
    style: {
      transform: `scaleX(${scaleX})`,
      transformOrigin: 'left center',
      fontWeight,
      transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), font-weight 0.15s ease-out',
    } as React.CSSProperties,
    scaleX,
    fontWeight,
  };
}
