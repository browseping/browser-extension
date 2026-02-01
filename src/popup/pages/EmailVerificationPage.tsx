import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { requestOTP, verifyOTP } from '../../services/api';

interface EmailVerificationPageProps {
  onVerificationSuccess: (email: string) => void;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  onVerificationSuccess
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [hasShownError, setHasShownError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('pendingVerificationEmail');
    const savedStep = localStorage.getItem('verificationStep');
    const savedTimer = localStorage.getItem('resendTimer');
    
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedStep === 'otp') {
      setStep('otp');
    }
    if (savedTimer) {
      const timeLeft = parseInt(savedTimer) - Date.now();
      if (timeLeft > 0) {
        setResendTimer(Math.ceil(timeLeft / 1000));
      }
    }

    const handleBeforeUnload = () => {
      if (step === 'email' && !email) {
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('verificationStep');
        localStorage.removeItem('resendTimer');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, email]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('resendTimer');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!email.trim()) {
      if (!hasShownError) {
        toast.error('Please enter your email address');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (!hasShownError) {
        toast.error('Please enter a valid email address');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    setIsLoading(true);

    try {
      const data = await requestOTP(email);

      if (data.success) {
        setStep('otp');
        setResendTimer(60); // 1 minute cooldown
        setAttemptsRemaining(null);
        
        // Save state to localStorage
        localStorage.setItem('pendingVerificationEmail', email);
        localStorage.setItem('verificationStep', 'otp');
        localStorage.setItem('resendTimer', (Date.now() + 60000).toString());
        
        toast.success('Verification code sent to your email!');
      } else {
        toast.error(data.error || data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent double submission
    
    if (!otp.trim()) {
      if (!hasShownError) {
        toast.error('Please enter the verification code');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    if (otp.length !== 6) {
      if (!hasShownError) {
        toast.error('Verification code must be 6 digits');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    setIsLoading(true);

    try {
      const data = await verifyOTP(email, otp);

      if (data.success) {
        // Clear localStorage on successful verification
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('verificationStep');
        localStorage.removeItem('resendTimer');
        
        toast.success('Email verified successfully!');
        onVerificationSuccess(email);
      } else {
        if (data.requireResend) {
          toast.error(data.error || 'OTP expired. Please request a new code.');
          setStep('email');
          setOtp('');
          setResendTimer(0);
          setAttemptsRemaining(null);
          localStorage.setItem('verificationStep', 'email');
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          toast.error(data.error || `Invalid code. ${data.attemptsRemaining} attempts remaining.`);
          setOtp('');
        } else {
          toast.error(data.error || data.message || 'Invalid verification code');
          setOtp('');
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      const data = await requestOTP(email);

      if (data.success) {
        setResendTimer(60);
        setAttemptsRemaining(null);
        localStorage.setItem('resendTimer', (Date.now() + 60000).toString());
        toast.success('New verification code sent!');
        setOtp('');
      } else {
        toast.error(data.error || data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('verificationStep');
    localStorage.removeItem('resendTimer');
    
    // toast.success('Verification cancelled');
    
    setTimeout(() => {
      window.location.hash = '#/welcome';
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[600px] w-[400px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h1 className="text-2xl font-bold">
          {step === 'email' ? 'Verify Your Email' : 'Enter Verification Code'}
        </h1>
        <p className="text-blue-100 mt-2">
          {step === 'email' 
            ? 'We need to verify your email address before you can create an account.' 
            : `We've sent a 6-digit code to ${email}`
          }
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go Back
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="123456"
                maxLength={6}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the 6-digit code sent to your email
              </p>
              {attemptsRemaining !== null && attemptsRemaining < 5 && (
                <p className={`text-sm mt-1 ${attemptsRemaining <= 2 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isLoading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 
                  ? `Resend code in ${formatTime(resendTimer)}`
                  : 'Resend verification code'
                }
              </button>
              
              <div>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel verification
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          By verifying your email, you agree to receive communications from BrowsePing.
          Check your spam folder if you don't see the email.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;