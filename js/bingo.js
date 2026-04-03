let settings = {
    includeMii:     false,
    includeDash:    false,
    includeOmakase: false,
    excludedAll:    []
};

const state = {
    a: { cells: [], checked: Array(25).fill(false) },
    b: { cells: [], checked: Array(25).fill(false) }
};

const generateCount = { a: 0, b: 0 };
let teamNames = { a: 'チームA', b: 'チームB' };

const BINGO_LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
];

function getPool() {
    return FIGHTERS.filter(f => !settings.excludedAll.includes(f.id));
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let _initializing = true;

function generateBingo(id) {
    const pool = getPool();
    if (pool.length < 24) {
        alert('ファイターが少なすぎます（現在 ' + pool.length + ' 体）。少なくとも24体必要です。');
        return;
    }
    const picked = shuffle(pool).slice(0, 24);
    picked.splice(12, 0, { id: 0, name: 'free', label: '', free: true });
    state[id].cells   = picked;
    state[id].checked = Array(25).fill(false);
    state[id].checked[12] = true;
    if (!_initializing) {
        generateCount[id]++;
        updateGenerateCount(id);
    }
    renderBingo(id);
}

function updateGenerateCount(id) {
    const el = document.getElementById('gen-count-' + id);
    if (el) el.innerHTML = 'ビンゴ作成回数: <span class="count-num">' + generateCount[id] + '</span>回';
}

function resetCount(id) {
    generateCount[id] = 0;
    updateGenerateCount(id);
}

function renderBingo(id) {
    const grid = document.getElementById('bingo-' + id);
    grid.innerHTML = '';
    state[id].cells.forEach((f, i) => {
        const cell = document.createElement('div');
        const extraClass = f.free ? ' free-cell' : (state[id].checked[i] ? ' checked' : '');
        cell.className = 'bingo-cell' + extraClass;
        cell.dataset.index = i;
        if (f.free) {
            cell.innerHTML = '<span class="free-label"></span>';
        } else {
            let tagHtml = '';
            if (f.dash) tagHtml = '<div class="tag tag-dash">DASH</div>';
            if (f.mii)  tagHtml = '<div class="tag tag-mii">MII</div>';
            cell.innerHTML = tagHtml +
                '<img class="cell-img" src="images/' + f.name + '.png" alt="' + f.label + '" loading="lazy">' +
                '<div class="cell-name">' + f.label + '</div>';
            cell.addEventListener('click', (function(bid, idx){ return function(){ toggleCheck(bid, idx); }; })(id, i));
        }
        grid.appendChild(cell);
    });
    updateBingoCount(id);
}

function toggleCheck(id, i) {
    if (state[id].cells[i] && state[id].cells[i].free) return;
    state[id].checked[i] = !state[id].checked[i];
    const cells = document.getElementById('bingo-' + id).children;
    cells[i].classList.toggle('checked', state[id].checked[i]);
    updateBingoCount(id);
}

function resetChecks(id) {
    state[id].checked = Array(25).fill(false);
    if (state[id].cells[12] && state[id].cells[12].free) state[id].checked[12] = true;
    renderBingo(id);
}

function updateBingoCount(id) {
    const ch = state[id].checked;
    const cells = document.getElementById('bingo-' + id).children;
    Array.from(cells).forEach(c => c.classList.remove('bingo-line'));
    let count = 0;
    BINGO_LINES.forEach(line => {
        if (line.every(i => ch[i])) {
            count++;
            line.forEach(i => cells[i].classList.add('bingo-line'));
        }
    });
    document.getElementById('bingo-count-' + id).textContent = count === 0 ? '' : count + 'ビンゴ';
}

function updateTitles() {
    document.getElementById('title-a').textContent = teamNames.a;
    document.getElementById('title-b').textContent = teamNames.b;
}

(function init() {
    FIGHTERS.forEach(f => {
        if ((f.mii     && !settings.includeMii) ||
            (f.dash    && !settings.includeDash) ||
            (f.omakase && !settings.includeOmakase)) {
            settings.excludedAll.push(f.id);
        }
    });
    _initializing = true;
    generateBingo('a');
    generateBingo('b');
    _initializing = false;
    updateGenerateCount('a');
    updateGenerateCount('b');
})();