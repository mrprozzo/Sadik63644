
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, FileUp, X, AlertCircle, Archive, Clock } from 'lucide-react';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import { AdPlaceholder } from './AdPlaceholder';

interface FileState {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'error';
  resultUrl?: string;
  progress: number;
  error?: string;
}

const ThinSpinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className} text-blue-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const Converter: React.FC = () => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isQueueActive, setIsQueueActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (files.length > 0 && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [files.length]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles).filter(f => 
      f.name.toLowerCase().endsWith('.heic') || f.type === 'image/heic'
    );

    if (fileArray.length === 0 && Array.from(newFiles).length > 0) {
      alert("Please select valid .HEIC files.");
      return;
    }

    const newStates: FileState[] = fileArray.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newStates]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    const processNextInQueue = async () => {
      if (isQueueActive) return;

      const nextPending = files.find(f => f.status === 'pending');
      if (!nextPending) return;

      setIsQueueActive(true);

      setFiles(prev => prev.map(f => 
        f.id === nextPending.id ? { ...f, status: 'converting' } : f
      ));

      try {
        const blob = await heic2any({
          blob: nextPending.file,
          toType: 'image/jpeg',
          quality: 0.85
        });

        const blobResult = Array.isArray(blob) ? blob[0] : blob;
        const url = URL.createObjectURL(blobResult);

        setFiles(prev => prev.map(f => f.id === nextPending.id ? { 
          ...f, 
          status: 'completed', 
          resultUrl: url,
          progress: 100 
        } : f));
      } catch (err) {
        console.error('Conversion Error:', err);
        setFiles(prev => prev.map(f => f.id === nextPending.id ? { 
          ...f, 
          status: 'error', 
          error: 'Conversion failed' 
        } : f));
      } finally {
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsQueueActive(false);
      }
    };

    processNextInQueue();
  }, [files, isQueueActive]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed?.resultUrl) URL.revokeObjectURL(removed.resultUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.resultUrl);
    if (completedFiles.length < 2) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const f of completedFiles) {
        const response = await fetch(f.resultUrl!);
        const blob = await response.blob();
        const fileName = f.file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        zip.file(fileName, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = "converted_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      alert("Failed to create ZIP file.");
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const isAnyInQueue = files.some(f => f.status === 'converting' || f.status === 'pending');

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
        className={`relative group bg-white border-2 border-dashed rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 transition-all duration-500 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/5 cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50/20 scale-[1.01]' : 'border-gray-200'
        }`}
      >
        <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 transition-transform duration-500">
          <FileUp className={`w-6 h-6 md:w-10 md:h-10 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3 tracking-tight">
          Drop your HEIC images here
        </h3>
        <p className="text-sm md:text-lg text-gray-400 mb-6 md:mb-10 font-light tracking-tight px-4">
          or tap to select files from your device
        </p>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            triggerFileSelect();
          }}
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 md:px-12 py-3.5 md:py-5 rounded-full text-base md:text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/10 flex items-center space-x-2 md:space-x-3"
        >
          <span>Select HEIC Files</span>
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".heic" 
          multiple 
          onChange={(e) => handleFiles(e.target.files)} 
        />

        {/* Feature List Grid */}
        <div className="mt-8 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-8 gap-x-4 md:gap-x-12 w-full max-w-4xl border-t border-gray-100 pt-6 md:pt-12">
          {[
            'Free & Instant',
            'Browser-Based',
            'Privacy-Friendly',
            'High Quality'
          ].map((text) => (
            <div key={text} className="flex items-center justify-center space-x-1.5 md:space-x-3 group/item">
              <CheckIcon />
              <span className="text-[10px] md:text-sm font-semibold text-gray-600 group-hover/item:text-gray-900 transition-colors">
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <div ref={resultsRef} className="space-y-3 md:space-y-4 pt-4 md:pt-8 animate-in slide-in-from-bottom-6 duration-700 ease-out">
          <div className="flex items-center justify-between px-2 md:px-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                QUEUE ({files.length})
              </h4>
            </div>
            <button 
              onClick={() => setFiles([])}
              className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              Clear All
            </button>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
            {files.map((fileState, index) => (
              <div 
                key={fileState.id}
                className={`flex items-center justify-between p-4 md:p-7 ${
                  index !== files.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4 md:space-x-6 min-w-0 flex-grow">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100 relative">
                    {fileState.status === 'completed' && fileState.resultUrl ? (
                      <img 
                        src={fileState.resultUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover animate-in fade-in duration-700" 
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        {fileState.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 md:w-7 md:h-7 text-red-500" />
                        ) : (
                          <FileUp className="w-5 h-5 md:w-7 md:h-7 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-grow flex flex-col justify-center">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm md:text-base font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-xs tracking-tight">
                        {fileState.file.name}
                      </p>
                      {fileState.status === 'converting' && <ThinSpinner className="w-4 h-4 md:w-5 md:h-5" />}
                      {fileState.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    
                    <p className="text-[10px] md:text-sm font-medium text-gray-400 mt-0.5">
                      {formatFileSize(fileState.file.size)}
                      {fileState.status === 'converting' && <span className="ml-2 text-blue-500 animate-pulse text-[9px] md:text-[11px] font-bold uppercase tracking-wider">Processing...</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 md:space-x-5 ml-2 md:ml-4">
                  {fileState.status === 'completed' && fileState.resultUrl && (
                    <a 
                      href={fileState.resultUrl} 
                      download={fileState.file.name.replace(/\.[^/.]+$/, "") + ".jpg"}
                      className="bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#0071e3] px-4 md:px-7 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all flex items-center space-x-1 md:space-x-2 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline uppercase tracking-widest">Download</span>
                    </a>
                  )}
                  <button 
                    onClick={() => removeFile(fileState.id)}
                    className="p-1.5 md:p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            ))}

            {completedCount >= 2 && !isAnyInQueue && (
              <div className="p-6 md:p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-700 ease-out">
                <button 
                  onClick={downloadAll}
                  disabled={isZipping}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-10 md:px-14 py-4 md:py-6 rounded-full text-lg md:text-xl font-bold transition-all transform hover:scale-[1.03] active:scale-[0.97] flex items-center space-x-4 md:space-x-5 shadow-2xl shadow-blue-500/25"
                >
                  {isZipping ? <ThinSpinner className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <Archive className="w-6 h-6 md:w-7 md:h-7" />}
                  <span>{isZipping ? 'Packing...' : 'Download ZIP'}</span>
                </button>
                <p className="mt-4 text-[10px] md:text-[12px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                  {completedCount} Images ready
                </p>
              </div>
            )}
          </div>
          
          {completedCount > 0 && (
            <div className="mt-8 md:mt-16 animate-in fade-in zoom-in-95 duration-1000">
              <AdPlaceholder label="Conversion Ready" className="opacity-70" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
