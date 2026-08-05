"use client";

import { useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store/useAppStore';
import gsap from 'gsap';
import { useScrollStore } from '../lib/store/useScrollStore';

// ============================================================
// SHEPARD TONE GENERATOR — Web Audio API (no external files)
// A psychoacoustic illusion: sounds like it rises forever
// Built from stacked octave oscillators with a bell-curve
// amplitude envelope fading top & bottom harmonics out.
// ============================================================

const NUM_VOICES = 8;          // Number of stacked octave partials
const BASE_FREQ = 55;          // A1 — lowest octave base
const CYCLE_DURATION = 8;      // Seconds per full "rising" loop
const DAMPING = 0.06;          // Velocity lerp factor

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function AudioController() {
  const audioEnabled = useAppStore(state => state.audioEnabled);

  const ctxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const smoothVRef = useRef(0);

  useEffect(() => {
    if (!audioEnabled) return;
    if (ctxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass() as AudioContext;
      ctxRef.current = ctx;
      startTimeRef.current = ctx.currentTime;

      // Master gain — fades in after user interaction
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Biquad filter — modulated by scroll velocity
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 1.2;
      filter.connect(masterGain);
      filterRef.current = filter;

      // Create reverb (convolver with impulse response)
      const convolver = ctx.createConvolver();
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.35;

      // Simple impulse response generator for reverb
      const sampleRate = ctx.sampleRate;
      const reverbLength = sampleRate * 2.5; // 2.5s tail
      const impulse = ctx.createBuffer(2, reverbLength, sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = impulse.getChannelData(c);
        for (let i = 0; i < reverbLength; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 3.5);
        }
      }
      convolver.buffer = impulse;
      filter.connect(convolver);
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);

      // ── BUILD SHEPARD TONE VOICES ──
      // Each voice = one octave, stacked NUM_VOICES times.
      // Amplitude follows a bell-curve (loudest in middle octaves,
      // silent at the top and bottom) — this is the psychoacoustic trick.
      const oscs: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      for (let i = 0; i < NUM_VOICES; i++) {
        const osc = ctx.createOscillator();
        const voiceGain = ctx.createGain();

        osc.type = 'sine';
        // Each voice starts at a different octave
        osc.frequency.value = BASE_FREQ * Math.pow(2, i);

        // Bell-curve amplitude envelope: voice in the middle = loudest
        // Voices at the extremes = nearly silent
        const bellPos = i / (NUM_VOICES - 1); // 0.0 → 1.0
        const bellAmp = Math.exp(-Math.pow((bellPos - 0.5) * 3.2, 2));
        voiceGain.gain.value = bellAmp * 0.12;

        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start();

        oscs.push(osc);
        gains.push(voiceGain);
      }

      oscillatorsRef.current = oscs;
      gainNodesRef.current = gains;

      // Fade in master volume gently
      gsap.to(masterGain.gain, { value: 0.55, duration: 3.5, ease: 'power2.inOut' });

    } catch (e) {
      console.warn('Shepard Tone — Web Audio API failed:', e);
    }

    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [audioEnabled]);

  // ── REAL-TIME SHEPARD TONE PITCH RISE (GSAP ticker) ──
  useEffect(() => {
    if (!audioEnabled) return;

    const ticker = () => {
      const ctx = ctxRef.current;
      const oscs = oscillatorsRef.current;
      const gains = gainNodesRef.current;
      if (!ctx || oscs.length === 0) return;

      // Time-based progress through the illusion cycle (0 → 1, loops)
      const elapsed = ctx.currentTime - startTimeRef.current;
      const cycleProgress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION; // 0 → 1

      // Scroll velocity → filter and gain modulation
      const state = useScrollStore.getState();
      const rawV = Math.min(Math.abs(state.velocity) * 0.1, 1.0);
      smoothVRef.current = lerp(smoothVRef.current, rawV, DAMPING);
      const vNorm = smoothVRef.current;

      // Modulate filter cutoff: idle = dark (200Hz), fast scroll = bright (2400Hz)
      if (filterRef.current) {
        filterRef.current.frequency.value = lerp(200, 2400, vNorm);
      }

      // Modulate master volume: idle = whisper, scroll = full presence
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = lerp(0.12, 0.75, vNorm);
      }

      // ── SHEPARD ILLUSION: SHIFT ALL VOICE FREQUENCIES ──
      // Each voice pitches up smoothly within its octave window.
      // As it exits the top of its octave, the bell-curve gain fades it
      // to silence while the next lower voice fades back in — creating
      // the perception of infinite ascent.
      for (let i = 0; i < oscs.length; i++) {
        // Each voice has a phase offset equal to its octave position
        const voicePhase = (cycleProgress + i / NUM_VOICES) % 1.0;

        // Frequency: rises from BASE_FREQ*2^i to BASE_FREQ*2^(i+1) over one cycle
        const freq = BASE_FREQ * Math.pow(2, i + voicePhase);
        oscs[i].frequency.value = freq;

        // Bell-curve amplitude re-applied at real-time phase:
        // Fades out at top and bottom of each voice's range
        const bellAmp = Math.exp(-Math.pow((voicePhase - 0.5) * 3.2, 2));
        gains[i].gain.value = bellAmp * 0.14;
      }
    };

    gsap.ticker.add(ticker);
    return () => gsap.ticker.remove(ticker);
  }, [audioEnabled]);

  return null;
}
