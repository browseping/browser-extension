import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiSave, FiExternalLink, FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiMail } from 'react-icons/fi';
import { FaTelegram, FaSnapchat, FaDiscord, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { fetchUserProfile, updateProfile } from '../../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SocialMediaData {
  twitter: string;
  linkedin: string;
  instagram: string;
  github: string;
  website: string;
  telegram: string;
  snapchat: string;
  discord: string;
}

const SocialMediaPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SocialMediaData>({
    twitter: '',
    linkedin: '',
    instagram: '',
    github: '',
    website: '',
    telegram: '',
    snapchat: '',
    discord: ''
  });
  const [originalData, setOriginalData] = useState<SocialMediaData>({
    twitter: '',
    linkedin: '',
    instagram: '',
    github: '',
    website: '',
    telegram: '',
    snapchat: '',
    discord: ''
  });

  const socialPlatforms = [
    {
      key: 'github' as keyof SocialMediaData,
      label: 'GitHub',
      icon: <FiGithub size={20} />,
      placeholder: 'https://github.com/yourusername',
      description: 'Your GitHub profile or portfolio'
    },
    {
      key: 'linkedin' as keyof SocialMediaData,
      label: 'LinkedIn',
      icon: <FiLinkedin size={20} />,
      placeholder: 'https://linkedin.com/in/yourusername',
      description: 'Your professional LinkedIn profile'
    },
    {
      key: 'twitter' as keyof SocialMediaData,
      label: 'Twitter / X',
      icon: <FiTwitter size={20} />,
      placeholder: 'https://twitter.com/yourusername',
      description: 'Your Twitter/X profile'
    },
    {
      key: 'instagram' as keyof SocialMediaData,
      label: 'Instagram',
      icon: <FaInstagram size={20} />,
      placeholder: 'https://instagram.com/yourusername',
      description: 'Your Instagram profile'
    },
    {
      key: 'website' as keyof SocialMediaData,
      label: 'Personal Website',
      icon: <FiGlobe size={20} />,
      placeholder: 'https://yourwebsite.com',
      description: 'Your personal website or blog'
    },
    {
      key: 'telegram' as keyof SocialMediaData,
      label: 'Telegram',
      icon: <FaTelegram size={20} />,
      placeholder: 'https://t.me/yourusername',
      description: 'Your Telegram profile'
    },
    {
      key: 'discord' as keyof SocialMediaData,
      label: 'Discord',
      icon: <FaDiscord size={20} />,
      placeholder: 'yourusername#1234',
      description: 'Your Discord username'
    },
    {
      key: 'snapchat' as keyof SocialMediaData,
      label: 'Snapchat',
      icon: <FaSnapchat size={20} />,
      placeholder: 'https://snapchat.com/add/yourusername',
      description: 'Your Snapchat profile'
    }
  ];

  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetchUserProfile(user.username, user.token);
        if (response.success && response.data) {
          const data = {
            twitter: response.data.twitter || '',
            linkedin: response.data.linkedin || '',
            instagram: response.data.instagram || '',
            github: response.data.github || '',
            website: response.data.website || '',
            telegram: response.data.telegram || '',
            snapchat: response.data.snapchat || '',
            discord: response.data.discord || ''
          };
          setFormData(data);
          setOriginalData(data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleInputChange = (field: keyof SocialMediaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value.trim() }));
  };

  const validateUrl = (url: string, platform: string) => {
    if (!url) return true;
    
    // Special case for Discord (username format)
    if (platform === 'discord') {
      return url.includes('#') || url.startsWith('http');
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!user || saving || !hasChanges) return;

    // Validate URLs
    for (const platform of socialPlatforms) {
      const value = formData[platform.key];
      if (value && !validateUrl(value, platform.key)) {
        toast.error(`Invalid URL format for ${platform.label}`);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await updateProfile(formData, user.token);
      if (response.success) {
        toast.success('Social media links updated successfully!');
        setOriginalData(formData);
        
        if (response.data) {
          await updateUser(response.data);
        }
      } else {
        toast.error(response.message || 'Failed to update social media links');
      }
    } catch (error) {
      console.error('Failed to update social media links:', error);
      toast.error('Failed to update social media links');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      toast((t) => (
        <div className="flex flex-col space-y-3">
          <div>
            <p className="font-medium text-gray-900">Unsaved changes</p>
            <p className="text-sm text-gray-600">You have unsaved changes. What would you like to do?</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/profile');
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await handleSave();
              }}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '280px'
        }
      });
    } else {
      navigate('/profile');
    }
  };

  const getFilledCount = () => {
    return Object.values(formData).filter(value => value.trim() !== '').length;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">Social Media Links</h1>
            <p className="text-sm text-gray-600">
              {getFilledCount()}/{socialPlatforms.length} platforms connected
            </p>
          </div>

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start space-x-3">
            <FiExternalLink size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Privacy Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your social media links visibility is controlled by your privacy settings. 
                You can change who can see this information in Privacy & Security settings.
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Form */}
        <div className="space-y-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {platform.label}
                  </label>
                  <p className="text-xs text-gray-500">{platform.description}</p>
                </div>
                {formData[platform.key] && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
              
              <input
                type="text"
                value={formData[platform.key]}
                onChange={(e) => handleInputChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              
              {formData[platform.key] && !validateUrl(formData[platform.key], platform.key) && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid URL format
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Changes Notice */}
        {hasChanges && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">You have unsaved changes</span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-2">Tips</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Use full URLs for better compatibility (e.g., https://github.com/username)</li>
            <li>• For Discord, you can use either username#1234 or a profile URL</li>
            <li>• Leave fields empty if you don't use that platform</li>
            <li>• Your links will appear on your profile based on privacy settings</li>
          </ul>
        </div>
      </div>

      {/* Bottom Save Button */}
      {hasChanges && (
        <div className="border-t border-gray-200 bg-white p-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <FiSave size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialMediaPage;
