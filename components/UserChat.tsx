import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { chatAPI, getUser, ChatMessage } from '../utils/api';

const UserChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const isLoadingUnreadRef = useRef(false);
  const lastMessagesRef = useRef<string>('');
  
  // Memoize user to prevent unnecessary re-renders
  const user = useMemo(() => getUser(), []);
  const userId = user?.id;

  // Listen for open chat events from product detail page
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent;
      const productIdFromEvent = customEvent.detail?.productId;
      if (productIdFromEvent) {
        setProductId(productIdFromEvent);
      }
      setIsOpen(true);
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => {
      window.removeEventListener('openChat', handleOpenChat);
    };
  }, []);

  // Load messages and unread count on mount
  useEffect(() => {
    if (!userId) return;
    
    // Initial load
    loadMessages();
    loadUnreadCount();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for updates
  useEffect(() => {
    if (!userId) return;
    
    // Poll for new messages every 15 seconds
    const interval = setInterval(() => {
      if (isOpen) {
        // Only poll messages when chat is open
        loadMessages();
      }
      // Always check unread count
      loadUnreadCount();
    }, 15000);

    return () => clearInterval(interval);
  }, [userId, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]); // Only depend on message count, not the array itself

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && userId) {
      markAsRead();
      // Reload messages after marking as read
      const timer = setTimeout(() => {
        loadMessages();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = useCallback(async () => {
    if (!userId || isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      const fetchedMessages = await chatAPI.getMessages();
      
      // Only update if messages actually changed
      const messagesStr = JSON.stringify(fetchedMessages);
      if (messagesStr !== lastMessagesRef.current) {
        setMessages(fetchedMessages);
        lastMessagesRef.current = messagesStr;
      }
    } catch (error) {
      // Silently fail - don't spam console with errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Network error - backend might be down, ignore
        return;
      }
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId || isLoadingUnreadRef.current) return;
    try {
      isLoadingUnreadRef.current = true;
      const count = await chatAPI.getUnreadCount();
      // Only update if count actually changed
      setUnreadCount(prev => prev !== count ? count : prev);
    } catch (error) {
      // Silently fail - don't spam console with errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Network error - backend might be down, ignore
        return;
      }
      console.error('Error loading unread count:', error);
    } finally {
      isLoadingUnreadRef.current = false;
    }
  }, [userId]);

  const markAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await chatAPI.markAsRead();
      setUnreadCount(0);
    } catch (error) {
      // Silently fail - don't spam console
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return;
      }
      console.error('Error marking messages as read:', error);
    }
  }, [userId]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !userId || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      await chatAPI.sendMessage(messageText, productId);
      // Reload messages to get the new one
      await loadMessages();
      // Clear productId after first message
      if (productId) {
        setProductId(undefined);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
      setMessageInput(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  }, [messageInput, userId, isSending, productId, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
        aria-label="Open chat"
      >
        <MessageCircle size={28} className="relative" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-emerald-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask us anything!
        </span>
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col z-50 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Chat Support</h3>
                <p className="text-xs text-emerald-100">We're here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-mint-50/50 to-white space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="text-emerald-300 mb-4" size={48} />
                <p className="text-emerald-600 font-medium">No messages yet</p>
                <p className="text-emerald-500 text-sm mt-2">Start a conversation with us!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      message.sender === 'admin'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-tl-none'
                        : 'bg-white text-emerald-900 border-2 border-emerald-100 rounded-tr-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'admin' ? 'text-emerald-50' : 'text-emerald-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-emerald-100 bg-white rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 placeholder-emerald-400"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default UserChat;

