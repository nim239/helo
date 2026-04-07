import React from 'react';

export interface SectionData {
  id: number;
  label: string;
  bg: string;
  content: React.ReactNode;
}

export const sections: SectionData[] = [
  {
    id: 1,
    label: 'intro',
    bg: '#0a0a0a',
    content: (
      <div className="text-center">
        <h1 className="text-white text-6xl font-light tracking-widest leading-tight">NAM</h1>
        <p className="text-white/40 text-[10px] tracking-[0.8em] mt-4 uppercase font-medium">Motion Designer & CGI Artist</p>
      </div>
    ),
  },
  {
    id: 2,
    label: 'reel',
    bg: '#111111',
    content: (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-[80%] aspect-video bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
          <p className="text-white/20 text-[10px] tracking-[0.4em] uppercase">Showreel Loading...</p>
        </div>
        <p className="text-white/10 text-[10px] tracking-widest uppercase mt-4">2025 REEL</p>
      </div>
    ),
  },
  {
    id: 3,
    label: 'work-a',
    bg: '#0f0f0f',
    content: (
      <div className="flex flex-col items-center">
         <p className="text-white/20 text-[10px] tracking-[0.6em] uppercase">CGI / 3D ARCHIVE</p>
      </div>
    ),
  },
  {
    id: 4,
    label: 'work-b',
    bg: '#0d0d0d',
    content: (
      <div className="flex flex-col items-center">
        <p className="text-white/20 text-[10px] tracking-[0.6em] uppercase">MOTION DESIGN SERIES</p>
      </div>
    ),
  },
  {
    id: 5,
    label: 'about',
    bg: '#0c0c0c',
    content: (
      <div className="max-w-md px-10">
        <p className="text-white/40 text-[10px] leading-relaxed tracking-widest text-justify uppercase">
          Focusing on the intersection of movement and digital aesthetics. Shaping light and motion into visual narratives.
        </p>
      </div>
    ),
  },
  {
    id: 6,
    label: 'contact',
    bg: '#080808',
    content: (
      <div className="flex flex-col items-center">
        <a href="mailto:contact@nam.design" className="text-white/60 text-xs tracking-[0.5em] hover:text-white transition-colors duration-500 uppercase">contact@nam.design</a>
      </div>
    ),
  },
];
