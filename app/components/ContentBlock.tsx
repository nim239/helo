"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ContentBlockProps {
  number: number;
  text: string;
  backgroundColor: string;
  dataIndex: number;
}

const HeavyContent = () => {
  const videoId = 'pn9t38Tn89s';
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&autohide=1`;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
      <iframe
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
        src={src}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      {/* Transparent overlay to prevent any YouTube UI from showing on hover */}
      <div className="absolute top-0 left-0 w-full h-full"></div>
    </div>
  );
};

const ContentBlock: React.FC<ContentBlockProps> = ({ number, text, backgroundColor, dataIndex }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: blockRef.current,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => setIsIntersecting(true),
      onLeave: () => setIsIntersecting(false),
      onEnterBack: () => setIsIntersecting(true),
      onLeaveBack: () => setIsIntersecting(false),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div ref={blockRef} className="block h-screen border-b border-gray-700 font-sans relative overflow-hidden" style={{ backgroundColor: backgroundColor }} data-index={dataIndex}>
      
      {/* Video Background Layer (z-0) */}
      {isIntersecting && <HeavyContent />}

      {/* Text Overlay Layer (z-10) */}
      <div className="relative z-10 w-full h-full pointer-events-none text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
        {/* Centered Number using Flexbox */}
        <div className="w-full h-full flex justify-center items-center">
          <h1 className="text-[60vh] font-bold leading-none opacity-80">
            {number}
          </h1>
        </div>

        {/* Absolutely Positioned Text on top */}
        <p className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 text-4xl md:text-6xl w-2/5 md:w-1/3">
          {text}
        </p>
      </div>

    </div>
  );
};

export default ContentBlock;