import React, { useState } from 'react';
import { FiMonitor, FiShield, FiUsers, FiCheck, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      icon: (
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden">
          <img 
            src="icons/icon128.png" 
            alt="BrowsePing Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      ),
      title: "Welcome to BrowsePing",
      description: "Browsing doesn't have to be lonely. Connect with friends, share your online presence, and discover what's capturing everyone's attention across the web.",
      features: [
        "See what friends are browsing",
        "Share your activity in real-time",
        "Discover content together"
      ]
    },
    {
      icon: <FiMonitor className="w-16 h-16 text-blue-600" />,
      title: "Powerful Analytics & Insights",
      description: "Understand your digital habits with detailed analytics about your browsing patterns, time spent online, and most-visited sites.",
      features: [
        "Track your browsing time",
        "Analyze tab usage patterns",
        "View hourly activity insights"
      ]
    },
    {
      icon: <FiTrendingUp className="w-16 h-16 text-blue-600" />,
      title: "Monthly Leaderboard Competition",
      description: "Compete with friends on the monthly activity leaderboard. See who's the most active browser and climb to the top!",
      features: [
        "Track monthly online activity",
        "Compete with your network",
        "Earn bragging rights"
      ]
    },
    {
      icon: <FiShield className="w-16 h-16 text-blue-600" />,
      title: "Complete Privacy Control",
      description: "You decide what to share and with whom. Granular privacy settings giengage in real-time conversations.",
      features: [
        "Add and manage friends",
        "Real-time messaging",
        "Stay connected alwayyou want"
      ]
    },
    {
      icon: <FiUsers className="w-16 h-16 text-blue-600" />,
      title: "Connect & Engage",
      description: "Build your social browsing network. Add friends, send messages, and compete on monthly activity leaderboards.",
      features: [
        "Add and manage friends",
        "Real-time messaging",
        "Monthly leaderboards"
      ]
    },
    {
      icon: <FiCheck className="w-16 h-16 text-green-600" />,
      title: "Ready to Get Started?",
      description: "Join thousands making browsing more social. Create your free account now and start connecting with friends.",
      features: [
        "Quick & easy signup",
        "Free forever",
        "Join your friends today"
      ]
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/welcome');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/welcome');
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-[600px] w-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
              {currentStepData.description}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {currentStepData.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center justify-center space-x-2 text-sm text-gray-700"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-center space-x-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Skip
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
