import React, { useState } from 'react';
import { FiBarChart, FiClock } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import LeaderboardPanel from '../components/analytics/LeaderboardPanel';
import TabUsageAnalytics from '../components/analytics/TabUsageAnalytics';
import HourlyPresenceAnalytics from '../components/analytics/HourlyPresenceAnalytics';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('TabUsage');

  const tabs = [
    {
      key: 'TabUsage',
      label: 'Tab Usage',
      icon: <FiBarChart size={16} />,
      component: <TabUsageAnalytics />
    },
    {
      key: 'hourly',
      label: 'Hourly',
      icon: <FiClock size={16} />,
      component: <HourlyPresenceAnalytics />
    },
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      icon: <FaTrophy size={16} />,
      component: <LeaderboardPanel onBack={() => {}} />
    }
  ];

  return (
    <div className="flex flex-col h-full">

      <div className="px-4 pt-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mt-4">
          {tabs.find(tab => tab.key === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;