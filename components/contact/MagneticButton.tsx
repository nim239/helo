"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface MagneticButtonProps {
  label?: string;
  email?: string;
}

export function MagneticButton({
  label = "CONTACT",
  email = "hello@n2antigravity.com",
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const raf = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    current.current.x += (target.current.x - current.current.x) * 0.12;
    current.current.y += (target.current.y - current.current.y) * 0.12;
    setPos({ x: current.current.x, y: current.current.y });
    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [animate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    target.current = { x: dx * 0.28, y: dy * 0.28 };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0, y: 0 };
    setHovered(false);
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setClicked(true)}
      onMouseUp={() => setClicked(false)}
      onClick={() => {
        window.location.href = `mailto:${email}`;
      }}
      aria-label="Send Email"
      className="relative bg-transparent border-none outline-none p-0 cursor-pointer"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${clicked ? 0.94 : hovered ? 1.06 : 1})`,
        transition: "transform 0.08s ease",
      }}
    >
      {/* Outer Glow Ring */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, rgba(0,242,255,0.18) 0%, transparent 70%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Main Round Body */}
      <div
        className="w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
        style={{
          border: `1px solid ${hovered ? "rgba(0,242,255,0.7)" : "rgba(255,255,255,0.2)"}`,
          background: hovered
            ? "radial-gradient(circle at 50% 50%, rgba(0,242,255,0.1) 0%, transparent 70%)"
            : "transparent",
        }}
      >
        {/* Rotating Concentric Rings */}
        <div
          className="absolute inset-2 rounded-full border border-[rgba(0,242,255,0.15)] animate-spin-slow pointer-events-none"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute inset-5 rounded-full border border-[rgba(255,0,127,0.15)] animate-spin-slow-reverse pointer-events-none"
          style={{ animationDuration: "18s" }}
        />

        {/* Text Prompt */}
        <div className="relative z-10 text-center">
          <div
            className="font-mono text-xs tracking-[0.4em] uppercase transition-colors duration-300 leading-none mb-2"
            style={{ color: hovered ? "#00F2FF" : "rgba(255,255,255,0.5)" }}
          >
            {hovered ? "→" : "◎"}
          </div>
          <div
            className="font-sans font-bold text-sm tracking-[0.3em] uppercase transition-colors duration-300"
            style={{ color: hovered ? "#00F2FF" : "#ffffff" }}
          >
            {label}
          </div>
        </div>
      </div>
    </button>
  );
}
