import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiSave, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { fetchUserProfile, updateProfile } from '../../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface PersonalDetailsData {
  dateOfBirth: string;
}

const PersonalDetailsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalDetailsData>({
    dateOfBirth: ''
  });
  const [originalData, setOriginalData] = useState<PersonalDetailsData>({
    dateOfBirth: ''
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetchUserProfile(user.username, user.token);
        if (response.success && response.data) {
          const data = {
            dateOfBirth: response.data.dateOfBirth 
              ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] 
              : ''
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

  const handleInputChange = (field: keyof PersonalDetailsData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || saving || !hasChanges) return;

    setSaving(true);
    try {
      const profileData = {
        dateOfBirth: formData.dateOfBirth || null
      };
      
      const response = await updateProfile(profileData, user.token);
      if (response.success) {
        toast.success('Personal details updated successfully!');
        setOriginalData(formData);
        
        if (response.data) {
          await updateUser(response.data);
        }
      } else {
        toast.error(response.message || 'Failed to update personal details');
      }
    } catch (error) {
      console.error('Failed to update personal details:', error);
      toast.error('Failed to update personal details');
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);

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
            <h1 className="text-lg font-bold text-gray-800">Personal Details</h1>
            <p className="text-sm text-gray-600">Manage your date of birth</p>
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
            <FiCalendar size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Privacy Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your personal details visibility is controlled by your privacy settings. 
                You can change who can see this information in Privacy & Security settings.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Date of Birth */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              placeholder="Select your date of birth"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            {age !== null && (
              <p className="text-xs text-gray-500 mt-1">
                You are {age} years old
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This helps personalize your experience and is used for age verification
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

        {/* Privacy Information */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-2">Privacy Control</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Your date of birth visibility is controlled by privacy settings</li>
            <li>• You can set it to "Public", "Friends Only", or "Private"</li>
            <li>• Age calculations are done automatically for features that require it</li>
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

export default PersonalDetailsPage;
