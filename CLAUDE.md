# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hotel availability checker and admin booking system ("Mayapur Inspection House") for the UP Irrigation & Water Resources Department. Monorepo with separate `frontend/` and `backend/` directories, each with their own `package.json` and `node_modules`.

The public-facing site lets users **check room availability** via a color-coded calendar. All booking operations happen through a **protected admin panel** (`/admin/*`).

## Commands

### Backend (`cd backend`)
- `npm run dev` — start with nodemon (hot reload)
- `npm start` — production start
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate deploy` — apply migrations in production (never use `migrate dev` against prod)
- `node seed-admin.js <username> <password> <name>` — create an admin account
- No test suite configured

### Frontend (`cd frontend`)
- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

**Backend**: Express 5 server (`index.js`) with Prisma ORM connected to PostgreSQL (Supabase). Uses the `@prisma/adapter-pg` driver adapter with a `pg` connection pool, configured via `prisma.config.ts` and `db.js`. Database URL comes from `backend/prisma/.env`. All routes are defined inline in `index.js` (no router separation). Auth uses JWT (`jsonwebtoken`) with bcrypt-hashed passwords. JWT secret comes from `JWT_SECRET` env var. Auth middleware is in `middleware/auth.js`.

**Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS 4. All pages are client components using `"use client"`. The API service layer (`src/services/api.ts`) uses `NEXT_PUBLIC_API_URL` env var to reach the backend.

**Database models** (defined in `backend/prisma/schema.prisma`):
- `Room` — id (uuid), name, description, pricePerNight, maxGuests, images (single URL string), timestamps. Maps to `rooms` table.
- `Booking` — id (uuid), roomId (FK to Room), guestName, guestPhone, guestEmail (optional), checkIn/checkOut (DateTime), amountPaid, status (string, e.g. "confirmed"), timestamps. Maps to `bookings` table. Column names use snake_case in DB via `@map`.
- `Admin` — id (uuid), username (unique), passwordHash, name, timestamps. Maps to `admins` table.

**API endpoints** (all in `backend/index.js`):

Public:
- `GET /rooms` — list all rooms
- `GET /rooms/:id` — single room
- `POST /rooms` — create room
- `GET /rooms/:id/availability?month=YYYY-MM` — returns booked date ranges for a month (no guest info exposed). Uses DB-level date filtering with composite index on (checkIn, checkOut) for efficiency.

Admin (JWT auth required via `Authorization: Bearer <token>`):
- `POST /admin/login` — authenticate, returns JWT token
- `GET /admin/me` — verify token, return admin info
- `POST /admin/bookings` — create booking (guestName, guestPhone, guestEmail?, checkIn, checkOut, amountPaid). Validates overlap.
- `GET /admin/bookings?month=YYYY-MM&roomId=X&status=X` — list bookings with filters
- `GET /admin/bookings/:id` — single booking
- `PUT /admin/bookings/:id` — update booking (partial updates supported, re-validates date conflicts)
- `DELETE /admin/bookings/:id` — delete booking

**Public flow**: Home → Room listing → Room detail (`/rooms/[id]`) → AvailabilityCalendar component shows color-coded monthly view (green=available, red=booked). Users can click two dates to check a specific range.

**Admin flow**: `/admin/login` → `/admin/dashboard` (stats, today's occupancy, upcoming check-ins) → `/admin/bookings` (filterable table with edit/delete) → `/admin/bookings/new` (create form) → `/admin/bookings/[id]/edit` (edit form).

## Frontend Structure

- `src/services/api.ts` — all API functions (public + admin), types, auth header helper
- `src/context/AdminAuth.tsx` — React context for admin JWT session (stored in sessionStorage)
- `src/components/AvailabilityCalendar.tsx` — shared calendar component used on public room page
- `src/components/Navbar.tsx` — public site navigation
- `src/components/Footer.tsx` — public site footer
- `src/app/admin/layout.tsx` — admin layout with auth guard, header nav, logout
- `src/app/admin/login/page.tsx` — admin login form
- `src/app/admin/dashboard/page.tsx` — admin dashboard
- `src/app/admin/bookings/page.tsx` — bookings list with filters
- `src/app/admin/bookings/new/page.tsx` — new booking form
- `src/app/admin/bookings/[id]/edit/page.tsx` — edit booking form

## Deployment

- Frontend: Vercel (Singapore region `sin1`)
- Backend: Railway (Dockerized, Node 20)
- Database: PostgreSQL on Supabase (connection goes through PgBouncer)
- Environment variables needed on Railway: `DATABASE_URL`, `JWT_SECRET`

## Key Details

- Currency is INR (₹), locale is `en-IN`
- Room images are stored as a single URL string, not an array
- The backend uses CommonJS (`require`/`module.exports`), not ES modules
- Prisma config uses a driver adapter (`PrismaPg`) rather than Prisma's built-in connection handling
- The `db.js` module caches the Prisma client on `globalThis` in non-production to avoid connection exhaustion during dev
- Admin auth tokens expire after 24 hours
- The availability endpoint returns only date ranges — no guest details are exposed to the public
- Booking fields: Guest Name (required), Phone Number (required), Email (optional), Amount Paid (required), From/To dates (required)
