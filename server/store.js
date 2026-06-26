import db from './db.js';

const getOrCreateConv = db.prepare(`
  INSERT INTO conversations (contact_email, last_message, last_time, unread_count)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(contact_email) DO UPDATE SET
    last_message = excluded.last_message,
    last_time = excluded.last_time,
    unread_count = unread_count + excluded.unread_count,
    updated_at = datetime('now')
  RETURNING id
`);

const insertMessage = db.prepare(`
  INSERT INTO messages (conversation_id, message_id, from_email, to_email, subject, text, time, direction, read)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getConversationsStmt = db.prepare(`
  SELECT contact_email as email, last_message as lastMessage, last_time as lastTime, unread_count as unread
  FROM conversations
  ORDER BY last_time DESC
`);

const getMessagesStmt = db.prepare(`
  SELECT id, message_id as messageId, from_email as "from", to_email as "to", subject, text, time, direction, read
  FROM messages
  WHERE conversation_id = ?
  ORDER BY time ASC
`);

const getConvByContact = db.prepare(`
  SELECT id FROM conversations WHERE contact_email = ?
`);

const markRead = db.prepare(`
  UPDATE messages SET read = 1
  WHERE conversation_id = ? AND direction = 'received' AND read = 0
`);

const resetUnread = db.prepare(`
  UPDATE conversations SET unread_count = 0 WHERE id = ?
`);

export function addMessage(msg) {
  const contactEmail = msg.direction === 'sent' ? msg.to : msg.from;
  const key = contactEmail.toLowerCase();
  const unread = msg.direction === 'received' ? 1 : 0;

  const conv = getOrCreateConv.get(key, msg.text, msg.time, unread);
  const convId = conv.id || getConvByContact.get(key).id;

  insertMessage.run(
    convId,
    msg.id?.toString() || null,
    msg.from,
    msg.to,
    msg.subject || null,
    msg.text,
    msg.time,
    msg.direction,
    msg.read ? 1 : 0
  );
}

export function getConversations() {
  return getConversationsStmt.all();
}

export function getMessages(contactEmail) {
  const key = contactEmail.toLowerCase();
  const conv = getConvByContact.get(key);
  if (!conv) return [];

  markRead.run(conv.id);
  resetUnread.run(conv.id);

  return getMessagesStmt.all(conv.id).map(m => ({
    ...m,
    read: Boolean(m.read),
  }));
}
