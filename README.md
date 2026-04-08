# Task Manager — Full-Stack Application

A production-grade Task Manager built with **React**, **Node.js/Express**, and **PostgreSQL**.

---

## Live URLs *(update after deployment)*

| Service  | URL |
|----------|-----|
| Frontend | `https://your-app.onrender.com` |
| Backend  | `https://your-api.onrender.com` |

---

## Tech Stack

| Layer     | Technology                           |
|-----------|--------------------------------------|
| Frontend  | React 18, CRA, plain CSS             |
| Backend   | Node.js 20, Express.js               |
| Database  | PostgreSQL 16 (pg Pool, raw SQL)     |
| Container | Docker + Docker Compose              |

---

## Folder Structure

```
task-manager/
├── docker-compose.yml          # Orchestrates db + server + client
├── .gitignore
├── README.md
│
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.js     # Controlled form — create task
│   │   │   ├── TaskItem.js     # Single card — optimistic update + delete
│   │   │   └── TaskList.js     # List wrapper + empty state
│   │   ├── services/
│   │   │   └── api.js          # Centralised fetch calls
│   │   ├── App.js              # Root component — state + handlers
│   │   ├── index.js            # React DOM entry point
│   │   └── styles.css          # Single-file responsive CSS
│   ├── Dockerfile
│   ├── nginx.conf              # SPA-friendly nginx config
│   ├── .env.example
│   └── package.json
│
└── server/                     # Express REST API
    ├── config/
    │   └── db.js               # pg Pool + schema initialisation
    ├── controllers/
    │   └── taskController.js   # Request / response only
    ├── routes/
    │   └── taskRoutes.js       # Route → middleware → controller
    ├── models/
    │   └── taskModel.js        # Raw SQL — all DB interactions
    ├── middlewares/
    │   ├── errorHandler.js     # Central error middleware (4-arg)
    │   └── validateRequest.js  # Input validation middleware
    ├── utils/
    │   └── ApiError.js         # Custom operational error class
    ├── app.js                  # Express app config + middleware
    ├── server.js               # Entry point — starts server
    ├── Dockerfile
    ├── .env.example
    └── package.json
```

---

## Quick Start

### Option A — Docker Compose (recommended, zero config)

```bash
# Clone the repository
git clone https://github.com/your-username/task-manager.git
cd task-manager

# Start everything (db + server + client) in one command
docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| API       | http://localhost:5000/api    |
| Postgres  | localhost:5432               |

To stop: `docker-compose down`  
To wipe the DB volume: `docker-compose down -v`

---

### Option B — Local (manual)

#### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally

#### 1. Backend

```bash
cd server
cp .env.example .env        # edit DATABASE_URL with your credentials
npm install
npm start                   # http://localhost:5000
```

#### 2. Frontend

```bash
cd client
cp .env.example .env        # optionally set REACT_APP_API_URL
npm install
npm start                   # http://localhost:3000
```

> The CRA `proxy` field in `package.json` forwards `/api/*` to `localhost:5000`
> during development, so no CORS issues locally.

---

## API Reference

### Base URL: `/api`

| Method | Route           | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/tasks`        | List all tasks                                   |
| GET    | `/tasks/:id`    | Get a single task                                |
| POST   | `/tasks`        | Create a task                                    |
| PATCH  | `/tasks/:id`    | Partially update a task                          |
| DELETE | `/tasks/:id`    | Delete a task                                    |

### Query Parameters (GET /tasks)

| Param    | Type    | Description                          | Default |
|----------|---------|--------------------------------------|---------|
| `status` | string  | Filter: `todo`, `in-progress`, `done`| —       |
| `page`   | integer | Page number (1-based)                | `1`     |
| `limit`  | integer | Results per page (max 100)           | `10`    |

### Request Body — POST /tasks

```json
{
  "title": "Fix login bug",           // required
  "description": "Auth token issue",  // optional
  "status": "todo",                   // optional, default: "todo"
  "due_date": "2025-06-30"            // optional, ISO date string
}
```

### Response envelope

```json
{
  "success": true,
  "data": { ... },
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

### Error response

```json
{
  "success": false,
  "error": "title is required and must be a non-empty string."
}
```

---

## Environment Variables

### `server/.env`

| Variable        | Description                                  | Default       |
|-----------------|----------------------------------------------|---------------|
| `PORT`          | Express server port                          | `5000`        |
| `NODE_ENV`      | Environment (`development` / `production`)   | `development` |
| `DATABASE_URL`  | Full PostgreSQL connection string            | **required**  |
| `DB_SSL`        | Enable SSL (`true` / `false`)                | `false`       |
| `CLIENT_ORIGIN` | CORS allowed origin                          | `*`           |

### `client/.env`

| Variable             | Description                                       |
|----------------------|---------------------------------------------------|
| `REACT_APP_API_URL`  | Backend base URL. Leave empty to use CRA proxy.   |

---

## HTTP Status Codes

| Code | Meaning                        |
|------|--------------------------------|
| 200  | OK                             |
| 201  | Created                        |
| 400  | Bad Request (validation error) |
| 404  | Not Found                      |
| 500  | Internal Server Error          |

---

## Assumptions & Trade-offs

- **Raw SQL over ORM** — `pg` is used directly to demonstrate SQL knowledge and keep the stack minimal. An ORM (Prisma, Sequelize) would be appropriate for a larger project.
- **No authentication** — User auth is out of scope per the assignment, but the folder structure makes it straightforward to add a `users` table and JWT middleware.
- **Schema-on-startup** — The DB schema is created via `CREATE TABLE IF NOT EXISTS` at server boot instead of formal migrations. For production, a migration tool (node-pg-migrate, Flyway) would be preferred.
- **`updated_at` managed in application code** — Avoids requiring a PL/pgSQL trigger, keeping the schema portable across Postgres hosts.
- **CRA proxy for dev** — The `"proxy"` key in `client/package.json` removes the need for CORS configuration during local development.

---

## What I'd Improve With More Time

1. **Authentication** — JWT-based auth with a `users` table; tasks linked via `user_id` foreign key.
2. **Database migrations** — Replace boot-time schema init with `node-pg-migrate` for safe incremental changes.
3. **Tests** — Integration tests with Jest + Supertest for all API endpoints; React Testing Library for components.
4. **Rate limiting & security headers** — `express-rate-limit` + `helmet`.
5. **CI/CD** — GitHub Actions pipeline: lint → test → Docker build → deploy to Render/Railway.
6. **Drag-and-drop Kanban view** — Visualise tasks as a board (todo / in-progress / done columns).

---

## Deployment Guide (Render)

1. Push to a public GitHub repository.
2. **Backend** — Create a new *Web Service* on Render pointing to `/server`. Set env vars from `.env.example`. Add a *PostgreSQL* database and paste the internal connection string into `DATABASE_URL`.
3. **Frontend** — Create a new *Static Site* on Render pointing to `/client`. Set build command `npm run build`, publish directory `build`, and set `REACT_APP_API_URL` to the backend service URL.
4. Update the *Live URLs* section at the top of this README.
