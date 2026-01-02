import React, { useState } from 'react';
import { FiDownload, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportJSON,
  label = 'Export',
  variant = 'secondary',
  size = 'md',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      if (format === 'csv') {
        await onExportCSV();
        toast.success('CSV exported successfully!');
      } else {
        await onExportJSON();
        toast.success('JSON exported successfully!');
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`);
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 relative';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
    minimal: 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const dropdownSizeClasses = {
    sm: 'text-xs py-1.5',
    md: 'text-sm py-2',
    lg: 'text-base py-2.5'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
          (disabled || isExporting) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Export data"
        aria-label="Export data"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : (
          <FiDownload className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        )}
        <span>{label}</span>
        <FiChevronDown className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && !isExporting && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className={`w-full px-4 ${dropdownSizeClasses[size]} text-left hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700`}
            >
              <span className="text-green-600"></span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className={`w-full px-4 ${dropdownSizeClasses[size]} text-left hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700 border-t border-gray-100`}
            >
              <span className="text-blue-600"></span>
              <span>Export as JSON</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
