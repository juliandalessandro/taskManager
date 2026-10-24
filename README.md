# Task Manager

A full-stack task management application with a Google Keep–inspired UI, built with Next.js, PostgreSQL, and Prisma. The project combines full-stack development with automated API and end-to-end testing using Playwright.

**Live demo:** [Task Manager](https://task-manager-taupe-one-44.vercel.app)

## Features

- **Authentication:** Register and log in using either username or email.
- **Private tasks:** Create, edit, complete, and delete tasks.
- **Checklists:** Create checklists, add or remove items, and mark individual items as completed.
- **Interactive UI:** Confirmation dialogs, keyboard shortcuts, and click-outside behavior for forms and modals.
- **Protected routes:** Session-based access control with server-side authorization checks.
- **Automated testing:** API tests and browser-based E2E tests covering successful flows, validation errors, authentication, and access control.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** Auth.js (NextAuth.js v5), Credentials provider, JWT sessions
- **Validation:** Zod
- **Testing:** Playwright with TypeScript
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL database, such as a [Neon](https://neon.tech/) project

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd taskManager
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="your-postgres-connection-string"
   AUTH_SECRET="your-generated-auth-secret"
   ```

   Generate an authentication secret using the command recommended by your installed Auth.js version. Keep your `.env` file private and never commit real credentials.

3. Apply the database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Testing

The project uses Playwright for API testing and end-to-end testing.

### Install Playwright browsers

```bash
npx playwright install
```

### Run the tests

Run the full suite using two workers:

```bash
npx playwright test --workers=2
```

Run a specific test file:

```bash
npx playwright test tests/e2e/tasks-e2e.spec.ts
```

Run tests matching a name:

```bash
npx playwright test -g "login"
```

Open the HTML report from the latest run:

```bash
npx playwright show-report
```

### Test Organization

- **`tests/api/`** — API tests covering authentication, task and checklist operations, validation, and access control.
- **`tests/auth/`** — UI tests for registration, login, and logout.
- **`tests/e2e/`** — Browser-based tests simulating real user interactions, including task and checklist workflows.
- **`tests/global-setup.ts`** — Prepares deterministic test data, including test users and tasks.
- **`tests/global-teardown.ts`** — Cleans up generated test data after the suite runs.

The test suite uses authenticated browser state and seeded test data to exercise both successful and unsuccessful scenarios.

**Note:** Configure the required environment variables and database before running the suite. Review the global setup and teardown scripts to understand which data they create and remove.
