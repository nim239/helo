"use client";

import { useEffect, useState } from 'react';
import sectionsData from '../data/sections.json';
import { Section } from '../components/Section';
import { SpriteAnimation } from '../components/SpriteAnimation';
import { HorizontalMarquee } from '../components/HorizontalMarquee';
import { ParallaxSides } from '../components/ParallaxSides';
import { BackgroundGrid } from '../components/BackgroundGrid';
import { EnterOverlay } from '../components/EnterOverlay';
import { HackerMode } from '../components/HackerMode';
import { AudioController } from '../components/AudioController';
import { CustomCursor } from '../components/CustomCursor';
import { CurtainsTransition } from '../components/CurtainsTransition';
import { NeonCard } from '../components/NeonCard';
import { KineticHeader } from '../components/KineticHeader';
import { MagneticButton } from '../components/contact/MagneticButton';
import { ParticleField } from '../components/contact/ParticleField';
import { useKineticTypography } from '../lib/hooks/useKineticTypography';
import { useExhibitionScroll } from '../lib/hooks/useExhibitionScroll';
import { useViewportSync } from '../lib/hooks/useViewportSync';
import { useAppStore } from '../lib/store/useAppStore';
import { useScrollStore } from '../lib/store/useScrollStore';

function SectionContent({ section }: { section: any }) {
  const kineticTypography = useKineticTypography();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    if (section.id === 'contact') {
      const updateClock = () => {
        setLiveTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
      };
      updateClock();
      const timer = setInterval(updateClock, 1000);
      return () => clearInterval(timer);
    }
  }, [section.id]);

  if (section.id === 'intro') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative text-center z-10">
        {/* Top left metadata */}
        <div className="absolute top-10 left-10 md:left-14 font-mono text-[11px] tracking-[0.4em] text-white/30 uppercase">
          {section.subtitle || "NimVFX — 2026"}
        </div>

        {/* Main Headline */}
        <div className="z-10 text-center">
          <div className="font-mono text-xs tracking-[0.5em] text-[#00F2FF] mb-4 uppercase opacity-90">
            {section.caption || "Motion Design / CGI / Direction"}
          </div>
          <div className="w-full px-10 md:px-14 mb-2">
            <KineticHeader text1="NIM" text2="VFX" gradientOn={2} w1WeightRange={[100, 300]} w2WeightRange={[900, 700]} />
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#00F2FF] to-transparent animate-pulse" />
        </div>
      </div>
    );
  }

  if (section.id === 'reel') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8 z-10">
        {/* Top center counter & title */}
        <div className="absolute top-10 left-0 flex flex-col items-center z-10 w-full pointer-events-none px-10 md:px-14">
          <div className="font-mono text-[11px] text-white/30 tracking-[0.4em] mb-4 uppercase">{section.counter || "02 / 06"}</div>
          <KineticHeader text1="DIRECTOR'S" text2="REEL" />
        </div>

        {/* 16:9 Cinematic Frame */}
        <div className="w-[85vw] max-w-4xl aspectRatio-[16/9] relative z-10 my-auto">
          <NeonCard 
            width="100%" 
            height="100%" 
            accent="#00F2FF" 
            label="REEL — 2026 — 4K" 
            src={section.src} 
            poster={section.poster} 
          />
          {/* Play Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#00F2FF]/60 flex items-center justify-center cursor-pointer bg-black/60 backdrop-blur-sm shadow-[0_0_30px_rgba(0,242,255,0.2)] transition-transform duration-300 hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 4L16 10L6 16V4Z" fill="#00F2FF" />
            </svg>
          </div>
        </div>

        {/* Bottom meta row */}
        <div className="absolute bottom-10 left-10 md:left-14 right-10 md:right-14 flex justify-between font-mono text-[11px] text-white/30 tracking-widest uppercase">
          <span>DURATION: {section.meta?.duration || "03:42"}</span>
          <span>FORMAT: {section.meta?.format || "4K UHD / PRORES 4444"}</span>
          <span>CODEC: {section.meta?.codec || "H.265"}</span>
        </div>
      </div>
    );
  }

  if (section.id === 'work-a') {
    const bentoItems = section.bentoItems || [
      { id: "cgi-01", label: "GLASS FLUID SIM — C4D", accent: "#00F2FF", rotation: -0.5 },
      { id: "cgi-02", label: "NEON GEOMETRY — OCTANE", accent: "#FF007F", rotation: 0.3 },
      { id: "cgi-03", label: "PARTICLE STORM — HOUDINI", accent: "#00FF88", rotation: -0.4 },
      { id: "cgi-04", label: "ABSTRACT ARCH — BLENDER", accent: "#0066FF", rotation: 0.2 },
      { id: "cgi-05", label: "DATA VIZ — AE + WEBGL", accent: "#FF007F", rotation: -0.3 },
    ];

    return (
      <div className="w-full h-full flex flex-col justify-center px-10 md:px-14 relative z-10">
        <div className="absolute top-10 left-0 flex flex-col items-center z-10 w-full pointer-events-none px-10 md:px-14">
          <div className="font-mono text-[11px] text-white/30 tracking-[0.4em] mb-4 uppercase">{section.counter || "03 / 06"}</div>
          <KineticHeader text1="CGI" text2="SHOWCASE" />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-[55dvh] max-w-6xl w-full mx-auto mt-24">
          <div className="md:row-span-2">
            <NeonCard label={bentoItems[0]?.label} accent={bentoItems[0]?.accent} rotation={bentoItems[0]?.rotation} src={section.src} poster={section.poster} index={0} />
          </div>
          <div>
            <NeonCard label={bentoItems[1]?.label} accent={bentoItems[1]?.accent} rotation={bentoItems[1]?.rotation} index={1} />
          </div>
          <div>
            <NeonCard label={bentoItems[2]?.label} accent={bentoItems[2]?.accent} rotation={bentoItems[2]?.rotation} index={2} />
          </div>
          <div>
            <NeonCard label={bentoItems[3]?.label} accent={bentoItems[3]?.accent} rotation={bentoItems[3]?.rotation} index={3} />
          </div>
          <div>
            <NeonCard label={bentoItems[4]?.label} accent={bentoItems[4]?.accent} rotation={bentoItems[4]?.rotation} index={4} />
          </div>
        </div>
      </div>
    );
  }

  if (section.layout === 'horizontal-marquee') {
    return (
      <div className="w-full h-full flex flex-col justify-center relative">
        <div className="absolute top-10 md:top-14 left-0 flex flex-col items-center z-20 pointer-events-none mix-blend-difference w-full px-10 md:px-14">
          <div className="font-mono text-[11px] text-white/40 tracking-[0.4em] mb-4 uppercase">{section.counter}</div>
          <KineticHeader 
            text1={section.title === 'Motion Work' ? 'MOTION' : 'COMMER'} 
            text2={section.title === 'Motion Work' ? 'WORK' : 'CIALS'} 
            gradientOn={1} 
          />
        </div>

        <HorizontalMarquee 
          items={section.items || []} 
          direction={(section.marquee?.direction as 'left' | 'right') || 'left'} 
          speed={(section.marquee?.speed || 1.0) * 0.05} 
        />

        {section.isClone && (
          <span className="absolute bottom-10 right-10 z-10 text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-widest pointer-events-none">Buffer Clone</span>
        )}
      </div>
    );
  }

  if (section.id === 'contact') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden z-10">
        <ParticleField />

        {/* Stroked Background Letterform */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-[clamp(280px,35vw,520px)] leading-none tracking-tighter text-transparent select-none pointer-events-none z-0 opacity-4" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.04)' }}>
          NIM
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-20 border-b border-white/5">
          <div className="font-sans font-bold text-xs tracking-[0.3em] text-white/90 uppercase">
            NimVFX
          </div>
          <div className="font-mono text-[11px] tracking-widest text-white/30">
            {liveTime} — GMT+7
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-10 text-center">
          <div>
            <div className="font-mono text-xs tracking-[0.5em] text-white/30 uppercase mb-4">
              Available for work — 2026
            </div>
            <div className="w-[85vw] max-w-6xl mx-auto px-4">
              <KineticHeader text1="LET'S" text2="CONNECT." gradientOn={2} />
            </div>
          </div>

          <MagneticButton label="CONTACT" email="hello@n2antigravity.com" />
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-20 border-t border-white/5 font-mono text-[10px] text-white/20 uppercase tracking-widest">
          <span>Motion Design / CGI / Direction</span>
          <span>© 2026 NimVFX</span>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
      <h2 style={kineticTypography.style} className="text-4xl md:text-7xl font-bold tracking-tighter mb-4">{section.title}</h2>
    </div>
  );
}

export default function Exhibition() {
  const [mounted, setMounted] = useState(false);
  const setDeepLinkTarget = useAppStore(state => state.setDeepLinkTarget);
  const hasEntered = useAppStore(state => state.hasEntered);
  const isIntroComplete = useScrollStore(state => state.isIntroComplete);
  
  useViewportSync();
  const lenisRef = useExhibitionScroll();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.location.hash) {
      setDeepLinkTarget(window.location.hash);
    }
  }, [setDeepLinkTarget]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (typeof window !== 'undefined' && window.location.hash && lenis && isIntroComplete && hasEntered) {
      const hashId = window.location.hash.substring(1);
      const targetElement = document.getElementById(`real-${hashId}`);
      if (targetElement) {
        lenis.scrollTo(targetElement, { immediate: true });
      }
    }
  }, [isIntroComplete, lenisRef, hasEntered]);

  if (!mounted) {
    return <main className="bg-black min-h-screen w-full"></main>;
  }

  const realSections = sectionsData;
  const exhibitionBuffer = [
    ...realSections.map(s => ({ ...s, isClone: false, key: `real-${s.id}` })), 
    { ...realSections[0], isClone: true, key: `clone-bot-loop` }
  ];

  return (
    <main className="relative w-full bg-black text-white selection:bg-white/20 overflow-hidden">
      <BackgroundGrid />
      <CustomCursor />
      <CurtainsTransition />
      <AudioController />
      <HackerMode />
      <EnterOverlay />
      <ParallaxSides />
      <SpriteAnimation startIntro={hasEntered} />
      
      {exhibitionBuffer.map((section) => (
        <Section key={section.key} id={section.key} isClone={section.isClone}>
          <SectionContent section={section} />
        </Section>
      ))}
    </main>
  );
}
