import React, { useState } from 'react';
import { X, Send, Loader, RefreshCw, Eye } from 'lucide-react';
import type { EmailTemplate } from '../types';
import { replaceVariables, previewRandomSyntax, generateVariations } from '../utils/templateParser';
import { supabase } from '../lib/supabase';

interface Props {
  template: EmailTemplate;
  onClose: () => void;
}

const SAMPLE_DATA = {
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Inc'
};

const TemplatePreview = ({ template, onClose }: Props) => {
  const [previewData, setPreviewData] = useState(SAMPLE_DATA);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRandomized, setShowRandomized] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [showVariations, setShowVariations] = useState(false);

  const getPreviewContent = () => {
    const content = template.content;
    if (showRandomized) {
      return replaceVariables(content, previewData);
    }
    return previewRandomSyntax(replaceVariables(content, previewData));
  };

  const handleGenerateVariations = () => {
    const newVariations = generateVariations(template.content, previewData, 5);
    setVariations(newVariations);
    setShowVariations(true);
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setError('Please enter a test email address');
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      const { error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to: testEmail,
          subject: replaceVariables(template.subject, previewData),
          content: replaceVariables(template.content, previewData),
          template_id: template.id
        }
      });

      if (error) throw error;

      setSuccess('Test email sent successfully!');
      setTestEmail('');
    } catch (err) {
      console.error('Error sending test email:', err);
      setError('Failed to send test email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Template Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Preview Data</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(previewData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setPreviewData({ ...previewData, [key]: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-600">Preview</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRandomized(!showRandomized)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw size={14} />
                    {showRandomized ? 'Show Options' : 'Randomize'}
                  </button>
                  <button
                    onClick={handleGenerateVariations}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Eye size={14} />
                    Show Variations
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <h5 className="text-sm text-gray-500 mb-1">Subject</h5>
                <p className="font-medium">{replaceVariables(template.subject, previewData)}</p>
              </div>
              <div>
                <h5 className="text-sm text-gray-500 mb-1">Content</h5>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: getPreviewContent().replace(/\n/g, '<br>')
                  }}
                />
              </div>
            </div>
          </div>

          {showVariations && variations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Sample Variations</h3>
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: variation.replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">Send Test Email</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                onClick={handleSendTest}
                disabled={sending || !testEmail}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                Send Test
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="mt-2 text-sm text-green-600">{success}</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;