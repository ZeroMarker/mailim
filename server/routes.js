import { sendEmail } from './smtp.js';
import { initSmtp } from './smtp.js';
import { addMessage, getConversations, getMessages } from './store.js';
import { broadcast } from './index.js';

let currentEmail = null;

export async function handleMessageSend({ to, text, email, password }) {
  if (email && password) {
    initSmtp(email, password);
    currentEmail = email;
  }

  if (!to || !text) throw new Error('Recipient and text required');

  const subject = 'MailIM: ' + text.slice(0, 50);
  await sendEmail(to, subject, text);

  const msg = {
    id: Date.now(),
    from: currentEmail,
    to,
    subject,
    text,
    time: new Date().toISOString(),
    direction: 'sent',
    read: true,
  };
  addMessage(msg);
  broadcast({ type: 'new_message', message: msg, contact: to });

  return { ok: true, message: msg };
}

export { getConversations, getMessages };
