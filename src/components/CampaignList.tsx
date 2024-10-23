import React from 'react';
import { Calendar, Clock, Pause, Play, Trash2, Edit2 } from 'lucide-react';
import type { Campaign } from '../types';

interface Props {
  campaigns: Campaign[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
}

const CampaignList = ({ campaigns, onToggleStatus, onDelete, onEdit }: Props) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No campaigns yet. Create your first email campaign.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium text-gray-800">{campaign.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={16} />
                    {campaign.schedule.days.join(', ')}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={16} />
                    {campaign.schedule.startTime} - {campaign.schedule.endTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(campaign)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => onToggleStatus(campaign.id)}
                className={`p-2 rounded-lg ${
                  campaign.status === 'active'
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {campaign.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => onDelete(campaign.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sent</span>
                <span className="text-lg font-semibold">{campaign.metrics.sent}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Successful</span>
                <span className="text-lg font-semibold text-green-600">
                  {campaign.metrics.successful}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="text-lg font-semibold text-red-600">
                  {campaign.metrics.failed}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignList;