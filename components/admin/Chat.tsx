import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, MessageCircle, Loader2 } from 'lucide-react';
import { chatAPI, ChatMessage } from '../../utils/api';

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageText?: string;
  unreadCount: number;
}

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      const convs = await chatAPI.getConversations();
      setConversations(convs);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      const errorMsg = error.message || 'Failed to load conversations';
      setError(errorMsg);
      // Show user-friendly error message
      if (errorMsg.includes('Access denied') || errorMsg.includes('403')) {
        alert('Access denied. Please make sure you are logged in as admin.');
      } else if (errorMsg.includes('401') || errorMsg.includes('token')) {
        alert('Authentication failed. Please log in again.');
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Load messages for selected user
  const loadMessages = useCallback(async (userId: string) => {
    try {
      setIsLoadingMessages(true);
      const msgs = await chatAPI.getMessagesForUser(userId);
      setMessages(msgs);
      // Mark messages as read when viewing
      try {
        await chatAPI.markUserMessagesAsRead(userId);
      } catch (markError) {
        // Silently fail - not critical
        console.warn('Error marking messages as read:', markError);
      }
      // Reload conversations to update unread count
      await loadConversations();
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (error.message?.includes('401') || error.message?.includes('token')) {
        alert('Authentication failed. Please log in again.');
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [loadConversations]);

  // Initial load
  useEffect(() => {
    loadConversations();
    
    // Poll for new conversations every 10 seconds
    const interval = setInterval(() => {
      loadConversations();
      if (selectedUserId) {
        loadMessages(selectedUserId);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loadConversations, selectedUserId, loadMessages]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    } else {
      setMessages([]);
    }
  }, [selectedUserId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      await chatAPI.sendMessageToUser(selectedUserId, messageText);
      // Reload messages to get the new one
      await loadMessages(selectedUserId);
      // Reload conversations to update last message
      await loadConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
      setMessageInput(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
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

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.userId === selectedUserId);

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Conversations List */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-lg border border-emerald-100 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-emerald-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageCircle className="text-red-300 mb-4" size={48} />
              <p className="text-red-600 font-medium">Error loading conversations</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <button
                onClick={() => loadConversations()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageCircle className="text-emerald-300 mb-4" size={48} />
              <p className="text-emerald-600 font-medium">No conversations yet</p>
              <p className="text-emerald-500 text-sm mt-2">
                {searchTerm ? 'No conversations match your search' : 'Start chatting with customers!'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.userId}
                onClick={() => setSelectedUserId(conversation.userId)}
                className={`p-4 border-b border-emerald-100 cursor-pointer transition-all ${
                  selectedUserId === conversation.userId
                    ? 'bg-gradient-to-r from-emerald-50 to-mint-50'
                    : 'hover:bg-mint-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                    {getInitials(conversation.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-emerald-900 truncate">{conversation.userName}</h3>
                      <span className="text-xs text-emerald-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-emerald-600 truncate">
                        {conversation.lastMessageText || conversation.userEmail}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-emerald-100 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-mint-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  {getInitials(selectedConversation.userName)}
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">{selectedConversation.userName}</h3>
                  <p className="text-xs text-emerald-600">{selectedConversation.userEmail}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-mint-50/50 to-white">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-emerald-600" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="text-emerald-300 mb-4" size={48} />
                  <p className="text-emerald-600 font-medium">No messages yet</p>
                  <p className="text-emerald-500 text-sm mt-2">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'admin'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-white text-emerald-900 border border-emerald-100'
                      } shadow-sm`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-emerald-50' : 'text-emerald-500'
                        }`}
                      >
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-emerald-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-emerald-300 mb-4" size={64} />
              <p className="text-emerald-600 text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
