# AI News Blog System — Supabase Edition

Full-stack web application with Supabase (PostgreSQL + Auth) + Node.js backend + React frontend.

## Quick Start

### 1. Create Supabase project
- Go to https://supabase.com → New Project
- Copy your **Project URL** and **anon key** from Settings → API

### 2. Run database schema
- Go to Supabase dashboard → SQL Editor
- Paste and run `database/schema.sql`

### 3. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, keys, and Gemini API key
```

### 4. Run backend
```bash
cd backend && npm install && npm run dev
```

### 5. Run frontend
```bash
cd frontend && npm install && npm run dev
```

## Default Admin
After running schema.sql, register normally then go to Supabase dashboard →
Table Editor → profiles → set your user's role to 'admin'.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express 5 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (built-in) |
| AI | Google Gemini 1.5 Flash |
