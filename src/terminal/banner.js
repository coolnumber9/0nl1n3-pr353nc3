import { kdaVersion } from './version.js';

// Boot banner, "fetch" layout: gradient KDA mark + micro-CV info column.
// Collapses to mark + version line below 600px (see terminal.css).
// Art is aria-hidden; screen readers get the info column (desktop) or
// the version line (mobile) — never the block characters.

const ART = [
  '██╗  ██╗██████╗  █████╗ ',
  '██║ ██╔╝██╔══██╗██╔══██╗',
  '█████╔╝ ██║  ██║███████║',
  '██╔═██╗ ██║  ██║██╔══██║',
  '██║  ██╗██████╔╝██║  ██║',
  '╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝',
];

export function buildBanner() {
  const v = kdaVersion();
  const frag = document.createDocumentFragment();

  const wrap = document.createElement('div');
  wrap.className = 'term-banner';

  const art = document.createElement('pre');
  art.className = 'banner-art';
  art.setAttribute('aria-hidden', 'true');
  ART.forEach((row, i) => {
    const span = document.createElement('span');
    span.className = `g${i + 1}`;
    span.textContent = row + (i < ART.length - 1 ? '\n' : '');
    art.appendChild(span);
  });

  const info = document.createElement('div');
  info.className = 'banner-fetch';

  const title = document.createElement('div');
  title.className = 'fetch-title';
  title.textContent = 'kda@midknight';
  info.appendChild(title);

  const rule = document.createElement('div');
  rule.className = 'fetch-rule';
  rule.setAttribute('aria-hidden', 'true');
  rule.textContent = '─'.repeat(25);
  info.appendChild(rule);

  const rows = [
    ['SHELL', `kda-shell ${v}`],
    ['HOST', 'kdamora.com'],
    ['IN PROD', '21 yrs, no rollback'],
    ['SHIPPED', '75K+ devices'],
    ['PATENTS', '2 (US, granted)'],
  ];
  for (const [key, val] of rows) {
    const line = document.createElement('div');
    const k = document.createElement('span');
    k.className = 'fetch-key';
    k.textContent = key;
    const value = document.createElement('span');
    value.className = 'fetch-val';
    value.textContent = val;
    line.append(k, value);
    info.appendChild(line);
  }

  // MODE row — the locked state glows warm (--signal-warm), a quiet
  // invitation to go looking for the key
  const unlocked = document.body.dataset.mode === 'story';
  const modeLine = document.createElement('div');
  const modeKey = document.createElement('span');
  modeKey.className = 'fetch-key';
  modeKey.textContent = 'MODE';
  const modeVal = document.createElement('span');
  modeVal.className = 'fetch-val';
  const accent = document.createElement('span');
  accent.className = unlocked ? 'sig' : 'warn';
  accent.textContent = unlocked ? '· unlocked' : '· story locked';
  modeVal.append(document.createTextNode(unlocked ? 'story ' : 'cv '), accent);
  modeLine.append(modeKey, modeVal);
  info.appendChild(modeLine);

  // the banner prints once per session, but the lock state is live:
  // when the story unlocks, the MODE row resolves warm → signal in place
  if (!unlocked) {
    window.addEventListener(
      'story:unlocked',
      () => {
        accent.className = 'sig';
        accent.textContent = '· unlocked';
        modeVal.replaceChild(document.createTextNode('story '), modeVal.firstChild);
      },
      { once: true }
    );
  }

  wrap.append(art, info);
  frag.appendChild(wrap);

  // Mobile fallback line (Option A). The version span is hidden on desktop,
  // where the SHELL row already carries it.
  const verline = document.createElement('div');
  verline.className = 'banner-verline dim';
  const ver = document.createElement('span');
  ver.className = 'verline-version';
  ver.textContent = `kda-shell ${v} — `;
  verline.append(ver, document.createTextNode('last login: from somewhere curious'));
  frag.appendChild(verline);

  return frag;
}
