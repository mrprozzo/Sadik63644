
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
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
        className={`relative group bg-white border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center apple-shadow cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50/30 scale-[1.01]' : 'border-gray-200'
        }`}
      >
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <FileUp className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Drag & drop your HEIC images here
        </h3>
        <p className="text-gray-400 mb-8 font-light tracking-tight">
          or click anywhere to select files
        </p>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            triggerFileSelect();
          }}
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-10 py-4 rounded-full font-semibold transition-all transform active:scale-95 apple-shadow-hover flex items-center space-x-2"
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

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
            <span>Free & Instant</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
            <span>Private</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
            <span>Unlimited</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
            <span>High Def</span>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div ref={resultsRef} className="space-y-4 pt-4 animate-in slide-in-from-bottom-6 duration-700 ease-out">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                CONVERSION QUEUE ({files.length})
              </h4>
            </div>
            <button 
              onClick={() => setFiles([])}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden apple-shadow">
            {files.map((fileState, index) => (
              <div 
                key={fileState.id}
                className={`flex items-center justify-between p-6 ${
                  index !== files.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-5 min-w-0 flex-grow">
                  {/* Left Side: Thumbnail Image */}
                  <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100 relative">
                    {fileState.status === 'completed' && fileState.resultUrl ? (
                      <img 
                        src={fileState.resultUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover animate-in fade-in duration-700" 
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        {fileState.status === 'error' ? (
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <FileUp className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Middle Section: Name & Metadata */}
                  <div className="min-w-0 flex-grow flex flex-col justify-center">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px] sm:max-w-xs">
                        {fileState.file.name}
                      </p>
                      {fileState.status === 'converting' && <ThinSpinner />}
                      {fileState.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    
                    <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                      {formatFileSize(fileState.file.size)}
                      {fileState.status === 'converting' && <span className="ml-2 text-blue-500 animate-pulse text-[10px] font-bold uppercase tracking-tight">Processing</span>}
                    </p>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center space-x-4 ml-4">
                  {fileState.status === 'completed' && fileState.resultUrl && (
                    <a 
                      href={fileState.resultUrl} 
                      download={fileState.file.name.replace(/\.[^/.]+$/, "") + ".jpg"}
                      className="bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#0071e3] px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline uppercase tracking-wide">Download</span>
                    </a>
                  )}
                  <button 
                    onClick={() => removeFile(fileState.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {completedCount >= 2 && !isAnyInQueue && (
              <div className="p-8 bg-gray-50/40 border-t border-gray-100 flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-700 ease-out">
                <button 
                  onClick={downloadAll}
                  disabled={isZipping}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-12 py-5 rounded-full text-lg font-bold transition-all transform hover:scale-[1.03] active:scale-[0.97] flex items-center space-x-4 shadow-2xl shadow-blue-500/20"
                >
                  {isZipping ? <ThinSpinner className="w-6 h-6 text-white" /> : <Archive className="w-6 h-6" />}
                  <span>{isZipping ? 'Packing ZIP...' : 'Download All (.ZIP)'}</span>
                </button>
                <p className="mt-4 text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                  {completedCount} Images Ready for Bulk Download
                </p>
              </div>
            )}
          </div>
          
          {completedCount > 0 && (
            <div className="mt-12 animate-in fade-in zoom-in-95 duration-1000">
              <AdPlaceholder label="Conversion Ready" className="opacity-60" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
