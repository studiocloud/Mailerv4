import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, FileUp } from 'lucide-react';
import type { Lead } from '../types';

interface Props {
  onClose: () => void;
  onImport: (leads: Lead[]) => void;
}

const LeadImportModal = ({ onClose, onImport }: Props) => {
  const [csvContent, setCsvContent] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): Lead[] => {
    const leads: Lead[] = content
      .split('\n')
      .filter(line => line.trim())
      .filter(line => !line.startsWith('Name,')) // Skip header row
      .map(line => {
        const [name, email, company] = line.split(',').map(s => s.trim());
        
        if (!name || !email || !company) {
          throw new Error('All fields are required');
        }

        if (!email.includes('@')) {
          throw new Error('Invalid email format');
        }

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          email,
          company
        };
      });

    return leads;
  };

  const handleImport = () => {
    try {
      const leads = parseCSV(csvContent);
      onImport(leads);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid CSV format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setCsvContent(content);
        setError('');
      } catch (err) {
        setError('Failed to read file');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Leads</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 hover:border-blue-500 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <FileUp size={32} className="text-gray-400 mb-2" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Choose CSV file
            </button>
            <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-1">CSV Format:</p>
            <p className="text-xs text-gray-500">Name,Email,Company</p>
            <p className="text-xs text-gray-500">John Doe,john@example.com,Acme Inc</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Content
            </label>
            <textarea
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setError('');
              }}
              className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
              placeholder="Paste CSV content here or upload a file"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!csvContent.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} />
            Import Leads
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadImportModal;