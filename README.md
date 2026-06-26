# MailIM

An instant messaging application that uses email as the transport layer.

## Concept

MailIM leverages existing email infrastructure (SMTP/IMAP) to deliver real-time messaging capabilities. Messages are sent as emails but presented in a chat-like interface, combining the reliability and decentralization of email with the UX of modern IM apps.

## Features

- Chat-style UI over email protocol (Gmail)
- Real-time message polling via IMAP
- Contact discovery via email address
- Message threading as conversations
- WebSocket for instant message delivery
- Decentralized — works with any email provider

## Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React + Vite)         │
│  Login  ▸  Chat List  ▸  Chat View          │
│                    │ ▲                       │
│              WebSocket                       │
├─────────────────────────────────────────────┤
│              Backend (Express)               │
│  Auth ▸ SMTP (send) ▸ IMAP (poll/receive)   │
└─────────────────────────────────────────────┘
           │                    │
       SMTP/TLS            IMAP/TLS
           ▼                    ▼
       ┌──────────────────────────┐
       │      Gmail Servers       │
       └──────────────────────────┘
```

## Getting Started

### Prerequisites

1. A Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords) (requires 2FA enabled)

### Setup

```bash
# Clone the repo
git clone https://github.com/ZeroMarker/mailim.git
cd mailim

# Install dependencies (backend + frontend)
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Gmail credentials (optional, can also login via UI)

# Start both server and client
npm run dev
```

The app runs at `http://localhost:5173` (frontend) with backend on port 3001.

### Testing

1. Open two browser windows (or normal + incognito)
2. Login with Gmail account A in window 1
3. Login with Gmail account B in window 2
4. Start a new chat and send messages between them
5. Messages travel through Gmail SMTP/IMAP and appear in real-time

## Tech Stack

- **Backend**: Node.js, Express, ws (WebSocket)
- **Frontend**: React 18, Vite, Tailwind CSS
- **Email**: Nodemailer (SMTP), imapflow + mailparser (IMAP)

## Release

Releases are automated via GitHub Actions.

```bash
# Tag a new version
git tag v0.1.0
git push origin v0.1.0
```

This triggers the release workflow which:
1. Builds the frontend
2. Packages server + client into a tarball
3. Creates a GitHub Release with auto-generated notes

Download release artifacts from the [Releases](https://github.com/ZeroMarker/mailim/releases) page.

## License

MIT
