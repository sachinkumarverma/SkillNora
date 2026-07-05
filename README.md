# Skillnora — AI-powered eLearning Platform

A full-stack eLearning platform built with Next.js 15, Express.js, Supabase, and Razorpay.

---

## Tech Stack

| Layer     | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS  |
| Backend   | Express.js (Node), ES Modules                      |
| Database  | Supabase (PostgreSQL) + Supabase Auth              |
| Payments  | Razorpay                                           |
| Storage   | Supabase Storage (videos, thumbnails, avatars)     |
| AI        | Groq API (LLaMA models) — summaries, AI chat       |
| Auth      | Supabase Auth (email magic link, Google, GitHub OAuth) + optional TOTP 2FA |

---

## Project Structure

```
Skillnora/
├── frontend/         # Next.js 15 app
│   └── src/app/
│       ├── (dashboard)/  # Protected routes (student, instructor, admin)
│       │   ├── admin/        # Admin overview, courses, payments, students…
│       │   ├── instructor/   # Instructor studio dashboard
│       │   ├── courses/      # Course detail & lecture player
│       │   ├── notes/        # Student notes
│       │   └── settings/     # User settings & 2FA enrollment
│       └── auth/         # Login / signup page
├── backend/          # Express API server
│   ├── src/features/ # Feature-based modules (courses, enrollments, admin…)
│   ├── migrations/   # SQL schema (001_initial_schema.sql)
│   └── server.js
└── package.json      # Root: runs both frontend + backend concurrently
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install          # root (installs concurrently)
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the following in `backend/.env`:

| Variable                        | Description                                  |
|---------------------------------|----------------------------------------------|
| `DATABASE_URL`                  | Supabase Postgres connection string (pooler) |
| `SUPABASE_URL`                  | Your Supabase project URL                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-only)      |
| `SUPABASE_ANON_KEY`             | Supabase anon/public key                     |
| `RAZORPAY_KEY_ID`               | Razorpay Key ID                              |
| `RAZORPAY_KEY_SECRET`           | Razorpay Key Secret                          |
| `GROQ_API_KEY`                  | Groq API key for AI features                 |
| `PORT`                          | Backend port (default: 5000)                 |

And in `frontend/.env.local`:

| Variable                         | Description                         |
|----------------------------------|-------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anon key                   |
| `NEXT_PUBLIC_API_URL`            | Backend URL (e.g. http://localhost:5000) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`    | Razorpay publishable key            |

### 3. Set up the Database

Open the Supabase SQL editor and run:

```
backend/migrations/001_initial_schema.sql
```

This creates all tables, triggers, and RLS policies in one shot.

### 4. Run development servers

```bash
# From project root — runs both frontend and backend:
npm run dev:all

# Or separately:
npm run dev:api    # Express backend on :5000
npm run dev        # Next.js frontend on :3000
```

---

## Database Schema Overview

See [`backend/migrations/001_initial_schema.sql`](./backend/migrations/001_initial_schema.sql) for the full schema.

### Core Tables

| Table              | Purpose                                              |
|--------------------|------------------------------------------------------|
| `users`            | User profiles (student / instructor / admin roles)   |
| `courses`          | Course catalog with pricing, metadata, and ratings   |
| `lectures`         | Individual video lectures within a course            |
| `enrollments`      | Tracks which user enrolled in which course           |
| `orders`           | Razorpay payment records                             |
| `refunds`          | Refund ledger (issued when courses are deleted)      |
| `reviews`          | Star ratings and review text per course              |
| `certificates`     | Issued completion certificates with a unique code    |
| `notes`            | Student notes linked to a specific lecture           |
| `lecture_comments` | Q&A discussion threads on lectures                   |
| `wishlist_items`   | Courses saved to a user's wishlist                   |
| `cart_items`       | Courses in a user's cart                             |
| `notifications`    | In-app notification feed                             |
| `support_tickets`  | User-submitted support requests                      |

### `orders.status` values

| Status      | Meaning                                     |
|-------------|---------------------------------------------|
| `created`   | Order initiated via Razorpay                |
| `paid`      | Payment confirmed (Razorpay webhook)        |
| `success`   | Alias used in some Razorpay flows           |
| `captured`  | Payment captured by Razorpay               |
| `failed`    | Payment failed                              |
| `refunded`  | Payment reversed / refunded                 |

> **Revenue Calculation:** `SUM(amount WHERE status IN ('paid','success','captured')) - SUM(amount WHERE status = 'refunded')` — both admin and instructor dashboards use this identical formula from the `orders` table for consistency.

---

## Key Features

- 🎓 **Multi-role platform** — Student, Instructor, and Admin dashboards
- 📹 **Video lectures** — Supabase Storage with signed URL generation (6-hour expiry)
- 💳 **Razorpay payments** — Order creation, webhook verification, refund on course deletion
- 🔐 **Two-Factor Authentication (2FA)** — TOTP via Google Authenticator (opt-in per user)
- 📊 **Analytics dashboards** — Revenue charts, student enrollment trends, course health
- 💬 **Q&A discussions** — Threaded comments with emoji reactions and image uploads on lectures
- 📝 **Notes** — Per-lecture notes with direct "Go to Video" deep-link navigation
- 📝 **Test Series Engine** — Full-featured exam simulator with live timers, anti-cheat mechanisms (tab focus tracking, disable copy/paste), section switching, and a dynamic question palette.
  - *Mobile-First Design*: Test taking experience is highly optimized for mobile devices with swipeable/hideable palettes, proper `100dvh` viewport constraints, auto-stacking layouts for options and controls, and zero horizontal clipping.
  - *Auto-Submit*: Smart timers that lock the test and seamlessly auto-save/submit answers the exact second the clock expires, redirecting users directly to their analysis.
- 🏆 **Certificates** — Auto-issued on course completion with a unique verification code
- 🔔 **Notifications** — Real-time in-app feed for replies, new comments, and support tickets
- 🤖 **AI features** — Groq-powered lecture summaries and an AI chat assistant
- 🎫 **Support tickets** — Users can submit tickets; admin is notified via the notification feed

---

## Supabase Setup Notes

1. Create a Supabase project and copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to your backend env (never expose client-side).
3. In **Authentication → URL Configuration**, add your app URL to allowed redirect URLs.
4. Enable **Google** and/or **GitHub** OAuth providers if needed.
5. Run `001_initial_schema.sql` in the SQL editor to create all tables and RLS policies.
6. Create a **Storage bucket** named `course-thumbnails` (for videos and images).

---

## Revenue & Statistics Consistency

Both the **Admin Dashboard** (`/admin`) and **Instructor Dashboard** (`/instructor`) calculate revenue identically:

```sql
SUM(amount) FILTER (WHERE status IN ('paid', 'success', 'captured'))
- SUM(amount) FILTER (WHERE status = 'refunded')
```

**Student counts** only count users with `role = 'student'` — instructors enrolling in their own free courses for testing are excluded.
