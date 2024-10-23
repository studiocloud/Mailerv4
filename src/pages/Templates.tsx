import React, { useState, useEffect } from 'react';
import { Plus, Eye, Code, Loader, AlertCircle } from 'lucide-react';
import type { EmailTemplate } from '../types';
import TemplateEditor from '../components/TemplateEditor';
import TemplatePreview from '../components/TemplatePreview';
import { supabase } from '../lib/supabase';

const Templates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content
      })));
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: EmailTemplate) => {
    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update({
            name: template.name,
            subject: template.subject,
            content: template.content
          })
          .eq('id', template.id);

        if (error) throw error;

        setTemplates(templates.map(t => t.id === template.id ? template : t));
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('templates')
          .insert([{
            name: template.name,
            subject: template.subject,
            content: template.content
          }])
          .select()
          .single();

        if (error) throw error;

        setTemplates([{
          id: data.id,
          name: data.name,
          subject: data.subject,
          content: data.content
        }, ...templates]);
      }

      setShowEditor(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Email Templates</h1>
        <button
          onClick={() => setShowEditor(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          New Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{template.subject}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowEditor(true);
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Code size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowPreview(true);
                }}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showEditor && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No templates yet. Create your first email template.</p>
        </div>
      )}

      {showEditor && (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default Templates;