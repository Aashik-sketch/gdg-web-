# Recruitment Portal

A recruitment application portal built with the Next.js App Router. Applicants
sign in, choose up to two departments, answer a per-department questionnaire, and
track their applications. Administrators review submissions in a console with
filtering, CSV export, shortlisting and bulk email.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14.2.5 (App Router) |
| UI | React 18, Tailwind CSS, shadcn/ui on Radix primitives |
| Auth | better-auth 1.6.25 with the `admin` plugin, Firestore adapter |
| Data | Cloud Firestore via `firebase-admin` 14 (server only) |
| Validation | zod (server-side authoritative, shared with the client form) |
| Email | nodemailer |
| Tests | Vitest + Testing Library (jsdom) |

## Requirements

- Node.js 18.17 or newer (developed on 20.20)
- [Bun](https://bun.sh) — the lockfile is `bun.lock`
- A Firebase project with Firestore enabled, or the Firestore emulator

## Quick start

```bash
bun install
cp .env.example .env.local     # then fill in the values below
bun run dev                   # http://localhost:3000
```

To run against the Firestore emulator instead of a live project:

```bash
firebase emulators:start --only firestore
# set FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" in .env.local
```

## Environment variables

`.env.example` is the authoritative list. The essentials:

| Variable | Required | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | **yes** | Signs session cookies. Generate with `openssl rand -base64 32`. The app refuses to start in production without it. |
| `BETTER_AUTH_URL` | yes in prod | Public origin, e.g. `https://example.com`. |
| `FIREBASE_PROJECT_ID` | yes | Service account project. |
| `FIREBASE_CLIENT_EMAIL` | yes | Service account email. |
| `FIREBASE_PRIVATE_KEY` | yes | Service account key, with literal `\n` escapes. |
| `GOOGLE_APPLICATION_CREDENTIALS` | alternative | Path to a service-account JSON, instead of the three above. |
| `FIRESTORE_EMULATOR_HOST` | dev only | Point the Admin SDK at a local emulator. |
| `NEXT_PUBLIC_APPLICATION_DEADLINE` | no | ISO-8601 with offset. Drives both the API cut-off and the countdown. |
| `NEXT_PUBLIC_MAX_APPLICATIONS_PER_USER` | no | Defaults to `2`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Omit both to disable the Google provider. |
| `EMAIL_USERNAME` / `EMAIL_PASSWORD` | no | Omit to disable bulk email; the endpoint then returns 503. |

There is no Firebase *client* SDK in this project — all Firestore access is
server-side through the Admin SDK, so no `NEXT_PUBLIC_FIREBASE_*` keys are
needed.

## Scripts

```bash
bun run dev            # development server
bun run build          # production build
bun run start          # serve the production build
bun run lint           # ESLint (next/core-web-vitals)
bun run test           # Vitest, single run
bun run test:watch     # Vitest, watch mode
bun run test:coverage  # Vitest with v8 coverage
bun run verify         # lint + test + build
bun run clean          # remove .next and coverage
```

## Project layout

```
app/
  (pages)/
    departments/          department picker (step 1)
    join/[...joinIds]/    application form (step 2)
                          page.jsx validates route ids on the server;
                          JoinApplicationView.jsx holds the interactive UI
    admin/                admin console, role-gated server-side
    development/          featured-departments landing page
  api/
    submit-form/          create an application (auth + zod + transaction)
    check-applications/   the caller's own application count and departments
    check-department-submission/
    get-submissions/      the caller's own submissions
    admin/applicants/     full listing (admin only)
    shortlist/[id]/       toggle shortlisted (admin only)
    send-email/           bulk mail (admin only)
    auth/[...all]/        better-auth handler
  auth/signin, auth/signout
components/
  ui/                     shadcn primitives plus alert, badge, breadcrumb,
                          progress, stepper, spinner, stat-card, button-group
constants/
  index.js                catalogue and questionnaire source data
  departmentNames.js      >> edit this to rename a department <<
  departments.js          id-keyed catalogue used by the whole app
  applicationSteps.js     the three flow steps
lib/
  firebase.js             single Firebase Admin initialisation
  auth.js  authz.js       better-auth config; requireUser / requireAdmin
  config.js               deadline and application cap
  validation.js           zod schemas, HTML escaping
  redirect.js             safe post-sign-in return paths
tests/                    Vitest suites
```

## Renaming a department

Edit **`constants/departmentNames.js`** and nothing else. It maps each
department's stable UUID to a display name, and each entry is annotated with the
name currently in the catalogue and its question count:

```js
export const DEPARTMENT_NAMES = {
  "c21ca066-ab4d-40a3-943c-f170d6312bdc": "Web Development", // 5 questions
  "4499a966-2740-4c36-88dd-8916a909fc77": "",                // keeps existing name
};
```

Leave a value blank to keep the catalogue name. The change propagates to the
department picker, the application form, the admin filter, CSV export and
outgoing email at once.

This works because the UUID — not the display name — is the join key. Earlier the
name linked a department to its questionnaire, to submission validation and to
duplicate detection, so renaming one silently deleted its questions and rejected
its applications. Submissions store `DepartmentId` alongside the display name,
and `tests/lib/departments.test.js` asserts that a renamed department keeps its
questionnaire.

## Deployment checklist

1. Set every required variable above. The app fails loudly rather than falling
   back to a placeholder Firebase project.
2. Deploy the Firestore rules — they are deny-all, and only take effect once
   deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
   All access goes through the Admin SDK, which bypasses rules, so denying direct
   client access costs the application nothing.
3. Grant at least one administrator. The `admin` plugin reads a `role` field on
   the user document (better-auth stores users in the `user` collection); set it
   to `admin`. Without this, `/admin` is inaccessible to everyone.
4. Set `NEXT_PUBLIC_APPLICATION_DEADLINE` to the real closing date.

## Security notes

- Every privileged route requires a session; `/api/admin/applicants`,
  `/api/shortlist/[id]` and `/api/send-email` additionally require the `admin`
  role via `lib/authz.js`.
- `/admin` performs its role check on the server *before* querying Firestore, so
  applicant data never reaches the RSC payload of a non-admin.
- Routes derive the caller's email from the session and ignore any `email` query
  parameter.
- `POST /api/submit-form` ignores client-supplied `Email` and `Department`; the
  department name is derived server-side from the submitted id.
- The application cap is enforced inside a Firestore transaction, so concurrent
  requests cannot exceed it.
- Applicant-controlled fields are HTML-escaped before being interpolated into
  outgoing email.
- Post-sign-in return paths are sanitised against open redirects
  (`lib/redirect.js`).
- Email/password sign-up currently has **no email verification and no domain
  allowlist** — anyone can self-register. Decide whether to require Google OAuth
  only before opening applications.

## Outstanding work

- **`constants/index.js` contains scrambled placeholder text** for every
  department name, description and questionnaire question. Names can be fixed via
  `constants/departmentNames.js`; the questions must be replaced in
  `constants/index.js` directly.
- `/admin` ships 353 kB of first-load JS (react-table, tiptap, react-icons). A
  dynamic import of `MailComposer` would remove most of it.
- `components/magicui/*` and several unused `components/ui` primitives are
  scaffolding with no current consumers. They cost nothing at runtime but could
  be pruned.

## Testing

```bash
bun run test
```

117 tests across 10 files, covering authorization, request validation, deadline
configuration, safe redirects, department rename safety, the UI primitives, and
the applicant and admin flows — including regression tests for the department
filter, the optimistic shortlist update, and the sign-out-safe Continue flow.
