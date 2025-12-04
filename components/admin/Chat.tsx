import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: string;
}

interface Conversation {
  id: number;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations: Conversation[] = [
    {
      id: 1,
      customerName: 'Rajesh Kumar',
      lastMessage: 'When will my order be delivered?',
      timestamp: '2 min ago',
      unread: 2,
      avatar: 'RK',
      messages: [
        { id: 1, text: 'Hello, I placed an order yesterday. Can you tell me the status?', sender: 'customer', timestamp: '10:30 AM' },
        { id: 2, text: 'Hello Rajesh! Thank you for your order. Let me check the status for you.', sender: 'admin', timestamp: '10:32 AM' },
        { id: 3, text: 'Your order #ORD-001 is currently being processed and will be shipped today.', sender: 'admin', timestamp: '10:33 AM' },
        { id: 4, text: 'When will my order be delivered?', sender: 'customer', timestamp: '10:35 AM' },
      ],
    },
    {
      id: 2,
      customerName: 'Priya Sharma',
      lastMessage: 'Thank you so much!',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'PS',
      messages: [
        { id: 1, text: 'I received my order today. It\'s beautiful!', sender: 'customer', timestamp: '9:00 AM' },
        { id: 2, text: 'That\'s wonderful to hear, Priya! We\'re so glad you love it.', sender: 'admin', timestamp: '9:05 AM' },
        { id: 3, text: 'Thank you so much!', sender: 'customer', timestamp: '9:10 AM' },
      ],
    },
    {
      id: 3,
      customerName: 'Amit Patel',
      lastMessage: 'Can I customize the gift box?',
      timestamp: '3 hours ago',
      unread: 1,
      avatar: 'AP',
      messages: [
        { id: 1, text: 'Hi, I\'m interested in the Anniversary Hamper. Can I customize it?', sender: 'customer', timestamp: '8:00 AM' },
        { id: 2, text: 'Hello Amit! Yes, absolutely. We offer customization options. What would you like to customize?', sender: 'admin', timestamp: '8:15 AM' },
        { id: 3, text: 'Can I customize the gift box?', sender: 'customer', timestamp: '8:20 AM' },
      ],
    },
    {
      id: 4,
      customerName: 'Sneha Reddy',
      lastMessage: 'Do you have same-day delivery?',
      timestamp: '5 hours ago',
      unread: 0,
      avatar: 'SR',
      messages: [
        { id: 1, text: 'Do you offer same-day delivery in Mumbai?', sender: 'customer', timestamp: '6:00 AM' },
        { id: 2, text: 'Yes, we do offer same-day delivery for orders placed before 2 PM. Would you like to place an order?', sender: 'admin', timestamp: '6:10 AM' },
      ],
    },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Handle send message logic
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

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
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedChat(conversation.id)}
              className={`p-4 border-b border-emerald-100 cursor-pointer transition-all ${
                selectedChat === conversation.id
                  ? 'bg-gradient-to-r from-emerald-50 to-mint-50'
                  : 'hover:bg-mint-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-emerald-900 truncate">{conversation.customerName}</h3>
                    <span className="text-xs text-emerald-500 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-600 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-emerald-100 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  {currentChat.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">{currentChat.customerName}</h3>
                  <p className="text-xs text-emerald-600">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-mint-50/50 to-white">
              {currentChat.messages.map((message) => (
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
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'admin' ? 'text-emerald-50' : 'text-emerald-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-emerald-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
                />
                <button type="button" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                  <Smile size={20} />
                </button>
                <button
                  type="submit"
                  className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md"
                >
                  <Send size={20} />
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

