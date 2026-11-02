# SYD204 Task API

Task List REST API (Node.js + Express + MySQL on Aiven) with a browser frontend.

## Structure

```
task-api/
├── server-mvc.js            entry point (API + serves public/)
├── test-db.js               connection test
├── database/schema.sql      run once in MySQL Workbench
├── public/                  FRONTEND (index.html, style.css, app.js)
└── src/                     BACKEND
    ├── db.js                connection pool
    ├── routes/              URL -> controller
    ├── controllers/         validation + HTTP responses
    ├── models/              SQL only
    └── middleware/          logger, validateId, errorHandler
```

## Setup

1. Create your own Aiven service user (see the practical guide).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `DB_USER` and `DB_PASS`.
4. Run `database/schema.sql` in MySQL Workbench.
5. `npm run test:db` should print "Connected to MySQL".
6. `npm run dev` (or `npm start`), then open http://localhost:3000

## Endpoints

| Method | URL | Body | Success |
|---|---|---|---|
| GET | /health | | 200 |
| GET | /tasks?status=active\|done | | 200 |
| POST | /tasks | `{ "title": "..." }` | 201 |
| GET | /tasks/:id | | 200 |
| PUT | /tasks/:id | `{ "title": "...", "completed": true }` | 200 |
| PATCH | /tasks/:id | `{ "title"?, "completed"? }` | 200 |
| DELETE | /tasks/:id | | 204 |

Errors: 400 bad input (or non-numeric id), 404 not found, 500 server/database error.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ETIMEDOUT` / hang | Check `DB_PORT=15308` (not 3306) and `DB_SSL=REQUIRED` |
| `Access denied` | Wrong `DB_USER` / `DB_PASS`. Do not use `avnadmin` |
| `self-signed certificate` | Download the CA cert from Aiven, save as `ca.pem`, set `DB_CA_PATH=ca.pem` |
| `Table 'tasks' doesn't exist` | Run `database/schema.sql` |
| Port 3000 in use | Stop the old server (Ctrl+C) or change `PORT` |
