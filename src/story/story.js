// Story mode — scrollytelling renderer. GSAP loads lazily on unlock only.

import { initLockupCycle } from '../fx/lockup-fx.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initStory() {
  window.addEventListener('story:unlocked', (e) => renderStory(e.detail));
}

function block(b) {
  switch (b.t) {
    case 'prose':
      return `<div class="ep-block"><p>${esc(b.text)}</p>${todo(b)}</div>`;
    case 'quote':
      return `<blockquote class="ep-quote ep-block"><p>${esc(b.text)}</p></blockquote>`;
    case 'stats':
      return `<div class="ep-stats ep-block">${b.items
        .map((s) => `<div><span class="v">${esc(s.v)}</span><span class="l">${esc(s.l)}</span></div>`)
        .join('')}</div>`;
    case 'artifact':
    case 'project':
      return `<div class="ep-${b.t} ep-block">
        <h3>${esc(b.title)}</h3>
        <p>${esc(b.text)}</p>
        ${b.link ? `<a href="${esc(b.link)}" target="_blank" rel="noopener">${esc(b.link.replace('https://', ''))}</a>` : ''}
        ${todo(b)}
      </div>`;
    case 'lockup':
      return `<div class="ep-lockup ep-block">
        <p class="code" aria-label="life-long learner">while (alive) { <span class="fn">learn()</span>; }</p>
        <p class="line">providing meaning <span class="gt" data-morph aria-label="beyond">&gt;</span> technology leadership</p>
      </div>`;
    case 'image':
      return `<figure class="ep-figure ep-block">
        <img loading="lazy" src="${import.meta.env.BASE_URL}${esc(b.src)}" alt="${esc(b.alt || '')}" />
        ${b.cap ? `<figcaption>${esc(b.cap)}${todo(b)}</figcaption>` : todo(b)}
      </figure>`;
    case 'video':
      return `<figure class="ep-figure ep-video ep-block">
        <div class="video-frame">
          <iframe src="https://player.vimeo.com/video/${esc(b.id)}" loading="lazy"
            allow="fullscreen; picture-in-picture" allowfullscreen title="${esc(b.cap || 'video')}"></iframe>
        </div>
        ${b.cap ? `<figcaption>${esc(b.cap)}${todo(b)}</figcaption>` : ''}
      </figure>`;
    case 'video-grid':
      return `<div class="ep-video-grid ep-block">${b.items
        .map(
          (v) => `<figure class="ep-figure ep-video">
        <div class="video-frame">
          <iframe src="https://player.vimeo.com/video/${esc(v.id)}" loading="lazy"
            allow="fullscreen; picture-in-picture" allowfullscreen title="${esc(v.cap || 'video')}"></iframe>
        </div>
        ${v.cap ? `<figcaption>${esc(v.cap)}${todo(v)}</figcaption>` : ''}
      </figure>`
        )
        .join('')}</div>`;
    case 'instagram':
      return `<figure class="ep-figure ep-insta ep-block">
        <iframe src="https://www.instagram.com/p/${esc(b.shortcode)}/embed/" loading="lazy"
          allowtransparency="true" title="${esc(b.cap || 'instagram post')}"></iframe>
        ${b.cap ? `<figcaption>${esc(b.cap)}${todo(b)}</figcaption>` : ''}
      </figure>`;
    case 'insta-grid':
      return `<div class="ep-insta-grid ep-block">${b.items
        .map(
          (v) => `<figure class="ep-figure ep-insta">
        <iframe src="https://www.instagram.com/p/${esc(v.shortcode)}/embed/" loading="lazy"
          allowtransparency="true" title="${esc(v.cap || 'instagram post')}"></iframe>
        ${v.cap ? `<figcaption>${esc(v.cap)}${todo(v)}</figcaption>` : ''}
      </figure>`
        )
        .join('')}</div>`;
    case 'contact':
      return `<div class="ep-contact ep-block">
        <a href="mailto:${esc(b.email)}">${esc(b.email)}</a>
        <a href="${esc(b.github)}" target="_blank" rel="noopener">github/coolnumber9</a>
        <a href="${esc(b.linkedin)}" target="_blank" rel="noopener">linkedin/kdamora</a>
      </div>`;
    default:
      return '';
  }
}

const todo = (b) => (b.todo ? `<span class="ep-todo">[TODO: ${esc(b.todo)}]</span>` : '');

function episodeHtml(ep) {
  const [dir, file] = ['~/story/', ep.slug];
  return `
  <section class="episode" id="${esc(ep.slug)}" aria-label="${esc(ep.title)}">
    <p class="ep-slug"><span class="dir">${dir}</span>${esc(file)}</p>
    <h2 class="ep-title">${esc(ep.title)}</h2>
    ${ep.blocks.map(block).join('')}
    <div class="ep-log"><span>${esc(ep.log)}</span><span>ACT ${ep.act}</span></div>
  </section>`;
}

async function renderStory({ story, greeting, audience }) {
  document.body.dataset.mode = 'story';
  document.getElementById('cv-root').hidden = true;
  const root = document.getElementById('story-root');
  root.hidden = false;

  root.innerHTML = `
    <div class="story-progress" aria-hidden="true"></div>
    <div class="story">
      <div class="story-head">
        <span class="fui-chip">USER ID <b>KDAMORA</b></span>
        <span class="fui-chip">STS <span class="sig">DECRYPTED</span></span>
        <span class="fui-chip">EPISODES <b>${story.episodes.length}</b></span>
        <span class="story-greeting mono">&gt; <span class="sig">${esc(greeting)}</span></span>
      </div>
      <aside class="story-rail" aria-label="Episode index">
        <nav>
          ${story.episodes
            .map((ep) => `<a href="#${esc(ep.slug)}" data-rail="${esc(ep.slug)}"><span class="dir">~/story/</span>${esc(ep.slug)}</a>`)
            .join('')}
        </nav>
      </aside>
      <div class="story-main">
        ${story.episodes.map(episodeHtml).join('')}
      </div>
    </div>`;

  window.scrollTo(0, 0);
  await revealSequence(root);
  initLockupCycle({
    codeEl: root.querySelector('.ep-lockup .code'),
    gtEl: root.querySelector('[data-morph]'),
  });
  initScroll(root);
}

/* the one theatrical beat: titles resolve from scrambled glyphs. skippable. */
async function revealSequence(root) {
  if (reduced()) return;
  const glyphs = '!<>-_\\/[]{}—=+*^?#________';
  const titles = [...root.querySelectorAll('.ep-title')].slice(0, 8);
  let skipped = false;
  const skip = () => { skipped = true; };
  window.addEventListener('keydown', skip, { once: true });

  await Promise.all(
    titles.map(async (el) => {
      const finalText = el.textContent;
      const steps = 10;
      for (let i = 0; i < steps && !skipped; i++) {
        el.textContent = finalText
          .split('')
          .map((ch, idx) => (idx / finalText.length < i / steps ? ch : ch === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0]))
          .join('');
        await new Promise((r) => setTimeout(r, 55));
      }
      el.textContent = finalText;
    })
  );
  window.removeEventListener('keydown', skip);
}

async function initScroll(root) {
  const bar = root.querySelector('.story-progress');
  const railLinks = [...root.querySelectorAll('[data-rail]')];
  const episodes = [...root.querySelectorAll('.episode')];

  const setActive = (slug) => railLinks.forEach((a) => a.classList.toggle('active', a.dataset.rail === slug));

  if (reduced()) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: '-40% 0px -50% 0px' }
    );
    episodes.forEach((ep) => io.observe(ep));
    window.addEventListener('scroll', () => {
      const p = window.scrollY / (document.body.scrollHeight - innerHeight);
      bar.style.width = `${Math.min(100, p * 100)}%`;
    }, { passive: true });
    return;
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(bar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: root.querySelector('.story-main'), start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

  episodes.forEach((ep) => {
    ScrollTrigger.create({
      trigger: ep,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && setActive(ep.id),
    });

    gsap.from(ep.querySelectorAll('.ep-block'), {
      opacity: 0,
      y: 18,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: ep, start: 'top 70%' },
    });

    const stats = ep.querySelectorAll('.ep-stats .v');
    stats.forEach((v) => {
      const raw = v.textContent;
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (Number.isNaN(num)) return;
      const suffix = raw.replace(/^[0-9,.]+/, '');
      const prefix = raw.startsWith('#') ? '#' : '';
      const obj = { n: 0 };
      gsap.to(obj, {
        n: num,
        duration: 1.1,
        ease: 'power1.out',
        scrollTrigger: { trigger: v, start: 'top 80%' },
        onUpdate: () => {
          const val = num >= 1000 ? Math.round(obj.n).toLocaleString('en-US') : Math.round(obj.n);
          v.textContent = `${prefix}${val}${suffix}`;
        },
      });
    });
  });
}
