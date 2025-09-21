"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper function to determine if a color is light or dark
const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) {
    return '#000000'; // Default to black if color is invalid
  }

  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  // Perceived luminance (ITU-R BT.709)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Use a threshold to decide between dark and light text
  return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Black for light backgrounds, white for dark backgrounds
};

interface ContentBlockProps {
  number: number;
  text: string;
  backgroundColor: string;
  dataIndex: number;
}

// Đây là một component giả lập cho các nội dung nặng như video, animation phức tạp...
const HeavyContent = ({ number }: { number: number }) => {
  useEffect(() => {
    // Bạn có thể thấy log này trong console của trình duyệt mỗi khi một block được lazy load
    console.log(`Heavy component for block ${number} MOUNTED`);
    return () => console.log(`Heavy component for block ${number} UNMOUNTED`);
  }, [number]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/80 p-8 rounded-lg shadow-lg">
      <h2 className="text-white text-2xl font-bold">Đây là nội dung nặng</h2>
      <p className="text-white mt-2">Ví dụ: Iframe Video cho block {number}</p>
      <p className="text-yellow-300 text-sm mt-4">Component này chỉ render khi block chứa nó đi vào màn hình.</p>
    </div>
  );
};

const ContentBlock = React.forwardRef<HTMLDivElement, ContentBlockProps>(({ number, text, backgroundColor, dataIndex }, ref) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dùng ScrollTrigger để theo dõi khi nào block này đi vào/ra khỏi màn hình
    const trigger = ScrollTrigger.create({
      trigger: blockRef.current,
      start: "top bottom", // Khi top của block chạm đáy màn hình
      end: "bottom top",   // Khi đáy của block chạm đỉnh màn hình
      onEnter: () => setIsIntersecting(true),
      onLeave: () => setIsIntersecting(false),
      onEnterBack: () => setIsIntersecting(true),
      onLeaveBack: () => setIsIntersecting(false),
    });

    return () => {
      trigger.kill(); // Dọn dẹp trigger khi component bị unmount
    };
  }, []);

  const textColor = getContrastTextColor(backgroundColor);

  return (
    <div ref={blockRef} className="block h-screen flex flex-col items-center justify-center border-b border-gray-700 font-sans relative overflow-hidden" style={{ backgroundColor: backgroundColor, color: textColor }} data-index={dataIndex}>
      <h1 className="text-[15rem] font-bold leading-none">{number}</h1>
      <p className="text-5xl mt-4">{text}</p>
      
      {/* Chỉ render component nặng khi block này đang hiển thị trên màn hình */}
      {isIntersecting && <HeavyContent number={number} />}
    </div>
  );
});

ContentBlock.displayName = 'ContentBlock';

export default ContentBlock;