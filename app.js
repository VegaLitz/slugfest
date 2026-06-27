const DB_PATH = 'tournament';
const DEFAULT_PFP = 'https://api.dicebear.com/7.x/shapes/svg?seed=blank';
const TEAM_COUNT_OPTIONS = [2, 4, 8, 16, 32];

let DATA = null;
let editMode = false;
let editingTeamId = null;
let dbRef = null;
let suppressNextSnapshot = false;

const bracketEl = document.getElementById('bracket');
const teamModal = document.getElementById('teamModal');
const editModal = document.getElementById('editModal');
const countModal = document.getElementById('countModal');
const codeModal = document.getElementById('codeModal');
const editBanner = document.getElementById('editBanner');
const connStatus = document.getElementById('connStatus');

init();

async function init() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    dbRef = firebase.database().ref(DB_PATH);

    dbRef.once('value').then(async (snap) => {
      if (!snap.exists()) {
        const seed = await fetch('seed-data.json').then(r => r.json());
        await dbRef.set(seed);
      }
    });

    dbRef.on('value', (snap) => {
      const val = snap.val();
      if (!val) return;
      if (suppressNextSnapshot) { suppressNextSnapshot = false; }
      DATA = val;
      document.getElementById('siteTitle').textContent = DATA.tournamentName || 'SLUGFAST';
      connStatus.textContent = '● live';
      connStatus.className = 'status live';
      render();
    }, (err) => {
      console.error(err);
      connStatus.textContent = 'offline — check firebase-config.js';
      connStatus.className = 'status offline';
    });
  } catch (e) {
    console.error(e);
    connStatus.textContent = 'offline — check firebase-config.js';
    connStatus.className = 'status offline';
  }

  bindGlobalControls();
}

function pushData() {
  if (!dbRef || !DATA) return;
  dbRef.set(DATA);
}

function getTeam(id) {
  return DATA.teams.find(t => t.id === id) || null;
}

/* ---------- RENDER ---------- */

function render() {
  if (!DATA) return;
  bracketEl.innerHTML = '';
  DATA.bracket.rounds.forEach((round, rIdx) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'round';

    const title = document.createElement('div');
    title.className = 'round-title';
    title.textContent = round.name;
    roundEl.appendChild(title);

    const matchesWrap = document.createElement('div');
    matchesWrap.className = 'round-matches';

    round.matches.forEach(match => {
      matchesWrap.appendChild(renderMatch(match, rIdx));
    });

    roundEl.appendChild(matchesWrap);
    bracketEl.appendChild(roundEl);
  });
}

function renderMatch(match, roundIdx) {
  const matchEl = document.createElement('div');
  matchEl.className = 'match' + (editMode ? ' editing' : '');
  matchEl.dataset.matchId = match.id;

  matchEl.appendChild(renderSlot(match, 'team1', roundIdx));
  matchEl.appendChild(renderSlot(match, 'team2', roundIdx));

  return matchEl;
}

function renderSlot(match, slotKey, roundIdx) {
  const teamId = match[slotKey];
  const team = teamId ? getTeam(teamId) : null;
  const isWinner = match.winner && match.winner === teamId;

  const slot = document.createElement('div');
  slot.className = 'slot' + (team ? '' : ' empty') + (isWinner ? ' winner' : '');

  const img = document.createElement('img');
  img.className = 'slot-pfp';
  img.src = team ? (team.pfp || DEFAULT_PFP) : DEFAULT_PFP;
  img.alt = '';

  const nameBtn = document.createElement('button');
  nameBtn.className = 'slot-name';
  nameBtn.textContent = team ? team.name : 'TBD';

  if (team) {
    if (editMode) {
      nameBtn.addEventListener('click', () => openEditModal(team.id));
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openEditModal(team.id));
    } else {
      nameBtn.addEventListener('click', () => openTeamModal(team.id));
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openTeamModal(team.id));
    }
  }

  slot.appendChild(img);
  slot.appendChild(nameBtn);

  if (team && editMode) {
    const pickBtn = document.createElement('button');
    pickBtn.className = 'slot-pick';
    pickBtn.textContent = isWinner ? '✓ Winner' : 'Pick winner';
    pickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setWinner(match.id, teamId, roundIdx);
    });
    slot.appendChild(pickBtn);
  }

  return slot;
}

/* ---------- WINNER PROPAGATION ---------- */

function setWinner(matchId, teamId, roundIdx) {
  const round = DATA.bracket.rounds[roundIdx];
  const matchIndex = round.matches.findIndex(m => m.id === matchId);
  const match = round.matches[matchIndex];
  match.winner = teamId;

  const nextRound = DATA.bracket.rounds[roundIdx + 1];
  if (nextRound) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const slotKey = matchIndex % 2 === 0 ? 'team1' : 'team2';
    const nextMatch = nextRound.matches[nextMatchIndex];
    if (nextMatch[slotKey] !== teamId) {
      nextMatch[slotKey] = teamId;
      clearDownstream(roundIdx + 1, nextMatchIndex);
    }
  }

  render();
  pushData();
}

function clearDownstream(roundIdx, matchIndex) {
  const round = DATA.bracket.rounds[roundIdx];
  if (!round) return;
  const match = round.matches[matchIndex];
  if (!match) return;
  if (match.winner !== null) {
    match.winner = null;
    const nextRound = DATA.bracket.rounds[roundIdx + 1];
    if (nextRound) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const slotKey = matchIndex % 2 === 0 ? 'team1' : 'team2';
      nextRound.matches[nextMatchIndex][slotKey] = null;
      clearDownstream(roundIdx + 1, nextMatchIndex);
    }
  }
}

/* ---------- TEAM VIEW MODAL ---------- */

function openTeamModal(teamId) {
  const team = getTeam(teamId);
  if (!team) return;

  document.getElementById('modalPfp').src = team.pfp || DEFAULT_PFP;
  document.getElementById('modalName').textContent = team.name;

  const membersWrap = document.getElementById('modalMembers');
  membersWrap.innerHTML = '';

  (team.members || []).forEach(m => {
    const row = document.createElement('div');
    row.className = 'member-row';

    const img = document.createElement('img');
    img.src = m.pfp || DEFAULT_PFP;
    img.alt = '';

    const info = document.createElement('div');
    info.className = 'member-info';
    const name = document.createElement('div');
    name.className = 'member-name';
    name.textContent = m.name;
    const role = document.createElement('div');
    role.className = 'member-role';
    role.textContent = m.role || '';

    info.appendChild(name);
    info.appendChild(role);
    row.appendChild(img);
    row.appendChild(info);
    membersWrap.appendChild(row);
  });

  teamModal.classList.add('show');
}

document.getElementById('modalClose').addEventListener('click', () => teamModal.classList.remove('show'));
teamModal.addEventListener('click', (e) => { if (e.target === teamModal) teamModal.classList.remove('show'); });

/* ---------- EDIT TEAM MODAL ---------- */

function openEditModal(teamId) {
  editingTeamId = teamId;
  const team = getTeam(teamId);
  const body = document.getElementById('editModalBody');
  body.innerHTML = '';

  body.appendChild(field('Team name', 'team-name', team.name));
  body.appendChild(field('Team picture URL', 'team-pfp', team.pfp || ''));

  const membersHeader = document.createElement('span');
  membersHeader.className = 'edit-label';
  membersHeader.textContent = 'Members';
  body.appendChild(membersHeader);

  const membersList = document.createElement('div');
  membersList.id = 'editMembersList';
  body.appendChild(membersList);

  (team.members || []).forEach((m, idx) => membersList.appendChild(memberFieldRow(m, idx)));

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add member';
  addBtn.style.marginTop = '10px';
  addBtn.addEventListener('click', () => {
    membersList.appendChild(memberFieldRow({ name: '', pfp: '', role: '' }, membersList.children.length));
  });
  body.appendChild(addBtn);

  editModal.classList.add('show');
}

function field(labelText, key, value) {
  const wrap = document.createElement('div');
  const label = document.createElement('span');
  label.className = 'edit-label';
  label.textContent = labelText;
  const input = document.createElement('input');
  input.className = 'edit-field';
  input.dataset.key = key;
  input.value = value;
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function memberFieldRow(member, idx) {
  const row = document.createElement('div');
  row.className = 'member-row';
  row.dataset.idx = idx;
  row.style.flexWrap = 'wrap';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.style.marginLeft = 'auto';
  removeBtn.addEventListener('click', () => row.remove());

  const nameInput = document.createElement('input');
  nameInput.className = 'edit-field member-name-input';
  nameInput.placeholder = 'Member name';
  nameInput.value = member.name || '';

  const pfpInput = document.createElement('input');
  pfpInput.className = 'edit-field member-pfp-input';
  pfpInput.placeholder = 'Picture URL';
  pfpInput.value = member.pfp || '';

  const roleInput = document.createElement('input');
  roleInput.className = 'edit-field member-role-input';
  roleInput.placeholder = 'Role (e.g. Killer / Survivor)';
  roleInput.value = member.role || '';

  const innerWrap = document.createElement('div');
  innerWrap.style.flex = '1';
  innerWrap.appendChild(nameInput);
  innerWrap.appendChild(pfpInput);
  innerWrap.appendChild(roleInput);

  row.appendChild(innerWrap);
  row.appendChild(removeBtn);
  return row;
}

document.getElementById('editModalClose').addEventListener('click', () => editModal.classList.remove('show'));
editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.classList.remove('show'); });

document.getElementById('editSaveBtn').addEventListener('click', () => {
  const team = getTeam(editingTeamId);
  if (!team) return;

  const nameInput = document.querySelector('[data-key="team-name"]');
  const pfpInput = document.querySelector('[data-key="team-pfp"]');
  team.name = nameInput.value.trim() || team.name;
  team.pfp = pfpInput.value.trim();

  const memberRows = document.querySelectorAll('#editMembersList .member-row');
  const newMembers = [];
  memberRows.forEach(row => {
    const name = row.querySelector('.member-name-input').value.trim();
    const pfp = row.querySelector('.member-pfp-input').value.trim();
    const role = row.querySelector('.member-role-input').value.trim();
    if (name) newMembers.push({ name, pfp, role });
  });
  team.members = newMembers;

  render();
  pushData();
  editModal.classList.remove('show');
});

/* ---------- BRACKET GENERATION (for resizing team count) ---------- */

function roundName(numMatches) {
  if (numMatches === 1) return 'Final';
  if (numMatches === 2) return 'Semifinals';
  if (numMatches === 4) return 'Quarterfinals';
  return 'Round of ' + (numMatches * 2);
}

function generateTournament(teamCount, existingTeams) {
  const teams = [];
  for (let i = 0; i < teamCount; i++) {
    const id = 't' + (i + 1);
    const existing = existingTeams.find(t => t.id === id);
    teams.push(existing || {
      id,
      name: 'Team ' + (i + 1),
      pfp: '',
      members: [
        { name: 'Player 1', pfp: '', role: 'Killer' },
        { name: 'Player 2', pfp: '', role: 'Survivor' },
        { name: 'Player 3', pfp: '', role: 'Survivor' },
        { name: 'Player 4', pfp: '', role: 'Survivor' }
      ]
    });
  }

  const rounds = [];
  let matchCounter = 1;
  let currentRoundSize = teamCount / 2;
  let firstRound = true;

  while (currentRoundSize >= 1) {
    const matches = [];
    for (let i = 0; i < currentRoundSize; i++) {
      if (firstRound) {
        matches.push({
          id: 'm' + matchCounter++,
          team1: teams[i * 2] ? teams[i * 2].id : null,
          team2: teams[i * 2 + 1] ? teams[i * 2 + 1].id : null,
          winner: null
        });
      } else {
        matches.push({ id: 'm' + matchCounter++, team1: null, team2: null, winner: null });
      }
    }
    rounds.push({ name: roundName(currentRoundSize), matches });
    firstRound = false;
    currentRoundSize = currentRoundSize / 2;
  }

  return { teams, rounds };
}

/* ---------- TOOLBAR ---------- */

function bindGlobalControls() {
  document.getElementById('editToggle').addEventListener('click', () => {
    if (!editMode) {
      const unlocked = sessionStorage.getItem('slugfast_unlocked') === 'true';
      if (unlocked || !window.EDIT_CODE) {
        enterEditMode();
      } else {
        codeModal.classList.add('show');
      }
    } else {
      editMode = false;
      editBanner.classList.remove('show');
      document.getElementById('editToggle').textContent = '✏️ Edit Mode';
      render();
    }
  });

  document.getElementById('codeModalClose').addEventListener('click', () => codeModal.classList.remove('show'));
  codeModal.addEventListener('click', (e) => { if (e.target === codeModal) codeModal.classList.remove('show'); });
  document.getElementById('codeSubmitBtn').addEventListener('click', () => {
    const val = document.getElementById('codeInput').value;
    if (val === EDIT_CODE) {
      sessionStorage.setItem('slugfast_unlocked', 'true');
      codeModal.classList.remove('show');
      document.getElementById('codeInput').value = '';
      enterEditMode();
    } else {
      alert('Incorrect edit code.');
    }
  });

  document.getElementById('shareBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('shareBtn');
      const original = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });

  document.getElementById('teamCountBtn').addEventListener('click', () => {
    const wrap = document.getElementById('countOptions');
    wrap.innerHTML = '';
    countModal.classList.add('show');
    TEAM_COUNT_OPTIONS.forEach(n => {
      const btn = document.createElement('button');
      btn.textContent = n + ' teams';
      if (DATA && DATA.teamCount === n) btn.className = 'primary';
      btn.addEventListener('click', () => {
        if (!editMode) {
          alert('Turn on Edit Mode first to change the number of teams.');
          return;
        }
        if (!confirm('Change to ' + n + ' teams? This will rebuild the bracket (existing winners are reset).')) return;
        const { teams, rounds } = generateTournament(n, DATA.teams || []);
        DATA.teamCount = n;
        DATA.teams = teams;
        DATA.bracket = { rounds };
        render();
        pushData();
        countModal.classList.remove('show');
      });
      wrap.appendChild(btn);
    });
  });
  document.getElementById('countModalClose').addEventListener('click', () => countModal.classList.remove('show'));
  countModal.addEventListener('click', (e) => { if (e.target === countModal) countModal.classList.remove('show'); });
}

function enterEditMode() {
  editMode = true;
  editBanner.classList.add('show');
  document.getElementById('editToggle').textContent = '✅ Exit Edit Mode';
  render();
}
