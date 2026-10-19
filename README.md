# CampusFlow — Smart Student Academic Portal

CampusFlow is a client-side academic management portal for a college software-development assessment. It demonstrates connected student, course, attendance, assessment, timetable, announcement, dashboard, and reporting workflows using fictional data persisted in browser LocalStorage.

> **Demonstration only:** Authentication and role restrictions run in the browser and are not secure authorization. Do not enter real student information or use this application to protect sensitive records.

## Features

- Administrator and student demo entry, with role-aware navigation and client-side route guards.
- Student roster CRUD, profile view, validation, filtering, sorting, pagination, and CSV export.
- Course catalog CRUD, enrollment, and cascade-safe course deletion.
- Course/date attendance register, duplicate-safe session editing, history, percentages, and under-75% monitoring.
- Enrolled-student assessment results using internal / 20, assignment / 20, examination / 60, and grade bands.
- Weekly timetable with room and department-division overlap validation.
- Searchable, editable announcements targeted by department and year.
- Calculated dashboard and reports with attendance, enrollment, course, performance, and risk charts.
- Seed-once fictional data for 30 students, 6 courses, enrollments, attendance, results, timetable, and announcements.
- Settings action to restore the original demo dataset.
- Responsive layout, Vitest / React Testing Library checks, ESLint, and GitHub Actions CI with optional Pages deployment.

## Technology stack

React 19, Vite 8, JavaScript ES modules, Tailwind CSS 4, React Router 7, Lucide React, Recharts, LocalStorage, Vitest, React Testing Library, ESLint 9, and GitHub Actions.

## Folder structure

```text
.
├── .github/workflows/ci-cd.yml
├── public/favicon.svg
├── src/
│   ├── components/       # Shared controls and panels
│   ├── pages/            # Dashboard and portal modules
│   ├── services/         # Seed data, persistence, and business rules
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/                # Vitest and React Testing Library
├── AGILE_PLAN.md
├── FA2_DEMONSTRATION.md
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## Installation

Install Node.js 22 LTS or newer, then run:

```sh
npm ci
```

## Development commands

```sh
npm run dev       # Start Vite development server
npm run build     # Create the production bundle in dist/
npm run preview   # Preview the production bundle locally
npm test          # Run all tests once (non-interactive)
npm run test:watch
npm run lint      # Run ESLint; any lint error returns a failing exit code
```

## Demo login

Open the development URL and choose **Administrator** or **Student**. Student mode requires choosing one of the 30 fictional student profiles. No password is collected. Demo session selection is stored in LocalStorage. Use the profile menu to end the demo session; use Settings → Reset demo data to restore seed records.

## Data model and limitations

The first app load seeds deterministic fictional records into `campusflow-data-v1`. Subsequent loads preserve user edits. The prior `fa2-students` student list is migrated once when the new data key does not exist. All data remains in the current browser profile and can be edited through developer tools; there is no server, multi-user synchronization, production identity provider, or secure authorization. The charts summarize the records present in LocalStorage and are not institutional analytics.

## Testing and quality

`npm test` verifies student validation/search/deletion, attendance percentages and duplicate prevention, assessment calculations and grades, enrollment uniqueness, timetable overlaps, dashboard statistics, and the rendered student search flow. `npm run lint` checks source, tests, and project configuration. The GitHub Actions workflow runs the production build, tests, and lint on pull requests targeting `main` and pushes to `main`.

## GitHub repository setup

1. Create an empty GitHub repository named `student-management-fa2`.
2. Initialize Git in this project if needed, add the repository as `origin`, and commit the project files.
3. Push the `main` branch. This workspace currently has no Git repository metadata, so local changes have not been committed or pushed.

Use your own repository remote; do not commit local environment credentials.

## GitHub Actions and Pages deployment

The workflow at `.github/workflows/ci-cd.yml` checks out the repository, installs the lockfile with `npm ci`, builds, tests, lints, and uploads the resulting `dist/` artifact. Pull requests run CI only. A successful push to `main`, or a manual run on `main`, can deploy through the official GitHub Pages Actions.

1. Push the workflow and application to the repository's `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Confirm the repository's Actions permissions permit workflow runs.
4. Open **Actions → CampusFlow CI/CD** and verify the CI and deployment jobs.
5. Open the Pages URL shown on the deployment job. Vite is configured with `/student-management-fa2/` as its base path and React Router uses hash URLs for subpath hosting.

Deployment is not claimed until the GitHub workflow succeeds and the published site has been opened and checked.

## Agile planning and demonstration

See [AGILE_PLAN.md](AGILE_PLAN.md) for the problem statement, stack, five user stories, US1 Given–When–Then criteria, sprint backlog, and Definition of Done. Follow [FA2_DEMONSTRATION.md](FA2_DEMONSTRATION.md) for a two-speaker 1–2 minute recording plan with specific actions and original narration.
