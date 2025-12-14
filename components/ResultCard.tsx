import React from 'react';
import { GeneratedAsset } from '../types';
import { Copy, Check, Trash2, Globe, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultCardProps {
  asset: GeneratedAsset;
  onDelete: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ asset, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Copy content description if media, or text if text
    navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-all hover:shadow-lg group">
      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm">
        <div className="flex gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-slate-900 px-3 py-1.5 rounded-full flex items-center gap-2">
            {asset.mediaType === 'image' && <ImageIcon size={12} />}
            {asset.mediaType === 'video' && <VideoIcon size={12} />}
            {asset.type}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-slate-200 px-2 py-1 rounded-full flex items-center gap-1">
                <Globe size={10} /> {asset.language}
            </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleCopy}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-colors"
            title="Copy Text"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button 
            onClick={() => onDelete(asset.id)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-8 overflow-auto max-h-[600px] text-base text-slate-700 leading-loose prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 w-full">
        {asset.mediaUrl && asset.mediaType === 'image' && (
           <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
             <img src={asset.mediaUrl} alt="Generated Asset" className="w-full h-auto object-cover" />
           </div>
        )}
        
        {asset.mediaUrl && asset.mediaType === 'video' && (
           <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-black">
             <video src={asset.mediaUrl} controls className="w-full h-auto max-h-[500px]" />
           </div>
        )}

        <ReactMarkdown>{asset.content}</ReactMarkdown>
      </div>
      
      <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 text-right font-medium">
        Generated at {asset.createdAt.toLocaleTimeString()}
      </div>
    </div>
  );
};
