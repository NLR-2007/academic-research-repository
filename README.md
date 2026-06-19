<div align="center">

# LUMINA

### Academic Research Repository

A full-stack platform for uploading, discovering, and managing academic research papers — built with React, Node.js, Express, and MySQL.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

**Browse papers** · **Upload research** · **Request access** · **Admin review pipeline**

</div>

---

## Features

### For Researchers
- **Submit papers** with PDF upload, automatic metadata extraction, and duplicate detection (SHA-256 hash)
- **Edit your papers** — update title, abstract, authors, keywords, visibility, and more from your profile
- **Three visibility levels** — Public, Restricted (login required), or Private (invite-only)
- **Private share links** — generate time-limited (7-day) tokens for sharing private papers
- **Request access** to restricted/private papers with a notification-based approval flow
- **Researcher profile** — institution, bio, scholar links, badge progression, and submission history
- **Badge system** — Newcomer → Bronze → Silver → Gold → Diamond based on approved paper count

### For Readers
- **Browse & search** papers by title, author, abstract, keyword, category, year, license, or visibility
- **Category-based navigation** — AI, Machine Learning, Web Development, Biotechnology, Physics, Chemistry, Economics
- **Trending papers** — weekly view-count based rankings
- **In-browser PDF viewer** — read papers directly without downloading
- **arXiv integration** — seeded papers link directly to arXiv PDFs

### For Admins
- **Review pipeline** — approve, reject (with reason), or delete submitted papers
- **Dashboard analytics** — submission stats, approval rates, category distribution charts
- **User management** — view all users, monitor activity, manage accounts
- **Audit logs** — every admin action is logged with timestamps and reasons
- **Telegram OTP** — two-factor authentication via Telegram Bot for admin login
- **Email notifications** — optional SMTP integration for approval/rejection alerts

---

## Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| **React 18** | UI components with hooks, context, and functional patterns |
| **React Router v6** | Client-side routing with protected routes |
| **Axios** | HTTP client with JWT interceptor |
| **Recharts** | Dashboard analytics charts |
| **React Dropzone** | Drag-and-drop PDF upload |
| **Vite** | Dev server and production bundler |
| **Vanilla CSS** | Custom design system — no UI framework |

### Backend

| Technology | Purpose |
|:---|:---|
| **Node.js + Express** | REST API server |
| **MySQL + mysql2** | Relational database with connection pooling |
| **JWT + bcryptjs** | Stateless authentication and password hashing |
| **Multer** | Multipart file upload (PDF & ZIP) |
| **pdf-parse** | Automatic metadata extraction from uploaded PDFs |
| **Nodemailer** | Email notifications (SMTP) |
| **Telegram Bot API** | Admin OTP delivery for two-factor auth |
| **UUID v4** | Collision-free primary keys |

---

## React Concepts & Patterns Used

| Concept | Where it's applied |
|:---|:---|
| **Props** | `PaperCard`, `SearchBar`, `BadgeIcon` — parent-to-child data flow |
| **Lifting State Up** | Search query state lives in parent (`AllPapers`), shared with `SearchBar` and paper list |
| **Context API** | `AuthContext` provides `user`, `saveSession`, `logout` globally — avoids prop drilling |
| **Custom Hooks** | `useAuth()` for auth state, `useAdminActions()` for approve/reject/delete logic |
| **Controlled Components** | All form inputs — profile editor, paper editor, login, register, upload wizard |
| **Conditional Rendering** | Ternary chains for access states, short-circuit for optional UI elements |
| **Component Composition** | `<Protected>` route guard wraps children, `<ErrorBoundary>` wraps the app |
| **Colocation** | API endpoints grouped by domain, admin pages in `Admin/` folder |
| **useEffect** | Data fetching, localStorage sync, polling intervals with cleanup |
| **Declarative Routing** | `<Routes>` with nested `<Route>` elements, `useParams`, `useSearchParams` |

---

## Architecture

```
lumina/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios client + endpoint definitions
│       │   ├── client.js       # Axios instance with JWT interceptor
│       │   └── endpoints.js    # paperApi, userApi, adminApi, authApi
│       ├── components/         # Reusable UI components
│       │   ├── Navbar.jsx      # Navigation with role-based links
│       │   ├── PaperCard.jsx   # Paper listing card
│       │   ├── SearchBar.jsx   # Controlled search input
│       │   ├── UploadWizard.jsx# Multi-step paper submission
│       │   ├── BadgeIcon.jsx   # Researcher badge display
│       │   ├── CategoryZone.jsx# Category grid
│       │   ├── AdminSidebar.jsx# Admin navigation
│       │   └── ErrorBoundary.jsx
│       ├── context/
│       │   └── AuthContext.jsx  # Global auth state (Context API)
│       ├── hooks/
│       │   └── useAdminActions.js # Reusable admin action logic
│       ├── pages/
│       │   ├── Home.jsx        # Landing page with trending papers
│       │   ├── AllPapers.jsx   # Browse + search + filter
│       │   ├── PaperDetail.jsx # Full paper view with PDF reader
│       │   ├── Upload.jsx      # Paper submission page
│       │   ├── Profile.jsx     # Researcher dashboard
│       │   ├── Login.jsx       # User + Admin login
│       │   ├── Register.jsx    # User registration
│       │   ├── About.jsx       # About page
│       │   └── Admin/
│       │       ├── Dashboard.jsx   # Analytics + recent activity
│       │       ├── PaperManager.jsx# Review queue
│       │       └── UserManager.jsx # User administration
│       ├── main.jsx            # App entry + route definitions
│       └── styles.css          # Complete design system
│
├── server/                     # Node.js backend (Express)
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Register, login, admin OTP
│   │   ├── paperController.js  # CRUD, access control, sharing
│   │   ├── adminController.js  # Dashboard, approve/reject, logs
│   │   └── userController.js   # Profile, notifications
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification + optional auth
│   │   ├── adminMiddleware.js  # Admin role check
│   │   └── uploadMiddleware.js # Multer config (PDF/ZIP only)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── papers.js
│   │   ├── admin.js
│   │   ├── users.js
│   │   └── categories.js
│   ├── utils/
│   │   ├── seedPapers.js       # Populate from arXiv API
│   │   ├── seedAdmin.js        # Create admin account
│   │   ├── pdfParser.js        # Extract metadata from PDFs
│   │   ├── telegramOTP.js      # Telegram bot OTP delivery
│   │   ├── mailer.js           # SMTP email notifications
│   │   └── badgeUpdater.js     # Auto-update researcher badges
│   ├── database/
│   │   └── schema.sql          # Full database schema
│   ├── uploads/                # File storage (gitignored)
│   │   ├── papers/YYYY/MM/     # Approved PDFs
│   │   ├── code/YYYY/MM/       # Code attachments (ZIP)
│   │   └── temp/               # Upload staging area
│   └── server.js               # Express app entry point
```

---

## Database Schema

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│    users     │────▶│ research_papers  │◀────│   categories   │
│──────────────│     │──────────────────│     │────────────────│
│ id (UUID)    │     │ id (UUID)        │     │ id (INT)       │
│ name         │     │ user_id (FK)     │     │ name           │
│ email        │     │ title            │     │ description    │
│ institution  │     │ authors (JSON)   │     │ paper_count    │
│ badge_level  │     │ abstract         │     └────────────────┘
│ password_hash│     │ keywords (JSON)  │
└──────┬───────┘     │ doi, journal     │     ┌────────────────┐
       │             │ visibility       │     │    admins      │
       │             │ status           │────▶│────────────────│
       │             │ file_path        │     │ id (INT)       │
       │             │ view_count       │     │ username       │
       │             └────────┬─────────┘     │ otp_code       │
       │                      │               │ telegram_id    │
       ▼                      ▼               └────────────────┘
┌──────────────┐     ┌──────────────────┐
│access_requests│    │  notifications   │     ┌────────────────┐
│──────────────│     │──────────────────│     │  admin_logs    │
│ requester_id │     │ user_id (FK)     │     │────────────────│
│ paper_id     │     │ paper_id (FK)    │     │ admin_id (FK)  │
│ status       │     │ type, message    │     │ paper_id (FK)  │
└──────────────┘     └──────────────────┘     │ action, reason │
                                              └────────────────┘
┌──────────────┐     ┌──────────────────┐
│ paper_views  │     │private_share_links│
│──────────────│     │──────────────────│
│ user_id (FK) │     │ paper_id (FK)    │
│ paper_id (FK)│     │ token            │
│ view_week    │     │ expires_at       │
└──────────────┘     └──────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/NLR-2007/academic-research-repository.git
cd academic-research-repository
```

### 2. Set up the database

```sql
SOURCE server/database/schema.sql;
```

### 3. Configure & start the backend

```bash
cd server
cp .env.example .env     # Edit with your DB credentials and secrets
npm install
node utils/seedAdmin.js  # Create admin account
npm run dev              # Starts on http://localhost:5001
```

### 4. Configure & start the frontend

```bash
cd client
cp .env.example .env     # Set VITE_API_URL and VITE_UPLOADS_URL
npm install
npm run dev              # Starts on http://localhost:5173
```

### 5. (Optional) Seed sample papers from arXiv

```bash
cd server
node utils/seedPapers.js       # Adds 20 papers from arXiv
node utils/seedPapers.js 50    # Adds 50 papers
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|:---|:---|:---:|
| `PORT` | Server port (default: 5001) | |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port (default: 3306) | |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | |
| `ADMIN_USERNAME` | Admin login username | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot for admin OTP | Yes |
| `TELEGRAM_CHAT_ID` | Telegram chat for OTP delivery | Yes |
| `SMTP_HOST` | Email server host | |
| `SMTP_PORT` | Email server port | |
| `SMTP_USER` | Email username | |
| `SMTP_PASS` | Email password | |

### Client (`client/.env`)

| Variable | Description | Default |
|:---|:---|:---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_UPLOADS_URL` | Backend uploads base URL | `http://localhost:5000` |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/admin/login` | Admin login (step 1 — sends OTP) |
| `POST` | `/api/auth/admin/verify-otp` | Admin login (step 2 — verify OTP) |

### Papers
| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/api/papers` | | List approved papers (filterable) |
| `GET` | `/api/papers/trending` | | Weekly trending papers |
| `GET` | `/api/papers/:id` | Optional | Paper detail + PDF access |
| `PUT` | `/api/papers/:id` | Yes | Edit own paper |
| `POST` | `/api/papers/upload-temp` | Yes | Upload PDF to staging |
| `POST` | `/api/papers/extract` | Yes | Extract PDF metadata |
| `POST` | `/api/papers/submit` | Yes | Submit paper for review |
| `GET` | `/api/papers/duplicate-check` | Yes | Check title duplicates |
| `POST` | `/api/papers/:id/request-access` | Yes | Request access to private paper |
| `POST` | `/api/papers/access-requests/:id/respond` | Yes | Accept/deny access request |
| `POST` | `/api/papers/:id/share-link` | Yes | Generate private share link |

### Admin
| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/api/admin/dashboard` | Admin | Dashboard stats & charts |
| `GET` | `/api/admin/papers` | Admin | All papers (any status) |
| `PATCH` | `/api/admin/papers/:id/approve` | Admin | Approve paper |
| `PATCH` | `/api/admin/papers/:id/reject` | Admin | Reject paper (with reason) |
| `DELETE` | `/api/admin/papers/:id` | Admin | Delete paper (with reason) |
| `GET` | `/api/admin/users` | Admin | List all users |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account |
| `GET` | `/api/admin/logs` | Admin | Admin action audit trail |

### Users
| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/api/users/me` | Yes | Profile + papers + notifications |
| `PATCH` | `/api/users/me` | Yes | Update profile |
| `PATCH` | `/api/users/notifications/read` | Yes | Mark notifications read |

---

## Data Flow

```
User Action
  └─▶ React Component (useState)
        └─▶ Axios API Call (endpoints.js + JWT interceptor)
              └─▶ Express Route (routes/*.js)
                    └─▶ Auth Middleware (JWT verify)
                          └─▶ Controller (business logic)
                                └─▶ MySQL (pool.query)
                                ◀── JSON response
                          ◀── res.json()
                    ◀── { data }
              ◀── setState(data)
        ◀── Re-render
```

---

## Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- Stateless **JWT** authentication with configurable expiry
- Admin login requires **Telegram OTP** (single-use, 5-minute expiry)
- **SHA-256 file hashing** prevents duplicate uploads and plagiarism
- **Role-based access control** — user, admin, and guest permission levels
- **CORS** restricted to configured client origin
- **Parameterized SQL queries** — no raw string concatenation
- Private papers protected by **ownership check**, **access grants**, or **time-limited share tokens**

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with React + Node.js + MySQL**

Made by [NLR-2007](https://github.com/NLR-2007)

</div>
