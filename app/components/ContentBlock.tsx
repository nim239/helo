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

  return (
    <div ref={blockRef} className="block h-screen flex flex-col items-center justify-center border-b border-gray-700 font-sans relative overflow-hidden" style={{ backgroundColor: backgroundColor }} data-index={dataIndex}>
      <h1 className="text-[15rem] font-bold leading-none text-black">{number}</h1>
      <p className="text-5xl mt-4 text-black">{text}</p>
      
      {/* Chỉ render component nặng khi block này đang hiển thị trên màn hình */}
      {isIntersecting && <HeavyContent number={number} />}
    </div>
  );
});

ContentBlock.displayName = 'ContentBlock';

export default ContentBlock;