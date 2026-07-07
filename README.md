# Task Manager — MERN Stack (HTML/CSS/JS Frontend)

A full CRUD Task Manager with JWT authentication.

**Stack:**
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- Frontend: Plain HTML, CSS, JavaScript (fetch API) — no framework
- Auth: JWT stored in `localStorage`, sent as `Authorization: Bearer <token>`

---

## Features

- User Register & Login (passwords hashed with bcrypt)
- JWT-protected routes — each user only sees their own tasks
- Full CRUD on tasks:
  - **Create** task (title, description, priority, due date)
  - **Read** tasks (with search + filter by status/priority)
  - **Update** task details or mark complete/incomplete
  - **Delete** task (with confirmation)
- Clean, moderate UI — badges for priority/status, responsive form

---

## Folder Structure

```
task-manager/
├── backend/
│   ├── config/db.js
│   ├── models/User.js
│   ├── models/Task.js
│   ├── middleware/authMiddleware.js
│   ├── controllers/authController.js
│   ├── controllers/taskController.js
│   ├── routes/authRoutes.js
│   ├── routes/taskRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html          (Login page)
│   ├── register.html       (Register page)
│   ├── dashboard.html      (Task CRUD dashboard)
│   ├── css/style.css
│   └── js/
│       ├── api.js          (fetch wrapper + JWT header)
│       ├── auth.js         (login/register logic)
│       └── dashboard.js    (CRUD logic)
├── JWT_GUIDE.md            (explains JWT concepts + interview Q&A)
└── README.md
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string (or `mongodb://localhost:27017/taskmanager` if running MongoDB locally)
- `JWT_SECRET` — any long random string (used to sign tokens)
- `PORT` — defaults to 5000

Start the server:

```bash
npm run dev
```

You should see:
```
MongoDB Connected: ...
Server running on port 5000
```

### 2. Frontend Setup

No build tools needed — it's plain HTML/CSS/JS.

**Option A — Open directly:**
Just open `frontend/index.html` in your browser.

**Option B — Use a local server (recommended, avoids CORS quirks):**
If you have VS Code, install the "Live Server" extension, right-click
`index.html` → "Open with Live Server".

Or with Node's `http-server`:
```bash
cd frontend
npx http-server -p 5500
```

Then visit `http://localhost:5500`.

> Make sure the backend is running on port 5000 (or update `API_BASE_URL`
> in `frontend/js/api.js` if you changed the port).

### 3. Test the flow

1. Go to `register.html` → create an account
2. You'll be redirected to `dashboard.html` automatically
3. Add, edit, complete, and delete tasks
4. Try the search box and filters
5. Click Logout, then try visiting `dashboard.html` directly — you'll be
   redirected to login (route protection works!)

---

## API Endpoints Reference

| Method | Endpoint | Protected? | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/profile` | Yes | Get logged-in user's profile |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks` | Yes | Get all tasks (supports `?search=`, `?status=`, `?priority=`) |
| GET | `/api/tasks/:id` | Yes | Get single task |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |

Protected routes require header: `Authorization: Bearer <token>`

---

## For Your Resume / Interview

See **`JWT_GUIDE.md`** for a full breakdown of how JWT auth works in this
project, plus common interview questions with simple answers.

Suggested resume bullet:
> Built a full-stack Task Manager (Node.js, Express, MongoDB) with JWT-based
> authentication and bcrypt password hashing; implemented complete CRUD
> operations with search/filter functionality and user-scoped data access.
