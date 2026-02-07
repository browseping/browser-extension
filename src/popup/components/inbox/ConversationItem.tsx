import React from 'react';
import { FiUsers, FiUser, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';

interface ConversationItemProps {
  conversation: {
    id: string;
    conversation: {
      id: string;
      type: 'DIRECT' | 'GROUP';
      name?: string;
      lastMessage?: {
        id: string;
        content: string;
        createdAt: string;
        status?: 'sending' | 'sent' | 'delivered' | 'seen';
        sender: {
          id: string;
          username: string;
          displayName: string;
        };
      };
      participants: Array<{
        status: 'ACCEPTED' | 'PENDING';
        user: {
          id: string;
          username: string;
          displayName: string;
        };
      }>;
    };
    status: 'ACCEPTED' | 'PENDING';
    unreadCount: number;
  };
  onClick: () => void;
  isPending?: boolean;
}

const ConversationItem = ({
  conversation,
  onClick,
  isPending = false,
}: ConversationItemProps) => {
  const { user } = useAuth();
  const { typingUsers } = useMessage();
  const { conversation: conv } = conversation;

  const getDisplayInfo = () => {
    if (conv.type === 'GROUP') {
      return {
        name: conv.name || 'Group Chat',
        icon: <FiUsers size={20} className={isPending ? 'text-orange-600' : 'text-blue-600'} />,
      };
    } else {
      const otherParticipant = conv.participants.find(p => p.user.id !== user?.id);
      return {
        name: otherParticipant?.user.displayName || otherParticipant?.user.username || 'Unknown',
        icon: <FiUser size={20} className={isPending ? 'text-orange-600' : 'text-green-600'} />,
      };
    }
  };

  const { name, icon } = getDisplayInfo();

  // Check if other participant is typing
  const conversationId = conv.id;
  const otherParticipant = conv.participants.find(p => p.user.id !== user?.id);
  const isOtherUserTyping = otherParticipant && typingUsers[conversationId]?.includes(otherParticipant.user.id);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getLastMessagePreview = () => {
    if (!conv.lastMessage) {
      return isPending ? 'Message request' : 'No messages yet';
    }

    const isOwn = conv.lastMessage.sender.id === user?.id;
    const senderName = isOwn ? 'You' : conv.lastMessage.sender.displayName || conv.lastMessage.sender.username;

    return `${senderName}: ${conv.lastMessage.content}`;
  };

  //   const getMessageStatus = () => {
  //     if (!conv.lastMessage || conv.lastMessage.sender.id !== user?.id) return null;

  //     const status = conv.lastMessage.status;
  //     switch (status) {
  //       case 'sending':
  //         return <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />;
  //       case 'sent':
  //         return <span className="text-gray-400 text-xs">✓</span>;
  //       case 'delivered':
  //         return <span className="text-gray-600 text-xs">✓✓</span>;
  //       case 'seen':
  //         return <span className="text-blue-500 text-xs">✓✓</span>;
  //       default:
  //         return null;
  //     }
  //   };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${isPending ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
        }`}
    >
      {/* Avatar/Icon */}
      <div className="flex-shrink-0 mr-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isPending ? 'bg-orange-100' : 'bg-gray-100'
            }`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
            {isPending && <FiClock size={12} className="text-orange-600" />}
            {isOtherUserTyping && !isPending && (
              <span className="text-xs text-blue-600 italic animate-pulse">
                typing...
              </span>
            )}
          </div>
          {conv.lastMessage && !isPending && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate ${isPending ? 'text-orange-700 font-medium' : 'text-gray-600'
              }`}
          >
            {getLastMessagePreview()}
          </p>

          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {/* {getMessageStatus()} */}

            {conversation.unreadCount > 0 && !isPending && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}

            {isPending && (
              <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1">New</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
