# TransitOps (ODOO TransitOps)

**TransitOps** is a full-stack fleet logistics and transport management platform. It provides an admin operations console, a driver mobile-style portal, and a public shipment tracking experience — all backed by a REST API with JWT authentication, PostgreSQL persistence, and real-time telemetry support.

The backend is also referenced internally as **AxisFleet**.

**Repository:** [github.com/DevPatel0007/ODOO-TransitOps](https://github.com/DevPatel0007/ODOO-TransitOps)

---

## Table of contents

- [Overview](#overview)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication & roles](#authentication--roles)
- [Demo access](#demo-access)
- [Frontend routes](#frontend-routes)
- [API reference](#api-reference)
- [Database schema](#database-schema)
- [Frontend state & data layer](#frontend-state--data-layer)
- [Security](#security)
- [Scripts reference](#scripts-reference)
- [Production build](#production-build)
- [Troubleshooting](#troubleshooting)

---

## Overview

TransitOps helps logistics teams manage the full lifecycle of fleet operations:

| Portal | Audience | Purpose |
|--------|----------|---------|
| **Admin Console** | Admins & managers | Dashboard, trips, drivers, vehicles, invoices, lorry receipts, expenses, reports, tracking |
| **Driver Portal** | Drivers | Home, current trip, expenses, profile |
| **Public Tracking** | Clients & visitors | Shipment lookup and live tracking simulation |

The application is a **monorepo** with two independently runnable packages:

- `Frontend/` — React SPA (Vite dev server on port **5173**)
- `backend/` — Express API (port **4000**)

---

## Key features

### Admin console (`/admin`)

- **Dashboard** — KPI cards, fleet overview, revenue charts, activity feed
- **Trips** — Create and manage trips (source, destination, client, revenue, driver/vehicle assignment)
- **Drivers** — Driver roster with status, ratings, and assignment info
- **Vehicles** — Fleet inventory, insurance/service dates, driver assignment
- **Quotations** — Quote management for transport jobs
- **Lorry Receipts (LR)** — Consignor/consignee documentation with PDF export
- **Expenses** — Trip expense tracking and approval workflow
- **Invoices** — Billing and invoice management
- **Reports** — Operational reporting views
- **Tracking** — Trip tracking detail for operations team
- **Settings** — Company and application settings

### Driver portal (`/driver`)

- **Home** — Driver dashboard and quick actions
- **Current Trip** — Active trip details and status
- **Expenses** — Submit fuel, toll, food, repair, and other expenses
- **Profile** — Driver profile and account info

### Public tracking (`/track`)

- Shipment lookup by tracking ID
- Simulated live tracking with progress, logs, and map-style UI
- No login required

### Backend capabilities

- User registration and login with role-based access control
- JWT access tokens (15 min) + httpOnly refresh cookies (7 days)
- Fleet CRUD: vehicles, drivers, trip lifecycle
- Lorry receipt creation and PDF generation
- GPS telemetry buffering with Server-Sent Events (SSE) streaming
- OpenAPI / Swagger documentation
- Rate limiting, CORS, and security headers

---

## Tech stack

### Frontend (`Frontend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6.x | Type safety |
| Vite | 8 | Dev server & build tool |
| Tailwind CSS | 4 | Styling |
| React Router | 7 | Client-side routing |
| Recharts | 3 | Dashboard charts |
| Motion / Framer Motion | 12 | Animations |
| Lucide React | 1.x | Icons |
| Sonner | 2 | Toast notifications |

### Backend (`backend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js + TypeScript | — | Runtime |
| Express | 5 | HTTP server |
| Drizzle ORM | 1.0-rc | Database access & migrations |
| PostgreSQL | 17 | Primary database |
| jsonwebtoken | 9 | JWT auth |
| Zod | 4 | Environment validation |
| Swagger UI Express | 5 | API docs |

---

## Architecture

```mermaid
flowchart TB
    subgraph Client
        Browser[React SPA - Vite :5173]
    end

    subgraph Backend
        API[Express API :4000]
        Auth[JWT Auth Middleware]
        Routes[Route Handlers]
        Telemetry[Telemetry SSE + Buffer]
    end

    subgraph Data
        PG[(PostgreSQL :5432)]
    end

    Browser -->|REST /api/v1| API
    Browser -->|SSE /track| API
    API --> Auth --> Routes
    Routes --> PG
    Telemetry --> PG
```

**Request flow (authenticated API call):**

1. User logs in via `POST /api/v1/auth/login`
2. Frontend stores `accessToken` in `localStorage` (`transitops_access_token`)
3. Frontend stores user profile in `localStorage` (`transitops_user`)
4. Backend sets `refresh_token` as an httpOnly cookie
5. Subsequent API calls send `Authorization: Bearer <token>`
6. Role-gated write endpoints require `ADMIN` or `MANAGER` (or `DRIVER` for telemetry pings)

**Development proxy:** Vite proxies `/api`, `/health`, and `/api-docs` to `http://localhost:4000`.

---

## Project structure

```
odoo/
├── Frontend/                          # React single-page application
│   ├── src/
│   │   ├── App.tsx                    # Route definitions
│   │   ├── main.tsx                   # App entry point
│   │   ├── index.css                  # Global styles & Tailwind theme
│   │   ├── data.ts                    # Mock/seed data for UI & demo sessions
│   │   ├── hooks/
│   │   │   └── useLogout.ts           # Shared logout handler
│   │   ├── components/
│   │   │   ├── layout/                # AdminLayout, DriverLayout, Sidebar
│   │   │   └── ui/                    # Button, Card, Input, Tabs, etc.
│   │   ├── pages/
│   │   │   ├── auth/Login.tsx         # Login, signup, demo access
│   │   │   ├── admin/                 # Admin console pages
│   │   │   ├── driver/                # Driver portal pages
│   │   │   └── tracking/Tracking.tsx  # Public tracking portal
│   │   └── lib/
│   │       ├── api.ts                 # Backend API client & auth session helpers
│   │       ├── types.ts               # Shared TypeScript interfaces
│   │       ├── driverStore.ts         # Driver state (local + API sync)
│   │       ├── vehicleStore.ts        # Vehicle state
│   │       ├── tripStore.ts           # Trip state
│   │       ├── expenseStore.ts        # Expense state
│   │       ├── invoiceStore.ts        # Invoice state
│   │       ├── lrStore.ts             # Lorry receipt state
│   │       ├── notificationStore.ts   # In-app notifications
│   │       └── settingsStore.ts       # App settings
│   ├── vite.config.ts                 # Vite config + API proxy
│   ├── .env                           # VITE_API_URL (optional)
│   └── package.json
│
├── backend/                           # Express REST API
│   ├── src/
│   │   ├── server.ts                  # Server bootstrap
│   │   ├── app.ts                     # Express app & route mounting
│   │   ├── config/env.ts              # Zod-validated environment
│   │   ├── db/
│   │   │   ├── index.ts               # Drizzle client
│   │   │   └── schema.ts              # PostgreSQL table definitions
│   │   ├── routes/
│   │   │   ├── auth.ts                # Register, login, logout, me
│   │   │   ├── fleet.ts               # Vehicles & drivers
│   │   │   ├── trips.ts               # Trip CRUD & status updates
│   │   │   ├── receipts.ts            # Lorry receipts + PDF
│   │   │   └── telemetry.ts           # GPS pings & SSE tracking
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT & role authorization
│   │   │   └── security.ts            # CORS, headers, rate limiting
│   │   ├── lib/
│   │   │   ├── auth.ts                # Password hashing & JWT helpers
│   │   │   └── http.ts                # Error handling utilities
│   │   ├── docs/openapi.ts            # OpenAPI spec source
│   │   └── scripts/
│   │       └── seed-demo-users.ts     # Demo user seeder
│   ├── drizzle/                       # Generated SQL migrations
│   ├── docker-compose.yml             # PostgreSQL 17 container
│   ├── drizzle.config.ts              # Drizzle Kit configuration
│   ├── openapi.json                   # Exported OpenAPI document
│   └── package.json
│
└── README.md                          # This file
```

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Git**

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/DevPatel0007/ODOO-TransitOps.git
cd ODOO-TransitOps
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL 17 on port `5432` with:

- User: `postgres`
- Password: `postgres`
- Database: `postgres`

### 3. Configure the backend

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your-secure-secret-min-16-chars
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### 4. Install backend dependencies, migrate, and seed

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

### 5. Start the backend

```bash
npm run dev
```

API available at: **http://localhost:4000**

Verify health: **http://localhost:4000/health**

### 6. Configure and start the frontend

```bash
cd ../Frontend
npm install
```

Optional — create or edit `Frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

```bash
npm run dev
```

App available at: **http://localhost:5173**

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `dev-axisfleet-secret-change-me` | Secret for signing JWTs (min 16 chars) |
| `PORT` | No | `4000` | HTTP server port |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `CORS_ORIGIN` | No | — | Allowed frontend origin (e.g. `http://localhost:5173`) |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window per IP |

### Frontend (`Frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api/v1` | Backend API base URL. Use full URL for direct calls, or rely on Vite proxy |

---

## Database

### Migrations

Migrations are managed with **Drizzle Kit**:

```bash
cd backend

# Generate a new migration after schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate
```

### Drizzle Studio (database GUI)

```bash
cd backend
npm run studio
```

### Seed demo users

```bash
cd backend
npm run db:seed
```

Creates:

| Name | Email | Role | Password |
|------|-------|------|----------|
| Alok Sharma | `alok@tms.com` | ADMIN | `demo123` |
| Rajesh Kumar | `rajesh@tms.com` | DRIVER | `demo123` |

The seeder is idempotent — existing emails are skipped.

---

## Authentication & roles

### User roles

| Role | Description | Default landing route |
|------|-------------|----------------------|
| `ADMIN` | Full system access | `/admin` |
| `MANAGER` | Operations oversight (same console as admin) | `/admin` |
| `DRIVER` | Mobile dispatch portal | `/driver` |
| `CLIENT` | Public tracking access | `/track` |

### Token model

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Access token | `localStorage` (`transitops_access_token`) | 15 minutes | Sent as `Authorization: Bearer` header |
| Refresh token | httpOnly cookie (`refresh_token`) | 7 days | Session renewal (stored in `refresh_sessions` table) |
| User profile | `localStorage` (`transitops_user`) | Until logout | Cached user name, email, role |

### Password security

Passwords are hashed with **HMAC-SHA256** and a per-user random salt (`salt:hash` format). Plain passwords are never stored.

### Logout

Logout is handled by the shared `useLogout` hook (`Frontend/src/hooks/useLogout.ts`):

1. Calls `POST /api/v1/auth/logout` to revoke the refresh session
2. Clears `localStorage` auth keys
3. Redirects to `/login`

Used in the **sidebar** (admin & driver layouts) and the **tracking page** header.

### Authorization on API routes

| Access level | Endpoints |
|--------------|-----------|
| Public | `GET /health`, `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` |
| Authenticated (Bearer token) | `GET /auth/me`, most `GET` list endpoints |
| `ADMIN` or `MANAGER` | Create/update vehicles, trips, receipts; assign drivers |
| `ADMIN`, `MANAGER`, or `DRIVER` | Post telemetry pings |

---

## Demo access

The login page (`/login`) offers **one-click demo access** that works without a running backend:

| Button | Opens | Session |
|--------|-------|---------|
| **Demo Admin** | `/admin` | Client-side demo session (Alok Sharma, ADMIN) |
| **Demo Driver** | `/driver` | Client-side demo session (Rajesh Kumar, DRIVER) |

Demo sessions use mock users from `Frontend/src/data.ts` and a local `demo-access-token`. The UI loads immediately with mock/store data.

For **full API-backed authentication**, use the email/password form or seed users with `npm run db:seed` and sign in with the credentials in the [Database](#seed-demo-users) section.

---

## Frontend routes

| Path | Page | Auth |
|------|------|------|
| `/` | Redirects to `/admin` | — |
| `/login` | Login & signup | Public |
| `/signup` | Signup tab (same component as login) | Public |
| `/admin` | Admin dashboard | Demo or logged-in |
| `/admin/trips` | Trip list | Demo or logged-in |
| `/admin/drivers` | Driver list | Demo or logged-in |
| `/admin/vehicles` | Vehicle list | Demo or logged-in |
| `/admin/quotations` | Quotations | Demo or logged-in |
| `/admin/lr` | Lorry receipts | Demo or logged-in |
| `/admin/expenses` | Expenses | Demo or logged-in |
| `/admin/invoices` | Invoices | Demo or logged-in |
| `/admin/reports` | Reports | Demo or logged-in |
| `/admin/tracking` | Admin tracking detail | Demo or logged-in |
| `/admin/settings` | Settings | Demo or logged-in |
| `/driver` | Driver home | Demo or logged-in |
| `/driver/current-trip` | Current trip | Demo or logged-in |
| `/driver/expenses` | Driver expenses | Demo or logged-in |
| `/driver/profile` | Driver profile | Demo or logged-in |
| `/track` | Public tracking portal | Public |

---

## API reference

Base URL: `http://localhost:4000/api/v1`

Interactive docs: **http://localhost:4000/api-docs**

OpenAPI JSON: **http://localhost:4000/api-docs.json**

### Health & meta

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/` | Backend status message |

### Auth (`/api/v1/auth`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | `{ name, email, password, role? }` | Create account |
| `POST` | `/login` | `{ email, password }` | Sign in |
| `POST` | `/logout` | — | Revoke refresh token & clear cookie |
| `GET` | `/me` | — | Get current user (requires Bearer token) |

### Fleet (`/api/v1`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/vehicles` | Optional | List vehicles (`?status=`, `?search=`) |
| `POST` | `/vehicles` | ADMIN, MANAGER | Create vehicle |
| `PATCH` | `/vehicles/:id/assign-driver` | ADMIN, MANAGER | Assign driver to vehicle |
| `GET` | `/drivers` | Optional | List all drivers |
| `GET` | `/drivers/available` | Optional | List available drivers only |

### Trips (`/api/v1/trips`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Optional | List all trips |
| `POST` | `/` | ADMIN, MANAGER | Create trip |
| `PATCH` | `/:id/status` | ADMIN, MANAGER | Update trip status |

**Trip statuses:** `PLANNING` → `ASSIGNED` → `STARTED` → `IN_TRANSIT` → `DELIVERED` | `CANCELLED`

### Receipts (`/api/v1/receipts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Optional | List lorry receipts |
| `POST` | `/` | ADMIN, MANAGER | Create lorry receipt |
| `GET` | `/:id/pdf` | Optional | Download receipt as PDF |

### Telemetry (`/api/v1`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/trips/:tripId/ping` | ADMIN, MANAGER, DRIVER | Buffer GPS point |
| `GET` | `/trips/:tripId/track` | Optional | SSE stream of live telemetry |

Telemetry points are buffered in memory and flushed to PostgreSQL every **5 minutes**.

---

## Database schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | Application accounts (email, password hash, role) |
| `refresh_sessions` | Active refresh token sessions (jti, expiry, revocation) |
| `drivers` | Driver profiles (license, phone, rating, vehicle assignment) |
| `vehicles` | Fleet vehicles (plate, type, capacity, insurance, status) |
| `trips` | Transport jobs (source, destination, client, revenue, status) |
| `expenses` | Trip expenses (fuel, toll, food, repair, approval status) |
| `lorry_receipts` | LR documents (consignor, consignee, freight, payment type) |
| `telemetry_points` | GPS coordinates captured during trips |

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `ADMIN`, `MANAGER`, `DRIVER`, `CLIENT` |
| `vehicle_status` | `AVAILABLE`, `ON_TRIP`, `MAINTENANCE` |
| `driver_status` | `AVAILABLE`, `ON_TRIP`, `OFFLINE` |
| `trip_status` | `PLANNING`, `ASSIGNED`, `STARTED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED` |
| `payment_type` | `To Pay`, `Paid`, `TBB (To Be Billed)` |
| `expense_type` | `FUEL`, `TOLL`, `FOOD`, `REPAIR`, `OTHER` |
| `approval_status` | `PENDING`, `APPROVED`, `REJECTED` |

### Entity relationships

- `drivers.user_id` → `users.id` (optional link between driver profile and login account)
- `drivers.assigned_vehicle_id` → `vehicles.id`
- `vehicles.assigned_driver_id` → `drivers.id`
- `trips.driver_id` → `drivers.id`
- `trips.vehicle_id` → `vehicles.id`
- `expenses.trip_id` → `trips.id`
- `telemetry_points.trip_id` → `trips.id`

---

## Frontend state & data layer

The frontend uses a hybrid approach:

1. **API client** (`src/lib/api.ts`) — HTTP calls to the backend with automatic Bearer token injection
2. **Local stores** (`src/lib/*Store.ts`) — In-memory state with mock data fallbacks for UI-rich demos
3. **Mock data** (`src/data.ts`) — Seed data for drivers, vehicles, trips, and demo users

| Store | File | Responsibility |
|-------|------|----------------|
| Driver store | `driverStore.ts` | Driver list, snapshots, API sync |
| Vehicle store | `vehicleStore.ts` | Fleet data management |
| Trip store | `tripStore.ts` | Trip list and status |
| Expense store | `expenseStore.ts` | Expense entries |
| Invoice store | `invoiceStore.ts` | Invoice records |
| LR store | `lrStore.ts` | Lorry receipt data |
| Notification store | `notificationStore.ts` | Toast-style in-app alerts |
| Settings store | `settingsStore.ts` | Company name and app preferences |

---

## Security

| Feature | Implementation |
|---------|----------------|
| JWT authentication | HS256 signed access & refresh tokens |
| Password hashing | HMAC-SHA256 with per-user salt |
| httpOnly cookies | Refresh tokens not accessible to JavaScript |
| CORS | Configurable origin with localhost auto-allow |
| Rate limiting | 100 requests / 60s per IP (configurable) |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `COOP` |
| Role-based access | `authorizeRoles()` middleware on write endpoints |

> **Production note:** Change `JWT_SECRET`, enable `secure: true` on cookies behind HTTPS, and set `CORS_ORIGIN` to your deployed frontend URL.

---

## Scripts reference

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production server |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:generate` | Generate Drizzle migration from schema changes |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed demo admin and driver users |
| `npm run studio` | Open Drizzle Studio |

### Frontend (`Frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Production build

### Backend

```bash
cd backend
npm install
npm run build
NODE_ENV=production npm run start
```

Ensure `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` are set for your production environment.

### Frontend

```bash
cd Frontend
npm install
npm run build
```

Serve the `Frontend/dist/` folder with any static file server (Nginx, Vercel, Netlify, etc.). Set `VITE_API_URL` at build time to point to your production API.

---

## Troubleshooting

### Backend won't start — `DATABASE_URL` error

Create `backend/.env` with a valid PostgreSQL connection string and ensure Docker Postgres is running:

```bash
cd backend && docker compose up -d
```

### Login fails with "Invalid email or password"

Run the seeder or sign up a new account:

```bash
cd backend && npm run db:seed
```

### Demo buttons work but API calls fail

Demo mode uses client-side sessions only. Start the backend for live API integration, or sign in with real credentials after seeding.

### CORS errors in the browser

Set `CORS_ORIGIN=http://localhost:5173` in `backend/.env`, or use the Vite proxy (leave `VITE_API_URL` as `/api/v1`).

### Port already in use

- Frontend default: `5173` — change in `vite.config.ts`
- Backend default: `4000` — set `PORT` in `backend/.env`
- PostgreSQL default: `5432` — change in `docker-compose.yml`

### Migrations fail

Confirm PostgreSQL is reachable at the host/port in `DATABASE_URL`. The Drizzle config uses `postgresql://postgres:postgres@localhost:5432/postgres` by default.

---

## License

Frontend source files include SPDX-License-Identifier: Apache-2.0 headers where applicable.

---

## Related documentation

- [Frontend/README.md](Frontend/README.md) — Frontend-specific development notes
