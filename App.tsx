
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Converter } from './components/Converter';
import { InfoSection } from './components/InfoSection';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AdPlaceholder } from './components/AdPlaceholder';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] apple-shadow p-8 md:p-12 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="prose prose-slate max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100">
      <Header />
      
      <main className="flex-grow">
        <section className="pt-8 md:pt-16 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-2 md:mb-4 px-2">
              Convert HEIC to JPG
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed px-4">
              High-quality image conversion that happens entirely in your browser. 
              Private, secure, and instant.
            </p>
          </div>

          <Converter />
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-10">
          <AdPlaceholder label="Advertisement" className="mb-16 md:mb-24" />
          
          <InfoSection />
          
          <div className="my-16 md:my-24 h-px bg-gray-200" />
          
          <FAQ />
        </div>
      </main>

      <Footer onOpenModal={(type) => setActiveModal(type)} />

      {/* Legal Modals */}
      <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
        title="Privacy Policy"
      >
        <div className="space-y-6 text-gray-600 leading-relaxed font-light">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Commitment to Privacy</h3>
            <p className="font-medium text-blue-700">
              Crucial: We do not upload your images to any server. All processing happens locally in your browser using client-side technology.
            </p>
          </div>
          <p>
            HEICtoJPG is built with a "Privacy First" philosophy. Unlike traditional online converters, we do not operate a backend server that handles your image data.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Data Collection</h3>
          <p>
            Because conversion is done locally, your original HEIC files and converted JPG files never leave your computer or mobile device. We do not have access to, nor do we store, any of the images you process.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Advertising (Google AdSense)</h3>
          <p>
            We use Google AdSense to show advertisements. Google, as a third-party vendor, uses cookies to serve ads based on your visit to this site. Users may opt out of personalized advertising by visiting Google's Ads Settings.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
          <p>
            Questions? Email us at <a href="mailto:officialmrprozzo100@gmail.com" className="text-blue-600 font-medium hover:underline">officialmrprozzo100@gmail.com</a>
          </p>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'terms'} 
        onClose={closeModal} 
        title="Terms of Service"
      >
        <div className="space-y-6 text-gray-600 leading-relaxed font-light">
          <p>By using HEICtoJPG, you agree to the following terms:</p>
          <h3 className="text-lg font-semibold text-gray-900">Service Description</h3>
          <p>HEICtoJPG provides a free, browser-based utility for converting HEIC files to JPG format. This service is provided "as is" and "as available".</p>
          <h3 className="text-lg font-semibold text-gray-900">Disclaimer of Warranty</h3>
          <p>The tool is provided without warranties of any kind. We do not guarantee that the conversion will be error-free or that the output will meet your exact requirements.</p>
          <h3 className="text-lg font-semibold text-gray-900">Limitation of Liability</h3>
          <p>In no event shall HEICtoJPG or its creators be liable for any indirect, incidental, or consequential damages resulting from the use of this service.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'contact'} 
        onClose={closeModal} 
        title="Contact Us"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-500 font-light">
            Have questions, suggestions, or found a bug? We'd love to hear from you.
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 w-full">
            <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-2">Email Support</p>
            <a href="mailto:officialmrprozzo100@gmail.com" className="text-xl font-medium text-blue-600 hover:text-blue-700 transition-colors break-all">
              officialmrprozzo100@gmail.com
            </a>
          </div>
          <button 
            onClick={closeModal}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 underline underline-offset-4"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
