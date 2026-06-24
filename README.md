# AI Task Board

A production-ready frontend skeleton for an AI-powered task board application, similar to Trello.

## Stack

- React 19 + TypeScript
- Vite
- React Router v7
- TanStack Query
- Zustand
- Tailwind CSS v4
- shadcn/ui components
- React Hook Form + Zod
- Supabase client (stub)
- @dnd-kit (drag-and-drop)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Mock Authentication

Any valid email/password combination works for login. Session persists in localStorage.

## Environment Variables

Copy `.env.example` to `.env` (optional for MVP):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app runs without Supabase configured — all data is mocked.

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |
| `/dashboard` | Overview |
| `/boards` | Board list |
| `/boards/:id` | Kanban board |
| `/ai-generator` | AI task generation |
| `/ai-chat` | AI assistant chat |
| `/telegram` | Telegram inbox |
| `/billing` | Subscription & usage |
| `/settings` | Profile, team, notifications, integrations |

## Project Structure

```
src/
├── app/           App shell & providers
├── pages/         Route pages
├── layouts/       Auth, App, Settings layouts
├── components/    UI & domain components
├── features/      Feature hooks & logic
├── hooks/         Shared hooks
├── stores/        Zustand stores
├── services/      Mock service layer
├── types/         TypeScript types
├── lib/           Utils, mock data, validators
└── routes/        Router config
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
