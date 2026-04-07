"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionData } from '@/data/sections';

interface SectionProps {
  section: SectionData;
}

const Section = ({ section }: SectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => setVisible(true),
      onLeave: () => setVisible(false),
      onEnterBack: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    });
    return () => trigger.kill();
  }, []);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: section.bg }}
      className="w-full h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-1000"
    >
      {visible && (
        <div className="animate-in fade-in duration-1000">
          {section.content}
        </div>
      )}
    </div>
  );
};

export default Section;
