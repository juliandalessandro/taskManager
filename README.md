# Task Manager

A full-stack task management app with a Google Keep–inspired UI, built to practice fullstack development alongside test automation with Playwright. Users can register, log in with either username or email, and manage their own private tasks (create, edit, complete, delete).

**Live demo:** [https://task-manager-taupe-one-44.vercel.app](https://task-manager-taupe-one-44.vercel.app)

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma
- **Auth:** Auth.js (NextAuth v5) with the Credentials provider and the Username plugin, JWT sessions
- **Validation:** Zod
- **Testing:** Playwright (TypeScript) — E2E and API tests
- **Deployment:** Vercel

## Features

- Registration and login with either username or email
- Session-protected routes via middleware (with a secondary server-side check on protected pages)
- Full task CRUD: create, edit, mark as complete, delete
- Confirmation modal before deleting a task
- Keyboard (Escape) and click-outside support for dismissing forms and modals

## Getting started locally

Requirements: Node.js, a PostgreSQL database (e.g. a free [Neon](https://neon.tech) project).

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root with:
   ```
   DATABASE_URL="your-postgres-connection-string"
   AUTH_SECRET="generate-one-with-npx-auth-secret"
   ```

3. Run the database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```
   Available at [http://localhost:3000](http://localhost:3000)

## Running the tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run the full suite
npx playwright test

# Run a specific file
npx playwright test tests/e2e/tasks-e2e.spec.ts

# Run tests matching a name
npx playwright test -g "login"

# View the last HTML report
npx playwright show-report
```

Tests are organized by type:
- **`tests/api/`** — hit the backend endpoints directly (auth, tasks), including CSRF/redirect handling specific to Auth.js
- **`tests/auth/`** — UI tests of login, logout and register features
- **`tests/e2e/`** — simulate real user interaction through the browser
- **`tests/global-setup.ts`** / **`tests/global-teardown.ts`** — seed a deterministic test user and second-user task before the suite runs, and clean up generated test data afterward, so the suite behaves the same on any machine or CI environment
