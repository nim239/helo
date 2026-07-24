"use client";

import React from 'react';

interface SectionProps {
  id: string;
  isClone?: boolean;
  children: React.ReactNode;
}

export function Section({ id, isClone = false, children }: SectionProps) {
  // Debug Formula: generate a deterministic hue from the section ID
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <section
      id={id}
      aria-hidden={isClone ? "true" : "false"}
      className="relative w-full overflow-hidden flex items-center justify-center border-b border-white/10"
      style={{ 
        // Read from the dynamically updated CSS variable or fallback to 100vh
        height: 'var(--section-height, 100vh)',
        // 🧪 DEBUG: Tô màu background nhạt để dễ quan sát ranh giới section
        backgroundColor: `hsla(${hue}, 70%, 20%, 0.3)`
      }}
    >
      {/* 
        This is a 'dumb' component. 
        It does not use GSAP or ScrollTrigger directly, avoiding re-renders. 
      */}
      {children}
    </section>
  );
}
