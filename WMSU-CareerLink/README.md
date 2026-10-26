# WMSU CareerLink — Complete Front-End Prototype

A React + Vite front-end prototype for a university job and internship portal. It contains separate Student, Employer, and Admin screens and uses fictional sample data. No Express API or SQL database is included yet, as requested.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder and open it in VS Code.
3. Open a terminal in this folder and run:

   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL Vite prints (usually `http://localhost:5173`).
5. For a production build, run `npm run build`.

## Demo login

On the login screen, select Student, Employer, or Admin. Any valid email address and a password of at least four characters simulate sign-in. Registration and password reset are also demo-only. Do not enter real passwords or sensitive information.

## Included screens

- Auth: Login, Register, Forgot Password
- Shared: Navbar, Sidebar, Button, Modal, SearchBar, NotificationPanel, Settings
- Student: Dashboard, Profile, Internships, Applications, Notifications, Saved Opportunities (uses the Internships screen filtered to saved items)
- Employer: Dashboard, Company Profile, Job Postings, Applicants
- Admin: Dashboard, Users, Employers, Job Approvals, Applications, Categories & Courses, Announcements, Reports
- Sample data and responsive CSS

## Prototype limitations

- Changes are stored in this browser's localStorage where supported. They are not shared between devices or users and can be cleared by the browser.
- Authentication is simulated and is not secure.
- File selection does not upload or permanently store résumé documents.
- Notifications are local demo data; no email or push notifications are sent.
- WMSU-inspired colors are used. Add an approved official logo/image to `public/` if your group has permission to use it.