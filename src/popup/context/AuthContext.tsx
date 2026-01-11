import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, updateUserInLocalStorage, getUserFromLocalStorage, clearUserFromLocalStorage, resetOnboardingStatus } from '../utils/localStorage';
import { logout as logoutAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userData = await getUserFromLocalStorage();
        if (userData) {
          setUser(userData);
          chrome.runtime.sendMessage({ type: 'POPUP_OPENED' });
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSessionExpired = (event: CustomEvent) => {
      handleLogoutLocal();
    };

    checkUserSession();
    
    window.addEventListener('sessionExpired', handleSessionExpired as EventListener);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired as EventListener);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    chrome.storage.local.set({ user: JSON.stringify(userData) });
    chrome.runtime.sendMessage({ type: 'LOGIN_SUCCESS'});
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await updateUserInLocalStorage(updatedFields);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleLogoutLocal = async () => {
    setUser(null);
    await clearUserFromLocalStorage();
    await resetOnboardingStatus();
    chrome.runtime.sendMessage({ type: 'LOGOUT' });
  };

  const logout = async () => {
    if (user?.token) {
      try {
        const response = await logoutAPI(user.token);
        
        if (response.success) {
          toast.success('Logged out successfully', {
            duration: 3000,
            position: 'top-center',
          });
        } else {
          toast.error('Logout completed (server error)', {
            duration: 3000,
            position: 'top-center',
          });
        }
      } catch (error) {
        console.error('Logout API error:', error);
        toast.error('Logout completed (server unavailable)', {
          duration: 3000,
          position: 'top-center',
        });
      }
    }
    
    await handleLogoutLocal();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
