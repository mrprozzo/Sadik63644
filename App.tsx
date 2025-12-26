
import React from 'react';
import { Header } from './components/Header';
import { Converter } from './components/Converter';
import { InfoSection } from './components/InfoSection';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AdPlaceholder } from './components/AdPlaceholder';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100">
      <Header />
      
      <main className="flex-grow">
        <section className="pt-6 md:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-3">
              Convert HEIC to JPG
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              High-quality image conversion that happens entirely in your browser. 
              Private, secure, and instant.
            </p>
          </div>

          <Converter />
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <AdPlaceholder label="Advertisement" className="mb-24" />
          
          <InfoSection />
          
          <div className="my-24 h-px bg-gray-100" />
          
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
