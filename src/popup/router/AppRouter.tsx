import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FriendsProvider } from '../context/FriendsContext';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import WelcomeScreen from '../components/welcome/WelcomeScreen';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ForgotPasswordOTPPage from '../pages/ForgotPassword/ForgotPasswordOTPPage';
import PasswordResetPage from '../pages/ForgotPassword/PasswordResetPage';
import { OnboardingFlow } from '../components/onboarding';

// Main Pages
import HomePage from '../pages/HomePage';
import FriendsPage from '../pages/FriendsPage';
import InboxPage from '../pages/InboxPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import MorePage from '../pages/MorePage';

// Settings & Profile Pages
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/profile/ProfileEditPage';
import PersonalDetailsPage from '../pages/profile/PersonalDetailsPage';
import SocialMediaPage from '../pages/profile/SocialMediaPage';

// Future Feature Pages
import NotificationPage from '../pages/NotificationPage';
import AboutPage from '../pages/AboutPage';
import HelpPage from '../pages/HelpPage';
import PrivacyPage from '../pages/PrivacyPage';
import { MessageProvider } from '../context/MessageContext';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  const handleEmailVerified = (email: string) => {
    setVerifiedEmail(email);
    window.location.hash = '#/signup';
  };

  React.useEffect(() => {
    if (!user && !loading) {
      const pendingEmail = localStorage.getItem('pendingVerificationEmail');
      const forgotPasswordStep = localStorage.getItem('forgotPasswordStep');
      const currentHash = window.location.hash;
      
      if (pendingEmail && (currentHash === '#/' || currentHash === '' || currentHash === '#')) {
        setTimeout(() => {
          if (window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#') {
            window.location.hash = '#/email-verification';
          }
        }, 200);
        return;
      }
      
      if (forgotPasswordStep && (currentHash === '#/' || currentHash === '' || currentHash === '#')) {
        setTimeout(() => {
          if (window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#') {
            switch (forgotPasswordStep) {
              case 'verify-otp':
                window.location.hash = '#/forgot-password/verify-otp';
                break;
              case 'reset-password':
                window.location.hash = '#/forgot-password/reset';
                break;
              default:
                window.location.hash = '#/forgot-password';
                break;
            }
          }
        }, 200);
        return;
      }

      if (currentHash === '#/' || currentHash === '' || currentHash === '#') {
        setTimeout(() => {
          if (window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#') {
            const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
            window.location.hash = onboardingCompleted ? '#/welcome' : '#/onboarding';
          }
        }, 200);
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] w-[400px] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes */}
        {!user && (
          <>
            <Route path="/" element={
              localStorage.getItem('onboardingCompleted') === 'true' 
                ? <WelcomeScreen /> 
                : <OnboardingFlow />
            } />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage onVerificationSuccess={handleEmailVerified}/>} />
            <Route path="/signup" element={<SignupPage verifiedEmail={verifiedEmail} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/verify-otp" element={<ForgotPasswordOTPPage />} />
            <Route path="/forgot-password/reset" element={<PasswordResetPage />} />
          </>
        )}
        
        {/* Main App Routes */}
        {user && (
          <Route path="/*" element={
            <FriendsProvider>
              <MessageProvider>
                <AuthenticatedApp />
              </MessageProvider>
            </FriendsProvider>
          } />
        )}
      </Routes>
    </HashRouter>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = React.useState(0);
  
  // Fetch notification count on mount and periodically
  React.useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (user?.token) {
          const { getUnreadNotificationCount } = await import('../../services/api');
          const response = await getUnreadNotificationCount(user.token);
          if (response.success) {
            setNotificationCount(response.data.unreadCount);
          }
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [user?.token]);
  
  const handleRefresh = async () => {
    try {
      if (user?.token) {
        const { flushAnalytics } = await import('../../services/api');
        await flushAnalytics(user.token);
      }
      
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({ type: "PUBLISH_ACTIVE_TAB" }, () => resolve());
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Refresh error:', error);
      window.location.reload();
    }
  };

  const handleNotifications = () => {
    window.location.href = '#/notifications';
  };

  return (
    <AppLayout 
      onRefresh={handleRefresh} 
      onNotifications={handleNotifications}
      notificationCount={notificationCount}
    >
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/more" element={<MorePage />} />
        
        {/* other pages */}
        <Route path="/settings" element={<PrivacyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/personal" element={<PersonalDetailsPage />} />
        <Route path="/profile/social" element={<SocialMediaPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </AppLayout>
  );
};

export default AppRouter;