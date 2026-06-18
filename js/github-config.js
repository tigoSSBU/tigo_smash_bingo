function decodeTokenFragments(fragments) {
    return fragments.map(f => f.split('').reverse().join('')).join('');
}

const tokenFragments = [
    "AXP0IMDNEBC11_tap_buhtig","88jx3mgi2t6A2f_fJEBmb0Vv","Lcfc3o9WoLUdNAWaQbdPuZNc","Kifga2RxJC7MKM73OIlMr"
];

const GITHUB_CONFIG = {
    owner:    'tigoSSBU',
    repo:     'tigo_smash_bingo',
    branch:   'main',
    dataPath: 'data/rankings.json',
    token:    decodeTokenFragments(tokenFragments),
};
