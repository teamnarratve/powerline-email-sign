import React, { useState } from 'react';
import { SignatureData } from '../types';
import { BRANCHES } from '../constants';
import { Building2, User, Phone, Mail, MapPin } from 'lucide-react';

interface SignatureFormProps {
  data: SignatureData;
  onChange: (key: keyof SignatureData, value: string) => void;
}

const SignatureForm: React.FC<SignatureFormProps> = ({ data, onChange }) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(BRANCHES[0].id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.name as keyof SignatureData, e.target.value);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    setSelectedBranchId(branchId);
    
    const branch = BRANCHES.find(b => b.id === branchId);
    if (branch) {
      onChange('address', branch.address);
      onChange('officePhone', branch.officePhone);
      onChange('branchEmail', branch.branchEmail);
    }
  };

  const inputWrapperClass = "space-y-1.5";
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider";
  const selectClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-base sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer";

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 mt-2">
      <Icon size={16} className="text-blue-500" />
      <span className="text-sm font-semibold text-slate-700">{title}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Branch Selection Box - Prominent */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
        <label className={`${labelClass} mb-2 block text-blue-600`}>Select Office Location</label>
        <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={selectedBranchId} 
              onChange={handleBranchChange} 
              className={`${selectClass} pl-10`}
            >
              {BRANCHES.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.label}</option>
              ))}
            </select>
        </div>
      </div>

      {/* Identity Section */}
      <div>
        <SectionHeader icon={User} title="Personal Information" />
        <div className="space-y-4">
            <div className={inputWrapperClass}>
                <label className={labelClass}>Full Name</label>
                <input 
                type="text" 
                name="fullName" 
                value={data.fullName} 
                onChange={handleChange} 
                className={inputClass}
                placeholder="Ex. John Doe"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={inputWrapperClass}>
                    <label className={labelClass}>Job Title</label>
                    <input 
                        type="text" 
                        name="jobTitle" 
                        value={data.jobTitle} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>
                <div className={inputWrapperClass}>
                    <label className={labelClass}>Business Unit</label>
                    <input 
                        type="text" 
                        name="businessUnit" 
                        value={data.businessUnit} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <SectionHeader icon={Phone} title="Contact Numbers" />
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className={`${inputWrapperClass} col-span-2`}>
                    <label className={labelClass}>Office Phone</label>
                    <input 
                        type="text" 
                        name="officePhone" 
                        value={data.officePhone} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>
                <div className={inputWrapperClass}>
                    <label className={labelClass}>Ext.</label>
                    <input 
                        type="text" 
                        name="extension" 
                        value={data.extension} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={inputWrapperClass}>
                    <label className={labelClass}>Mobile</label>
                    <input 
                        type="text" 
                        name="mobileNumber" 
                        value={data.mobileNumber} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>
                <div className={inputWrapperClass}>
                    <label className={labelClass}>Fax</label>
                    <input 
                        type="text" 
                        name="faxNumber" 
                        value={data.faxNumber} 
                        onChange={handleChange} 
                        className={inputClass}
                        placeholder="Optional"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Digital Section */}
      <div>
        <SectionHeader icon={Mail} title="Digital Contact" />
        <div className="space-y-4">
            <div className={inputWrapperClass}>
                <label className={labelClass}>Personal Email</label>
                <input 
                type="email" 
                name="email" 
                value={data.email} 
                onChange={handleChange} 
                className={inputClass}
                />
            </div>

            <div className={inputWrapperClass}>
                <label className={labelClass}>Branch Contact Email</label>
                <input 
                type="email" 
                name="branchEmail" 
                value={data.branchEmail} 
                onChange={handleChange} 
                className={inputClass}
                />
            </div>
        </div>
      </div>

      {/* Location Section */}
      <div>
        <SectionHeader icon={MapPin} title="Location" />
        <div className={inputWrapperClass}>
            <label className={labelClass}>Office Address</label>
            <textarea 
            name="address" 
            value={data.address} 
            readOnly
            rows={4}
            className={`${inputClass} resize-none font-mono text-xs leading-relaxed bg-slate-100 text-slate-500 cursor-not-allowed`}
            />
        </div>
      </div>

    </div>
  );
};

export default SignatureForm;