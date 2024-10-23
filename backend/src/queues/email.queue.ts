import Queue from 'bull';
import { createTransport } from 'nodemailer';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { replaceVariables } from '../utils/template';

interface EmailJob {
  campaignId: string;
  templateId: string;
  emailAccountId: string;
  leadId: string;
}

export const emailQueue = new Queue<EmailJob>('email-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

emailQueue.process(async (job) => {
  const { campaignId, templateId, emailAccountId, leadId } = job.data;

  try {
    // Fetch required data
    const [emailAccount, template, lead] = await Promise.all([
      supabase
        .from('email_accounts')
        .select('*')
        .eq('id', emailAccountId)
        .single(),
      supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single(),
      supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()
    ]);

    if (!emailAccount.data || !template.data || !lead.data) {
      throw new Error('Required data not found');
    }

    // Create transport
    const transport = createTransport({
      host: emailAccount.data.smtp_host,
      port: emailAccount.data.smtp_port,
      secure: emailAccount.data.use_tls,
      auth: {
        user: emailAccount.data.email,
        pass: emailAccount.data.password
      }
    });

    // Replace variables in template
    const content = replaceVariables(template.data.content, {
      name: lead.data.name,
      email: lead.data.email,
      company: lead.data.company
    });

    const subject = replaceVariables(template.data.subject, {
      name: lead.data.name,
      company: lead.data.company
    });

    // Send email
    await transport.sendMail({
      from: emailAccount.data.email,
      to: lead.data.email,
      subject,
      html: content
    });

    // Update campaign metrics
    await supabase.rpc('increment_campaign_metrics', {
      p_campaign_id: campaignId,
      p_successful: true
    });

    // Update email account sent count
    await supabase.rpc('increment_sent_count', {
      p_email_account_id: emailAccountId
    });

    logger.info(`Email sent successfully to ${lead.data.email}`);
  } catch (error) {
    // Update campaign metrics for failed email
    await supabase.rpc('increment_campaign_metrics', {
      p_campaign_id: campaignId,
      p_successful: false
    });

    logger.error('Error sending email:', error);
    throw error;
  }
});

emailQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

emailQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});