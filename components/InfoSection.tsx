
import React from 'react';
import { ShieldCheck, Zap, Lock, Globe } from 'lucide-react';

export const InfoSection: React.FC = () => {
  const items = [
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: "Instant Conversion",
      description: "Our tool processes your images immediately using your computer's resources, meaning there's no waiting in a server queue."
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-500" />,
      title: "100% Private",
      description: "Your files never leave your device. The conversion happens entirely within your web browser. No data is uploaded to our servers."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "High Quality",
      description: "We use advanced algorithms to ensure that the transition from HEIC to JPG preserves as much detail and color as possible."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: "Trusted & Safe",
      description: "Used by thousands of professionals every day. No software installation required, and no hidden trackers or invasive ads."
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {items.map((item, idx) => (
        <div key={idx} className="flex space-x-5">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              {item.icon}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 leading-relaxed font-light">{item.description}</p>
          </div>
        </div>
      ))}

      <div className="md:col-span-2 mt-12 bg-gray-50 rounded-3xl p-10">
        <h3 className="text-2xl font-semibold mb-6">Why convert HEIC to JPG?</h3>
        <div className="grid md:grid-cols-2 gap-8 text-gray-500 font-light leading-relaxed">
          <p>
            HEIC (High Efficiency Image Container) is the default image format for newer iPhones. 
            While it saves space, many Windows applications, older Android phones, and online 
            platforms don't support it yet.
          </p>
          <p>
            Converting to JPG ensures maximum compatibility with every device and software 
            in the world. Our tool makes this process seamless while keeping your photos 
            exactly where they belong: in your hands.
          </p>
        </div>
      </div>
    </section>
  );
};
