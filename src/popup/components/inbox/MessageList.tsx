import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: any[];
  conversationId: string;
  conversationType: 'DIRECT' | 'GROUP';
}

const MessageList = ({ messages, conversationId, conversationType }: MessageListProps) => {
  const { user } = useAuth();
  const { conversations, typingUsers } = useMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get conversation and check if other user is typing
  const conversation = conversations.find(c => c.conversation.id === conversationId);
  const otherParticipant = conversation?.conversation.participants.find(p => p.user.id !== user?.id);
  const isOtherUserTyping = otherParticipant && typingUsers[conversationId]?.includes(otherParticipant.user.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const isOwn = message.senderId === user?.id;
        const isLast = index === messages.length - 1;

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={isOwn}
            isLast={isLast}
            conversationType={conversationType}
          />
        );
      })}
      {isOtherUserTyping && otherParticipant && (
        <TypingIndicator 
          userName={otherParticipant.user.displayName || otherParticipant.user.username}
        />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
