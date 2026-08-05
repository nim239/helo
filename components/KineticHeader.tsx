"use client";

import { useRef, useEffect } from 'react';
import { useScrollStore } from '../lib/store/useScrollStore';
import gsap from 'gsap';

// Math lerp function
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

interface KineticHeaderProps {
  text1: string;
  text2: string;
  gradientOn?: 1 | 2 | 'both';
  w1WeightRange?: [number, number];
  w2WeightRange?: [number, number];
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL TICKER REGISTRY
// Instead of each KineticHeader instance registering its own GSAP ticker,
// all instances share a single global ticker — cutting 5 tickers → 1.
// ─────────────────────────────────────────────────────────────────────────────
type HeaderEntry = {
  word1: HTMLHeadingElement;
  word2: HTMLHeadingElement;
  smoothV: { current: number };
  w1WeightRange: [number, number];
  w2WeightRange: [number, number];
};

const _registry = new Set<HeaderEntry>();
let _tickerActive = false;

function _globalTicker() {
  const state = useScrollStore.getState();
  const rawV = Math.min(Math.abs(state.velocity) * 0.45, 1.0);

  for (const entry of _registry) {
    // Independent damped smoothV per header
    entry.smoothV.current = lerp(entry.smoothV.current, rawV, 0.18);
    const v = entry.smoothV.current;

    const w1Weight = lerp(entry.w1WeightRange[0], entry.w1WeightRange[1], v);
    const w1Stretch = lerp(100, 180, v);
    const w2Weight = lerp(entry.w2WeightRange[0], entry.w2WeightRange[1], v);
    const w2Stretch = lerp(100, 35, v);

    entry.word1.style.fontVariationSettings = `"wght" ${w1Weight}, "wdth" ${w1Stretch}`;
    entry.word2.style.fontVariationSettings = `"wght" ${w2Weight}, "wdth" ${w2Stretch}`;
  }
}

function registerHeader(entry: HeaderEntry) {
  _registry.add(entry);
  if (!_tickerActive) {
    gsap.ticker.add(_globalTicker);
    _tickerActive = true;
  }
}

function unregisterHeader(entry: HeaderEntry) {
  _registry.delete(entry);
  if (_registry.size === 0 && _tickerActive) {
    gsap.ticker.remove(_globalTicker);
    _tickerActive = false;
  }
}

export function KineticHeader({ 
  text1 = "CGI", 
  text2 = "SHOWCASE", 
  gradientOn = 1,
  w1WeightRange = [400, 900],
  w2WeightRange = [400, 100]
}: KineticHeaderProps) {
  const word1Ref = useRef<HTMLHeadingElement>(null);
  const word2Ref = useRef<HTMLHeadingElement>(null);
  const smoothV = useRef(0);
  const entryRef = useRef<HeaderEntry | null>(null);

  useEffect(() => {
    if (!word1Ref.current || !word2Ref.current) return;

    const entry: HeaderEntry = {
      word1: word1Ref.current,
      word2: word2Ref.current,
      smoothV,
      w1WeightRange,
      w2WeightRange,
    };

    entryRef.current = entry;
    registerHeader(entry);

    return () => {
      unregisterHeader(entry);
    };
  }, [w1WeightRange, w2WeightRange]);

  const getGradientClass = (wordNumber: 1 | 2) => {
    return gradientOn === wordNumber || gradientOn === 'both'
      ? "bg-gradient-to-r from-[#00F2FF] via-[#FF007F] to-[#0066FF] bg-clip-text text-transparent"
      : "text-white";
  };

  return (
    <div className="w-full flex items-baseline gap-[0.25em] overflow-hidden">
      <h2
        ref={word1Ref}
        className={`text-[6vw] leading-none uppercase font-black tracking-tighter whitespace-nowrap backface-hidden transform-gpu ${getGradientClass(1)}`}
        style={{ fontVariationSettings: `"wght" ${w1WeightRange[0]}, "wdth" 100` }}
      >
        {text1}
      </h2>
      <h2
        ref={word2Ref}
        className={`text-[6vw] leading-none uppercase font-black tracking-tighter whitespace-nowrap backface-hidden transform-gpu ${getGradientClass(2)}`}
        style={{ fontVariationSettings: `"wght" ${w2WeightRange[0]}, "wdth" 100` }}
      >
        {text2}
      </h2>
    </div>
  );
}
