
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <p className="text-gray-500 leading-relaxed font-light">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Is it really free to use?",
      answer: "Yes, our HEIC to JPG converter is completely free to use. There are no hidden fees, no subscriptions, and no limits on how many images you can convert."
    },
    {
      question: "Are my photos sent to a server?",
      answer: "No. Unlike other tools, we use modern web technology (WebAssembly) to process your images directly in your browser. Your private photos never leave your device."
    },
    {
      question: "Will I lose image quality during conversion?",
      answer: "We use high-quality encoding (90% quality by default) which maintains visual fidelity while ensuring the resulting JPG is compatible with all software."
    },
    {
      question: "Does it work on mobile devices?",
      answer: "Absolutely. Our website is fully responsive and works perfectly on iPhones, iPads, and Android devices. You can convert your HEIC photos directly from your phone's gallery."
    },
    {
      question: "What is the difference between HEIC and JPG?",
      answer: "HEIC offers better compression than JPG, meaning it takes up less space for the same quality. However, JPG is the universal standard for digital images and works everywhere."
    }
  ];

  return (
    <section>
      <h2 className="text-3xl font-semibold text-gray-900 mb-8">Frequently Asked Questions</h2>
      <div className="max-w-3xl">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  );
};
