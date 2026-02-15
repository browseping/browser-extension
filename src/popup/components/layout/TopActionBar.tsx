import React from 'react';
import { FiBell, FiRefreshCw } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

interface TopActionBarProps {
  onRefresh?: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
}

const TopActionBar: React.FC<TopActionBarProps> = ({ 
  onRefresh, 
  onNotifications, 
  notificationCount = 0 
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* App Logo/Title */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">BP</span>
        </div>
        <span className="text-lg font-bold text-gray-800">BrowsePing</span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-1">
        <ThemeToggle />
        <button
          onClick={onNotifications}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <FiBell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
        
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw size={20} />
        </button>
      </div>
    </div>
  );
};

export default TopActionBar;