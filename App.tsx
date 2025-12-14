import React, { useState } from 'react';
import { Box, Globe, ArrowRight, Wand2 } from 'lucide-react';
import { LogoUploader } from './components/LogoUploader';
import { BrandAnalysisView } from './components/BrandAnalysisView';
import { AssetGenerator } from './components/AssetGenerator';
import { ResultCard } from './components/ResultCard';
import { BrandProfile, GeneratedAsset, AssetType, Language } from './types';
import { analyzeBrandIdentity, fileToGenerativePart, generateMarketingContent } from './services/geminiService';

function App() {
  // State for onboarding
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for application data
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  // Analysis Handler
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile || !websiteUrl) return;

    setIsAnalyzing(true);
    try {
      const base64Data = await fileToGenerativePart(logoFile);
      const profile = await analyzeBrandIdentity(base64Data, logoFile.type, websiteUrl);
      setBrandProfile(profile);
    } catch (error) {
      console.error(error);
      alert("Error during analysis. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generation Handler
  const handleGenerateAsset = async (type: AssetType, context: string, language: Language) => {
    if (!brandProfile) return;
    setIsGeneratingAsset(true);
    try {
      const result = await generateMarketingContent(brandProfile, type, context, language);
      
      const newAsset: GeneratedAsset = {
        id: Date.now().toString(),
        type,
        content: result.text,
        mediaUrl: result.mediaUrl,
        mediaType: result.mediaType,
        language,
        createdAt: new Date()
      };
      
      setGeneratedAssets(prev => [newAsset, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Could not generate content. If generating video, ensure you have selected a valid API key from a paid project.");
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const handleDeleteAsset = (id: string) => {
    setGeneratedAssets(prev => prev.filter(a => a.id !== id));
  };

  const resetApp = () => {
    setBrandProfile(null);
    setGeneratedAssets([]);
    setLogoFile(null);
    setWebsiteUrl('');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="bg-slate-900 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Box size={24} strokeWidth={2.5} />
            </div>
            <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Virtual Architects <span className="text-slate-400 font-medium">Studio</span></h1>
          </div>
          {brandProfile && (
            <button 
              onClick={resetApp} 
              className="text-sm px-4 py-2 rounded-full border border-slate-200 hover:border-slate-900 text-slate-600 hover:text-slate-900 font-semibold transition-all"
            >
              Start New Project
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* VIEW 1: ONBOARDING / INPUT */}
        {!brandProfile && (
          <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold tracking-wide uppercase">
                AI Marketing Suite
              </div>
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Design your Brand Strategy <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Instantly.</span>
              </h2>
              <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
                Upload your logo and website. Our Virtual Architects will build your entire marketing identity in seconds.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
               {/* Decorative background blob */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

              <form onSubmit={handleAnalyze} className="space-y-8 relative z-10">
                
                <LogoUploader 
                  selectedFile={logoFile} 
                  onFileSelect={setLogoFile} 
                  onClear={() => setLogoFile(null)} 
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-3 ml-1">
                    2. Company Website
                  </label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://www.yourcompany.com"
                      className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-lg font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!logoFile || !websiteUrl || isAnalyzing}
                  className={`w-full py-5 rounded-[2rem] text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl transition-all transform active:scale-[0.98] ${
                    !logoFile || !websiteUrl || isAnalyzing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 hover:bg-black hover:shadow-slate-300'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Wand2 className="animate-spin" />
                      Architecting...
                    </>
                  ) : (
                    <>
                      Analyze Identity
                      <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: DASHBOARD */}
        {brandProfile && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Top Section: Brand Identity */}
            <section>
              <BrandAnalysisView brand={brandProfile} />
            </section>

            {/* Bottom Section: Generator & Results */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Generator Form */}
              <div className="lg:col-span-4 sticky top-28">
                <AssetGenerator 
                  isGenerating={isGeneratingAsset} 
                  onGenerate={handleGenerateAsset} 
                />
              </div>

              {/* Right Column: Results Stream */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Studio Output</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{generatedAssets.length} Assets</span>
                </div>

                {generatedAssets.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center text-slate-400 bg-slate-50/50 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                        <Wand2 size={32} className="text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">Workspace Empty</h4>
                    <p className="max-w-xs mx-auto">Use the generator on the left to start building your marketing campaign.</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {generatedAssets.map(asset => (
                      <ResultCard 
                        key={asset.id} 
                        asset={asset} 
                        onDelete={handleDeleteAsset} 
                      />
                    ))}
                  </div>
                )}
              </div>

            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
