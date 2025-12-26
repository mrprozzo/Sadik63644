
import React from 'react';

interface FooterProps {
  onOpenModal: (type: 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-24 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold text-gray-400 tracking-wide uppercase">
          <button 
            onClick={() => onOpenModal('privacy')}
            className="hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => onOpenModal('terms')}
            className="hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => onOpenModal('contact')}
            className="hover:text-gray-900 transition-colors"
          >
            Contact
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-gray-400 font-light">
            © {new Date().getFullYear()} HEICtoJPG. All rights reserved.
          </div>
          <div className="text-[10px] text-gray-300 font-medium uppercase tracking-[0.2em]">
            Secure Client-Side Conversion
          </div>
        </div>

        <div className="text-[11px] text-gray-300 font-light max-w-sm text-center leading-relaxed">
          Designed for photographers, creators, and professionals who prioritize privacy and speed. 
          Your images never leave your browser.
        </div>
      </div>
    </footer>
  );
};
