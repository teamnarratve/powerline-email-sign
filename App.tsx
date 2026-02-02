import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Download, Image as ImageIcon, Copy, RefreshCcw, Sparkles, AlertCircle, Code2 } from 'lucide-react';
import FileSaver from 'file-saver';
import { SignatureData } from './types';
import { INITIAL_DATA } from './constants';
import { generateSignatureHTML } from './utils/template';
import SignatureForm from './components/SignatureForm';
import SignaturePreview, { PreviewHandle } from './components/SignaturePreview';
import SuccessModal from './components/SuccessModal';
import { supabase } from './utils/supabase';
import Login from './components/Login';
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

const App: React.FC = () => {
  const [data, setData] = useState<SignatureData>(INITIAL_DATA);
  const previewRef = useRef<PreviewHandle>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'generator' | 'admin'>('generator');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session?.user?.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string | undefined) => {
    if (!userId) {
        setIsAdmin(false);
        return;
    }
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    setIsAdmin(data?.role === 'admin');
  };

  // Auto-save removed as per request. Data is now saved only on specific actions (Download/Copy).
  // Kept empty structure if we need other side effects later, or just remove.
  // Actually, let's just remove the effect block.

  const saveSignature = async () => {
      if (!session?.user) return;
      try {
          await supabase.from('generated_signatures').insert({
              user_id: session.user.id,
              full_name: data.fullName,
              job_title: data.jobTitle,
              mobile: data.mobileNumber,
              department: data.businessUnit,
              email: data.email
          });
      } catch (err) {
          console.error("Failed to save signature", err);
      }
  };

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
    saveSignature();
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    // @ts-ignore
    const save = FileSaver.saveAs || FileSaver;
    save(blob, `${data.fullName.replace(/\s+/g, '_')}_Signature.html`);
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    saveSignature();
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
      saveSignature(); // Also save on Copy
      navigator.clipboard.writeText(generatedHtml).then(() => {
          setShowSuccessModal(true);
      }, () => {
          alert("Failed to copy code.");
      });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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
             <div className="h-6 w-px bg-slate-200 mx-1 hidden xs:block"></div>
             {isAdmin && (
                <button
                    onClick={() => setView(view === 'admin' ? 'generator' : 'admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        view === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {view === 'admin' ? 'Back' : 'Admin'}
                </button>
            )}
             <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Sign Out"
             >
                <div className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </div>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {view === 'admin' ? (
            <React.Suspense fallback={<div>Loading...</div>}>
                <AdminDashboard />
            </React.Suspense>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* Left Column - Form */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Signature Details
                        </h2>
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

              {/* Right Column - Preview */}
              <div className="lg:col-span-8 flex flex-col gap-6 lg:sticky lg:top-24">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px] xl:min-h-[600px] max-h-[calc(100vh-8rem)]">
                     {/* Browser-like Header */}
                     <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
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
                     <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-50 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                         </div>
                         
                         <div className="w-full h-full overflow-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent flex items-center justify-center">
                            <div className="relative z-10 w-auto min-w-fit max-w-full shadow-2xl shadow-slate-200/50 rounded-lg mx-auto bg-white">
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
        )}
      </main>
    </div>
  );
};

export default App;