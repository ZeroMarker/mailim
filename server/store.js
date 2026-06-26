const conversations = new Map();

export function addMessage(msg) {
  const contactEmail = msg.direction === 'sent' ? msg.to : msg.from;
  const key = contactEmail.toLowerCase();

  if (!conversations.has(key)) {
    conversations.set(key, []);
  }
  conversations.get(key).push(msg);
}

export function getConversations() {
  const list = [];
  for (const [email, messages] of conversations) {
    const last = messages[messages.length - 1];
    list.push({
      email,
      lastMessage: last.text,
      lastTime: last.time,
      unread: messages.filter(m => m.direction === 'received' && !m.read).length,
    });
  }
  list.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
  return list;
}

export function getMessages(contactEmail) {
  const key = contactEmail.toLowerCase();
  const msgs = conversations.get(key) || [];
  for (const m of msgs) {
    if (m.direction === 'received') m.read = true;
  }
  return msgs;
}
