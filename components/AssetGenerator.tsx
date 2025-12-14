import React, { useState } from 'react';
import { AssetType, Language } from '../types';
import { Send, Sparkles, Loader2, Globe2, Image, Video } from 'lucide-react';

interface AssetGeneratorProps {
  isGenerating: boolean;
  onGenerate: (type: AssetType, context: string, language: Language) => void;
}

const LANGUAGES: Language[] = ['Italiano', 'English', 'Español', 'Français', 'Deutsch'];

export const AssetGenerator: React.FC<AssetGeneratorProps> = ({ isGenerating, onGenerate }) => {
  const [selectedType, setSelectedType] = useState<AssetType>(AssetType.SOCIAL_POST);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Italiano');
  const [context, setContext] = useState('');

  const handleTypeSelect = async (type: AssetType) => {
    // Check for API Key requirement for Video
    if (type === AssetType.SOCIAL_VIDEO) {
      // Use type assertion to access window.aistudio
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
           const hasKey = await aistudio.hasSelectedApiKey();
           if (!hasKey) {
             await aistudio.openSelectKey();
           }
        } catch (e) {
          console.error("Error checking API key:", e);
        }
      }
    }
    setSelectedType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (context.trim()) {
      onGenerate(selectedType, context, selectedLanguage);
    }
  };

  const isVisual = selectedType === AssetType.SOCIAL_IMAGE || selectedType === AssetType.SOCIAL_VIDEO;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 h-full flex flex-col relative overflow-hidden">
      
      {/* Decorative gradient background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg shadow-slate-200">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Generate</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        
        {/* Language Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3 ml-1">
            <Globe2 size={16} className="text-slate-400"/>
            Language
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                  selectedLanguage === lang
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-3 ml-1">Asset Type</label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {Object.values(AssetType).map((type) => {
               let Icon = null;
               if (type === AssetType.SOCIAL_IMAGE) Icon = Image;
               if (type === AssetType.SOCIAL_VIDEO) Icon = Video;
               
               return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`text-sm px-5 py-3 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                    selectedType === type
                      ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-200'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {Icon && <Icon size={16} className="text-indigo-500" />}
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-800 mb-3 ml-1">
            {isVisual ? 'Visual Description' : 'Topic & Context'}
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={isVisual ? "Describe the image or video you want to generate..." : "E.g. Launching a new summer collection, 20% discount code..."}
            className="w-full h-40 p-5 rounded-[1.5rem] border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none text-slate-800 text-base bg-slate-50/30 transition-shadow"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !context.trim()}
          className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-lg hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {selectedType === AssetType.SOCIAL_VIDEO ? 'Rendering Video...' : 'Building...'}
            </>
          ) : (
            <>
              Generate
              <Send size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
