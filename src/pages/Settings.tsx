import React, { useState, useEffect } from 'react';
import { Bell, Mail, Shield, Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NotificationSmtpModal from '../components/NotificationSmtpModal';

interface UserSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  daily_reports: boolean;
  weekly_reports: boolean;
  security_alerts: boolean;
  max_daily_emails: number;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from: string | null;
}

const defaultSettings: Omit<UserSettings, 'user_id'> = {
  email_notifications: false,
  daily_reports: false,
  weekly_reports: false,
  security_alerts: false,
  max_daily_emails: 1000,
  smtp_host: null,
  smtp_port: null,
  smtp_user: null,
  smtp_pass: null,
  smtp_from: null
};

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<UserSettings>({
    ...defaultSettings,
    user_id: user?.id || ''
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          id: data.id,
          user_id: data.user_id,
          email_notifications: data.email_notifications,
          daily_reports: data.daily_reports,
          weekly_reports: data.weekly_reports,
          security_alerts: data.security_alerts,
          max_daily_emails: data.max_daily_emails,
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_user: data.smtp_user,
          smtp_pass: data.smtp_pass,
          smtp_from: data.smtp_from
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const settingsData = {
        email_notifications: settings.email_notifications,
        daily_reports: settings.daily_reports,
        weekly_reports: settings.weekly_reports,
        security_alerts: settings.security_alerts,
        max_daily_emails: settings.max_daily_emails,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_pass: settings.smtp_pass,
        smtp_from: settings.smtp_from
      };

      let result;
      
      if (settings.id) {
        result = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('id', settings.id);
      } else {
        result = await supabase
          .from('user_settings')
          .insert([{ ...settingsData, user_id: user.id }]);
      }

      if (result.error) throw result.error;

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      await fetchSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof UserSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleMaxDailyEmailsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      max_daily_emails: Math.max(0, numValue)
    }));
  };

  const handleSaveSmtpSettings = (smtpSettings: {
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_pass: string;
    smtp_from: string;
  }) => {
    setSettings(prev => ({
      ...prev,
      smtp_host: smtpSettings.smtp_host,
      smtp_port: parseInt(smtpSettings.smtp_port),
      smtp_user: smtpSettings.smtp_user,
      smtp_pass: smtpSettings.smtp_pass,
      smtp_from: smtpSettings.smtp_from
    }));
    setShowSmtpModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="text-gray-500" size={20} />
              <span>Email Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.email_notifications}
                onChange={() => handleToggle('email_notifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="text-gray-500" size={20} />
              <span>Daily Reports</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.daily_reports}
                onChange={() => handleToggle('daily_reports')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="text-gray-500" size={20} />
              <span>Weekly Reports</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.weekly_reports}
                onChange={() => handleToggle('weekly_reports')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-gray-500" size={20} />
              <span>Security Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.security_alerts}
                onChange={() => handleToggle('security_alerts')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSmtpModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Configure Notification SMTP
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Sending Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Daily Emails (All Accounts)
            </label>
            <input
              type="number"
              value={settings.max_daily_emails}
              onChange={(e) => handleMaxDailyEmailsChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
            />
          </div>
        </div>
      </div>

      {showSmtpModal && (
        <NotificationSmtpModal
          settings={{
            smtp_host: settings.smtp_host || '',
            smtp_port: settings.smtp_port?.toString() || '',
            smtp_user: settings.smtp_user || '',
            smtp_pass: settings.smtp_pass || '',
            smtp_from: settings.smtp_from || ''
          }}
          onSave={handleSaveSmtpSettings}
          onClose={() => setShowSmtpModal(false)}
        />
      )}
    </div>
  );
};

export default Settings;