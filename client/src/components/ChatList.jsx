import { useState } from 'react';

export default function ChatList({ conversations, activeChat, onSelect, onRefresh, userEmail, onStartChat }) {
  const [newEmail, setNewEmail] = useState('');
  const [showNew, setShowNew] = useState(false);

  const handleNewChat = (e) => {
    e.preventDefault();
    if (newEmail.trim()) {
      onStartChat(newEmail.trim());
      setNewEmail('');
      setShowNew(false);
    }
  };

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg text-gray-800">MailIM</h2>
          <div className="flex gap-1">
            <button
              onClick={onRefresh}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowNew(!showNew)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
              title="New chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 truncate">{userEmail}</p>
      </div>

      {showNew && (
        <form onSubmit={handleNewChat} className="p-3 border-b bg-gray-50">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address..."
            className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoFocus
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No conversations yet.<br />Start a new chat with the + button.
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.email}
              onClick={() => onSelect(conv.email)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                activeChat === conv.email ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-sm text-gray-800 truncate">{conv.email}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                  {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-2 flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
