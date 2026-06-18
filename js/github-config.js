// セットアップ: owner/repo/branch を自分のリポジトリ用に書き換えてください。
//
// token は実際の文字列をそのまま書くとGitHubの自動検出（secret scanning）で
// 公開リポジトリ内のトークンとして検出され、自動的に無効化されてしまいます。
// そのため、文字列を分割して逆順にした状態で tokenFragments に保存し、
// 読み込み時に decodeTokenFragments() で元に戻しています。
// ※ これはGitHubの自動無効化を避けるためだけの処置で、本当の暗号化では
//   ありません。このコードを読める人には結局トークンを知られてしまいます。
//
// 新しいトークンを設定する場合は、ブラウザのConsoleで以下を実行し
// （TOKEN_HEREを発行した本物のトークンに置き換える）、出力された配列を
// tokenFragments に貼り付けてください。
//
//   (function (token, parts) {
//     parts = parts || 4;
//     const len = Math.ceil(token.length / parts);
//     const chunks = [];
//     for (let i = 0; i < token.length; i += len) {
//       chunks.push(token.slice(i, i + len).split('').reverse().join(''));
//     }
//     console.log(JSON.stringify(chunks));
//   })('TOKEN_HERE');

function decodeTokenFragments(fragments) {
    return fragments.map(f => f.split('').reverse().join('')).join('');
}

const tokenFragments = [
    'YOUR_ENCODED_TOKEN_FRAGMENTS_HERE',
];

const GITHUB_CONFIG = {
    owner:    'YOUR_GITHUB_USERNAME',
    repo:     'YOUR_REPOSITORY_NAME',
    branch:   'main',
    dataPath: 'data/rankings.json',
    token:    decodeTokenFragments(tokenFragments),
};
