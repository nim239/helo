"use client";

import React from 'react';

interface ContentBlockProps {
  number: number;
  text: string;
  backgroundColor: string;
  dataIndex: number;
}

const ContentBlock = React.forwardRef<HTMLDivElement, ContentBlockProps>(({ number, text, backgroundColor, dataIndex }, ref) => {
  return (
    <div ref={ref} className="block h-screen flex flex-col items-center justify-center border-b border-gray-700 font-sans" style={{ backgroundColor: backgroundColor }} data-index={dataIndex}>
      <h1 className="text-[15rem] font-bold leading-none text-black">{number}</h1>
      <p className="text-5xl mt-4 text-black">{text}</p>
    </div>
  );
});

ContentBlock.displayName = 'ContentBlock';

export default ContentBlock;
