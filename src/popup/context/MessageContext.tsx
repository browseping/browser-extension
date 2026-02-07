import React, { Children, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getConversationMessages, getUserConversations, sendMessage as apiSendMessage } from "../../services/api";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  seenAt?: string;
  deliveredAt?: string;
  status?: "sending" | "sent" | "delivered" | "seen";
  isDirectMessage?: boolean;
  readReceipts?: Array<{
    userId: string;
    readAt: string;
    user?: {
      id: string;
      username: string;
      displayName: string;
    };
  }>;
  readBy?: Array<{
    user: {
      id: string;
      username: string;
      displayName: string;
    };
    readAt: string;
  }>;
  sender: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface Conversation {
  id: string;
  conversation: {
    id: string;
    type: "DIRECT" | "GROUP";
    name?: string;
    lastMessage?: Message;
    participants: Array<{
      status: "ACCEPTED" | "PENDING";
      user: {
        id: string;
        username: string;
        displayName: string;
      };
    }>;
  };
  status: "ACCEPTED" | "PENDING";
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  loading: boolean;
  unreadCount: number;
  pendingCount: number;
  typingUsers: Record<string, string[]>; // conversationId -> userIds who are typing
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string, markAsSeen: boolean) => Promise<void>;
  sendMessage: (data: {
    conversationId?: string;
    receiverId?: string;
    content: string;
  }) => Promise<{
    success: boolean;
    conversationId?: string;
    isNewConversation?: boolean;
    data?: any;
    message?: string;
  }>;
  markAsSeen: (conversationId: string, force?: boolean) => Promise<void>;
  acceptMessageRequest: (conversationId: string) => Promise<void>;
  rejectMessageRequest: (conversationId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const unreadCount = conversations.filter(c => c.status === 'ACCEPTED').reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingCount = conversations.filter(c => c.status === 'PENDING').length;


  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await getUserConversations(user.token);
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string, markAsSeen = false) => {
    if (!user) return;

    try {
      const response = await getConversationMessages(conversationId, user.token, 50, undefined, true);
      if (response.success) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [conversationId]: response.data || []
        }));

        console.log(`Loaded messages for conversation ${conversationId}`, response.data);

        if (markAsSeen) {
          setConversations(prev => prev.map(conv =>
            conv.conversation.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          ));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user, messages]);

  const sendMessage = useCallback(async (data: { conversationId?: string; receiverId?: string; content: string }) => {
    if (!user) return { success: false, message: "User not authenticated" };

    // Create optimistic message
    const tempId = `temp-${user.id}-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: data.conversationId || "",
      senderId: user.id,
      content: data.content,
      createdAt: new Date().toISOString(),
      status: "sending",
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username
      }
    };

    if (data.conversationId) {
      setMessages(prevMessages => ({
        ...prevMessages,
        [data.conversationId!]: [...(prevMessages[data.conversationId!] || []), optimisticMessage]
      }))
    }

    try {
      const response = await apiSendMessage(data, user.token);

      if (response.success) {
        const { conversationId, isNewConversation } = response;

        if (data.conversationId) {
          const realMessage = response.data;
          setMessages(prev => ({
            ...prev,
            [data.conversationId!]: prev[data.conversationId!].map(msg =>
              msg.id === tempId ? { ...realMessage, status: 'sent' } : msg
            )
          }));
        }

        if (isNewConversation && conversationId) {
          console.log('MessageContext: New conversation created, loading data');
          await loadConversations();
          await loadMessages(conversationId);
        }

        return {
          success: true,
          conversationId,
          isNewConversation,
          data: response.data
        };
      } else {
        if (data.conversationId) {
          setMessages(prev => ({
            ...prev,
            [data.conversationId!]: prev[data.conversationId!].filter(msg => msg.id !== tempId)
          }));
        }

        console.error('MessageContext: Failed to send message:', response);
        return {
          success: false,
          message: response.message || 'Failed to send message'
        };
      }
    } catch (error) {
      if (data.conversationId) {
        setMessages(prev => ({
          ...prev,
          [data.conversationId!]: prev[data.conversationId!].filter(msg => msg.id !== tempId)
        }));
      }

      console.error('MessageContext: Error sending message:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }

  }, [user, loadConversations, loadMessages]);


  // Simplified markAsSeen function using the optimized backend
  const markAsSeen = useCallback(async (conversationId: string, force: boolean = false) => {
    if (!user) return;

    try {
      const conversationMessages = messages[conversationId] || [];
      const conversation = conversations.find(c => c.conversation.id === conversationId);

      if (!conversation) {
        console.log('MessageContext: Conversation not found for markAsSeen');
        return;
      }

      const conversationType = conversation.conversation.type;

      // Check if there are any unread messages from others
      const unreadMessages = conversationMessages.filter(msg =>
        msg.senderId !== user.id && (
          conversationType === 'DIRECT'
            ? !msg.seenAt
            : (!msg.readBy || !msg.readBy.some((receipt: any) => receipt.user.id === user.id))
        )
      );

      // Only call API if there are unread messages or forced
      if (unreadMessages.length === 0 && !force) {
        console.log('MessageContext: No unread messages to mark as seen');
        return;
      }

      console.log('MessageContext: Marking conversation as seen:', conversationId, 'Type:', conversationType, 'Unread count:', unreadMessages.length);

      const { markConversationAsSeen } = await import('../../services/api');
      const response = await markConversationAsSeen(conversationId, user.token);

      if (response.success) {
        const seenAt = response.seenAt || new Date().toISOString();

        // Update local state based on conversation type
        setMessages(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map(msg => {
            if (msg.senderId === user.id) return msg; // Don't update own messages

            if (conversationType === 'DIRECT') {
              // For direct conversations, update seenAt field
              return {
                ...msg,
                seenAt: !msg.seenAt ? seenAt : msg.seenAt,
                status: 'seen' // Simplified status model
              };
            } else {
              // For group conversations, update readBy array
              const hasUserRead = msg.readBy?.some((receipt: any) => receipt.user.id === user.id);
              if (!hasUserRead) {
                return {
                  ...msg,
                  readBy: [
                    ...(msg.readBy || []),
                    {
                      user: {
                        id: user.id,
                        username: user.username || '',
                        displayName: user.displayName || user.username || '',
                      },
                      readAt: seenAt
                    }
                  ],
                  status: 'seen'
                };
              }
            }

            return msg;
          })
        }));

        // Reset unread count
        setConversations(prev => prev.map(conv =>
          conv.conversation.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        ));

        console.log('MessageContext: Conversation marked as seen successfully');
      }
    } catch (error) {
      console.error('MessageContext: Error marking conversation as seen:', error);
    }
  }, [user, messages, conversations]);

  const acceptMessageRequest = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { acceptConversationInvite } = await import('../../services/api');
      const response = await acceptConversationInvite(conversationId, user.token);
      if (response.success) {
        await loadConversations();
      }
    } catch (error) {
      console.error('Error accepting message request:', error);
    }
  }, [user, loadConversations]);

  const rejectMessageRequest = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { rejectConversationInvite } = await import('../../services/api');
      const response = await rejectConversationInvite(conversationId, user.token);
      if (response.success) {
        setConversations(prev => prev.filter(conv => conv.conversation.id !== conversationId));
      }
    } catch (error) {
      console.error('Error rejecting message request:', error);
    }
  }, [user]);

  // Handle typing updates
  const handleTypingUpdate = useCallback((conversationId: string, userId: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      const current = prev[conversationId] || [];
      if (isTyping) {
        // Add user if not already in list
        if (!current.includes(userId)) {
          return {
            ...prev,
            [conversationId]: [...current, userId]
          };
        }
        return prev;
      } else {
        // Remove user from list
        return {
          ...prev,
          [conversationId]: current.filter(id => id !== userId)
        };
      }
    });
  }, []);

  // Handle incoming messages via WebSocket
  const handleIncomingMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const existingMessages = prev[message.conversationId] || [];

      // Check if message already exists to prevent duplicates
      const messageExists = existingMessages.some(msg => msg.id === message.id);
      if (messageExists) {
        return prev;
      }

      return {
        ...prev,
        [message.conversationId]: [...existingMessages, { ...message, status: 'delivered' }]
      };
    });

    // Update conversation last message and unread count
    setConversations(prev => prev.map(conv =>
      conv.conversation.id === message.conversationId
        ? {
          ...conv,
          conversation: {
            ...conv.conversation,
            lastMessage: message
          },
          unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
        }
        : conv
    ));
  }, [user]);

  useEffect(() => {
    const handleWebSocketMessage = (message: any) => {
      console.log('MessageContext: WebSocket message received:', message.type);

      switch (message.type) {
        case 'NEW_MESSAGE':
          handleIncomingMessage(message.payload);
          break;
        case 'USER_TYPING':
          handleTypingUpdate(
            message.payload.conversationId,
            message.payload.userId,
            message.payload.isTyping
          );
          break;
        default:
          console.log('MessageContext: Unknown WebSocket message type:', message.type);
      }
    };

    chrome.runtime.onMessage.addListener(handleWebSocketMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleWebSocketMessage);
    };
  }, [
    handleIncomingMessage,
    handleTypingUpdate,
    loadConversations
  ]);

  useEffect(() => {
    if (user) {
      loadConversations();

      // Fetch initial typing state from background to handle persistence
      chrome.runtime.sendMessage({ type: 'GET_TYPING_STATE' }, (state) => {
        if (state) {
          console.log('[MessageContext] Received initial typing state:', state);
          setTypingUsers(state);
        }
      });
    }
  }, [user, loadConversations]);

  return (
    <MessageContext.Provider value={{
      conversations,
      messages,
      loading,
      loadConversations,
      loadMessages,
      unreadCount,
      pendingCount,
      typingUsers,
      sendMessage,
      markAsSeen,
      acceptMessageRequest,
      rejectMessageRequest
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
