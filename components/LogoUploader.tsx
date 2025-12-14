import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    onClear();
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-3 ml-1">
        1. Upload Brand Logo
      </label>
      
      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition-all duration-300 group"
        >
          <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
            <Upload size={24} />
          </div>
          <p className="text-base text-slate-900 font-semibold">Click to upload</p>
          <p className="text-sm text-slate-500 mt-1">PNG, JPG (max 5MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-[2rem] p-4 flex items-center gap-5 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 p-2">
             {previewUrl ? (
               <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain" />
             ) : (
               <ImageIcon size={28} className="text-slate-400" />
             )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-base font-bold text-slate-900 truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
          </div>
          <button 
            onClick={handleClear}
            className="p-3 text-slate-400 hover:text-white hover:bg-red-500 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
