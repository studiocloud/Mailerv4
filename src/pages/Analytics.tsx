import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Users, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Campaign } from '../types';

interface AnalyticsData {
  totalEmails: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  campaigns: Campaign[];
  dailyStats: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('7');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalEmails: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    campaigns: [],
    dailyStats: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch campaigns and their metrics
        const { data: campaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (campaignError) throw campaignError;

        // Calculate totals from campaign metrics
        const totals = campaigns.reduce((acc, campaign) => ({
          totalEmails: acc.totalEmails + campaign.metrics.sent,
          delivered: acc.delivered + campaign.metrics.successful,
          bounced: acc.bounced + campaign.metrics.failed,
          // Assuming 60% open rate and 20% click rate for this example
          opened: acc.opened + Math.floor(campaign.metrics.successful * 0.6),
          clicked: acc.clicked + Math.floor(campaign.metrics.successful * 0.2)
        }), {
          totalEmails: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0
        });

        // Generate daily stats for the chart
        const days = parseInt(timeframe);
        const dailyStats = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return {
            date: date.toISOString().split('T')[0],
            sent: Math.floor(Math.random() * 1000),
            opened: Math.floor(Math.random() * 700),
            clicked: Math.floor(Math.random() * 300)
          };
        });

        setData({
          ...totals,
          campaigns,
          dailyStats
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

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
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Emails Sent</p>
              <p className="text-2xl font-semibold">{data.totalEmails.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Rate</span>
              <span className="font-medium">
                {((data.delivered / data.totalEmails) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(data.delivered / data.totalEmails) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-semibold">
                {((data.opened / data.delivered) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Opened</span>
              <span className="font-medium">{data.opened.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(data.opened / data.delivered) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Click Rate</p>
              <p className="text-2xl font-semibold">
                {((data.clicked / data.opened) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Clicked</span>
              <span className="font-medium">{data.clicked.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${(data.clicked / data.opened) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Performance</h2>
        <div className="h-64">
          {/* In a real app, you'd use a charting library like Chart.js or Recharts */}
          <div className="flex h-full items-end gap-2">
            {data.dailyStats.map((stat, index) => (
              <div key={stat.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1" style={{ height: '90%' }}>
                  <div
                    className="w-full bg-blue-600 rounded-t"
                    style={{
                      height: `${(stat.sent / 1000) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-green-600"
                    style={{
                      height: `${(stat.opened / 1000) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-purple-600 rounded-b"
                    style={{
                      height: `${(stat.clicked / 1000) * 100}%`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(stat.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded" />
            <span className="text-sm text-gray-600">Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded" />
            <span className="text-sm text-gray-600">Opened</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded" />
            <span className="text-sm text-gray-600">Clicked</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Campaign</th>
                <th className="text-right py-3 px-4">Sent</th>
                <th className="text-right py-3 px-4">Delivered</th>
                <th className="text-right py-3 px-4">Failed</th>
                <th className="text-right py-3 px-4">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b last:border-0">
                  <td className="py-3 px-4">{campaign.name}</td>
                  <td className="text-right py-3 px-4">
                    {campaign.metrics.sent.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {campaign.metrics.successful.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {campaign.metrics.failed.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {((campaign.metrics.successful / campaign.metrics.sent) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;