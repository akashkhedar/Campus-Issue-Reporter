# Campus Watch — README

Comprehensive documentation and setup instructions for the Campus Watch web app (Vite + React + TypeScript). This repo implements a community reporting app with issue reports, map picking, media uploads, and an admin dashboard backed by Firebase (Firestore, Auth, Storage). The README below documents project layout, setup, Firebase and Google Maps configuration, local development, admin creation, key files, and troubleshooting.

**Contents**

- Project overview
- Quick start
- Environment variables
- Firebase setup (project + service account + rules)
- Google Maps setup
- Admin creation (script + console fallback)
- File map (important files)
- Running, building, and deployment
- Troubleshooting & notes

---

## Project overview

Campus Watch is a single-page application (SPA) built with Vite + React + TypeScript and styled with Tailwind CSS and shadcn-ui components. Features:

- Report issues with title, description, category, location (map or current location), images/videos.
- Browse a feed of reported issues and see details.
- Admin dashboard to assign resolver, update status, and attach resolution-proof media.
- Firebase-backed: Authentication, Firestore for issues, Storage for media.
- Google Maps used for location selection and reverse geocoding.

This repository contains the frontend app and a small helper script to create an admin account using the Firebase Admin SDK (for convenience during development).

---

## Quick start (local)

Prerequisites:

- Node.js 18+ (recommended) and npm
- A Firebase project with Firestore, Auth, and Storage enabled
- A Google Maps Platform API key with Maps JS API enabled

Steps:

1. Install dependencies

```bash
npm install
```

2. Create a local environment file `.env` (or `.env.local`) in the project root with the required vars (see next section).

3. Start the dev server

```bash
npm run dev
```

4. Open the app in your browser (Vite will show the local URL, usually `http://localhost:5173`).

Notes: If you change environment variables, restart the dev server.

---

## Environment variables

Create `.env` or `.env.local` with the following keys (Vite requires `VITE_` prefix for client exposure):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Example `.env` (do NOT commit real secrets):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:123:web:abcdef
VITE_GOOGLE_MAPS_API_KEY=AIza...yourkey...
```

Security: Keep service account JSON and other secrets out of the repo. Use CI secrets / environment variables for deployments.

---

## Firebase setup

Required Firebase services:

- Authentication (Email/Password or other providers)
- Firestore (in production use proper rules and security)
- Storage (for media uploads)

Client initialization is in `src/lib/firebase.ts`. The app uses the Firebase client SDK for reads/writes and Storage uploads.

Important notes:

- Firestore document timestamps are normalized in the code (`src/lib/issues.ts`) — the app converts Firestore Timestamps to JS `Date` for UI.
- When writing arrays that will include server timestamps, the code creates the document first (with empty arrays) then updates arrays via `arrayUnion()` with `serverTimestamp()` to avoid the Firestore limitation of sentinels inside arrays.

Local dev with admin operations:

- The project includes `tools/create_admin.cjs`, a helper script that uses the Firebase Admin SDK and a Google service account JSON to create a user and set a custom claim `admin: true`. This requires the service account and project to have the correct APIs enabled (Identity Toolkit/Email+Password sign-in enabled in Firebase Console). If the script fails with `auth/configuration-not-found`, enable Email/Password sign-in in Firebase Console and check GCP APIs.

Firestore rules: Not added by default here — add rules appropriate to your security model before production.

---

## Google Maps setup

This app uses Google Maps for location selection in `src/components/MapPicker.tsx` and reverse geocoding.

Steps:

1. Create / enable a Google Cloud project and enable the Maps JavaScript API and Geocoding API.
2. Create an API key and restrict it to your domains and the required Maps APIs.
3. Add the key to `.env` as `VITE_GOOGLE_MAPS_API_KEY` and restart the dev server.

Map behavior: The `MapPicker` component accepts a starting coordinate and allows clicking to place a pin; the app also supports using the browser geolocation API (user permission required).

---

## Admin creation

Option A — Use the included helper script (service account required):

1. Create a service account in Google Cloud Console and download the JSON key file (keep it private).
2. Ensure the Firebase project has Email/Password sign-in enabled (Firebase Console → Authentication → Sign-in method).
3. Ensure the Identity Toolkit / Firebase Authentication APIs are enabled for your GCP project.
4. Place the service account JSON (e.g., `admin.json`) locally and run:

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'F:\\campus-watch-main\\admin.json'
node tools/create_admin.cjs --email admin@example.com --password 'YourPassw0rd!'
```

The script will create the user and set `admin: true` as a custom claim. If you get the error `There is no configuration corresponding to the provided identifier`, check step 2 and GCP API permissions.

Option B — Manual (Firebase Console):

1. Open Firebase Console → Authentication → Users → Add user (email/password).
2. Use the Admin SDK elsewhere (or run the provided script with credentials) to set the custom claim for that uid to `{ admin: true }`.

Setting custom claims manually (example snippet using Admin SDK):

```js
// node setClaim.js
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("./admin.json")),
});
admin.auth().setCustomUserClaims("<UID>", { admin: true });
```

After an admin claim is set, the user must sign out and sign in again in the client to refresh their token.

---

## File map — important files

Below are the most relevant files and what they do. Use these as entry points when modifying behavior.

- `src/main.tsx` — App bootstrap and provider wiring.
- `src/App.tsx` — Top-level routing and layout.
- `src/pages/Index.tsx` — Home / feed of issues.
- `src/pages/ReportIssue.tsx` — Report form and submission flow (uploads media + adds Firestore doc).
- `src/pages/IssueDetail.tsx` — View issue details, media, and timeline.
- `src/pages/AdminLogin.tsx` — Admin login page.
- `src/pages/AdminDashboard.tsx` — Admin management UI (assign resolver, change status, attach resolution media).
- `src/components/MapPicker.tsx` — Map component used to pick coordinates and reverse geocode.
- `src/components/MediaUploader.tsx` — Handles image/video selection and preview.
- `src/components/IssueCard.tsx` — Single issue item used in feed.
- `src/components/FilterBar.tsx` — Filtering controls for the feed.
- `src/components/StatusTimeline.tsx` — Visual timeline of an issue's status history.
- `src/data/demoIssues.ts` — Demo data fallback if Firebase is not configured.
- `src/lib/firebase.ts` — Firebase client initialization (uses `.env` vars).
- `src/lib/issues.ts` — Firestore helper functions (add, list, get, update status, upload media helpers).
- `src/lib/utils.ts` — Small utilities used across the app.
- `tools/create_admin.cjs` — Helper script to create an admin user and set custom claim (requires `admin.json`).

Front-end UI components in `src/components/ui/*` are shadcn-ui building blocks used throughout.

---

## Running, building, and deployment

Local dev:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

Deploy: Use your preferred static host (Netlify, Vercel, Firebase Hosting). For Firebase Hosting, configure a `firebase.json` and deploy with `firebase deploy --only hosting` after building.

---

## Troubleshooting

- If Firestore reads/writes fail, verify `.env` values and that the Firebase project ID matches.
- If admin creation script errors with `auth/configuration-not-found`, ensure Email/Password sign-in is enabled and Identity Toolkit API is activated in GCP.
- Geolocation: Browser permission is required; some browsers/devices may time out — the app increases the geolocation timeout to 30s by default.
- Media uploads: Large files may hit Storage limits or timeouts. Use reasonable file sizes for testing.

---

## Testing & validation

There are no automated tests included by default. Manual tests to validate key flows:

1. Start dev server and verify the feed loads or falls back to `src/data/demoIssues.ts`.
2. Submit a report via `Report Issue` with a pinned map location and media attachments — check Firestore and Storage for created records.
3. Create an admin (via `tools/create_admin.cjs` or Firebase Console), sign in, and change an issue status to `Resolved` — upload resolution-proof media and confirm the `IssueDetail` shows it.

---

## Contributing

- Follow existing code patterns (TypeScript, Tailwind, shadcn components).
- Keep secrets out of version control.

If you'd like, I can:

- Add a `firebase.json` with sample rules & hosting config.
- Add a CI/continuous deploy workflow for Vercel or Firebase Hosting.
- Add automated tests or linters (ESLint config is present; adjust rules as needed).

---

## License

This repo does not include a license file. Add a `LICENSE` file if you plan to publish or share this project publicly.

---

If you want, I can now:

- run the `tools/create_admin.cjs` script (if you provide the `admin.json` service account and enable Email/Password in Firebase),
- add a `firebase.json` + sample Firestore rules,
- or add a CI config for deploying to Vercel/Firebase Hosting.

File: [README.md](README.md)
