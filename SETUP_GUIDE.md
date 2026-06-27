# SLUGFAST — Full Step-by-Step Setup Guide

This walks through every click, from "I have zero accounts" to "my tournament link is live and shared." Total time: ~15 minutes. Everything used is free.

---

## PART 1 — Create your Firebase project (the live database)

1. Go to **https://console.firebase.google.com**
2. Sign in with any Google account (make one if you don't have one — it's free).
3. Click **"Add project"** (or "Create a project").
4. Type a project name, e.g. `slugfast`. Click **Continue**.
5. It will ask about Google Analytics — toggle it **off** (you don't need it). Click **Create project**.
6. Wait ~30 seconds while it provisions, then click **Continue** to enter the project dashboard.

### 1a. Turn on the Realtime Database
7. In the left sidebar, find **Build** and click to expand it.
8. Click **Realtime Database**.
9. Click **"Create Database"**.
10. Pick a server location (any region close to you is fine). Click **Next**.
11. You'll see two options for security rules:
    - **Locked mode**
    - **Test mode** ← choose this one
12. Click **Enable**.

You now have a live database. It will have a URL that looks like:
`https://slugfast-xxxxx-default-rtdb.firebaseio.com`

### 1b. Register a "web app" to get your config keys
13. Click the **gear icon ⚙️** next to "Project Overview" (top-left) → **Project settings**.
14. Scroll down to the **"Your apps"** section.
15. Click the **`</>`** icon (this means "web app").
16. Give it a nickname, e.g. `slugfast-web`. Leave Firebase Hosting unchecked. Click **Register app**.
17. Firebase now shows you a code block called `firebaseConfig` that looks like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "slugfast-xxxxx.firebaseapp.com",
  databaseURL: "https://slugfast-xxxxx-default-rtdb.firebaseio.com",
  projectId: "slugfast-xxxxx",
  storageBucket: "slugfast-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

18. **Keep this browser tab open** — you'll copy these exact values in Part 3. Click **Continue to console** when ready to move on.

---

## PART 2 — Create your GitHub repository

1. Go to **https://github.com** and sign in (or create a free account).
2. Click the **+** icon top-right → **New repository**.
3. Repository name: `slugfast` (or anything you like).
4. Set visibility to **Public** (GitHub Pages free tier requires public repos, unless you have GitHub Pro).
5. Leave "Add a README" **unchecked** — you'll upload your own files.
6. Click **Create repository**.

You'll land on an empty repo page with an "uploading an existing file" link.

### 2a. Upload the project files
7. Click **"uploading an existing file"** (or "Add file" → "Upload files" if you don't see that link).
8. Drag in all 6 files from the project folder you downloaded:
   - `index.html`
   - `style.css`
   - `app.js`
   - `firebase-config.js`
   - `seed-data.json`
   - `README.md`
9. Scroll down, click **Commit changes**.

You should now see all 6 files listed in your repo.

---

## PART 3 — Plug your Firebase keys into the site

You need to edit `firebase-config.js` inside GitHub so the site knows which database to talk to.

1. In your repo, click on **`firebase-config.js`** to open it.
2. Click the **pencil icon ✏️** (top-right of the file view) to edit it directly in the browser.
3. Replace the placeholder object with your real values from Part 1, step 17. It should end up looking like:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "slugfast-xxxxx.firebaseapp.com",
  databaseURL: "https://slugfast-xxxxx-default-rtdb.firebaseio.com",
  projectId: "slugfast-xxxxx",
  storageBucket: "slugfast-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};

const EDIT_CODE = "slugfast";
```

4. (Optional but recommended) Change `"slugfast"` in `EDIT_CODE` to your own private word/PIN — this is what people will type to unlock Edit Mode.
5. Scroll down, click **Commit changes**.

---

## PART 4 — Turn on GitHub Pages (this makes it a live website)

1. In your repo, click **Settings** (top tab bar, with the gear icon).
2. In the left sidebar, click **Pages**.
3. Under **"Build and deployment"** → **Source**, choose **"Deploy from a branch"**.
4. Under **Branch**, choose `main` and folder `/ (root)`. Click **Save**.
5. Wait about 30–60 seconds. Refresh the page.
6. You'll see a green box: **"Your site is live at https://yourusername.github.io/slugfast/"**

Click that link — open it!

---

## PART 5 — Verify everything works

1. Open your new site link. You should see the SLUGFAST header and a bracket appear after a second (it's loading from Firebase).
2. Check the small text under the title — it should say **"● live"** in a greenish color. If it says **"offline — check firebase-config.js"**, go back to Part 3 and double check you pasted the values correctly (common mistake: missing a comma, or leaving in a placeholder value like `"YOUR_API_KEY"`).
3. Click **✏️ Edit Mode**. It will ask for your edit code — type the one from Part 3, step 4 (or `slugfast` if you didn't change it).
4. Click on a team name — an edit window should pop up letting you change the name, picture URL, and members.
5. Make a small test change (e.g. rename "Team 1" to "Test Team") and click **Save**.
6. Open the site in a **second browser tab** (or on your phone) — you should see "Test Team" appear there too, live, with no refresh needed. That confirms the live sync is working.
7. Click **🔢 Number of teams** (while still in Edit Mode) and try switching to a different number — confirm the bracket rebuilds.
8. Click **🔗 Copy link** and send that URL to a friend to test from their device.

---

## PART 6 — Share it with your tournament participants

Just send them the GitHub Pages URL from Part 4, step 6 (e.g. `https://yourusername.github.io/slugfast/`). They don't need any account, login, or installation — it just opens in their browser. Only people who know your edit code can change things; everyone else can browse and click into teams to see members.

---

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Status shows "offline" | `firebase-config.js` still has placeholder text, or a typo (missing quote/comma). Re-copy the values from Firebase Project Settings → Your apps. |
| Bracket never appears, blank page | Open browser dev tools (F12) → Console tab, look for a red error. Most common: the `databaseURL` value is wrong or missing `https://`. |
| Edits don't show up for others | Make sure you clicked **Save** in the edit popup (not just closed it), and check the "live" status indicator is green on both devices. |
| "Permission denied" error in console | Your Firebase Realtime Database rules reverted to locked mode, or the 30-day test-mode window expired. Go to Firebase Console → Realtime Database → **Rules** tab, set both `.read` and `.write` to `true`, click **Publish**. |
| Edit code doesn't work | It's case-sensitive — check `firebase-config.js` for the exact `EDIT_CODE` value you set. |
| Want to reset the bracket back to defaults | Go to Firebase Console → Realtime Database → click the **⋮** menu on the `tournament` node → Delete. Reload your site — it will reseed itself from `seed-data.json`. |

---

## Quick reference: what each file does

| File | Purpose |
|---|---|
| `index.html` | Page layout, loads Firebase + your scripts |
| `style.css` | All visual styling |
| `firebase-config.js` | Your personal Firebase keys + edit code (edit this) |
| `app.js` | All the logic: rendering the bracket, live sync, editing, resizing |
| `seed-data.json` | Starting data, only used the very first time the database is empty |
