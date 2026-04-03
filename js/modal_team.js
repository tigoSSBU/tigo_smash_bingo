function openModal() {
    document.getElementById('chk-mii').checked     = settings.includeMii;
    document.getElementById('chk-dash').checked    = settings.includeDash;
    document.getElementById('chk-omakase').checked = settings.includeOmakase;
    document.getElementById('fighter-search').value = '';
    buildAllFightersGrid();
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

function overlayClick(e) {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function buildAllFightersGrid(query) {
    const grid = document.getElementById('exclude-all-grid');
    grid.innerHTML = '';
    const q = (query || '').trim();

    FIGHTERS.forEach(f => {
        if (q && !f.label.includes(q)) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.id = f.id;
        btn.className = 'exclude-btn' + (settings.excludedAll.includes(f.id) ? ' excluded' : '');

        const len = f.label.length;
        const fs  = len <= 4 ? '0.60rem' : len <= 6 ? '0.52rem' : len <= 8 ? '0.44rem' : '0.36rem';
        btn.innerHTML =
            '<img class="ex-img" src="images/' + f.name + '.png" alt="' + f.label + '">' +
            '<span class="ex-name" style="font-size:' + fs + '">' + f.label + '</span>';

        btn.addEventListener('click', () => btn.classList.toggle('excluded'));
        grid.appendChild(btn);
    });
}

function filterFighterGrid() {
    buildAllFightersGrid(document.getElementById('fighter-search').value);
}

function onCheckboxChange(type, checked) {
    if (checked) {
        settings.excludedAll = settings.excludedAll.filter(id => {
            const f = FIGHTERS.find(f => f.id === id);
            if (!f) return true;
            if (type === 'mii'     && f.mii)     return false;
            if (type === 'dash'    && f.dash)    return false;
            if (type === 'omakase' && f.omakase) return false;
            return true;
        });
    } else {
        FIGHTERS.forEach(f => {
            const match =
                (type === 'mii'     && f.mii) ||
                (type === 'dash'    && f.dash) ||
                (type === 'omakase' && f.omakase);
            if (match && !settings.excludedAll.includes(f.id)) {
                settings.excludedAll.push(f.id);
            }
        });
    }
    buildAllFightersGrid(document.getElementById('fighter-search').value);
}

function saveSettings() {
    settings.includeMii     = document.getElementById('chk-mii').checked;
    settings.includeDash    = document.getElementById('chk-dash').checked;
    settings.includeOmakase = document.getElementById('chk-omakase').checked;
    settings.excludedAll = [...document.querySelectorAll('#exclude-all-grid .exclude-btn.excluded')]
        .map(b => Number(b.dataset.id));
    closeModal();
}

let playerCount = 4;

function addPlayerField() {
    playerCount++;
    const container = document.getElementById('player-inputs');
    const group = document.createElement('div');
    group.className = 'player-input-group';
    group.id = 'player-group-' + playerCount;
    group.innerHTML =
        '<label>プレイヤー ' + playerCount + '</label>' +
        '<div style="display:flex;gap:4px;align-items:center;">' +
        '<input type="text" id="player-' + playerCount + '" placeholder="名前を入力" maxlength="20">' +
        '<button type="button" class="remove-player-btn" onclick="removePlayerField(' + playerCount + ')">×</button></div>';
    container.appendChild(group);
}

function removePlayerField(num) {
    const group = document.getElementById('player-group-' + num);
    if (group) group.remove();
}

function getPlayerNames() {
    const names = [];
    for (let i = 1; i <= playerCount; i++) {
        const el = document.getElementById('player-' + i);
        if (el && el.value.trim()) names.push(el.value.trim());
    }
    return names;
}

function divideTeams() {
    const names = getPlayerNames();
    if (names.length < 2) { alert('2人以上の名前を入力してください。'); return; }
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const half  = Math.ceil(shuffled.length / 2);
    const teamA = shuffled.slice(0, half);
    const teamB = shuffled.slice(half);
    teamNames.a = teamA.join(' & ');
    teamNames.b = teamB.join(' & ');
    updateTitles();
    document.getElementById('team-result').innerHTML =
        '<div class="team-box"><h3>' + teamNames.a + '</h3><ul>' +
        teamA.map(n => '<li>' + n + '</li>').join('') + '</ul></div>' +
        '<div class="team-box"><h3>' + teamNames.b + '</h3><ul>' +
        teamB.map(n => '<li>' + n + '</li>').join('') + '</ul></div>';
}