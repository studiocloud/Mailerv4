import React, { useState, useEffect } from 'react';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import type { Campaign } from '../types';
import CampaignForm from '../components/CampaignForm';
import CampaignList from '../components/CampaignList';
import { supabase } from '../lib/supabase';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    templateId: '',
    leadListIds: [],
    emailAccountIds: [],
    schedule: {
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        templateId: campaign.template_id,
        leadListIds: campaign.lead_list_ids,
        emailAccountIds: campaign.email_account_ids,
        schedule: {
          startTime: campaign.schedule.start_time,
          endTime: campaign.schedule.end_time,
          days: campaign.schedule.days
        },
        status: campaign.status,
        metrics: campaign.metrics
      })));
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('campaigns')
          .update({
            name: newCampaign.name,
            template_id: newCampaign.templateId,
            lead_list_ids: newCampaign.leadListIds,
            email_account_ids: newCampaign.emailAccountIds,
            schedule: {
              start_time: newCampaign.schedule?.startTime,
              end_time: newCampaign.schedule?.endTime,
              days: newCampaign.schedule?.days
            }
          })
          .eq('id', selectedCampaign.id);

        if (error) throw error;

        setCampaigns(campaigns.map(campaign => {
          if (campaign.id === selectedCampaign.id) {
            return {
              ...campaign,
              name: newCampaign.name!,
              templateId: newCampaign.templateId!,
              leadListIds: newCampaign.leadListIds!,
              emailAccountIds: newCampaign.emailAccountIds!,
              schedule: {
                startTime: newCampaign.schedule!.startTime,
                endTime: newCampaign.schedule!.endTime,
                days: newCampaign.schedule!.days
              }
            };
          }
          return campaign;
        }));
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from('campaigns')
          .insert([{
            name: newCampaign.name,
            template_id: newCampaign.templateId,
            lead_list_ids: newCampaign.leadListIds,
            email_account_ids: newCampaign.emailAccountIds,
            schedule: {
              start_time: newCampaign.schedule?.startTime,
              end_time: newCampaign.schedule?.endTime,
              days: newCampaign.schedule?.days
            },
            status: 'draft',
            metrics: {
              sent: 0,
              successful: 0,
              failed: 0
            }
          }])
          .select()
          .single();

        if (error) throw error;

        setCampaigns([{
          id: data.id,
          name: data.name,
          templateId: data.template_id,
          leadListIds: data.lead_list_ids,
          emailAccountIds: data.email_account_ids,
          schedule: {
            startTime: data.schedule.start_time,
            endTime: data.schedule.end_time,
            days: data.schedule.days
          },
          status: data.status,
          metrics: data.metrics
        }, ...campaigns]);
      }

      setNewCampaign({
        name: '',
        templateId: '',
        leadListIds: [],
        emailAccountIds: [],
        schedule: {
          startTime: '09:00',
          endTime: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      });
      setSelectedCampaign(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      templateId: campaign.templateId,
      leadListIds: campaign.leadListIds,
      emailAccountIds: campaign.emailAccountIds,
      schedule: {
        startTime: campaign.schedule.startTime,
        endTime: campaign.schedule.endTime,
        days: campaign.schedule.days
      }
    });
    setShowForm(true);
  };

  const toggleCampaignStatus = async (id: string) => {
    try {
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) return;

      const newStatus = campaign.status === 'active' ? 'paused' : 'active';

      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCampaigns(campaigns.map(campaign => {
        if (campaign.id === id) {
          return {
            ...campaign,
            status: newStatus
          };
        }
        return campaign;
      }));
    } catch (err) {
      console.error('Error updating campaign status:', err);
      setError('Failed to update campaign status');
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign');
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
        <h1 className="text-2xl font-bold text-gray-800">Email Campaigns</h1>
        <button
          onClick={() => {
            setSelectedCampaign(null);
            setNewCampaign({
              name: '',
              templateId: '',
              leadListIds: [],
              emailAccountIds: [],
              schedule: {
                startTime: '09:00',
                endTime: '17:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
              }
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {showForm && (
        <CampaignForm
          campaign={newCampaign}
          onSubmit={handleSubmit}
          onChange={setNewCampaign}
          onCancel={() => {
            setShowForm(false);
            setSelectedCampaign(null);
            setNewCampaign({
              name: '',
              templateId: '',
              leadListIds: [],
              emailAccountIds: [],
              schedule: {
                startTime: '09:00',
                endTime: '17:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
              }
            });
          }}
          isEditing={!!selectedCampaign}
        />
      )}

      <CampaignList
        campaigns={campaigns}
        onToggleStatus={toggleCampaignStatus}
        onDelete={deleteCampaign}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Campaigns;