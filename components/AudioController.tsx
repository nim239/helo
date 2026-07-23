"use client";

import { useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store/useAppStore';
import { useScrollStore } from '../lib/store/useScrollStore';
import gsap from 'gsap';

export function AudioController() {
  const audioEnabled = useAppStore(state => state.audioEnabled);
  const velocity = useScrollStore(state => state.velocity);
  
  const ctxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioEnabled) return;
    if (ctxRef.current) return; // Already initialized

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // Create a drone sound using two oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 432; // Healing frequency A

      osc2.type = 'triangle';
      osc2.frequency.value = 528; // Healing frequency C

      filter.type = 'lowpass';
      filter.frequency.value = 800; // Base cutoff for higher pitch
      filter.Q.value = 2;

      gain.gain.value = 0; // Start silent

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      filterRef.current = filter;
      gainRef.current = gain;

      // Fade in base drone to approx -40dB (0.01 linear gain)
      gsap.to(gain.gain, { value: 0.005, duration: 2, ease: "power2.inOut" });

    } catch (e) {
      console.warn("Web Audio API failed to initialize", e);
    }

    return () => {
      if (ctxRef.current) {
        ctxRef.current.close();
      }
    };
  }, [audioEnabled]);

  // Modulate sound based on velocity
  useEffect(() => {
    if (!filterRef.current || !gainRef.current) return;

    const absVel = Math.abs(velocity);
    
    // Map velocity (0 to ~150+) to frequency cutoff (800Hz to 6000Hz)
    const targetFreq = 800 + Math.min(absVel * 30, 6000);
    // Map velocity to volume bump, maxing out around -40dB (~0.01)
    const targetGain = 0.005 + Math.min(absVel * 0.0001, 0.01);

    // Smoothly interpolate audio params
    gsap.to(filterRef.current.frequency, {
      value: targetFreq,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true,
    });

    gsap.to(gainRef.current.gain, {
      value: targetGain,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [velocity]);

  return null;
}
