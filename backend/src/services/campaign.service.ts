import { supabase } from '../utils/supabase';
import { emailQueue } from '../queues/email.queue';
import { logger } from '../utils/logger';

export class CampaignService {
  static async scheduleCampaign(campaignId: string) {
    try {
      // Fetch campaign data
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          template:templates(*),
          email_accounts:email_accounts(*),
          leads:leads(*)
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      if (!campaign) throw new Error('Campaign not found');

      // Calculate sending windows based on schedule
      const schedule = campaign.schedule;
      const startTime = new Date(`1970-01-01T${schedule.start_time}Z`);
      const endTime = new Date(`1970-01-01T${schedule.end_time}Z`);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
      
      // Calculate delay between emails based on daily limit
      const totalEmails = campaign.leads.length;
      const delayMinutes = totalMinutes / totalEmails;

      // Schedule emails
      campaign.leads.forEach((lead: any, index: number) => {
        const delay = index * delayMinutes * 60 * 1000; // Convert to milliseconds

        emailQueue.add({
          campaignId: campaign.id,
          templateId: campaign.template.id,
          emailAccountId: campaign.email_accounts[0].id, // For simplicity, using first email account
          leadId: lead.id
        }, {
          delay,
          jobId: `${campaign.id}-${lead.id}`
        });
      });

      // Update campaign status
      await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      logger.info(`Campaign ${campaignId} scheduled successfully`);
    } catch (error) {
      logger.error('Error scheduling campaign:', error);
      throw error;
    }
  }

  static async pauseCampaign(campaignId: string) {
    try {
      // Remove pending jobs
      const jobs = await emailQueue.getJobs(['delayed', 'waiting']);
      for (const job of jobs) {
        if (job.data.campaignId === campaignId) {
          await job.remove();
        }
      }

      // Update campaign status
      await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      logger.info(`Campaign ${campaignId} paused successfully`);
    } catch (error) {
      logger.error('Error pausing campaign:', error);
      throw error;
    }
  }
}