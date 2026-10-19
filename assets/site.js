// Shared by every page: navigation, footer, scroll effects, reveal, tilt, lightbox, hero waves.
const VERSION = '1.10.0';
const DOWNLOAD = `https://github.com/Vlocky1/Reboxed/releases/download/v${VERSION}/Reboxed-Setup-${VERSION}.exe`;
const PAGES = [['index.html', 'Accueil'], ['fonctionnalites.html', 'Fonctionnalités'], ['stems.html', 'Stems'], ['materiel.html', 'Contrôleurs & CDJ'], ['telecharger.html', 'Télécharger'], ['faq.html', 'FAQ']];
window.REBOXED = { VERSION, DOWNLOAD };

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const here = location.pathname.split('/').pop() || 'index.html';

  // ---- shared chrome ----
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress" id="progress"></div>
    <div class="bg"><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div></div>
    <div class="spot" id="spot"></div>
    <nav id="nav"><div class="container nav-in">
      <a class="brand" href="index.html"><img src="assets/logo.svg" alt=""><span>re<b>box</b>ed</span></a>
      <div class="nav-links">${PAGES.slice(1).map(([href, label]) => `<a href="${href}"${href === here ? ' class="on"' : ''}>${label}</a>`).join('')}</div>
      <div class="nav-cta"><a class="btn btn-primary magnetic" href="${DOWNLOAD}">Télécharger</a><button class="burger" aria-label="Menu">☰</button></div>
    </div></nav>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer><div class="container foot">
      <div><a class="brand" href="index.html"><img src="assets/logo.svg" alt=""><span>re<b>box</b>ed</span></a><p style="margin-top:10px;max-width:320px">Logiciel DJ gratuit et libre pour Windows. Comme Rekordbox, mais en mieux.</p></div>
      <div><h4>Découvrir</h4><a href="fonctionnalites.html">Fonctionnalités</a><a href="stems.html">Stems</a><a href="materiel.html">Contrôleurs &amp; CDJ</a></div>
      <div><h4>Commencer</h4><a href="telecharger.html">Télécharger</a><a href="faq.html">FAQ</a><a href="https://github.com/Vlocky1/Reboxed/releases">Versions</a></div>
      <div><h4>Projet</h4><a href="https://github.com/Vlocky1/Reboxed">GitHub</a><a href="https://github.com/Vlocky1/Reboxed/blob/master/LICENSE">Licence MIT</a><a href="https://github.com/Vlocky1/Reboxed/blob/master/docs/PLUGINS.md">Créer un plugin</a></div>
      <p class="legal">Reboxed ${VERSION} · Non affilié à AlphaTheta / Pioneer DJ ; rekordbox, CDJ et DDJ sont leurs marques. Démo audio : « Hot Core », Alex Beroza ft. Snowflake, CC BY 3.0 (ccMixter).</p>
    </div></footer>
    <div class="lightbox" id="lightbox"><div><img id="lbImg" alt=""><p id="lbCap"></p></div></div>`);
  $$('[data-download]').forEach((a) => { a.href = DOWNLOAD; });
  $$('[data-version]').forEach((el) => { el.textContent = VERSION; });
  const nav = $('#nav');
  $('.burger').addEventListener('click', () => nav.classList.toggle('open'));

  // ---- scroll progress, nav background, spotlight, hero screenshot ----
  const progress = $('#progress'); const spot = $('#spot'); const heroScreen = $('.screen');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    progress.style.width = `${(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`;
    if (heroScreen) { const s = Math.min(1, scrollY / 600); heroScreen.style.transform = `rotateX(${18 * (1 - s)}deg) scale(${0.94 + 0.06 * s})`; }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('pointermove', (e) => { spot.style.left = `${e.clientX}px`; spot.style.top = `${e.clientY}px`; spot.style.opacity = 1; });

  // ---- reveal + counters ----
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
    $$('[data-count]', en.target).forEach((el) => {
      const to = Number(el.dataset.count); const t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: 0.12 });
  window.observeReveal = (el) => io.observe(el);
  $$('.reveal').forEach((el) => io.observe(el));

  // ---- marquee ----
  const mq = $('#marquee');
  if (mq) {
    const words = ['2 ou 4 decks', 'Jogs', 'Stems FAST & HQ', 'Export CDJ / XDJ', 'Import rekordbox', 'YouTube & SoundCloud', 'Deezer & Spotify', 'Auto-tag', 'Nettoyeur de noms', '16 Beat FX', 'Color FX', 'Sampler', 'Automix', 'REC', 'Groove Circuit', 'DDJ-GRV6', 'DDJ-FLX4', 'Intelligent Playlists', 'Camelot', 'Phrases', '8 thèmes', 'Licence MIT'];
    mq.innerHTML = [...words, ...words].map((w) => `<span>${w}</span>`).join('');
  }

  // ---- magnetic buttons, tilt, spotlight on cards and tiles ----
  if (!reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg)`;
        el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  $$('.card, .tile').forEach((c) => c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }));

  // ---- lightbox ----
  const lb = $('#lightbox');
  const openLb = (src, cap) => { $('#lbImg').src = src; $('#lbCap').textContent = cap || ''; lb.classList.add('on'); };
  lb.addEventListener('click', () => lb.classList.remove('on'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('on'); });
  document.addEventListener('click', (e) => { const f = e.target.closest('[data-full]'); if (f) openLb(f.dataset.full, f.dataset.cap); });

  // ---- theme switcher ----
  const tImg = $('#themeImg'); const tNext = $('#themeImgNext');
  $$('#themesUi button').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    $$('#themesUi button').forEach((x) => x.classList.toggle('on', x === b));
    tNext.onload = () => { tNext.style.opacity = 1; setTimeout(() => { tImg.src = tNext.src; tNext.style.opacity = 0; }, 650); };
    tNext.src = `assets/shots/${b.dataset.shot}.webp`;
    document.documentElement.style.setProperty('--accent', b.dataset.accent);
    document.documentElement.style.setProperty('--accent2', b.dataset.accent2);
  }));

  // ---- hero waves (stem colours; they follow the demo's real stem levels while it plays) ----
  const hw = $('#heroWave');
  if (hw) {
    const hg = hw.getContext('2d');
    const COLORS = ['#ffa91f', '#3d8dff', '#3ddc84', '#ff4fa3'];
    const draw = (t) => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = hw.clientWidth * dpr; const h = hw.clientHeight * dpr;
      if (hw.width !== w || hw.height !== h) { hw.width = w; hw.height = h; }
      hg.clearRect(0, 0, w, h);
      COLORS.forEach((c, s) => {
        hg.beginPath();
        const lv = window.stemLevels ? window.stemLevels[[3, 2, 1, 0][s]] : 0.45;
        const amp = (0.25 + lv * 1.5) * h * (0.17 - s * 0.022);
        for (let x = 0; x <= w; x += 6 * dpr) {
          const k = x / w; const env = Math.sin(Math.PI * k) ** 1.5;
          const y = h / 2 + Math.sin(k * (9 + s * 3) + t / (900 - s * 130) + s) * amp * env * (0.6 + 0.4 * Math.sin(k * 40 + t / 300 + s * 2));
          if (x) hg.lineTo(x, y); else hg.moveTo(x, y);
        }
        hg.strokeStyle = c; hg.globalAlpha = 0.55; hg.lineWidth = 2 * dpr; hg.shadowColor = c; hg.shadowBlur = 18 * dpr; hg.stroke();
      });
      hg.globalAlpha = 1; hg.shadowBlur = 0;
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
})();
