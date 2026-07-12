// Mobile episode nav — fixed status bar + dropdown index. Story mode, ≤900px only
// (desktop keeps the sticky rail; see story.css). tmux-style: mark + current path.
// The monogram is the same 9×8 Morse-KDA grid as public/favicon.svg.

const MARK = `<svg class="sb-mark" width="14" height="12" viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true">
  <rect x="0" y="0" width="3" height="2"/><rect x="4" y="0" width="1" height="2"/><rect x="6" y="0" width="3" height="2"/>
  <rect x="0" y="3" width="3" height="2"/><rect x="4" y="3" width="1" height="2"/><rect x="6" y="3" width="1" height="2"/>
  <rect x="0" y="6" width="1" height="2"/><rect x="2" y="6" width="3" height="2"/>
</svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initStatusBar(root, episodes, { reduced = false } = {}) {
  const bar = document.createElement('div');
  bar.className = 'story-statusbar';
  bar.dataset.open = 'false';
  bar.innerHTML = `
    <button class="sb-btn" aria-expanded="false" aria-controls="sb-menu">
      ${MARK}
      <span class="sb-path"><span class="dir">~/story/</span><span class="sb-cur">${esc(episodes[0]?.slug ?? '')}</span></span>
      <span class="sb-caret" aria-hidden="true">▾</span>
    </button>
    <nav class="sb-menu" id="sb-menu" aria-label="Episode index">
      ${episodes
        .map((ep) => `<a href="#${esc(ep.slug)}" data-sb="${esc(ep.slug)}"><span class="dir">~/story/</span>${esc(ep.slug)}</a>`)
        .join('')}
    </nav>`;
  root.prepend(bar);

  const btn = bar.querySelector('.sb-btn');
  const cur = bar.querySelector('.sb-cur');
  const links = [...bar.querySelectorAll('[data-sb]')];

  const toggle = (open = bar.dataset.open !== 'true') => {
    bar.dataset.open = String(open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) bar.classList.remove('hidden');
  };

  btn.addEventListener('click', () => toggle());

  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(false);
      document.getElementById(a.dataset.sb)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${a.dataset.sb}`);
    })
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bar.dataset.open === 'true') {
      toggle(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (bar.dataset.open === 'true' && !bar.contains(e.target)) toggle(false);
  });

  // reading stays clean: hide on scroll down, return on scroll up
  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (bar.dataset.open !== 'true') {
        if (y > lastY + 8 && y > 80) bar.classList.add('hidden');
        else if (y < lastY - 8) bar.classList.remove('hidden');
      }
      lastY = y;
    },
    { passive: true }
  );

  return {
    setCurrent(slug) {
      cur.textContent = slug;
      links.forEach((a) => a.classList.toggle('active', a.dataset.sb === slug));
    },
  };
}
