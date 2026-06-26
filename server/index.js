import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleMessageSend, getConversations, getMessages } from './routes.js';
import { startImapWatch, stopImapWatch } from './imap.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total:', clients.size);
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total:', clients.size);
  });
});

export function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

app.post('/api/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    await startImapWatch({ email, password });
    res.json({ ok: true, email });
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const result = await handleMessageSend(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations', (req, res) => {
  res.json(getConversations());
});

app.get('/api/messages/:email', (req, res) => {
  res.json(getMessages(req.params.email));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`MailIM server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await stopImapWatch();
  process.exit(0);
});
