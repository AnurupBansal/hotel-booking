# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hotel booking application ("Mayapur Inspection House") for the UP Irrigation & Water Resources Department. Monorepo with separate `frontend/` and `backend/` directories, each with their own `package.json` and `node_modules`.

## Commands

### Backend (`cd backend`)
- `npm run dev` — start with nodemon (hot reload)
- `npm start` — production start
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate dev` — create/apply migrations during development
- `npx prisma migrate deploy` — apply migrations in production
- No test suite configured

### Frontend (`cd frontend`)
- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

**Backend**: Express 5 server (`index.js`) with Prisma ORM connected to PostgreSQL (Supabase). Uses the `@prisma/adapter-pg` driver adapter with a `pg` connection pool, configured via `prisma.config.ts` and `db.js`. Database URL comes from `backend/prisma/.env`. All routes are defined inline in `index.js` (no router separation).

**Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS 4. All pages are client components using `"use client"`. The API service layer (`src/services/api.ts`) uses `NEXT_PUBLIC_API_URL` env var to reach the backend.

**Database models** (defined in `backend/prisma/schema.prisma`):
- `Room` — id (uuid), name, description, pricePerNight, maxGuests, images (single URL string), timestamps. Maps to `rooms` table.
- `Booking` — id (uuid), roomId (FK to Room), userName, userEmail, checkIn/checkOut (DateTime), totalPrice, status (string, e.g. "confirmed"), timestamps. Maps to `bookings` table.

**API endpoints** (all in `backend/index.js`):
- `GET /rooms` — list all rooms
- `GET /rooms/:id` — single room
- `POST /rooms` — create room
- `POST /book` — create booking (validates dates, checks availability via overlap query)

**Booking flow**: Room detail page (`/rooms/[id]`) → date selection → BookingModal (guest name/email) → POST /book → redirect to `/booking-confirmation` with query params.

## Deployment

- Frontend: Vercel (Singapore region `sin1`)
- Backend: Railway (Dockerized, Node 20)
- Database: PostgreSQL on Supabase (connection goes through PgBouncer)

## Key Details

- Currency is INR (₹), locale is `en-IN`
- Room images are stored as a single URL string, not an array
- The backend uses CommonJS (`require`/`module.exports`), not ES modules
- Prisma config uses a driver adapter (`PrismaPg`) rather than Prisma's built-in connection handling
- The `db.js` module caches the Prisma client on `globalThis` in non-production to avoid connection exhaustion during dev
