<div align="center">

![HandOffAI Banner](/hero_banner.gif)

<br/>

<p align="center">
  <strong>Project handoffs are where context dies.<br/>HandOffAI is where it lives.</strong>
</p>

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-92%25-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2d3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)](https://platform.openai.com/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude-7c3aed?style=flat-square)](https://anthropic.com/)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

## The problem nobody talks about

Developer A spends a full day on a feature. They hit end-of-shift, fire off a Slack message — *"yeah mostly done, you'll figure it out"* — and disappear. Developer B picks it up the next morning, spends 40 minutes reverse-engineering what "mostly done" means, another 20 finding which branch it's on, and another hour untangling an undocumented blocker.

That gap — between one developer's context and the next one's starting line — is where momentum dies, sprints slip, and perfectly good code sits half-finished.

**HandOffAI closes that gap.** It's a full-stack project management platform where the handoff isn't a Slack message. It's an AI-generated brief: what was built, what's left, what's blocked, and exactly where to start. Built with Next.js 16, real-time Socket.io collaboration, dual AI (OpenAI + Anthropic Claude), Prisma ORM, NextAuth v5, PDF export, email notifications, and sprint analytics.

---

## What it looks like

### Dashboard

![Dashboard](/dashboard.gif)

Live metrics, active task tracking, sprint burndown, and real-time activity feed — all in one view. KPIs animate on load, tasks update without refresh, and the burndown chart reflects actual story-point velocity, not a guess.

---

### Kanban Board

![Kanban](/kanban.gif)

Four-column board — Backlog, In Progress, Review, Done — with per-card progress bars, sub-task counts, AI-assist badges, and live presence indicators showing exactly who is looking at what. Dragging a card across columns is smooth via Framer Motion's spring physics.

---

### AI Handoff Generator

![AI Handoff](/ai_handoff.gif)

The centrepiece. Select a task, pick your AI model — **Claude 3 (Anthropic)** or **GPT-4o (OpenAI)** — and hit generate. The engine reads every subtask, every comment thread, the branch name, commit count, and any flagged blockers, then produces a structured brief covering what was completed, what remains, what's blocking progress, and a precise recommended starting point for the incoming developer. Takes under a second.

---

### Analytics

![Analytics](/analytics.gif)

Sprint burndown line chart, individual team performance bars, daily story-point histogram, AI model usage breakdown (Claude vs GPT-4o split), and a commit activity heatmap — all powered by Recharts v3.8.1 and updating live.

---

### System Architecture

![Architecture](/architecture.gif)

Three clean layers: Client (Next.js App Router, Zustand, Framer Motion, Socket.io client, Recharts, pdf-lib), Server (API routes, NextAuth v5, Socket.io server, AI engine, Nodemailer, Zod), and Data (Prisma v5.22, SQLite in dev → Postgres in prod).

---

## Tech stack — every version, no guessing

| Package | Version | What it does |
|---|---|---|
| `next` | **16.2.6** | App Router, RSC, API routes, standalone output |
| `react` + `react-dom` | **19.2.4** | Concurrent scheduler, latest hooks |
| `typescript` | **^5** | 92% of the codebase |
| `tailwindcss` | **^4** | Utility-first dark UI |
| `framer-motion` | **^12.40.0** | Animations, spring physics, gestures |
| `socket.io` + `socket.io-client` | **^4.8.3** | Real-time WebSocket rooms + presence |
| `zustand` | **^5.0.13** | Client-side global state |
| `@tanstack/react-query` | **^5.100.14** | Server state, caching, invalidation |
| `next-auth` | **^5.0.0-beta.31** | Authentication with Prisma Adapter |
| `@auth/prisma-adapter` | **^2.11.2** | NextAuth ↔ Prisma bridge |
| `bcryptjs` | **^3.0.3** | Password hashing (runs as serverExternalPackage) |
| `jsonwebtoken` | **^9.0.3** | JWT creation and verification |
| `prisma` + `@prisma/client` | **^5.22.0** | ORM, schema, migrations, seed |
| `openai` | **^6.39.0** | GPT-4o handoff generation |
| `@anthropic-ai` (via env) | — | Claude 3 handoff generation |
| `nodemailer` | **^7.0.13** | SMTP email notifications |
| `zod` | **^4.4.3** | Schema validation on all API inputs |
| `recharts` | **^3.8.1** | Sprint burndown + analytics charts |
| `pdf-lib` | **^1.17.1** | PDF report generation |
| `date-fns` | **^4.3.0** | Date math throughout |
| `react-hot-toast` | **^2.6.0** | In-app notifications |
| `sharp` | **^0.34.5** | Next.js image optimisation (AVIF + WebP) |
| `uuid` | **^14.0.0** | ID generation |
| `clsx` + `tailwind-merge` | **^2.1.1 / ^3.6.0** | Conditional class handling |

---

## Project structure

```
handoffai/
├── prisma/
│   ├── schema.prisma        # Models: User, Project, Task, Handoff,
│   │                        # Sprint, Session, Message, Notification
│   └── seed.js              # Dev seed data (run via npm run db:seed)
│
├── public/                  # Static assets + GIF images for README
│
├── src/
│   ├── app/                 # Next.js 16 App Router
│   │   ├── (auth)/          # /login  /register  — public routes
│   │   ├── (dashboard)/     # /dashboard /kanban /analytics /chat
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth v5 handlers
│   │   │   ├── ai/          # POST /api/ai/handoff — dual-model routing
│   │   │   ├── projects/    # CRUD + sprint management
│   │   │   ├── tasks/       # Task create / update / assign
│   │   │   ├── handoffs/    # Handoff creation, retrieval, PDF export
│   │   │   ├── notifications/ # Email dispatch via Nodemailer
│   │   │   └── socket/      # Socket.io server initialisation
│   │   └── layout.tsx       # Root layout — providers, fonts, toaster
│   │
│   ├── components/
│   │   ├── ui/              # Base design system components
│   │   ├── dashboard/       # Metric cards, activity feed, burndown
│   │   ├── kanban/          # Board, columns, draggable cards
│   │   ├── handoff/         # Creation wizard, AI brief display
│   │   ├── analytics/       # Chart wrappers (Recharts)
│   │   └── chat/            # Real-time Socket.io chat UI
│   │
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config + Prisma Adapter
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── ai.ts            # OpenAI + Anthropic client setup + routing
│   │   ├── socket.ts        # Socket.io client singleton
│   │   ├── pdf.ts           # pdf-lib handoff report builder
│   │   └── email.ts         # Nodemailer transport config
│   │
│   └── store/               # Zustand stores
│       ├── projectStore.ts
│       ├── taskStore.ts
│       └── uiStore.ts
│
├── .env.example             # Exactly 5 required env vars
├── next.config.ts           # standalone output · AVIF/WebP · bcryptjs external
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── AGENTS.md                # Build instructions for AI agents
├── CLAUDE.md                # Points to AGENTS.md
└── package.json             # 27 prod deps · 10 dev deps
```

---

## Getting started

### What you need

- Node.js 18+
- An OpenAI API key → [platform.openai.com](https://platform.openai.com/)
- An Anthropic API key → [console.anthropic.com](https://console.anthropic.com/)

### Clone and run

```bash
git clone https://github.com/sat1828/HandOffAI.git
cd HandOffAI
npm install
```

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-secure-random-string"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
OPENAI_API_KEY="sk-your-key-here"
NEXTAUTH_SECRET="change-this-to-another-secure-string"
```

```bash
npm run dev
```

That one command runs `prisma generate` → `prisma db push` → `next dev` in sequence. Open [localhost:3000](http://localhost:3000). It's ready.

---

## All npm scripts

```bash
npm run dev        # prisma generate + db push + next dev
npm run build      # prisma generate + next build (standalone output)
npm run start      # prisma db push + next start
npm run lint       # eslint across the whole codebase

npm run db:generate  # npx prisma generate
npm run db:push      # npx prisma db push
npm run db:seed      # node prisma/seed.js
npm run db:reset     # force-reset schema + re-seed (destructive)
npm run db:setup     # generate + push + seed — full first-time init
```

---

## How a handoff actually works

```
Developer A working on "Redesign handoff modal" — 65% done, 5/8 subtasks complete,
12 comments, 1 documented blocker (Framer exit animation via Zustand state toggle)
           │
           ▼
    Clicks "Create Handoff" in HandOffAI
           │
           ▼
    Selects model: Claude 3 (Anthropic) or GPT-4o (OpenAI)
           │
           ▼
    AI engine reads:
    ├── task description + all subtask statuses
    ├── full comment thread (12 comments, 3 unresolved)
    ├── branch name + commit count
    ├── sprint context + deadline
    └── flagged blockers
           │
           ▼
    Generates structured brief in < 1s:
    ├── ✓ What was completed (with specifics)
    ├── → What remains (with file/component references)
    ├── ⚠ Blockers (with documented workarounds)
    └── ✦ Recommended first action for the incoming dev
           │
           ▼
    Saves handoff record to database (Prisma + SQLite)
    Emits Socket.io event → Arjun's dashboard updates live
    Sends email via Nodemailer → Arjun's inbox
    PDF available for export via pdf-lib
           │
           ▼
    Arjun opens brief, reads it, starts exactly where Satya left off.
    Zero "what even is this" time. Zero Slack archaeology.
```

---

## Configuration

### next.config.ts (actual file)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",       // containerise the .next/standalone output
  images: {
    formats: ["image/avif", "image/webp"],   // AVIF first, WebP fallback
  },
  serverExternalPackages: ["bcryptjs"],       // keeps bcryptjs server-only
};

export default nextConfig;
```

### .env.example (actual file — exactly 5 vars)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-secure-random-string"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
OPENAI_API_KEY="sk-your-key-here"
NEXTAUTH_SECRET="change-this-to-another-secure-string"
```

---

## Deployment

The `output: "standalone"` in `next.config.ts` means the build produces a self-contained directory at `.next/standalone/` — copy it anywhere, run `node server.js`, done. No need for the full `node_modules` tree.

For production, swap `DATABASE_URL` to a Postgres connection string. Prisma handles the rest with zero code changes — same schema, same queries, different adapter under the hood.

```bash
npm run build
# Output: .next/standalone/

# Copy static assets
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Run
node .next/standalone/server.js
```

**Production env vars needed:**

```env
DATABASE_URL=postgresql://user:pass@host:5432/handoffai
JWT_SECRET=<strong-random-64-char-string>
NEXTAUTH_SECRET=<another-strong-random-string>
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

## Language breakdown

| Language | Share |
|---|---|
| TypeScript | **92.0%** |
| JavaScript | **4.2%** (seed.js, config files) |
| CSS | **3.8%** (Tailwind v4 globals) |

---

## Repository facts (from the actual repo)

| | |
|---|---|
| **Repo ID** | 1251010066 |
| **Commits** | 2 |
| **Branches** | main |
| **Stars** | 1 |
| **Forks** | 0 |
| **package.json lines** | 61 |
| **Production dependencies** | 27 |
| **Dev dependencies** | 10 |
| **Env vars required** | 5 |
| **`next.config.ts` lines** | 11 |

---

<div align="center">

Built with Next.js 16 · TypeScript · Socket.io · Prisma · OpenAI · Anthropic Claude · React 19

<br/>

*`AGENTS.md`: "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data."*

</div>
