import React, { useState, useEffect } from 'react';
import { FiMonitor, FiShield, FiUsers, FiCheck, FiTrendingUp } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState(stepParam ? parseInt(stepParam) : 0);
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
      description: "BrowsePing transforms your solitary browsing into a vibrant social experience. Connect with friends, share your digital presence, and discover what's capturing everyone's attention across the web.",
      features: [
        "Share your online activity",
        "See what friends are exploring",
        "Discover content together"
      ]
    },
    {
      icon: <FiMonitor className="w-16 h-16 text-blue-600" />,
      title: "Personal Analytics",
      description: "Analyze your browsing patterns, tab usage, and time spent online with detailed insights.",
      features: [
        "Analyze browsing patterns",
        "Track tab usage",
        "Monitor time spent online"
      ]
    },
    {
      icon: <FiTrendingUp className="w-16 h-16 text-blue-600" />,
      title: "Hourly Insights & Leaderboards",
      description: "Discover your peak browsing hours and daily online patterns. Compare your activity with friends on monthly leaderboards.",
      features: [
        "Discover peak browsing hours",
        "View daily online patterns",
        "Compare with friends monthly"
      ]
    },
    {
      icon: <FiShield className="w-16 h-16 text-blue-600" />,
      title: "Privacy Control",
      description: "Complete control over what you share and who can see your activity. Your privacy is paramount.",
      features: [
        "Control what you share",
        "Choose who sees activity",
        "Customize privacy settings"
      ]
    },
    {
      icon: <FiUsers className="w-16 h-16 text-blue-600" />,
      title: "Friend Discovery",
      description: "Connect with friends and build your social browsing network. Share your browsing experience together.",
      features: [
        "Connect with friends",
        "Build social network",
        "Real-time messaging"
      ]
    },
    {
      icon: <FiCheck className="w-16 h-16 text-green-600" />,
      title: "Ready to Get Started?",
      description: "Make browsing more interesting, engaging, and social while maintaining complete control over your privacy.",
      features: [
        "Quick & easy signup",
        "Free forever",
        "Start connecting today"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
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

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
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

          <ul className="space-y-3 pt-4">
            {currentStepData.features.map((feature, index) => (
              <li 
                key={index}
                className="flex items-center justify-center space-x-2 text-sm text-gray-700"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
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
