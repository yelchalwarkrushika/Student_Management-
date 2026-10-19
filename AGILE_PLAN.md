# CampusFlow Agile Plan

## Project Overview

### Problem statement

Student administration, attendance, marks, and campus communications are often demonstrated as disconnected forms. That makes it difficult to see how routine academic records support a shared view of student progress.

### Objective

Build a responsive academic portal that demonstrates linked student, course, attendance, assessment, timetable, announcement, and reporting workflows using fictional records stored in the browser.

### Scope

The assessment includes an administrator and student demonstration role, client-side route restrictions, persistent CRUD workflows, calculated charts, automated tests, continuous integration, and an optional GitHub Pages deployment. It does not include a backend, real authentication, or secure storage of personal records.

### Technology stack

React 19, Vite 8, JavaScript ES modules, Tailwind CSS 4, React Router 7, Lucide React, Recharts, browser LocalStorage, Vitest, React Testing Library, ESLint 9, and GitHub Actions.

## User Stories

### US1: Student records

As an administrator, I want to manage student records so that student information remains organized.

**Given–When–Then acceptance criteria**

1. Given the administrator is on Students, when they submit a record with every required field and a unique student ID and roll number, then the student appears in the roster and remains after refresh.
2. Given a student ID or roll number already exists, when the administrator submits a duplicate, then the record is rejected and a clear inline error identifies the duplicate.
3. Given an invalid email, non-Indian/non-10-digit phone, future date of birth, invalid admission date, or missing required value, when the administrator submits the form, then no record is saved and a validation message is shown.
4. Given student records exist, when the administrator searches or filters by department, year, or status, then only matching students are shown; sorting and pagination remain usable.
5. Given a student is deleted, when the administrator confirms deletion, then the student and linked enrollments, attendance, and results are removed together.

### US2: Attendance

As a faculty member or authorized administrator, I want to record attendance so that student participation can be tracked.

**Acceptance criteria:** An administrator selects a course and date, marks each enrolled student present or absent, and saves the session. Editing the same course/date replaces that session rather than duplicating records. Attendance percentages use present sessions divided by recorded sessions; no sessions returns 0%. Student records below 75% can be reviewed.

### US3: Academic marks

As an authorized administrator, I want to manage academic marks so that student performance can be evaluated.

**Acceptance criteria:** Marks can be recorded only for an existing student-course enrollment. Internal assessment is out of 20, assignment is out of 20, and examination is out of 60. Values outside their ranges and duplicate result records are rejected; editing an existing result is supported and the published grade bands are applied.

### US4: Student self-service

As a student, I want to view my attendance and results so that I can monitor my academic progress.

**Acceptance criteria:** After choosing a fictional student in demo login, the student can see their own attendance, results, enrolled courses, timetable, and announcements targeted to their department/year. Administrator-only pages and controls are unavailable in the student experience.

### US5: Analytics and reports

As an administrator, I want to view analytics and reports so that academic decisions can be supported.

**Acceptance criteria:** Dashboard cards, charts, risk indicators, and report rows are calculated from current persisted student, course, attendance, result, enrollment, and announcement records. Updating a record updates the relevant views, and the report can be exported as CSV.

## Sprint Planning

One-week assessment sprint. Story points are relative estimates for this demonstration project.

| Story ID | Task | Priority | Story Points | Assigned Role | Expected Outcome |
| --- | --- | --- | ---: | --- | --- |
| US1 | Define student fields, validation, and seeded roster | High | 3 | Developer | 30 linked fictional student profiles |
| US1 | Build searchable CRUD roster, profile, filters, and CSV | High | 5 | Developer | Administrator can maintain student records |
| US1 | Test creation, duplicates, search, and cascade deletion | High | 3 | QA | Student rules have automated coverage |
| US2 | Model attendance sessions and percentage calculation | High | 3 | Developer | Duplicate-safe course/date attendance |
| US2 | Build attendance register and history view | High | 5 | Developer | Sessions can be marked, edited, and reviewed |
| US2 | Test attendance thresholds and empty-session behavior | High | 2 | QA | Attendance calculations are verified |
| US3 | Implement assessment ranges, totals, and grade bands | High | 3 | Developer | Valid marks calculate consistently |
| US3 | Build result entry and student result views | High | 5 | Developer | Enrolled students have editable results |
| US4 | Add demo role selection and route restrictions | Medium | 3 | Developer | Student and administrator views differ |
| US4 | Verify student visibility and navigation | Medium | 2 | QA | Student view contains only permitted demo views |
| US5 | Calculate dashboard and report datasets | High | 3 | Developer | Charts and reports use stored records |
| US5 | Add CSV report export and dashboard checks | Medium | 2 | QA | Report data is usable outside the portal |
| All | Configure Vite, lint, CI, tests, and Pages workflow | High | 5 | DevOps | Build and checks run on every PR |
| All | Create responsive styles and accessibility pass | Medium | 5 | Designer / QA | Desktop, tablet, and mobile layouts work |
| All | Write project and demonstration documentation | Medium | 2 | Team | Setup and FA2 presentation are repeatable |

## Definition of Done

- Feature implemented and connected to persisted application data.
- Input validation and destructive-action confirmation completed.
- Automated unit and component tests passed.
- ESLint passed with no errors.
- Production build completed successfully.
- UI checked at desktop and mobile widths.
- Acceptance criteria for the user story satisfied.
- Code committed to the GitHub repository by the project team.
- CI/CD pipeline successful on the target branch.
- GitHub Pages deployment verified in the browser.

The last three items require the project team to configure and operate its own GitHub repository; they are not claims of a deployment performed from this workspace.