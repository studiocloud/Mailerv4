import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Square, Loader, AlertCircle } from 'lucide-react';
import type { Campaign, EmailAccount, EmailTemplate } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  campaign: Partial<Campaign>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (campaign: Partial<Campaign>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const CampaignForm = ({ campaign, onSubmit, onChange, onCancel, isEditing }: Props) => {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchEmailAccounts(), fetchTemplates()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchEmailAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmailAccounts(data.map(account => ({
        ...account,
        id: account.id,
        name: account.name,
        email: account.email,
        smtpHost: account.smtp_host,
        smtpPort: account.smtp_port,
        useTLS: account.use_tls,
        dailyLimit: account.daily_limit,
        sentToday: account.sent_today
      })));
    } catch (err) {
      console.error('Error fetching email accounts:', err);
      setError('Failed to load email accounts');
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');

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
    }
  };

  const handleSelectAllAccounts = () => {
    const allAccountIds = emailAccounts.map(account => account.id);
    onChange({ ...campaign, emailAccountIds: allAccountIds });
  };

  const handleDeselectAllAccounts = () => {
    onChange({ ...campaign, emailAccountIds: [] });
  };

  const toggleEmailAccount = (accountId: string) => {
    const currentIds = campaign.emailAccountIds || [];
    const newIds = currentIds.includes(accountId)
      ? currentIds.filter(id => id !== accountId)
      : [...currentIds, accountId];
    onChange({ ...campaign, emailAccountIds: newIds });
  };

  const toggleDay = (day: string) => {
    const currentDays = campaign.schedule?.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    onChange({
      ...campaign,
      schedule: {
        ...campaign.schedule!,
        days: newDays
      }
    });
  };

  const handleSelectAllDays = () => {
    onChange({
      ...campaign,
      schedule: {
        ...campaign.schedule!,
        days: DAYS.map(day => day.value)
      }
    });
  };

  const handleDeselectAllDays = () => {
    onChange({
      ...campaign,
      schedule: {
        ...campaign.schedule!,
        days: []
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaign.name || ''}
              onChange={(e) => onChange({ ...campaign, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template
            </label>
            <select
              value={campaign.templateId || ''}
              onChange={(e) => onChange({ ...campaign, templateId: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select a template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Accounts
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllAccounts}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllAccounts}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
              {emailAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => toggleEmailAccount(account.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    campaign.emailAccountIds?.includes(account.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {campaign.emailAccountIds?.includes(account.id) ? (
                    <CheckSquare className="text-blue-600 flex-shrink-0" size={20} />
                  ) : (
                    <Square className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{account.name}</p>
                    <p className="text-sm text-gray-500 truncate">{account.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {account.sentToday} / {account.dailyLimit} sent today
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {emailAccounts.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No email accounts available. Add email accounts first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Start Time</label>
                  <input
                    type="time"
                    value={campaign.schedule?.startTime || '09:00'}
                    onChange={(e) => onChange({
                      ...campaign,
                      schedule: { ...campaign.schedule!, startTime: e.target.value }
                    })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">End Time</label>
                  <input
                    type="time"
                    value={campaign.schedule?.endTime || '17:00'}
                    onChange={(e) => onChange({
                      ...campaign,
                      schedule: { ...campaign.schedule!, endTime: e.target.value }
                    })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-600">Running Days</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllDays}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllDays}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {DAYS.map((day) => (
                    <div
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        campaign.schedule?.days?.includes(day.value)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {campaign.schedule?.days?.includes(day.value) ? (
                        <CheckSquare className="text-blue-600" size={16} />
                      ) : (
                        <Square className="text-gray-400" size={16} />
                      )}
                      <span className="text-sm">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {isEditing ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;