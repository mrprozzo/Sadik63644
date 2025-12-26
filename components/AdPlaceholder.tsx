
import React from 'react';

interface AdPlaceholderProps {
  label?: string;
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ label = "Advertisement", className = "" }) => {
  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-300 font-medium mb-2">
        {label}
      </span>
      <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-32 md:h-64 flex items-center justify-center text-gray-200 font-light italic apple-shadow-hover transition-all">
        {/* AdSense/Ezoic code would go here */}
        Responsive Ad Unit
      </div>
    </div>
  );
};
