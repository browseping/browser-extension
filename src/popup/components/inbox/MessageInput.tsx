import { useRef, useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  conversationId?: string;
}

const MessageInput = ({ onSend, disabled = false, conversationId }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();

  // Keep ref in sync with state for cleanup
  const isTypingRef = useRef(isTyping);

  // Function to send typing event via background script
  const sendTypingEvent = (typing: boolean) => {
    if (!conversationId || !user) return;

    chrome.runtime.sendMessage({
      type: typing ? 'TYPING_START' : 'TYPING_STOP',
      conversationId: conversationId,
      userId: user.id
    }).catch((error) => {
      console.warn('[MessageInput] Error sending typing event:', error);
    });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending || disabled) return;

    // Stop typing indicator when sending message
    if (isTyping) {
      setIsTyping(false);
      sendTypingEvent(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    setSending(true);
    try {
      await onSend(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();

    // Handle typing indicator
    if (!conversationId || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start if not already typing and user has started typing
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      sendTypingEvent(true);
    }

    // Set timeout to send typing stop after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingEvent(false);
      typingTimeoutRef.current = null;
    }, 3000);
  };


  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        sendTypingEvent(false);
      }
    };
  }, [conversationId]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4 bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || sending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || sending || disabled}
          className={`p-2 rounded-lg transition-colors ${content.trim() && !sending && !disabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          style={{ marginBottom: '8px' }}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
          ) : (
            <FiSend size={18} />
          )}
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
