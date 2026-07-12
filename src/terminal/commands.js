import { tryUnlock } from '../story/crypto.js';
import { kdaVersion, MORSE_KDA, BUILD_DATE } from './version.js';

const FILES = {
  'readme.md': [
    ['', 'Two modes. One person.'],
    ['dim', 'Default shows the CV. The other mode is a story —'],
    ['dim', 'it needs a key, and keys are issued personally.'],
    ['', ''],
    ['dim', 'usage: kda install story --key <code>'],
  ],
  'patents.txt': [
    ['sig', 'US10650232 B2'],
    ['', 'Produce and Non-produce Verification Using Hybrid Scanner (2020)'],
    ['sig', 'US8626120 B2'],
    ['', 'Methods to Improve Automated Check-in (2014)'],
  ],
  'contact.sig': [
    ['', 'kdamora@gmail.com'],
    ['', 'linkedin.com/in/kdamora'],
    ['', 'github.com/coolnumber9'],
    ['dim', '-----BEGIN SIGNATURE-----'],
    ['dim', 'while (alive) { learn(); }'],
    ['dim', '-----END SIGNATURE-----'],
  ],
};

const HELP = [
  ['', 'available commands:'],
  ['', ''],
  ['sig', '  help                              '],
  ['dim', '  this list'],
  ['sig', '  whoami                            '],
  ['dim', '  one-line bio'],
  ['sig', '  cv                                '],
  ['dim', '  back to the CV (cv --print for paper)'],
  ['sig', '  story                             '],
  ['dim', '  about story mode'],
  ['sig', '  kda install story --key <code>    '],
  ['dim', '  unlock story mode'],
  ['sig', '  ls, cat <file>                    '],
  ['dim', '  look around'],
  ['sig', '  clear, exit                       '],
  ['dim', '  the usual'],
];

export function execute(raw, term) {
  const input = raw.trim();
  if (!input) return;
  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd.toLowerCase()) {
    case 'help':
      return term.printLines(HELP);

    case 'whoami':
      return term.printLines([
        ['', 'Kristoffer Dominic Amora — engineering leader at the hardware–software seam.'],
        ['dim', '21 yrs · 2 US patents · 75K+ devices shipped · firmware+software+web'],
        ['dim', 'life-long learner. providing meaning beyond technology leadership.'],
      ]);

    case 'cv':
      if (args.includes('--print') || args.includes('--pdf')) {
        term.close();
        setTimeout(() => window.print(), 300);
        return;
      }
      term.close();
      document.body.dataset.mode = 'cv';
      document.getElementById('story-root').hidden = true;
      document.getElementById('cv-root').hidden = false;
      return;

    case 'story':
      return term.printLines([
        ['', 'There is another mode to this site — past projects, the longer story,'],
        ['', 'and a few things a CV never says.'],
        ['', ''],
        ['dim', 'It is sealed. Keys are issued personally — if you have one:'],
        ['sig', '  kda install story --key <code>'],
      ]);

    case 'kda':
      // the signature scene — deliberately absent from `help`
      if (args[0] === '--version' || args[0] === '-v') {
        return term.printLines([
          ...MORSE_KDA.map((row) => ['sig art', row]),
          ['', `kda-shell ${kdaVersion()}`],
          ['dim', `build date ${BUILD_DATE} — still in active development`],
        ]);
      }
    // fall through
    case 'npm':
    case 'bun':
    case 'pip':
      return installFlow(args, term);

    case 'ls':
      return term.printLines([['dim', Object.keys(FILES).join('   ') + '   story.enc']]);

    case 'cat': {
      const f = (args[0] || '').toLowerCase();
      if (!f) return term.printLines([['err', 'cat: missing operand']]);
      if (f === 'story.enc')
        return term.printLines([
          ['dim', '���K��U�...AES-256-GCM ciphertext (2 keyring entries)'],
          ['dim', 'cat: story.enc: content is sealed. try: kda install story --key <code>'],
        ]);
      if (FILES[f]) return term.printLines(FILES[f]);
      return term.printLines([['err', `cat: ${f}: no such file`]]);
    }

    case 'sudo':
      return term.printLines([['warn', 'nice try. permission denied.']]);

    case 'clear':
      return term.clear();

    case 'exit':
    case 'logout':
    case 'quit':
      term.printLines([['dim', 'logout']]);
      setTimeout(() => term.close(), 350);
      return;

    default:
      return term.printLines([
        ['err', `command not found: ${cmd}`],
        ['dim', "type 'help' to see what this thing can do"],
      ]);
  }
}

async function installFlow(args, term) {
  const joined = args.join(' ');
  if (!/install/.test(joined) || !/story/.test(joined)) {
    return term.printLines([['err', 'usage: kda install story --key <code>']]);
  }
  const m = joined.match(/--key[=\s]+(\S+)/);
  if (!m) {
    return term.printLines([
      ['err', 'E400: missing --key <code>'],
      ['dim', 'keys are issued personally — ask me.'],
    ]);
  }
  const code = m[1];

  await term.sequence([
    ['dim', `resolving story@1.0.0 ...`],
    ['dim', `fetching payload.enc (sealed) ...`],
    ['dim', `verifying key ...`],
  ]);

  const result = await tryUnlock(code);

  if (!result.ok) {
    if (result.reason === 'insecure-context') {
      return term.printLines([
        ['err', 'E426: secure context required.'],
        ['dim', 'Web Crypto only runs over HTTPS or localhost — this preview is plain http.'],
        ['dim', 'for phone testing: npm run dev:https, then open the https:// URL.'],
      ]);
    }
    return term.printLines([
      ['err', 'E401: key not recognized.'],
      ['dim', 'keys are issued personally — ask me.'],
    ]);
  }

  await term.sequence([
    ['sig', 'key accepted.'],
    ['dim', `decrypting ${result.episodeCount ?? ''} episodes ... done`],
    ['sig', `> ${result.greeting}`],
  ]);

  setTimeout(() => {
    term.close();
    window.dispatchEvent(new CustomEvent('story:unlocked', { detail: result }));
  }, 900);
}
