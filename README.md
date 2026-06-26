# MailIM

An instant messaging application that uses email as the transport layer.

## Concept

MailIM leverages existing email infrastructure (SMTP/IMAP) to deliver real-time messaging capabilities. Messages are sent as emails but presented in a chat-like interface, combining the reliability and decentralization of email with the UX of modern IM apps.

## Features

- Chat-style UI over email protocol
- Real-time message polling via IMAP IDLE
- Contact discovery via email address
- Message threading as conversations
- File attachments using MIME
- End-to-end encryption via PGP
- Decentralized — works with any email provider

## Architecture

```
┌──────────┐     SMTP      ┌──────────┐
│  MailIM  │ ────────────▸ │  Mail    │
│  Client  │ ◂──────────── │  Server  │
└──────────┘     IMAP      └──────────┘
     │
     ▼
┌──────────┐
│  Chat UI │
└──────────┘
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ZeroMarker/mailim.git
cd mailim

# Install dependencies
npm install

# Configure your email account
cp .env.example .env

# Start the app
npm start
```

## Tech Stack

- **Runtime**: Node.js
- **UI**: React + Tailwind CSS
- **Email**: Nodemailer (SMTP), imapflow (IMAP)
- **Encryption**: OpenPGP.js

## License

MIT
