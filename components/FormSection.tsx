import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-gray-700">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

export default FormSection;
