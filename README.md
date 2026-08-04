# Haseeb School — Teacher App (Web / PWA)

A mobile-friendly installable web app for class teachers: online class
attendance (restricted to a fixed morning window, enforced by Firebase's
server clock), a student complaint box, a read-only view of the
teacher's own attendance grouped by month, and salary-paid
notifications.

## Files

- `index.html` — the whole app (login, dashboard, attendance, complaints,
  my attendance, notifications)
- `style.css` — visual design
- `firebase-config.js` — your Firebase project keys (already filled in)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — makes the
  site installable on a phone's home screen (PWA)

## How to publish this on GitHub

**Option A — GitHub Pages (free, simplest)**

1. Create a new GitHub repository (e.g. `haseeb-school-teacher-app`).
2. Upload all the files in this folder to the root of that repository.
3. In the repo, go to **Settings → Pages**, set **Source** to the `main`
   branch and `/ (root)`, then save.
4. GitHub will give you a URL like
   `https://yourusername.github.io/haseeb-school-teacher-app/` — that's
   the link teachers open on their phone (Chrome → ⋮ menu → *Add to Home
   Screen*, or the in-app **Install App** button).

**Option B — Firebase Hosting** (since you already use Firebase for the
database, this keeps everything in one place)

```
npm install -g firebase-tools
firebase login
firebase init hosting     # choose this folder as the public directory
firebase deploy
```

Either option works the same way from the teacher's side — pick
whichever is easier for you to keep updating later.

## Important

The service worker (`sw.js`) and the "Add to Home Screen" install
prompt both require the site to be served over **HTTPS**. Both GitHub
Pages and Firebase Hosting provide this automatically — you don't need
to do anything extra.

## What's new in this version

- All text is now plain English (no Roman Urdu).
- Visual redesign: clearer dashboard tiles, a teacher avatar in the top
  bar, color-coded attendance chips, smoother animations, and a more
  polished overall look.
- **My Attendance** is now grouped by month, and shows the exact time
  the admin recorded each day, alongside a simple Present/Absent badge.
- The app already scopes each teacher to their own class and its own
  student list — a teacher only ever sees and marks attendance for the
  class they're assigned to.
