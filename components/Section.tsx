"use client";

import React from 'react';

interface SectionProps {
  id: string;
  isClone?: boolean;
  children: React.ReactNode;
}

export function Section({ id, isClone = false, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-hidden={isClone ? "true" : "false"}
      className="relative w-full overflow-hidden flex items-center justify-center border-b border-white/10"
      style={{ 
        // Read from the dynamically updated CSS variable or fallback to 100vh
        height: 'var(--section-height, 100vh)' 
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
