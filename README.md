# TransitOps

Fleet logistics management platform with an admin console, driver portal, and public shipment tracking.

## Architecture

| Layer | Stack | Location |
|-------|-------|----------|
| Frontend | React 19, TypeScript, Vite, Tailwind | `Frontend/` |
| Backend | Express 5, Drizzle ORM, PostgreSQL, JWT | `backend/` |
| Database | PostgreSQL 17 (Docker) | `backend/docker-compose.yml` |

## Quick start

### 1. Start the database

```bash
cd backend
docker compose up -d
```

### 2. Configure and migrate the backend

Create `backend/.env` with at least:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transitops
JWT_SECRET=your-secret-key
PORT=4000
```

Then run:

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs at `http://localhost:4000`.

### 3. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` to the backend. You can also set `VITE_API_URL=http://localhost:4000/api/v1` in `Frontend/.env`.

## Authentication

Roles: `ADMIN`, `MANAGER`, `DRIVER`, `CLIENT`.

- **Login:** `POST /api/v1/auth/login`
- **Signup:** `POST /api/v1/auth/register`
- **Logout:** `POST /api/v1/auth/logout` (revokes refresh token and clears session cookie)

Access tokens are stored in `localStorage`. Refresh tokens are stored in an httpOnly cookie.

### Demo accounts

Seed demo users with:

```bash
cd backend
npm run db:seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `alok@tms.com` | `demo123` |
| Driver | `rajesh@tms.com` | `demo123` |

On the login page, use **Demo Admin** or **Demo Driver** for one-click access.

### Logout

The sidebar logout button and the tracking page **Log Out** control call the backend logout endpoint, clear local storage, and redirect to `/login`.

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in or create an account |
| `/admin` | Admin dashboard (trips, drivers, vehicles, invoices, etc.) |
| `/driver` | Driver mobile-style portal |
| `/track` | Public shipment tracking |

## API docs

With the backend running, open `http://localhost:4000/api-docs` for the Swagger UI.

## Project structure

```
odoo/
├── Frontend/          # React SPA
├── backend/           # Express API + Drizzle schema
└── README.md
```

See `Frontend/README.md` for frontend-specific development notes.
