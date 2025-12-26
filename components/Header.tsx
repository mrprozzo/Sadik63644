
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-gray-900">HEICtoJPG</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium -mt-1 leading-none">
            Free Online Converter
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <span className="text-xs text-gray-400 font-medium tracking-wide">
            PRIVATE & SECURE
          </span>
        </div>
      </div>
    </header>
  );
};
