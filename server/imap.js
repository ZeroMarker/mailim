import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { addMessage } from './store.js';
import { broadcast } from './index.js';

let client = null;
let polling = null;

export async function startImapWatch({ email, password }) {
  if (client) await stopImapWatch();

  client = new ImapFlow({
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT) || 993,
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
  });

  await client.connect();
  await client.mailboxOpen('INBOX');
  console.log('IMAP connected for', email);

  await fetchRecent(email);
  startPolling(email);
}

async function fetchRecent(userEmail) {
  const lock = await client.getMailboxLock('INBOX');
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for await (const msg of client.fetch({ since }, { envelope: true, source: true, uid: true })) {
      const parsed = await simpleParser(msg.source);
      const fromAddr = parsed.from?.value?.[0]?.address || '';
      const toAddr = parsed.to?.value?.[0]?.address || '';
      const direction = fromAddr.toLowerCase() === userEmail.toLowerCase() ? 'sent' : 'received';

      addMessage({
        id: msg.uid,
        from: fromAddr,
        to: toAddr,
        subject: parsed.subject || '(no subject)',
        text: parsed.text || '',
        time: parsed.date?.toISOString() || new Date().toISOString(),
        direction,
        read: direction === 'sent',
      });
    }
  } finally {
    lock.release();
  }
}

function startPolling(userEmail) {
  polling = setInterval(async () => {
    try {
      const lock = await client.getMailboxLock('INBOX');
      try {
        const status = await client.status('INBOX', { unseen: true });
        if (status.unseen > 0) {
          for await (const msg of client.fetch({ unseen: true }, { envelope: true, source: true, uid: true })) {
            const parsed = await simpleParser(msg.source);
            const fromAddr = parsed.from?.value?.[0]?.address || '';
            const toAddr = parsed.to?.value?.[0]?.address || '';

            if (fromAddr.toLowerCase() !== userEmail.toLowerCase()) {
              const msgData = {
                id: msg.uid,
                from: fromAddr,
                to: toAddr,
                subject: parsed.subject || '(no subject)',
                text: parsed.text || '',
                time: parsed.date?.toISOString() || new Date().toISOString(),
                direction: 'received',
                read: false,
              };
              addMessage(msgData);
              broadcast({ type: 'new_message', message: msgData, contact: fromAddr });
            }
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      console.error('IMAP poll error:', err.message);
    }
  }, 5000);
}

export async function stopImapWatch() {
  if (polling) clearInterval(polling);
  if (client) {
    try { await client.logout(); } catch {}
    client = null;
  }
}
