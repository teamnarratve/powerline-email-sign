import React from 'react';
import { X, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-green-50 px-6 py-8 flex flex-col items-center text-center border-b border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
                <CheckCircle size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Copied to Clipboard!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-[280px]">
                The HTML code for your signature is now ready to paste.
            </p>
        </div>

        {/* Instructions */}
        <div className="p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Next Steps</h4>
            
            <ol className="space-y-4">
                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center mt-0.5">1</span>
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Open Settings</span>
                        <p className="mt-0.5 text-xs">Go to your email client's signature settings (Outlook, Gmail, etc).</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center mt-0.5">2</span>
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Paste & Save</span>
                        <p className="mt-0.5 text-xs">Paste the code (Ctrl+V / Cmd+V) into the signature box and save.</p>
                    </div>
                </li>
            </ol>

            <div className="mt-6 pt-4 border-t border-slate-100">
                 <button 
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                    Got it
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
