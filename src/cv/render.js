import cv from '../../content/cv.json';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function hero() {
  return `
  <header class="cv-hero">
    <p class="label">${esc(cv.name).toUpperCase()}<span class="sep">·</span><span>${esc(cv.title).toUpperCase()}</span></p>
    <h1 class="cv-thesis">Building at the <span class="keyword">hardware–software seam</span> for 21 years.</h1>
    <div class="lockup">
      <p class="lockup-code" aria-label="life-long learner">while (alive) { <span class="fn">learn()</span>; }</p>
      <p class="lockup-line">${esc(cv.tagline.line2pre)} <span class="gt" id="lockup-gt" aria-label="beyond">&gt;</span> ${esc(cv.tagline.line2post)}</p>
    </div>
    <div class="cv-stats">
      ${cv.stats.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}
    </div>
  </header>`;
}

function section(label, inner) {
  return `<section class="cv-section" aria-label="${esc(label)}"><span class="label">${esc(label)}</span>${inner}</section>`;
}

function experience() {
  return cv.experience
    .map(
      (x) => `
    <article class="xp">
      <div class="xp-meta">
        <p class="role">${esc(x.role)}</p>
        <p class="org">${esc(x.org)}</p>
        <p class="period">${esc(x.period)}</p>
      </div>
      <ul>${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </article>`
    )
    .join('');
}

function patents() {
  return `<div class="card-grid">${cv.patents
    .map(
      (p) => `
    <a class="card" href="${esc(p.url)}" target="_blank" rel="noopener">
      <span class="id">${esc(p.id)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.note)}</p>
    </a>`
    )
    .join('')}</div>`;
}

function projects() {
  return `<div class="card-grid">${cv.projects
    .map(
      (p) => `
    <div class="card">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.note)}</p>
      <p class="meta">${esc(p.role)} · ${esc(p.period)}</p>
    </div>`
    )
    .join('')}</div>`;
}

function rows(items) {
  return `<div class="rows">${items
    .map(
      (v) => `
    <div>
      <span class="r-title">${esc(v.role || v.title)}</span>
      ${v.org ? `<span class="r-org">${esc(v.org)}</span>` : ''}
      <span class="r-period">${esc(v.period || v.year)}</span>
    </div>`
    )
    .join('')}</div>`;
}

export function renderCV(root) {
  root.innerHTML = `
  <div class="cv">
    ${hero()}
    ${section('Profile', `<p class="cv-summary">${esc(cv.summary)}</p>`)}
    ${section(
      'Core competencies',
      `<div class="comp-grid">${cv.competencies.map((c) => `<div><h3>${esc(c.name)}</h3><p>${esc(c.detail)}</p></div>`).join('')}</div>`
    )}
    ${section('Skills', `<dl class="skills-list">${cv.skills.map((s) => `<div><dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd></div>`).join('')}</dl>`)}
    ${section('Experience', experience())}
    ${section('Patents', patents())}
    ${section('Selected projects', projects())}
    ${section('Awards', rows(cv.awards))}
    ${section('Volunteering', rows(cv.volunteering))}
    ${section(
      'Education',
      `<p style="margin:0"><strong>${esc(cv.education.degree)}</strong><br /><span style="color:var(--ink-soft)">${esc(cv.education.school)}</span></p>`
    )}
    <footer class="cv-footer">
      <a href="mailto:${esc(cv.links.email)}">${esc(cv.links.email)}</a>
      <a href="${esc(cv.links.linkedin)}" target="_blank" rel="noopener">linkedin/kdamora</a>
      <a href="${esc(cv.links.github)}" target="_blank" rel="noopener">github/coolnumber9</a>
    </footer>
  </div>`;

  initLockup();
}

function initLockup() {
  const gt = document.getElementById('lockup-gt');
  if (!gt) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;
  const morph = () => {
    if (busy) return;
    busy = true;
    if (reduced) {
      gt.textContent = 'beyond';
      gt.classList.add('morphed');
      setTimeout(() => { gt.textContent = '>'; gt.classList.remove('morphed'); busy = false; }, 1600);
      return;
    }
    const word = 'beyond';
    let i = 0;
    gt.classList.add('morphed');
    const t = setInterval(() => {
      i += 1;
      gt.textContent = word.slice(0, i);
      if (i >= word.length) {
        clearInterval(t);
        setTimeout(() => { gt.textContent = '>'; gt.classList.remove('morphed'); busy = false; }, 1600);
      }
    }, 85);
  };
  gt.closest('.lockup').addEventListener('mouseenter', morph);
  gt.closest('.lockup').addEventListener('focusin', morph);
}
