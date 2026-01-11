// Utility functions for localStorage management

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  totalOnlineSeconds?: number;
  lastOnlineAt?: string;
  createdAt?: string;
  updatedAt?: string; // ISO date string
  token: string;
  
  // Privacy settings
  emailPrivacy?: 'public' | 'friends_only' | 'private';
  dobPrivacy?: 'public' | 'friends_only' | 'private';
  onlinePrivacy?: 'public' | 'friends_only' | 'private';
  lastOnlinePrivacy?: 'public' | 'friends_only' | 'private';
  tabPrivacy?: 'friends_only' | 'close_friends_only' | 'private';
  friendsListPrivacy?: 'public' | 'friends_only' | 'private';
  socialMediaPrivacy?: 'public' | 'friends_only' | 'private';
  
  // Social media links
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  website?: string;
  telegram?: string;
  snapchat?: string;
  discord?: string;
}

/**
 * Updates user data in localStorage
 */
export const updateUserInLocalStorage = async (updatedData: Partial<User>): Promise<User | null> => {
  try {
    return new Promise<User | null>((resolve, reject) => {
      chrome.storage.local.get('user', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error reading from localStorage:', chrome.runtime.lastError);
          resolve(null);
          return;
        }

        let currentUser: User | null = null;
        
        if (result.user) {
          try {
            currentUser = JSON.parse(result.user);
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            resolve(null);
            return;
          }
        }

        if (!currentUser) {
          console.error('No current user found in localStorage');
          resolve(null);
          return;
        }

        const mergedUser: User = {
          ...currentUser,
          ...updatedData,
          updatedAt: new Date().toISOString()
        };

        // Save back to localStorage
        chrome.storage.local.set({ user: JSON.stringify(mergedUser) }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error saving to localStorage:', chrome.runtime.lastError);
            resolve(null);
            return;
          }
          
          console.log('User data updated in localStorage:', mergedUser);
          resolve(mergedUser);
        });
      });
    });
  } catch (error) {
    console.error('Error updating user in localStorage:', error);
    return null;
  }
};

/**
 * Gets user data from localStorage
 */
export const getUserFromLocalStorage = (): Promise<User | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('user', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error reading from localStorage:', chrome.runtime.lastError);
        resolve(null);
        return;
      }

      if (result.user) {
        try {
          const user = JSON.parse(result.user);
          resolve(user);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

export const clearUserFromLocalStorage = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove('user', () => {
      if (chrome.runtime.lastError) {
        console.error('Error removing user from localStorage:', chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

export const getOnboardingStatus = (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('hasCompletedOnboarding', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error reading onboarding status:', chrome.runtime.lastError);
        resolve(false);
        return;
      }
      resolve(result.hasCompletedOnboarding || false);
    });
  });
};

export const setOnboardingComplete = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ hasCompletedOnboarding: true }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting onboarding status:', chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

export const resetOnboardingStatus = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ hasCompletedOnboarding: false }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error resetting onboarding status:', chrome.runtime.lastError);
      }
      resolve();
    });
  });
};
