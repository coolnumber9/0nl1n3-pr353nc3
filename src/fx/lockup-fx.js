// Shared lockup animation — one scheduler per mode so the code-line scramble
// and the '>' → 'beyond' morph never run at the same time.
//
// Cycle (period 9s):
//   t = 0        scramble on `while (alive) { learn(); }` resolves (~0.55s)
//   t = period/3 '>' types out to 'beyond' (~0.5s)
//   t = 2/3      'beyond' backspaces away char by char, then '>' returns
//
// Reduced motion: no scramble; the glyph swaps text without the typing effect.

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initLockupCycle({ codeEl, gtEl, period = 9000 }) {
  if (!codeEl && !gtEl) return () => {};

  const codeHtml = codeEl ? codeEl.innerHTML : '';
  const codeText = codeEl ? codeEl.textContent : '';
  const word = 'beyond';

  const scramble = () => {
    if (!codeEl || reduced()) return;
    const steps = 10;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      if (i >= steps) {
        clearInterval(t);
        codeEl.innerHTML = codeHtml; // restore inner spans (.fn)
        return;
      }
      codeEl.textContent = codeText
        .split('')
        .map((ch, idx) =>
          idx / codeText.length < i / steps ? ch : ch === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        )
        .join('');
    }, 55);
  };

  const morphIn = () => {
    if (!gtEl) return;
    gtEl.classList.add('morphed');
    if (reduced()) {
      gtEl.textContent = word;
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      gtEl.textContent = word.slice(0, i);
      if (i >= word.length) clearInterval(t);
    }, 85);
  };

  const morphOut = () => {
    if (!gtEl) return;
    if (reduced()) {
      gtEl.textContent = '>';
      gtEl.classList.remove('morphed');
      return;
    }
    let i = word.length;
    const t = setInterval(() => {
      i -= 1;
      if (i >= 0) {
        gtEl.textContent = word.slice(0, i); // backspace one char
        if (i === 0) gtEl.classList.remove('morphed');
        return;
      }
      clearInterval(t); // one empty beat, then the glyph returns
      gtEl.textContent = '>';
    }, 70);
  };

  const cycle = () => {
    scramble();
    setTimeout(morphIn, period / 3);
    setTimeout(morphOut, (period * 2) / 3);
  };

  cycle();
  const main = setInterval(cycle, period);
  return () => clearInterval(main);
}
