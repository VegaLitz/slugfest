# SLUGFAST 🔪 — Live Edition

A free **live, shared** Dead by Daylight tournament bracket. Anyone with the link sees the same bracket update in real time — no server you manage, no domain cost. Hosting is GitHub Pages (free); live sync is powered by Firebase's free tier (no credit card required).

## Features
- Click any team name/picture → see that team's members and their pictures.
- **Edit Mode** (optionally locked behind a simple edit code) lets you rename teams, change pictures, edit members, pick match winners, and **change how many teams are in the tournament** (2/4/8/16/32).
- Every change is pushed to Firebase instantly, and everyone with the page open sees it live — no refresh needed.
- **Copy link** button to quickly share the URL.

---

## Setup (10 minutes, all free)

### 1. Create a free Firebase project
1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project**, give it a name (e.g. `slugfast`), and finish creation (you can skip Google Analytics).
3. In the left sidebar, go to **Build → Realtime Database** → **Create Database**.
4. Pick any region, then choose **Start in test mode** (this lets the page read/write without you wiring up authentication — fine for a casual tournament tool). Click **Enable**.
5. Click the gear icon next to "Project Overview" → **Project settings**. Scroll to **Your apps**, click the **</>** (web) icon, and register an app (no need for Firebase Hosting).
6. Firebase will show you a `firebaseConfig` object. Copy those values.

### 2. Fill in `firebase-config.js`
Open `firebase-config.js` in this project and paste your values in, e.g.:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "slugfast-12345.firebaseapp.com",
  databaseURL: "https://slugfast-12345-default-rtdb.firebaseio.com",
  projectId: "slugfast-12345",
  storageBucket: "slugfast-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

You can also change `EDIT_CODE` in that same file to anything you like — it's a simple PIN so random visitors can't casually flip into Edit Mode. (It's not bulletproof security, just friction — see the security note below.)

### 3. Upload to GitHub & enable Pages
1. Create a GitHub repo (e.g. `slugfast`) and upload all the files: `index.html`, `style.css`, `app.js`, `firebase-config.js`, `seed-data.json`, `README.md`.
2. Go to **Settings → Pages** in the repo, set Source to "Deploy from a branch", pick your main branch and `/ (root)`, save.
3. Your live site will be at `https://yourusername.github.io/slugfast/`.
4. The first time anyone loads the page, it seeds the Firebase database from `seed-data.json` automatically. After that, all data lives in Firebase and every visitor sees the same live bracket.

### 4. Share it
Click **Copy link** in the site, or just send your GitHub Pages URL to participants. Anyone you give the edit code to can manage the bracket; everyone else can browse and click into teams.

---

## Changing the number of teams
In Edit Mode, click **🔢 Number of teams** and pick 2/4/8/16/32. The bracket rebuilds automatically (Round of N → … → Semifinals → Final), keeping existing team names/pictures/members where the team still exists, and resetting picked winners (since the bracket shape changed).

Want a number that's not a power of two (e.g. 6 or 12 teams with byes)? Let me know and I can add custom byes — the current version supports clean power-of-two brackets only.

## Security note
Firebase "test mode" rules allow anyone who knows your database URL to read/write it directly (bypassing the site's edit code), and test-mode rules expire after 30 days by default (after which writes will stop working until you update the rules). For a casual/free tournament this is usually fine, but if you want it locked down long-term:
- In Firebase Console → Realtime Database → **Rules**, set rules to `".read": true, ".write": true` to keep them open past the 30-day window, or
- Add Firebase Authentication (e.g. anonymous or email sign-in) and restrict `.write` to signed-in users for real security. Happy to set this up if you want.

## Files
- `index.html` — page structure, loads Firebase SDK + app
- `style.css` — all styling
- `firebase-config.js` — your Firebase keys + edit code (fill this in!)
- `app.js` — bracket rendering, live sync, editing, team-count resizing
- `seed-data.json` — initial data used only the very first time the database is empty
