import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Settings = {
  notifications: {
    emailNotifications: boolean;
    campaignAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  sending: {
    maxDailyEmails: number;
    retryAttempts: number;
    delayBetweenEmails: number;
  };
};

type SmtpConfig = {
  host: string;
  port: string;
  email: string;
  password: string;
  name: string;
};

const defaultSettings: Settings = {
  notifications: {
    emailNotifications: true,
    campaignAlerts: true,
    weeklyReports: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30
  },
  sending: {
    maxDailyEmails: 1000,
    retryAttempts: 3,
    delayBetweenEmails: 5
  }
};

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: '',
    port: '',
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // If we have existing settings, use them
        setSettings(data.settings as Settings || defaultSettings);
        if (data.smtp_config) {
          setSmtpConfig(data.smtp_config as SmtpConfig);
        }
      } else {
        // If no settings exist, create default settings
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert([
            {
              user_id: userId,
              settings: defaultSettings,
              smtp_config: null
            }
          ]);

        if (insertError) {
          throw insertError;
        }

        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (
    newSettings: Settings,
    newSmtpConfig: SmtpConfig
  ) => {
    try {
      setError(null);

      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: newSettings,
          smtp_config: newSmtpConfig
        });

      if (upsertError) {
        throw upsertError;
      }

      setSettings(newSettings);
      setSmtpConfig(newSmtpConfig);

      return { success: true };
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
      return { success: false, error: 'Failed to save settings' };
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setSmtpConfig({
      host: '',
      port: '',
      email: '',
      password: '',
      name: ''
    });
  };

  return {
    settings,
    smtpConfig,
    loading,
    error,
    setSettings,
    setSmtpConfig,
    saveSettings,
    fetchSettings,
    resetSettings
  };
}