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

## E2E Tests (Playwright)

```bash
npx playwright install chromium
cp .env.e2e.example .env.e2e
# fill VITE_SUPABASE_*, E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD
npm run test:e2e:ui
```

Auth-only specs (registration, login, password reset, navigation, validation):

```bash
npm run test:e2e:auth:ui
```

Extended specs (AI, Telegram, Billing, sidebar navigation):

```bash
npm run test:e2e:extended:ui
```

Core specs (dashboard, boards, board details, settings):

```bash
npm run test:e2e:core:ui
```

See [.env.e2e.example](.env.e2e.example) for required environment variables.

## CI (GitHub Actions)

E2E tests run automatically on every push to `main`/`master` and on pull requests via [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml).

### Required GitHub Secrets

In the repository: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Description |
|--------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `E2E_LOGIN_EMAIL` | Confirmed test user email |
| `E2E_LOGIN_PASSWORD` | Password for the test user |

Use a dedicated Supabase test account that is already confirmed and stable across runs.

### What runs in CI

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

If tests fail, the workflow uploads `playwright-report` and `test-results` artifacts (traces, screenshots) for debugging.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm run test:e2e` — Run all Playwright tests (72 specs, headless)
- `npm run test:e2e:ui` — Run Playwright tests in UI mode
- `npm run test:e2e:auth` — Auth e2e (login, register, validation, password, navigation)
- `npm run test:e2e:auth:ui` — Auth e2e in UI mode
- `npm run test:e2e:core` — Core app e2e (dashboard, boards, board details, settings)
- `npm run test:e2e:core:ui` — Core app e2e in UI mode
- `npm run test:e2e:extended` — Extended e2e (AI, Telegram, Billing, navigation)
- `npm run test:e2e:extended:ui` — Extended e2e in UI mode
