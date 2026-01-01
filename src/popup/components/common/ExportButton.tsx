import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
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
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = (type: 'csv' | 'json') => {
    try {
      if (type === 'csv') {
        onExportCSV();
        toast.success('CSV exported successfully!', {
          duration: 2000,
          position: 'top-center',
        });
      } else {
        onExportJSON();
        toast.success('JSON exported successfully!', {
          duration: 2000,
          position: 'top-center',
        });
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    minimal: 'bg-transparent text-blue-600 hover:bg-blue-50'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={`
          flex items-center space-x-1.5 rounded-lg font-medium transition-colors
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <FiDownload size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        <span>{label}</span>
      </button>

      {showDropdown && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-2"
            >
              <FiDownload size={14} />
              <span>Export as CSV</span>
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-2"
            >
              <FiDownload size={14} />
              <span>Export as JSON</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
