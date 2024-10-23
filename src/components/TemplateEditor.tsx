import React, { useState } from 'react';
import { X, Variable, Shuffle, AlertCircle } from 'lucide-react';
import type { EmailTemplate } from '../types';
import { validateRandomSyntax } from '../utils/templateParser';

interface Props {
  template?: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onClose: () => void;
}

const VARIABLES = [
  { key: 'name', label: 'Lead Name' },
  { key: 'email', label: 'Lead Email' },
  { key: 'company', label: 'Company Name' },
];

const TemplateEditor = ({ template, onSave, onClose }: Props) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.content || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRandomSyntax(content);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid template syntax');
      return;
    }

    onSave({
      id: template?.id || '',
      name,
      subject,
      content
    });
  };

  const insertVariable = (key: string) => {
    const variable = `{{ ${key} }}`;
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + variable + content.substring(end);
    setContent(newContent);
  };

  const insertRandomBlock = () => {
    const randomBlock = '{{ RANDOM | option1 | option2 | option3 }}';
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newBlock = randomBlock;
    if (selectedText) {
      newBlock = `{{ RANDOM | ${selectedText} | alternative }}`;
    }
    
    const newContent = content.substring(0, start) + newBlock + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Content
              </label>
              <div className="mb-2 flex gap-2">
                <div className="flex gap-2">
                  {VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => insertVariable(variable.key)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    >
                      <Variable size={14} />
                      {variable.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={insertRandomBlock}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                >
                  <Shuffle size={14} />
                  Add Random Text
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                <p>Random Syntax: <code>{'{{ RANDOM | option1 | option2 | option3 }}'}</code></p>
                <p>Example: {'{{ RANDOM | Hello | Hi | Hey }} {{ name }},'}</p>
              </div>
              <textarea
                id="template-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                className="w-full h-96 p-3 border rounded-lg font-mono text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;