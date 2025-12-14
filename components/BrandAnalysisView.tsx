import React from 'react';
import { BrandProfile } from '../types';
import { Palette, Users, Mic2 } from 'lucide-react';

interface BrandAnalysisViewProps {
  brand: BrandProfile;
}

export const BrandAnalysisView: React.FC<BrandAnalysisViewProps> = ({ brand }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">
              Analyzed Brand
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{brand.brandName}</h2>
            <p className="text-slate-500 font-medium mt-1 text-lg">{brand.industry}</p>
          </div>
        </div>
        <div className="mt-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
           <p className="text-slate-700 italic text-lg text-center font-medium font-serif">"{brand.tagline}"</p>
        </div>
        <p className="mt-6 text-slate-600 leading-relaxed max-w-3xl">{brand.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Colors */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-5 text-slate-900 font-bold">
            <div className="p-2 bg-pink-100 rounded-full text-pink-600">
               <Palette size={18} />
            </div>
            <h3>Palette</h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {brand.colors.map((color, idx) => (
              <div key={idx} className="group relative">
                <div 
                  className="w-12 h-12 rounded-2xl border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform ring-1 ring-slate-100" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-900 text-white px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-5 text-slate-900 font-bold">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Mic2 size={18} />
             </div>
            <h3>Voice</h3>
          </div>
          <div className="inline-block px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-full text-sm font-semibold shadow-sm">
            {brand.toneOfVoice}
          </div>
        </div>

        {/* Audience */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-5 text-slate-900 font-bold">
             <div className="p-2 bg-green-100 rounded-full text-green-600">
                <Users size={18} />
             </div>
            <h3>Audience</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {brand.targetAudience}
          </p>
        </div>

      </div>
    </div>
  );
};
