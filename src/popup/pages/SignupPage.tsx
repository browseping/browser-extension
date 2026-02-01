import React, { useState, useEffect } from 'react';
import { signup } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.BACKEND_URL;

interface SignupPageProps {
  verifiedEmail?: string;
}

const SignupPage: React.FC<SignupPageProps> = ({ verifiedEmail }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: verifiedEmail || '',
    displayName: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (verifiedEmail) {
      setFormData(prev => ({
        ...prev,
        email: verifiedEmail
      }));
    }
  }, [verifiedEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email' && verifiedEmail) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/.test(formData.username)) {
      newErrors.username = 'Username must start with a letter and contain only letters, numbers, underscores, and hyphens';
    } else if (/[_-]{2,}/.test(formData.username)) {
      newErrors.username = 'Username cannot contain consecutive underscores or hyphens';
    } else if (/^[_-]|[_-]$/.test(formData.username)) {
      newErrors.username = 'Username cannot start or end with an underscore or hyphen';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        toast.error(error);
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await signup({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        displayName: formData.displayName || undefined
      });
      
      if (!response.success) {
        if (response.error === 'Please verify your email before signing up') {
          toast.error('Email verification required. Please verify your email first.');
          window.location.href = '#/email-verification';
          return;
        }
        toast.error(response.error || 'Failed to create account');
        return;
      }
      
      const loginResponse = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.username,
          password: formData.password
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        toast.success('Account created successfully!');
        login(loginData.data);
        window.location.href = '#/';
      } else {
        toast.success('Account created! Please log in manually.');
        setTimeout(() => {
          window.location.href = '#/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[600px] w-[400px] bg-white p-6">
      <div className="flex items-center mb-8">
        <a href="#/welcome" className="text-blue-600 hover:text-blue-800 mr-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username*
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Choose a username"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email* {verifiedEmail && <span className="text-green-600 text-sm">✓ Verified</span>}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!!verifiedEmail}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : verifiedEmail ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${verifiedEmail ? 'focus:ring-green-500' : 'focus:ring-blue-500'} ${verifiedEmail ? 'cursor-not-allowed' : ''}`}
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Create a password (min 8 characters)"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password*
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Confirm your password"
          />
        </div>
        
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name (optional)
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How others will see you"
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition duration-200`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="#/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;