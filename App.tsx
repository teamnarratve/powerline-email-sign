import React, { useState, useRef, useMemo } from 'react';
import { Download, Image as ImageIcon, Copy, RefreshCcw, Sparkles, AlertCircle } from 'lucide-react';
import FileSaver from 'file-saver';
import { SignatureData } from './types';
import { INITIAL_DATA } from './constants';
import { generateSignatureHTML } from './utils/template';
import SignatureForm from './components/SignatureForm';
import SignaturePreview, { PreviewHandle } from './components/SignaturePreview';
import SuccessModal from './components/SuccessModal';

const App: React.FC = () => {
  const [data, setData] = useState<SignatureData>(INITIAL_DATA);
  const previewRef = useRef<PreviewHandle>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDataChange = (key: keyof SignatureData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all fields to default?")) {
        setData(INITIAL_DATA);
    }
  };

  const generatedHtml = useMemo(() => generateSignatureHTML(data), [data]);

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    // @ts-ignore
    const save = FileSaver.saveAs || FileSaver;
    save(blob, `${data.fullName.replace(/\s+/g, '_')}_Signature.html`);
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
        const blob = await previewRef.current.captureImage();
        if (blob) {
            // @ts-ignore
            const save = FileSaver.saveAs || FileSaver;
            save(blob, `${data.fullName.replace(/\s+/g, '_')}_Signature.png`);
        } else {
            alert("Failed to generate image.");
        }
    } catch (e) {
        console.error(e);
        alert("An unexpected error occurred during image export.");
    } finally {
        setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedHtml).then(() => {
          setShowSuccessModal(true);
      }, () => {
          alert("Failed to copy code.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Powerline Solutions Logo" className="h-9 w-auto object-contain" />
             <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">Powerline Solutions</h1>
                <p className="hidden sm:block text-[10px] font-medium text-slate-500 uppercase tracking-widest">Email Signature</p>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
             <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Reset to Default"
             >
                <RefreshCcw size={18} />
             </button>
             <div className="h-6 w-px bg-slate-200 mx-1 hidden xs:block"></div>
             <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                title="Copy HTML Code"
             >
                <Copy size={16} />
                <span className="hidden md:inline">Copy HTML</span>
             </button>
             <button 
                onClick={downloadHtml}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                title="Download HTML File"
             >
                <Download size={16} />
                <span className="hidden md:inline">HTML</span>
             </button>
             <button 
                onClick={downloadImage}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                title="Export as PNG Image"
             >
                {isExporting ? <Sparkles className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PNG'}</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* Left Column: Form (Now appears first on mobile naturally) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Signature Details
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">Auto-saving</span>
                </div>
                <div className="p-4 sm:p-6">
                    <SignatureForm data={data} onChange={handleDataChange} />
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">Tips for Best Results</h3>
                        <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                            For Outlook, use the "Copy HTML" button and paste directly into your signature settings. 
                            Use the PNG export only if HTML is not supported, as it removes link clickability.
                        </p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8 flex flex-col gap-6 lg:sticky lg:top-24">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px] xl:min-h-[600px]">
                 {/* Browser-like Header */}
                 <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                         </div>
                         <div className="ml-4 px-3 py-1 bg-white rounded-md border border-slate-200 text-xs text-slate-500 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Preview
                         </div>
                     </div>
                 </div>

                 {/* Preview Canvas */}
                 {/* Added overflow-x-auto to allow scrolling on small mobile screens without breaking layout */}
                 <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-50 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
                     {/* Checkered pattern overlay for transparency feel */}
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                     </div>
                     
                     {/* Scroll Wrapper for Mobile */}
                     <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                        <div className="relative z-10 w-full min-w-[740px] max-w-[740px] shadow-2xl shadow-slate-200/50 rounded-lg mx-auto">
                            <SignaturePreview 
                                htmlContent={generatedHtml} 
                                ref={previewRef}
                            />
                        </div>
                     </div>
                 </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;