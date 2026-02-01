import React from 'react';
import { FiUserPlus, FiClock, FiShield } from 'react-icons/fi';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="h-[600px] w-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 p-5 flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg overflow-hidden">
            <img 
              src="icons/icon128.png" 
              alt="BrowsePing Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">BrowsePing</h1>
          <p className="text-lg text-gray-600">Connect with friends across the web</p>
        </div>
        
        <div className="w-full max-w-xs space-y-3">
          <a 
            href="#/email-verification" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-center"
          >
            Sign Up
          </a>
          
          <a 
            href="#/login" 
            className="block w-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-4 border border-blue-600 rounded-lg transition duration-200 text-center"
          >
            Log In
          </a>
          
          <a 
            href="#/onboarding?step=5" 
            className="block w-full bg-transparent hover:bg-blue-50 text-blue-600 font-medium py-3 px-4 border border-blue-300 rounded-lg transition duration-200 text-center"
          >
            View Tutorial
          </a>
        </div>
        
        <p className="text-sm text-gray-500 max-w-xs text-center">
          Join BrowsePing to see what your friends are browsing in real-time, with full privacy controls.
        </p>
      </div>
      
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-center space-x-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-2 mb-1.5 inline-block">
              <FiUserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Add Friends</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-2 mb-1.5 inline-block">
              <FiClock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Live Status</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-2 mb-1.5 inline-block">
              <FiShield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Privacy Control</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;