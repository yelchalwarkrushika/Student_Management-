# CampusFlow FA2 Demonstration

Target duration: exactly 2 minutes: one minute per speaker. Use your own narration and the team's actual GitHub repository and deployment URL.

| Time | Speaker | What to show and click | Suggested narration |
| --- | --- | --- | --- |
| 0:00–1:00 | Student 1 — Administrator | 0:00–0:08: Select Administrator and enter the portal. 0:08–0:20: Show dashboard KPIs and charts. 0:20–0:32: Open Students, search `Ishita`, then show Add student and close it. 0:32–0:43: Open Attendance and point to course/date, roster, and session history. 0:43–0:52: Open Academics and show the grading scheme. 0:52–1:00: Open Reports and point to Export report. | “We built CampusFlow, a student academic portal for our Agile Software Development FA2. The administrator dashboard brings together enrollment, attendance, course performance, and academic risk, all calculated from fictional records in this browser. In Students, administrators can search, filter, review, and maintain profiles with validation for student IDs, email, phone, and dates. Attendance is recorded by course and date, and saved sessions can be reopened and edited. Marks use internal, assignment, and examination components weighted to 100, with clear grade bands. Reports summarize the current records and can be exported as CSV.” |
| 1:00–2:00 | Student 2 — Student | 1:00–1:08: End the admin session from the profile menu. Choose Student and select a fictional profile. 1:08–1:20: Show the student dashboard. 1:20–1:32: Open Attendance and Academics. 1:32–1:43: Open Courses and Timetable. 1:43–1:52: Open Announcements and show a targeted notice. 1:52–2:00: Return to dashboard and mention the deployment. | “I’ll show the student experience using a fictional demo profile. The dashboard summarizes this student’s own attendance, courses, results, and academic status. In Attendance, the student can review recorded sessions and their personal percentage; in Academics, they can see subject marks and the calculated grade. Courses lists only enrolled classes, while Timetable shows the matching department and division schedule. Announcements are filtered to the student’s eligible audience. This is a browser-based demonstration, not secure production authentication. Our GitHub workflow runs the build, tests, and lint before a main-branch deployment. The live Pages URL is shown only after the team verifies the deployment.” |

## Before recording

1. Start the app with `npm run dev` and open `http://localhost:5173/student-management-fa2/`.
2. Use Settings → Reset demo data if earlier rehearsal changed records.
3. Push the project to the `main` branch of the team's GitHub repository.
4. In repository Settings → Pages, choose GitHub Actions as the deployment source.
5. Confirm the GitHub Actions run is green and copy the Pages URL from the deployment job before recording.
6. If deployment is not configured yet, show the workflow file and describe the intended deployment; do not claim that Pages is live.
7. Record both speakers with original narration. Do not use a generated voice-over or present fictional records as real student data.