import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { GeneratedSignature, SignatureData } from '../types';
import { Loader2, ShieldAlert, Download, Search, Users, FileText, Eye, X, Copy, Image as LucideImage, Code2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { INITIAL_DATA } from '../constants';
import { generateSignatureHTML } from '../utils/template';
import SignaturePreview from './SignaturePreview';

const AdminDashboard: React.FC = () => {
    const [signatures, setSignatures] = useState<GeneratedSignature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedSig, setSelectedSig] = useState<GeneratedSignature | null>(null);

    useEffect(() => {
        fetchSignatures();
    }, []);

    const fetchSignatures = async () => {
        try {
            const { data, error } = await supabase
                .from('generated_signatures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSignatures(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(signatures);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Signatures");
        XLSX.writeFile(workbook, "ProSig_Employee_Signatures.xlsx");
    };

    const mapToSignatureData = (sig: GeneratedSignature): SignatureData => {
        return {
            ...INITIAL_DATA,
            fullName: sig.full_name || '',
            jobTitle: sig.job_title || '',
            businessUnit: sig.department || '',
            mobileNumber: sig.mobile || '',
            email: sig.email || '',
        };
    };

    const filteredSignatures = signatures.filter(sig => 
        sig.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sig.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sig.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
                You do not have permission to view this data. Only administrators can access this dashboard.
            </p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Admin Dashboard
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        View and export generated employee signatures.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Job Title</th>
                            <th className="px-6 py-3">Department</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Created</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSignatures.map((sig) => (
                            <tr key={sig.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{sig.full_name}</div>
                                    <div className="text-xs text-slate-500">{sig.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{sig.job_title}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {sig.department}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{sig.mobile}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(sig.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedSig(sig)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                        title="View Signature"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSignatures.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 text-slate-300" />
                                        <p>No signatures found matching your search.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 text-center">
                Total Records: {filteredSignatures.length}
            </div>

            {/* Preview Modal */}
            {selectedSig && (
                <SignatureModal 
                    signature={selectedSig} 
                    onClose={() => setSelectedSig(null)} 
                />
            )}
        </div>
    );
};

interface SignatureModalProps {
    signature: GeneratedSignature;
    onClose: () => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ signature, onClose }) => {
    // Correct type for the ref based on SignaturePreview's exposed handle
    const previewRef = React.useRef<{ captureImage: () => Promise<Blob | null> }>(null);
    
    const mapToSignatureData = (sig: GeneratedSignature): SignatureData => {
        return {
            ...INITIAL_DATA,
            fullName: sig.full_name || '',
            jobTitle: sig.job_title || '',
            businessUnit: sig.department || '',
            mobileNumber: sig.mobile || '',
            email: sig.email || '',
        };
    };

    const data = mapToSignatureData(signature);
    const htmlContent = generateSignatureHTML(data);

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(htmlContent);
        // Could add a toast here, but alert is simple for now
        alert('Signature HTML copied to clipboard!');
    };

    const handleDownloadHtml = () => {
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        // @ts-ignore
        const save = FileSaver.saveAs || FileSaver;
        save(blob, `${signature.full_name.replace(/\s+/g, '_')}_Signature.html`);
    };

    const handleExportPng = async () => {
        if (previewRef.current) {
            try {
                // The methods exposed by SignaturePreview is captureImage, not exportPng
                const blob = await previewRef.current.captureImage();
                if (blob) {
                    // @ts-ignore
                    const save = FileSaver.saveAs || FileSaver;
                    save(blob, `${signature.full_name.replace(/\s+/g, '_')}_Signature.png`);
                } else {
                    console.error("Failed to capture image: blob is null");
                    alert("Failed to generate PNG. Please try again.");
                }
            } catch (err) {
                console.error("Export PNG error:", err);
                alert("An error occurred while exporting PNG.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Signature Preview</h3>
                        <p className="text-sm text-slate-500">
                            {signature.full_name} • {signature.job_title}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 bg-slate-100/50 flex flex-col gap-6 overflow-y-auto">
                    {/* Action Toolbar */}
                    <div className="flex flex-wrap justify-end gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <button
                            onClick={handleCopyHtml}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                        >
                            <Copy size={16} />
                            Copy HTML
                        </button>
                        <button
                            onClick={handleDownloadHtml}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                        >
                            <Code2 size={16} />
                            Download HTML
                        </button>
                        <button
                            onClick={handleExportPng}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                            <LucideImage size={16} />
                            Export PNG
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex justify-center min-h-[300px]">
                        <div className="w-full max-w-2xl">
                            <SignaturePreview 
                                ref={previewRef}
                                htmlContent={htmlContent} 
                            />
                        </div>
                    </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1">Note:</p>
                        <p>This preview uses stored data combined with current default settings for address, logo, and generic branch info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
