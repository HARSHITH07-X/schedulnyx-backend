# schedulnyx-backend

Backend API for **SchedulnyxAI** — a production-oriented Node.js + Express service
backed by PostgreSQL, Firebase Authentication, and the Google Gemini API.

This repository covers **Phase 1** of the build: infrastructure, the database
schema, Firebase JWT auth, and the onboarding/profile APIs. Tasks, goals,
scheduling, habits, families, inventory, and analytics arrive in later phases.

## Tech stack

- **Runtime:** Node.js 22 (ESM)
- **Framework:** Express 4
- **Database:** PostgreSQL (local Docker for dev, Supabase for production)
- **Auth:** Firebase Authentication (server verifies the client's Firebase JWT)
- **AI:** Google Gemini

## Project structure

```
src/
├── config/        # env, db pool, firebase admin, gemini initializers
├── controllers/   # route logic (auth, profile, ai)
├── db/            # migration runner + SQL migrations
├── middleware/    # auth, rate limiting, error handling
├── routes/        # express route definitions
├── services/      # business logic (scheduler engine — later phases)
├── utils/         # ApiError, asyncHandler, validation helpers
├── app.js         # express app factory
└── server.js      # entry point (runs migrations, starts server)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

Using the bundled compose file (recommended):

```bash
docker compose up -d db
```

This starts Postgres on `localhost:5432` with database/user/password
`schedulnyx` / `schedulnyx` / `schedulnyx_dev`.

### 3. Configure environment

```bash
cp .env.example .env
```

The defaults already point at the local Docker database. Firebase and Gemini can
be left blank during development (see **Dev auth** below).

### 4. Run migrations and start the server

```bash
npm run migrate   # optional; the server also runs migrations on boot
npm run dev       # or: npm start
```

The API listens on `http://localhost:5000`.

## Dev auth

Until Firebase credentials are configured, the API accepts an `x-dev-uid` header
to identify the caller (only when `NODE_ENV` is not `production`). This lets you
exercise authenticated endpoints without minting real Firebase tokens:

```bash
curl -X POST http://localhost:5000/api/auth/sync -H "x-dev-uid: demo-user"
curl http://localhost:5000/api/auth/me -H "x-dev-uid: demo-user"
```

Once Firebase is configured — either `FIREBASE_SERVICE_ACCOUNT` (full
service-account JSON) or the individual `FIREBASE_PROJECT_ID` /
`FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` fields — real Firebase ID tokens
are required via `Authorization: Bearer <token>` and the dev header is ignored.

## API (Phase 1)

| Method | Path                            | Auth | Description                              |
| ------ | ------------------------------- | ---- | ---------------------------------------- |
| GET    | `/`                             | no   | Liveness welcome message                 |
| GET    | `/api/health`                   | no   | DB + service config status               |
| POST   | `/api/auth/sync`                | yes  | Upsert the user + create profile shell   |
| GET    | `/api/auth/me`                  | yes  | Current user + profile                   |
| GET    | `/api/profile`                  | yes  | Get profile                              |
| PUT    | `/api/profile`                  | yes  | Update profile fields                    |
| POST   | `/api/profile/onboarding/complete` | yes | Persist details + mark onboarded      |
| POST   | `/api/ai/generate`              | yes  | Gemini text generation (503 if no key)   |

## Scripts

```bash
npm run dev       # start with --watch
npm start         # start
npm run migrate   # apply pending SQL migrations
npm run lint      # eslint
npm test          # node:test suite
```

## Database schema

See [`src/db/migrations/001_init.sql`](src/db/migrations/001_init.sql) for the
full schema: `users`, `profiles`, `goals`, `tasks`, `schedules`, `habits`,
`habit_logs`, `families`, `family_members`, and `inventory`.
