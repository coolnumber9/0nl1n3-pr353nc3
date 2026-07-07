import { execute } from './commands.js';

const BOOT = [
  ['dim', 'kda-shell v1.0.0 — last login: from somewhere curious'],
  ['', ''],
  ['', "type 'help' to look around, or paste the command you were given."],
  ['', ''],
];

export function initTerminal() {
  const overlay = document.getElementById('terminal');
  const output = document.getElementById('term-output');
  const input = document.getElementById('term-input');
  const scroll = document.getElementById('term-scroll');
  const chip = document.getElementById('term-chip');
  const closeBtn = overlay.querySelector('.term-close');

  const history = [];
  let hIndex = -1;
  let booted = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const term = {
    printLines(lines) {
      for (const [cls, text] of lines) {
        const div = document.createElement('div');
        if (cls) div.className = cls;
        div.textContent = text;
        output.appendChild(div);
      }
      scroll.scrollTop = scroll.scrollHeight;
    },
    async sequence(lines) {
      for (const line of lines) {
        term.printLines([line]);
        if (!reduced) await sleep(260 + Math.random() * 240);
      }
    },
    clear() {
      output.innerHTML = '';
    },
    open() {
      overlay.hidden = false;
      if (!booted) {
        booted = true;
        term.printLines(BOOT);
      }
      input.focus();
    },
    close() {
      overlay.hidden = true;
      chip.focus();
    },
  };

  const echo = (raw) => {
    const div = document.createElement('div');
    div.className = 'cmd-echo';
    div.textContent = raw;
    output.appendChild(div);
  };

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const raw = input.value;
      input.value = '';
      echo(raw);
      if (raw.trim()) {
        history.push(raw);
        hIndex = history.length;
      }
      await execute(raw, term);
      scroll.scrollTop = scroll.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIndex > 0) { hIndex -= 1; input.value = history[hIndex] ?? ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIndex < history.length - 1) { hIndex += 1; input.value = history[hIndex] ?? ''; }
      else { hIndex = history.length; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.trim();
      const options = ['help', 'whoami', 'cv', 'story', 'kda install story --key ', 'ls', 'cat ', 'clear', 'exit'];
      const hit = options.find((o) => o.startsWith(v) && v.length > 0);
      if (hit) input.value = hit;
    } else if (e.key === 'Escape') {
      term.close();
    }
  });

  chip.addEventListener('click', term.open);
  closeBtn.addEventListener('click', term.close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) term.close(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && overlay.hidden && !isTyping(e)) {
      e.preventDefault();
      term.open();
    }
  });

  return term;
}

function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
