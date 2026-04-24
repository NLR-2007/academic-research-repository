# Academic Research Repository

Full-stack research repository built with React, Node.js/Express, and MySQL.

## Stack

- Frontend: React, React Router v6, Axios, Recharts, React Dropzone, Vite
- Backend: Node.js, Express, Multer, pdf-parse, JWT, bcryptjs, Nodemailer
- Database: MySQL with `mysql2`
- Admin OTP: Telegram Bot API

## Setup

1. Create the database tables:

```sql
SOURCE server/database/schema.sql;
```

2. Configure backend environment:

```bash
cd server
cp .env.example .env
npm install
node utils/seedAdmin.js
npm run dev
```

3. Configure frontend environment:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Important Environment Variables

- `JWT_SECRET`: long random secret for user and admin JWTs
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`: required for admin OTP delivery
- `SMTP_*`: optional email delivery for approval/rejection notifications
- `DB_*`: MySQL connection details

## Notes

- Admin login is two-step: password verification, then single-use OTP that expires after 5 minutes.
- Uploaded PDFs first land in `server/uploads/temp`, then accepted submissions move into `server/uploads/papers/YYYY/MM`.
- Private papers require uploader ownership, accepted access request, or a 7-day share token.
- Restricted papers are visible in listings but require login for PDF access.
- Public papers are viewable by guests; download UI is shown only for logged-in users.
