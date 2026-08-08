# Student Attendance Register (Monthly) — Teacher Website

## Where to copy these files

Two different places — this feature touches both the teacher website
and one desktop file:

**Teacher website** (your repo/hosting folder for the phone app):
- `index.html`
- `style.css`
- `sw.js`

**Desktop app**, inside `Haseeb School Software\resources\app\app\`:
- `online-attendance-sync.html`

Push/deploy the teacher-website files as usual, and copy the desktop
file over the existing one, then reopen the desktop app.

## What this adds

A new **📘 Student Register** tile on the teacher's dashboard, next to
Class Attendance. It shows the whole class's attendance for a month —
read-only, exactly what's already been marked (by that teacher, day by
day, on Class Attendance).

- Pick a month at the top (defaults to the current month).
- Every student in the class is listed, sorted by **Roll No** (the
  Roll No feature from your last update) — with a quick P/A/L tally
  next to their name.
- **Tap a student** to open their full day-by-day calendar for that
  month, same style as My Attendance — colored by Present / Absent /
  Leave / Off (Sunday or a holiday the admin marked).
- A day that simply wasn't marked at all (teacher didn't take
  attendance that day) shows as **"Not taken"**, not Absent — it's
  not held against the student.

## One extra step: re-push the roster once

Since the register sorts by Roll No, the desktop app now also sends
each student's Roll No when you click **"Push Classes + Students to
Teacher App"** on the Teacher App Sync page. After copying the new
`online-attendance-sync.html`, open that page once and click that
button again so the Roll Nos reach the teacher app — otherwise the
register will still work, just sorted by name instead of Roll No until
you do.
