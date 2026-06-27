# SLUGFAST 🔪

A free, fully static **Dead by Daylight tournament bracket** site you can host on **GitHub Pages** — no server, no domain cost.

- Click any **team name** (or its picture) to see that team's members and their pictures.
- Toggle **Edit Mode** to rename teams, change pictures, edit/add/remove members, and pick match winners (winners automatically advance to the next round).
- Edits are saved in your browser (localStorage). To make changes visible to **everyone**, use **Export data.json** and replace the file in the repo (see below).

---

## 1. Put this on GitHub

1. Create a new repository on GitHub, e.g. `slugfast`.
2. Upload these files to the repo (drag-and-drop on the GitHub web UI works fine, or use git):
   - `index.html`
   - `style.css`
   - `app.js`
   - `data.json`
   - `README.md`

## 2. Turn on GitHub Pages

1. In your repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`.
3. Choose the branch (usually `main`) and folder `/ (root)`.
4. Click **Save**. After a minute, GitHub will give you a URL like:
   `https://yourusername.github.io/slugfast/`

That's it — the site is live, free, with no domain or server to pay for.

## 3. Customize your teams

You have two ways to edit content:

### A. In the browser (easiest, but only saved on your device until exported)
1. Open the site and click **✏️ Edit Mode**.
2. Click any team name or picture to open the editor: change the team name, picture URL, and each member's name/picture/role.
3. Click **Pick winner** on a slot to advance that team to the next round.
4. When you're happy with everything, click **⬇️ Export data.json** — this downloads the updated file.
5. Upload that downloaded `data.json` to your GitHub repo (replacing the old one). Now **everyone** who visits the site sees your changes, since the page loads `data.json` fresh for any visitor without saved local edits.

### B. Directly editing `data.json`
You can also just edit `data.json` by hand (in GitHub's web editor or locally) and commit it. Each team looks like this:

```json
{
  "id": "t1",
  "name": "Team One",
  "pfp": "https://example.com/picture.png",
  "members": [
    { "name": "Player 1", "pfp": "https://example.com/p1.png", "role": "Killer" },
    { "name": "Player 2", "pfp": "https://example.com/p2.png", "role": "Survivor" }
  ]
}
```

- `pfp` can be any image URL (a link to an imgur/discord image, etc.). If left blank, a placeholder picture is used.
- You can add/remove members freely; the modal will show however many you list.
- The `bracket.rounds` section defines the matches. The starter file ships with 8 teams (Quarterfinals → Semifinals → Final). To change the bracket size, add/remove matches and rounds following the same `team1`/`team2`/`winner` pattern — the app calculates how winners feed forward automatically based on match order (match index `i` in a round feeds into match `floor(i/2)` of the next round).

## Notes

- This is a 100% static site (HTML/CSS/JS) — nothing is sent to any server, so editing/exporting is all local to your browser.
- If you want a shared "live" editing experience where everyone's edits sync automatically without manually re-uploading `data.json`, you'd need a small backend or a service like Firebase — let me know if you'd like that version instead.
