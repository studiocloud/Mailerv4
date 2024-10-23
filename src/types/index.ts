export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  smtpHost: string;
  smtpPort: number;
  useTLS: boolean;
  dailyLimit: number;
  sentToday: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  leadListIds: string[];
  emailAccountIds: string[];
  schedule: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  status: 'draft' | 'active' | 'completed' | 'paused';
  metrics: {
    sent: number;
    successful: number;
    failed: number;
  };
}