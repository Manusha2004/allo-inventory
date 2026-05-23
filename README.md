# Allo Inventory Reservation System

Live Demo:
https://allo-inventory-3ila.vercel.app/products

GitHub Repository:
https://github.com/Manusha2004/allo-inventory

---

# Overview

This project is a reservation-based inventory management system built for the Allo Engineering take-home assignment.

The system prevents overselling during checkout by introducing temporary inventory reservations.

When a user reserves inventory:
- stock is temporarily held
- reservation expires after a fixed duration
- payment confirmation permanently decrements stock
- cancellation or expiry releases stock back into inventory

The application is built using:
- Next.js App Router
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- Tailwind CSS

---

# Features

## Inventory Management

- Products and warehouses
- Inventory tracking per warehouse
- Available stock calculation
- Reserved stock tracking

## Reservation System

- Create reservations
- Confirm reservations
- Release reservations
- Reservation expiry handling
- Countdown timer UI

## Concurrency Safety

Reservation creation is implemented using Prisma transactions to prevent race conditions.

If two users attempt to reserve the last available unit simultaneously:
- exactly one reservation succeeds
- the other receives HTTP 409

This guarantees inventory correctness under concurrent access.

## Expiry Handling

Reservations automatically expire after a fixed duration.

This project uses a lazy cleanup approach:
- expired reservations are cleaned up during product fetches and reservation operations
- inventory is automatically released back into stock

This avoids requiring a dedicated background worker while still maintaining correctness.

---

# API Endpoints

## GET /api/products

Returns products with warehouse inventory and available stock.

## GET /api/warehouses

Returns warehouses.

## POST /api/reservations

Creates a reservation.

Returns:
- 409 if insufficient stock

## POST /api/reservations/:id/confirm

Confirms reservation and permanently decrements stock.

Returns:
- 410 if reservation expired

## POST /api/reservations/:id/release

Releases reservation inventory.

---

# Tech Stack

- Next.js 16
- TypeScript
- Prisma
- PostgreSQL
- Supabase
- Tailwind CSS
- Vercel

---

# Local Setup

# Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/Manusha2004/allo-inventory
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_supabase_connection_string
```

## 4. Run Prisma Migration

```bash
npx prisma migrate dev
```

## 5. Generate Prisma Client

```bash
npx prisma generate
```

## 6. Seed Database

```bash
npx prisma db seed
```

## 7. Run Development Server

```bash
npm run dev
```

Application runs at:

```txt
http://localhost:3000
```

---

# Deployment

Frontend deployed on Vercel.

Database hosted on Supabase PostgreSQL.

---

# Author

Manusha N