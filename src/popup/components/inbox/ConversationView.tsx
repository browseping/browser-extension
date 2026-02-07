import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import { FiArrowLeft, FiCheck, FiMoreVertical, FiUser, FiX } from 'react-icons/fi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const {
    conversations,
    loadMessages,
    messages,
    sendMessage,
    markAsSeen,
    acceptMessageRequest,
    rejectMessageRequest
  } = useMessage();
  const [loading, setLoading] = useState(true);
  
  const conversation = conversations.find(c => c.conversation.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  console.log(conversation)
  const isPending = conversation?.status === 'PENDING';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const hasUnreadMessages = !!(conversation && conversation.unreadCount > 0);
      await loadMessages(conversationId, hasUnreadMessages);
      setLoading(false);
    };
    loadData();
  }, [conversationId]);

  useEffect(() => {
    if (isPending || loading) return;
    const hasUnreadMessages = conversation && conversation.unreadCount > 0;
    if (hasUnreadMessages) {
      const markAsSeenTimer = setTimeout(() => {
        markAsSeen(conversationId);
      }, 1000);

      return () => clearTimeout(markAsSeenTimer);
    }
  }, [conversationId, markAsSeen, isPending, loading, conversation]);


  const handleAcceptRequest = async () => {
    try {
      await acceptMessageRequest(conversationId);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async () => {
    try {
      await rejectMessageRequest(conversationId);
      onBack();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Conversation not found</p>
          <button
            onClick={onBack}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { conversation: conv } = conversation;

  const getDisplayInfo = () => {
    if (conv.type === 'GROUP') {
      return {
        name: conv.name || 'Group Chat',
        subtitle: `${conv.participants.length} members`,
        icon: <FiUser size={20} className="text-blue-600" />
      };
    } else {
      const otherParticipant = conv.participants.find(p => p.user.id !== user?.id);
      return {
        name: otherParticipant?.user.displayName || otherParticipant?.user.username || 'Unknown',
        subtitle: `@${otherParticipant?.user.username || 'unknown'}`,
        icon: <FiUser size={20} className="text-green-600" />
      };
    }
  };

  const handleSendMessage  = async (content: string) => {
    await sendMessage({ conversationId, content });
  }

  const { name, subtitle, icon } = getDisplayInfo();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b bg-white ${
        isPending ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPending ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            {icon}
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{name}</h2>
            <div className="flex items-center space-x-2">
              {conv?.type === 'DIRECT' && (
                <p className="text-sm text-gray-500">
                  @{conv.participants.find(p => p.user.id !== user?.id)?.user.username}
                </p>
              )}
              {conv?.type === 'GROUP' && (
                <p className="text-sm text-gray-500">
                  {conv.participants.length} members
                </p>
              )}
            </div>
          </div>
        </div>

        {conv.type === 'GROUP' && (
          <button
            onClick={() => console.log('Open group settings')}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          >
            <FiMoreVertical size={18} />
          </button>
        )}
      </div>

      {/* Message Request Banner */}
      {isPending && (
        <div className="bg-orange-100 border-b border-orange-200 p-4">
          <div className="text-center">
            <h3 className="font-medium text-orange-800 mb-2">Message Request</h3>
            <p className="text-sm text-orange-700 mb-4">
              {conv.type === 'GROUP' 
                ? `You've been invited to join "${name}"`
                : `${name} wants to send you a message`
              }
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleAcceptRequest}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiCheck size={16} />
                <span>Accept</span>
              </button>
              <button
                onClick={handleRejectRequest}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiX size={16} />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <MessageList
            messages={conversationMessages}
            conversationId={conversationId}
            conversationType={conv?.type || 'DIRECT'}
          />
        )}
      </div>

      {!isPending && (
        <MessageInput onSend={handleSendMessage} conversationId={conversationId} />
      )}
    </div>
  );
}

export default ConversationView;
