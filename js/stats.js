const Stats = (function () {

    const ROMAJI_TO_HIRAGANA_MAP = {
        'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お', 'n': 'ん',

        'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
        'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
        'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
        'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',

        'sa': 'さ', 'su': 'す', 'se': 'せ', 'so': 'そ',
        'si': 'し', 'shi': 'し', 'she': 'しぇ',
        'sya': 'しゃ', 'sha': 'しゃ', 'syu': 'しゅ', 'shu': 'しゅ', 'syo': 'しょ', 'sho': 'しょ',
        'za': 'ざ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
        'zi': 'じ', 'ji': 'じ',
        'zya': 'じゃ', 'ja': 'じゃ', 'jya': 'じゃ', 'zyu': 'じゅ', 'ju': 'じゅ', 'jyu': 'じゅ',
        'zyo': 'じょ', 'jo': 'じょ', 'jyo': 'じょ',

        'ta': 'た', 'te': 'て', 'to': 'と',
        'ti': 'ち', 'chi': 'ち',
        'tu': 'つ', 'tsu': 'つ',
        'tya': 'ちゃ', 'cha': 'ちゃ', 'tyu': 'ちゅ', 'chu': 'ちゅ', 'tyo': 'ちょ', 'cho': 'ちょ',
        'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
        'dya': 'ぢゃ', 'dyu': 'ぢゅ', 'dyo': 'ぢょ',

        'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
        'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',

        'ha': 'は', 'hi': 'ひ', 'he': 'へ', 'ho': 'ほ',
        'hu': 'ふ', 'fu': 'ふ',
        'fa': 'ふぁ', 'fi': 'ふぃ', 'fe': 'ふぇ', 'fo': 'ふぉ',
        'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
        'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
        'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
        'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
        'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',

        'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
        'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',

        'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',

        'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
        'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',

        'wa': 'わ', 'wo': 'を',
    };

    function fullwidthAlnumToHalfwidth(s) {
        return s.replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
    }

    function katakanaToHiragana(s) {
        return s.replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
    }

    function romajiClusterToHiragana(cluster) {
        let result = '';
        let i = 0;
        const len = cluster.length;

        while (i < len) {
            let matched = false;

            for (const tryLen of [3, 2, 1]) {
                if (i + tryLen > len) continue;
                const sub = cluster.substr(i, tryLen);
                if (ROMAJI_TO_HIRAGANA_MAP[sub]) {
                    result += ROMAJI_TO_HIRAGANA_MAP[sub];
                    i += tryLen;
                    matched = true;
                    break;
                }
            }
            if (matched) continue;

            const current = cluster[i];
            const next = (i + 1 < len) ? cluster[i + 1] : '';
            const isVowelOrN = ['a', 'i', 'u', 'e', 'o', 'n'].includes(current);
            if (!isVowelOrN && current === next) {
                result += 'っ';
                i += 1;
                continue;
            }

            result += current;
            i += 1;
        }

        return result;
    }

    function romajiToHiragana(s) {
        return s.replace(/[a-z]+/g, cluster => romajiClusterToHiragana(cluster));
    }

    function normalizeBasic(s) {
        s = s.trim();
        s = s.replace(/[\s\u3000]+/g, '');
        if (s === '') return '';
        s = fullwidthAlnumToHalfwidth(s);
        s = s.toLowerCase();
        return s;
    }

    function normalizeName(raw) {
        let s = normalizeBasic(raw);
        if (s === '') return '';
        s = katakanaToHiragana(s);
        s = romajiToHiragana(s);
        return s;
    }

    function utf8ToBase64(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        bytes.forEach(b => { binary += String.fromCharCode(b); });
        return btoa(binary);
    }

    function base64ToUtf8(b64) {
        const binary = atob(b64.replace(/\s/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    const teamPlayers = { a: [], b: [] };
    const recordedLines = { a: new Set(), b: new Set() };
    let matchDecided = false;
    let rankingsCache = [];
    let sortMode = 'bingo';

    function setTeams(teams) {
        teamPlayers.a = Array.isArray(teams.a) ? teams.a.slice() : [];
        teamPlayers.b = Array.isArray(teams.b) ? teams.b.slice() : [];
        startNewMatch();
    }

    function startNewMatch() {
        recordedLines.a = new Set();
        recordedLines.b = new Set();
        matchDecided = false;
    }

    function isTracked(id) {
        return teamPlayers[id] && teamPlayers[id].length > 0;
    }

    function handleBingoUpdate(id, completedLineIndexes) {
        const recorded = recordedLines[id];
        const newly = completedLineIndexes.filter(idx => !recorded.has(idx));
        if (newly.length === 0) {
            return;
        }
        newly.forEach(idx => recorded.add(idx));

        const bingoNames = isTracked(id) ? teamPlayers[id] : [];
        const bingoAmount = newly.length;

        let matchWinners = null;
        let matchLosers = null;
        if (!matchDecided && recorded.size >= 2) {
            matchDecided = true;
            const winnerId = id;
            const loserId  = (id === 'a') ? 'b' : 'a';
            matchWinners = isTracked(winnerId) ? teamPlayers[winnerId] : [];
            matchLosers  = isTracked(loserId)  ? teamPlayers[loserId]  : [];
        }

        recordUpdate(bingoNames, bingoAmount, matchWinners, matchLosers);
    }

    function isGithubConfigured() {
        return typeof GITHUB_CONFIG !== 'undefined' &&
            GITHUB_CONFIG.owner && GITHUB_CONFIG.owner !== 'YOUR_GITHUB_USERNAME' &&
            GITHUB_CONFIG.repo  && GITHUB_CONFIG.repo  !== 'YOUR_REPOSITORY_NAME' &&
            GITHUB_CONFIG.token && GITHUB_CONFIG.token !== 'EREH_STNEMGARF_NEKOT_DEDOCNE_RUOY';
    }

    function githubApiUrl() {
        return 'https://api.github.com/repos/' + GITHUB_CONFIG.owner + '/' +
            GITHUB_CONFIG.repo + '/contents/' + GITHUB_CONFIG.dataPath;
    }

    async function fetchCurrentFileAndSha() {
        const cacheBuster = '&_=' + Date.now();
        const url = githubApiUrl() + '?ref=' + encodeURIComponent(GITHUB_CONFIG.branch) + cacheBuster;
        const res = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + GITHUB_CONFIG.token,
                'Accept': 'application/vnd.github+json',
            },
            cache: 'no-store',
        });

        if (res.status === 404) {
            return { players: [], sha: null };
        }
        if (!res.ok) {
            throw new Error('GitHubからの読み込みに失敗しました（status: ' + res.status + '）');
        }

        const json = await res.json();
        let data;
        try {
            data = JSON.parse(base64ToUtf8(json.content));
        } catch (e) {
            data = { players: [] };
        }
        if (!Array.isArray(data.players)) {
            data.players = [];
        }
        return { players: data.players, sha: json.sha };
    }

    async function putFile(players, sha) {
        const body = {
            message: 'ランキングデータを更新',
            content: utf8ToBase64(JSON.stringify({ players }, null, 2)),
            branch: GITHUB_CONFIG.branch,
        };
        if (sha) {
            body.sha = sha;
        }

        const res = await fetch(githubApiUrl(), {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + GITHUB_CONFIG.token,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (res.status === 409) {
            const err = new Error('CONFLICT');
            err.isConflict = true;
            throw err;
        }
        if (!res.ok) {
            throw new Error('GitHubへの書き込みに失敗しました（status: ' + res.status + '）');
        }
        return res.json();
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const MAX_CONFLICT_RETRY = 8;

    async function readModifyWrite(mutatorFn, attempt) {
        attempt = attempt || 0;
        const current = await fetchCurrentFileAndSha();
        const updatedPlayers = mutatorFn(current.players.slice());

        try {
            await putFile(updatedPlayers, current.sha);
            rankingsCache = updatedPlayers;
            renderRankings();
        } catch (err) {
            if (err.isConflict && attempt < MAX_CONFLICT_RETRY) {
                const delay = 250 * (attempt + 1) + Math.random() * 250;
                await sleep(delay);
                return readModifyWrite(mutatorFn, attempt + 1);
            }
            throw err;
        }
    }

    let writeQueue = Promise.resolve();
    function queueWrite(mutatorFn) {
        const resultPromise = writeQueue.then(() => readModifyWrite(mutatorFn));
        writeQueue = resultPromise.catch(() => {});
        return resultPromise;
    }

    function findOrCreatePlayer(players, rawName) {
        const key = normalizeName(rawName);
        if (key === '') return null;

        let player = players.find(p => p.key === key);
        if (!player) {
            player = { key, name: rawName.trim(), bingo_count: 0, wins: 0, matches: 0 };
            players.push(player);
        }
        return player;
    }

    function recordUpdate(bingoNames, bingoAmount, matchWinners, matchLosers) {
        const isMatchEvent = matchWinners !== null || matchLosers !== null;

        if (!isGithubConfigured()) {
            if (isMatchEvent) matchDecided = false;
            return;
        }

        const names = (bingoNames || []).map(n => String(n).trim()).filter(n => n !== '');
        const hasBingoUpdate = bingoAmount > 0 && names.length > 0;

        const winners = (matchWinners || []).map(n => String(n).trim()).filter(n => n !== '');
        const losers  = (matchLosers  || []).map(n => String(n).trim()).filter(n => n !== '');
        const hasMatchUpdate = isMatchEvent && (winners.length > 0 || losers.length > 0);

        if (!hasBingoUpdate && !hasMatchUpdate) {
            if (isMatchEvent) matchDecided = false;
            return;
        }

        queueWrite(players => {
            if (hasBingoUpdate) {
                names.forEach(name => {
                    const player = findOrCreatePlayer(players, name);
                    if (player) player.bingo_count += bingoAmount;
                });
            }
            if (hasMatchUpdate) {
                winners.forEach(name => {
                    const player = findOrCreatePlayer(players, name);
                    if (player) { player.wins += 1; player.matches += 1; }
                });
                losers.forEach(name => {
                    const player = findOrCreatePlayer(players, name);
                    if (player) { player.matches += 1; }
                });
            }
            return players;
        }).catch(err => {
            console.error('ランキング記録の書き込みに失敗しました:', err);
            if (isMatchEvent) matchDecided = false;
        });
    }

    function fetchRankings() {
        fetch('data/rankings.json', { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error('rankings.jsonの取得に失敗しました');
                return res.json();
            })
            .then(data => {
                rankingsCache = Array.isArray(data.players) ? data.players : [];
                renderRankings();
            })
            .catch(() => {
                rankingsCache = [];
                renderRankings();
            });
    }

    function setSortMode(mode) {
        sortMode = mode;
        renderRankings();
    }

    function assignRanks(list, valueGetter) {
        let lastValue = null;
        let lastRank = 0;
        return list.map((item, index) => {
            const value = valueGetter(item);
            if (value !== lastValue) {
                lastRank = index + 1;
                lastValue = value;
            }
            return { item, rank: lastRank };
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderRankings() {
        const thead = document.getElementById('ranking-thead');
        const tbody = document.getElementById('ranking-tbody');
        const empty = document.getElementById('ranking-empty');
        if (!thead || !tbody) return;

        const btnBingo = document.getElementById('sort-bingo-btn');
        const btnRate  = document.getElementById('sort-winrate-btn');
        if (btnBingo && btnRate) {
            btnBingo.classList.toggle('active', sortMode === 'bingo');
            btnRate.classList.toggle('active', sortMode === 'winrate');
        }

        if (!rankingsCache || rankingsCache.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        const withRate = rankingsCache.map(p => {
            const matches = p.matches || 0;
            const wins = p.wins || 0;
            return {
                name: p.name,
                bingo_count: p.bingo_count || 0,
                wins,
                matches,
                win_rate: matches > 0 ? Math.round((wins / matches) * 1000) / 10 : null,
            };
        });

        const sorted = withRate.slice().sort((p1, p2) => {
            if (sortMode === 'winrate') {
                const r1 = p1.win_rate === null ? -1 : p1.win_rate;
                const r2 = p2.win_rate === null ? -1 : p2.win_rate;
                if (r2 !== r1) return r2 - r1;
                return p2.bingo_count - p1.bingo_count;
            }
            return p2.bingo_count - p1.bingo_count;
        });

        const ranked = assignRanks(
            sorted,
            sortMode === 'winrate'
                ? (p) => (p.win_rate === null ? -1 : p.win_rate)
                : (p) => p.bingo_count
        );

        if (sortMode === 'winrate') {
            thead.innerHTML = '<tr><th>順位</th><th>名前</th><th>勝率</th><th>勝ち/試合数</th></tr>';
            tbody.innerHTML = ranked.map(({ item, rank }) => {
                const winRateText = item.win_rate === null ? '-' : item.win_rate + '%';
                return (
                    '<tr>' +
                    '<td class="rank-cell">' + rank + '位</td>' +
                    '<td class="name-cell">' + escapeHtml(item.name) + '</td>' +
                    '<td>' + winRateText + '</td>' +
                    '<td>' + item.wins + ' / ' + item.matches + '</td>' +
                    '</tr>'
                );
            }).join('');
        } else {
            thead.innerHTML = '<tr><th>順位</th><th>名前</th><th>累計ビンゴ数</th></tr>';
            tbody.innerHTML = ranked.map(({ item, rank }) => {
                return (
                    '<tr>' +
                    '<td class="rank-cell">' + rank + '位</td>' +
                    '<td class="name-cell">' + escapeHtml(item.name) + '</td>' +
                    '<td>' + item.bingo_count + '</td>' +
                    '</tr>'
                );
            }).join('');
        }
    }

    return {
        setTeams,
        startNewMatch,
        handleBingoUpdate,
        fetchRankings,
        setSortMode,
        isGithubConfigured,
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    if (!Stats.isGithubConfigured()) {
        console.warn('js/github-config.js が未設定です。記録（書き込み）は行われません。表示（読み込み）のみ動作します。');
    }
    Stats.fetchRankings();
});
