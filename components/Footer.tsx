
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <div className="text-sm text-gray-400 font-light">
          © {new Date().getFullYear()} HEICtoJPG. All rights reserved.
        </div>
        
        <div className="flex space-x-8 text-xs font-medium text-gray-400 tracking-wide uppercase">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>

        <div className="text-[10px] text-gray-300 font-light max-w-xs text-center md:text-right">
          Made for photographers, creators, and professionals who value their privacy.
        </div>
      </div>
    </footer>
  );
};
