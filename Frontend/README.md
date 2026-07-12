# TransitOps Frontend

React + TypeScript + Vite SPA for the TransitOps fleet logistics platform.

## Development

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173` with API requests proxied to the backend.

Optional `.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Auth flow

1. Login or signup via `/login` calls the backend auth API.
2. The access token and user profile are saved to `localStorage`.
3. Users are routed by role: admin/manager → `/admin`, driver → `/driver`, client → `/track`.
4. Logout (sidebar or tracking header) calls `/api/v1/auth/logout`, clears `localStorage`, and redirects to `/login`.

### Demo login

The login page includes **Demo Admin** and **Demo Driver** buttons for instant one-click access:

- **Demo Admin** → `/admin`
- **Demo Driver** → `/driver`

No backend or seed step is required for demo buttons. For API-backed login, run `npm run db:seed` in `backend/` and use:

- Admin: `alok@tms.com` / `demo123`
- Driver: `rajesh@tms.com` / `demo123`

Run `npm run db:seed` in the `backend/` folder first to create these users.

## Layout

- `src/pages/admin/` — Admin console pages
- `src/pages/driver/` — Driver portal pages
- `src/pages/auth/Login.tsx` — Login and signup
- `src/components/layout/` — Admin and driver layouts with sidebar
- `src/hooks/useLogout.ts` — Shared logout handler
- `src/lib/api.ts` — Backend API client

For full setup including the database and backend, see the root [README](../README.md).
