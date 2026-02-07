import React from 'react';

interface TypingIndicatorProps {
  userName: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <div className="flex space-x-1">
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }}
        ></div>
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }}
        ></div>
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
      <span className="text-sm text-gray-500 italic">
        {userName} is typing...
      </span>
    </div>
  );
};

export default TypingIndicator;

