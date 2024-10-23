import React, { useState, useEffect } from 'react';
import { Plus, Mail, Trash2, Server, Upload, Download, FileDown, Loader, AlertCircle } from 'lucide-react';
import type { EmailAccount } from '../types';
import EmailAccountImportModal from '../components/EmailAccountImportModal';
import { supabase } from '../lib/supabase';

const EmailAccounts = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    password: '',
    smtpHost: '',
    smtpPort: 587,
    useTLS: true,
    dailyLimit: 100,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data.map(account => ({
        ...account,
        id: account.id,
        name: account.name,
        email: account.email,
        password: account.password,
        smtpHost: account.smtp_host,
        smtpPort: account.smtp_port,
        useTLS: account.use_tls,
        dailyLimit: account.daily_limit,
        sentToday: account.sent_today
      })));
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load email accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .insert([{
          name: newAccount.name,
          email: newAccount.email,
          password: newAccount.password,
          smtp_host: newAccount.smtpHost,
          smtp_port: newAccount.smtpPort,
          use_tls: newAccount.useTLS,
          daily_limit: newAccount.dailyLimit,
          sent_today: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setAccounts([{
        id: data.id,
        ...newAccount,
        sentToday: 0
      }, ...accounts]);

      setNewAccount({
        name: '',
        email: '',
        password: '',
        smtpHost: '',
        smtpPort: 587,
        useTLS: true,
        dailyLimit: 100
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Failed to add email account');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.filter(account => account.id !== id));
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete email account');
    }
  };

  const handleImport = async (importedAccounts: EmailAccount[]) => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .insert(
          importedAccounts.map(account => ({
            name: account.name,
            email: account.email,
            password: account.password,
            smtp_host: account.smtpHost,
            smtp_port: account.smtpPort,
            use_tls: account.useTLS,
            daily_limit: account.dailyLimit,
            sent_today: 0
          }))
        )
        .select();

      if (error) throw error;

      const newAccounts = data.map(account => ({
        id: account.id,
        name: account.name,
        email: account.email,
        password: account.password,
        smtpHost: account.smtp_host,
        smtpPort: account.smtp_port,
        useTLS: account.use_tls,
        dailyLimit: account.daily_limit,
        sentToday: account.sent_today
      }));

      setAccounts([...newAccounts, ...accounts]);
    } catch (err) {
      console.error('Error importing accounts:', err);
      setError('Failed to import email accounts');
    }
  };

  const handleExport = () => {
    const csv = accounts.map(account => 
      `${account.name},${account.email},${account.password},${account.smtpHost},${account.smtpPort},${account.dailyLimit}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_accounts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = `Account Name,Email Address,Password,SMTP Host,SMTP Port,Daily Limit
Marketing Account,marketing@company.com,yourpassword,smtp.gmail.com,587,100
Support Account,support@company.com,yourpassword,smtp.gmail.com,587,150
Sales Account,sales@company.com,yourpassword,smtp.gmail.com,587,200`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_accounts_template.csv';
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
        <h1 className="text-2xl font-bold text-gray-800">Email Accounts</h1>
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
            Add Account
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Marketing Account"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={newAccount.smtpHost}
                  onChange={(e) => setNewAccount({ ...newAccount, smtpHost: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={newAccount.smtpPort}
                  onChange={(e) => setNewAccount({ ...newAccount, smtpPort: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="65535"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Sending Limit
                </label>
                <input
                  type="number"
                  value={newAccount.dailyLimit}
                  onChange={(e) => setNewAccount({ ...newAccount, dailyLimit: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  required
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newAccount.useTLS}
                    onChange={(e) => setNewAccount({ ...newAccount, useTLS: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  Use TLS/SSL
                </label>
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
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.email}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <Server size={14} />
                    {account.smtpHost}:{account.smtpPort}
                  </div>
                  <p className="text-sm text-gray-500">
                    {account.sentToday} / {account.dailyLimit} emails sent today
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(account.sentToday / account.dailyLimit) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No email accounts added yet. Add your first email account to start sending campaigns.</p>
        </div>
      )}

      {showImportModal && (
        <EmailAccountImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
};

export default EmailAccounts;