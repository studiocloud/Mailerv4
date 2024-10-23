import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, FileDown, Loader, AlertCircle } from 'lucide-react';
import type { Lead } from '../types';
import LeadImportModal from '../components/LeadImportModal';
import LeadList from '../components/LeadList';
import { supabase } from '../lib/supabase';

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company
      })));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: newLead.name,
          email: newLead.email,
          company: newLead.company
        }])
        .select()
        .single();

      if (error) throw error;

      setLeads([{
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company
      }, ...leads]);

      setNewLead({ name: '', email: '', company: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding lead:', err);
      setError('Failed to add lead');
    }
  };

  const handleImport = async (importedLeads: Lead[]) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(
          importedLeads.map(lead => ({
            name: lead.name,
            email: lead.email,
            company: lead.company
          }))
        )
        .select();

      if (error) throw error;

      const newLeads = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company
      }));

      setLeads([...newLeads, ...leads]);
    } catch (err) {
      console.error('Error importing leads:', err);
      setError('Failed to import leads');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead');
    }
  };

  const handleExport = () => {
    const csv = [
      'Name,Email,Company',
      ...leads.map(lead => `${lead.name},${lead.email},${lead.company}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = `Name,Email,Company
John Doe,john@example.com,Acme Inc
Jane Smith,jane@example.com,Tech Corp
Mike Johnson,mike@example.com,Global Solutions`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <h1 className="text-2xl font-bold text-gray-800">Lead Lists</h1>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="bg-white text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 border"
          >
            <FileDown size={20} />
            Download Template
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-white text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 border"
          >
            <Upload size={20} />
            Import CSV
          </button>
          <button
            onClick={handleExport}
            className="bg-white text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 border"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleAddLead}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}

      <LeadList
        leads={leads}
        onDelete={handleDelete}
      />

      {showImportModal && (
        <LeadImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
};

export default Leads;