# JWT Authentication Guide (Explained Simply)

This guide explains what JWT is, why we use it, and exactly how it works in
this Task Manager project — so you can confidently explain it in your
placement interview or project presentation.

---

## 1. What is JWT?

**JWT = JSON Web Token**

It's a way for the server to give the browser a "digital ID card" after
login, so the browser can prove *"yes, I already logged in"* on every future
request — without the server needing to store session data.

A JWT looks like this (3 parts separated by dots):

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY0YWJjMTIzIn0.s7f3k2j...
   HEADER              PAYLOAD                SIGNATURE
```

| Part | Contains | Purpose |
|------|----------|---------|
| Header | Algorithm used (e.g. HS256) | Tells how it was signed |
| Payload | Data, e.g. `{ id: "user123" }` | The actual info (NOT secret — anyone can decode it) |
| Signature | Encrypted hash | Proves the token wasn't tampered with |

**Important:** The payload is *readable* by anyone (it's just Base64, not
encrypted) — so never put passwords in it. The signature is what makes it
*trustworthy* — only the server, which holds the `JWT_SECRET`, can create a
valid signature.

---

## 2. Why use JWT instead of sessions?

| Sessions (old way) | JWT (this project) |
|---|---|
| Server stores session data in memory/DB | Server stores nothing — token itself holds the info |
| Doesn't scale well across multiple servers | Works great across multiple servers (stateless) |
| Needs cookies + session store | Just needs the token, sent in a header |

---

## 3. The Full Flow in This Project

```
1. User registers/logs in
        ↓
2. Server checks credentials (bcrypt compares password)
        ↓
3. Server creates a JWT signed with JWT_SECRET
   jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
        ↓
4. Server sends token back to frontend
        ↓
5. Frontend saves it: localStorage.setItem("token", data.token)
        ↓
6. On every future request (e.g. "get my tasks"), frontend attaches:
   Authorization: Bearer <token>
        ↓
7. Server's "protect" middleware verifies token:
   jwt.verify(token, process.env.JWT_SECRET)
        ↓
8. If valid → req.user is set → request proceeds
   If invalid/expired → 401 Unauthorized
```

---

## 4. Where to find this in the code

| File | What it does |
|---|---|
| `backend/models/User.js` | Hashes password with **bcrypt** before saving |
| `backend/controllers/authController.js` | `generateToken()` creates the JWT on login/register |
| `backend/middleware/authMiddleware.js` | `protect` function verifies the JWT on every protected route |
| `backend/routes/taskRoutes.js` | Applies `protect` to all task routes, so only logged-in users can access tasks |
| `frontend/js/api.js` | Attaches `Authorization: Bearer <token>` header to every request |
| `frontend/js/auth.js` | Saves token to `localStorage` after login/register |
| `frontend/js/dashboard.js` | Redirects to login if no token exists |

---

## 5. Why is each task linked to a specific user?

Look at `Task.js` model — every task has a `user` field storing the
logged-in user's ID. When fetching tasks, we filter:

```js
const tasks = await Task.find({ user: req.user._id });
```

This ensures **User A can never see or edit User B's tasks**, even if they
guess a task's ID. `req.user._id` comes from the verified JWT — it can't be
faked, because only someone with the real password could get a valid token.

---

## 6. Common Interview Questions & Simple Answers

**Q: Is JWT encrypted?**
A: No — it's *signed*, not encrypted. Anyone can read the payload, but only
the server can verify (and therefore trust) the signature, since only the
server knows the `JWT_SECRET`.

**Q: Where should you store the JWT on the frontend?**
A: `localStorage` (what this project uses — simple) or an `httpOnly` cookie
(more secure against XSS, used in your Voting System project). For a resume
project, either is acceptable to explain — just know the trade-off:
localStorage is vulnerable to XSS attacks, httpOnly cookies are safer but
need CSRF protection.

**Q: What happens when the token expires?**
A: `jwt.verify()` throws an error, the middleware catches it and returns
`401 Unauthorized`. The frontend then redirects the user back to the login
page.

**Q: Why hash passwords with bcrypt if we already have JWT?**
A: They solve different problems. Bcrypt protects the password *at rest* in
the database (in case the DB is ever leaked). JWT protects *identity
verification* after login. You need both.

**Q: What's inside `expiresIn: "30d"`?**
A: It tells `jsonwebtoken` to embed an expiry timestamp inside the token
itself, so it automatically becomes invalid after 30 days — no manual
cleanup needed.

---

## 7. One-line summary for your presentation

> "When a user logs in, the server verifies their password and issues a
> signed JWT token. The frontend stores this token and sends it with every
> request. A middleware on the backend verifies the token's signature before
> allowing access, so only authenticated users can create, read, update, or
> delete their own tasks."
