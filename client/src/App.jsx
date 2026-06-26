import { useState } from 'react';
import Login from './components/Login.jsx';
import ChatList from './components/ChatList.jsx';
import ChatView from './components/ChatView.jsx';
import useWebSocket from './hooks/useWebSocket.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  useWebSocket(user, (data) => {
    if (data.type === 'new_message') {
      setMessages((prev) => {
        if (activeChat === data.contact) return [...prev, data.message];
        return prev;
      });
      refreshConversations();
    }
  });

  const refreshConversations = async () => {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    setConversations(data);
  };

  const openChat = async (email) => {
    setActiveChat(email);
    const res = await fetch(`/api/messages/${encodeURIComponent(email)}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async (text) => {
    if (!activeChat || !text.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: activeChat,
        text,
        email: user.email,
        password: user.password,
      }),
    });
    const res = await fetch(`/api/messages/${encodeURIComponent(activeChat)}`);
    const data = await res.json();
    setMessages(data);
    refreshConversations();
  };

  const handleLogin = async (email, password) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setUser({ email, password });
    refreshConversations();
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-full">
      <ChatList
        conversations={conversations}
        activeChat={activeChat}
        onSelect={openChat}
        onRefresh={refreshConversations}
        userEmail={user.email}
        onStartChat={async (email) => {
          setActiveChat(email);
          setMessages([]);
        }}
      />
      <ChatView
        activeChat={activeChat}
        messages={messages}
        onSend={sendMessage}
        userEmail={user.email}
      />
    </div>
  );
}
