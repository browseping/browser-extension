import React, { useState } from 'react';
import { FiArrowLeft, FiDownload, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { fetchWeeklyTabUsage, fetchHourlyPresence, fetchLeaderboard, fetchUserRank } from '../../services/api';
import { exportCompleteAnalytics } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const DataManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExportAll = async () => {
    if (!user) {
      toast.error('Please login to export analytics');
      return;
    }

    setExporting(true);
    toast.loading('Gathering all analytics data...', { id: 'export-all' });

    try {
      const [tabUsageRes, hourlyPresenceRes, leaderboardRes, userRankRes] = await Promise.all([
        fetchWeeklyTabUsage(user.token).catch(() => ({ data: null })),
        fetchHourlyPresence(user.token, 7).catch(() => null),
        fetchLeaderboard(user.token, 1, 10).catch(() => ({ success: false, data: null })),
        fetchUserRank(user.token).catch(() => ({ success: false, data: null }))
      ]);

      exportCompleteAnalytics(
        tabUsageRes.data,
        hourlyPresenceRes,
        leaderboardRes.success ? leaderboardRes.data : null,
        userRankRes.success ? userRankRes.data : null
      );

      toast.success('All analytics exported successfully!', { id: 'export-all' });
    } catch (error) {
      console.error('Error exporting all analytics:', error);
      toast.error('Failed to export analytics', { id: 'export-all' });
    } finally {
      setExporting(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4 flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Data Management</h1>
            <p className="text-xs text-gray-600">Export and manage your analytics</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Export
          </h2>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4">
                <FiDatabase size={24} />
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2">
                Export All Analytics
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                Download your complete browsing history and statistics including:
              </p>
              
              <ul className="space-y-2 mb-6 text-left">
                <li className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Weekly tab usage data</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Hourly activity patterns</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Leaderboard rankings</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Personal statistics</span>
                </li>
              </ul>

              <button
                onClick={handleExportAll}
                disabled={exporting}
                className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FiDownload size={18} />
                <span>{exporting ? 'Exporting...' : 'Export All Data'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 text-sm mb-1">
                About Your Data
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Your exported data is processed entirely on your device. No information is sent to external servers during the export process. The file will be downloaded directly to your browser's default download location.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Storage
          </h2>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Analytics Data</p>
                <p className="text-xs text-gray-500 mt-1">Cached analytics information</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                ~2.4 MB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;
