# Lead Intake Portal

A smart lead intake system that uses AI to automatically categorize and summarize client submissions, stores them in a database, and displays them on a filterable dashboard.

**Live Demo:** [https://smart-lead-app.vercel.app/]  
**Repo:** [https://github.com/Arion2/Smart-Lead-Intake-Portal](https://github.com/Arion2/Smart-Lead-Intake-Portal)

---

## Features

- **Intake Form** — Clean, validated form collecting name, email, business name, industry, and a free-text project description
- **AI Categorization** — Each submission is instantly analyzed by Groq (Llama 3.1), which generates a one-sentence summary and assigns a category (Automation, Website, AI Integration, SEO, Custom Software, Other)
- **Supabase Storage** — All data is persisted in a Postgres database via Supabase
- **Dashboard** — Real-time view of all submissions, filterable by AI category, with expandable full request text
- **Error handling** — Client-side validation, server-side validation, graceful AI/DB failure messages
- **Responsive design** — Works on mobile and desktop

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| AI | Groq — Llama 3.1 8B Instant (free tier) |
| Hosting | Vercel |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Groq](https://console.groq.com) account (free API key)

### 1. Clone the repo

```bash
git clone https://github.com/Arion2/Smart-Lead-Intake-Portal.git
cd Smart-Lead-Intake-Portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 4. Get your Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Click **API Keys** → **Create API key**
3. Copy the key

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
GROQ_API_KEY=groq-api-key
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the intake form is the home page, and the dashboard is at `/dashboard`.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
4. Deploy — Vercel auto-detects Next.js, no build config needed

---

## Environment Variables Reference

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | 
| `GROQ_API_KEY` | Groq API key | [console.groq.com](https://console.groq.com) → API Keys |

> **Note:** Never commit `.env.local` to version control. It is listed in `.gitignore`.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── submit/route.ts    # POST: validate, AI-categorize, insert to DB
│   │   └── leads/route.ts     # GET: fetch leads with optional category filter
│   ├── dashboard/page.tsx     # Dashboard with filtering
│   ├── globals.css            # Design system, animations
│   ├── layout.tsx             # Root layout with fonts
│   └── page.tsx               # Intake form (home page)
├── lib/
│   ├── ai.ts                    # Groq API helper (Llama 3.1)
│   └── supabase.ts            # Supabase client + types
supabase-schema.sql            # DB schema to run once in Supabase
```
