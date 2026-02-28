import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiSave, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { fetchUserProfile, updateProfile } from '../../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  displayName: string;
  bio: string;
}

interface ProfileData {
  displayName?: string;
  bio?: string;
  email?: string;
  username?: string;
}

const ProfileEditPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: ''
  });
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    displayName: '',
    bio: ''
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetchUserProfile(user.username, user.token);
        if (response.success && response.data) {
          const data = {
            displayName: response.data.displayName || '',
            bio: response.data.bio || ''
          };
          setFormData(data);
          setOriginalData(data);
          setProfileData(response.data);
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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || saving || !hasChanges) return;

    setSaving(true);
    try {
      const response = await updateProfile(formData, user.token);
      if (response.success) {
        toast.success('Profile updated successfully!');
        setOriginalData(formData);

        if (response.data) {
          await updateUser(response.data);
        }
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
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
            <h1 className="text-lg font-bold text-gray-800">Edit Profile</h1>
            <p className="text-sm text-gray-600">Update your basic information</p>
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
        {/* Profile Picture Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {formData.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <FiUser size={14} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Profile picture upload coming soon</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Display Name */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.displayName.length}/100 characters
            </p>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData?.email || ''}
              disabled
              placeholder="Your email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here
            </p>
          </div>

          {/* Username (Read-only) */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              placeholder="Your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed
            </p>
          </div>
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

export default ProfileEditPage;
