// 1. Go to https://console.firebase.google.com and create a free project (no credit card needed).
// 2. In the project, click "Build > Realtime Database" and create a database
//    (choose "Start in test mode" so it works immediately).
// 3. Click the gear icon (Project settings) > scroll to "Your apps" > click the </> (web) icon
//    to register a web app. Firebase will show you a config object like the one below.
// 4. Copy/paste your own values into the object below, replacing the placeholders.
// 5. Commit this file to your GitHub repo. That's it — no server, no payment required.

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Optional: a simple "edit code" so random visitors can't casually click into Edit Mode.
// This is NOT real security (anyone determined could still read this file or your DB) —
// it's just a friction layer for casual sharing. Change it to whatever you like.
const EDIT_CODE = "slugfast";
