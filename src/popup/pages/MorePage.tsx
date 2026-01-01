import React from 'react';
import { FiUser, FiBell, FiHelpCircle, FiInfo, FiLogOut, FiShield, FiMail, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  href?: string;
  action?: () => void;
  category: 'account' | 'preferences' | 'support' | 'about';
}

const MorePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '#/';
  };

  const menuItems: MenuItem[] = [
    // Account Section
    {
      icon: <FiUser size={20} />,
      label: 'Profile Settings',
      description: 'Edit your profile information and avatar',
      href: '#/profile',
      category: 'account'
    },
    {
      icon: <FiShield size={20} />,
      label: 'Privacy & Security',
      description: 'Control who can see your activity and information',
      href: '#/settings',
      category: 'account'
    },
    {
      icon: <FiDatabase size={20} />,
      label: 'Data Management',
      description: 'Export and manage your analytics',
      href: '#/data-management',
      category: 'account'
    },
    
    // Preferences Section
    {
      icon: <FiBell size={20} />,
      label: 'Notifications',
      description: 'Manage notification preferences and alerts',
      href: '#/notifications',
      category: 'preferences'
    },
    
    // Support Section
    {
      icon: <FiHelpCircle size={20} />,
      label: 'Help & Support',
      description: 'Get help, report issues, and contact support',
      href: '#/help',
      category: 'support'
    },
    {
      icon: <FiMail size={20} />,
      label: 'Feedback',
      description: 'Share feedback and feature requests',
      href: 'mailto:feedback@browseping.com',
      category: 'support'
    },
    
    // About Section
    {
      icon: <FiInfo size={20} />,
      label: 'About BrowsePing',
      description: 'Version info, changelog, and credits',
      href: '#/about',
      category: 'about'
    }
  ];

  const categories = [
    { key: 'account', label: 'Account', items: menuItems.filter(item => item.category === 'account') },
    { key: 'preferences', label: 'Preferences', items: menuItems.filter(item => item.category === 'preferences') },
    { key: 'support', label: 'Support', items: menuItems.filter(item => item.category === 'support') },
    { key: 'about', label: 'About', items: menuItems.filter(item => item.category === 'about') }
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">More</h1>
        <p className="text-sm text-gray-600">Settings, support, and account options</p>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {user?.displayName || user?.username}
            </h3>
            <p className="text-sm text-gray-600">@{user?.username}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
          <a
            href="#/profile"
            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <FiUser size={18} />
          </a>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          category.items.length > 0 && (
            <div key={category.key}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.label}
              </h3>
              
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <a
                    key={index}
                    href={item.href || '#'}
                    onClick={(e) => {
                      if (item.action) {
                        e.preventDefault();
                        item.action();
                      }
                    }}
                    className="block p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 group-hover:bg-blue-100 rounded-lg transition-colors">
                        {item.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800">
                          {item.label}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Logout Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors group"
        >
          <FiLogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-500">
          BrowsePing v1.0.0
        </p>
      </div>
    </div>
  );
};

export default MorePage;