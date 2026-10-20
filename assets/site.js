// Shared by every page: navigation, footer, scroll effects, reveal, tilt, lightbox, hero waves.
const VERSION = '1.12.1';
const DOWNLOAD = `https://github.com/Vlocky1/Reboxed/releases/download/v${VERSION}/Reboxed-Setup-${VERSION}.exe`;
const PAGES = [['index.html', 'Accueil'], ['fonctionnalites.html', 'Fonctionnalités'], ['stems.html', 'Stems'], ['materiel.html', 'Matériel & CDJ'], ['telecharger.html', 'Télécharger'], ['faq.html', 'FAQ']];
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
      <div><a class="brand" href="index.html"><img src="assets/logo.svg" alt=""><span>re<b>box</b>ed</span></a><p style="margin-top:10px;max-width:320px">Logiciel DJ gratuit et libre pour Windows. Comme Rekordbox, mais en mieux.</p><a class="insta" href="https://www.instagram.com/rebox.ed/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>@rebox.ed</a></div>
      <div><h4>Découvrir</h4><a href="fonctionnalites.html">Fonctionnalités</a><a href="stems.html">Stems</a><a href="materiel.html">Matériel &amp; CDJ</a></div>
      <div><h4>Commencer</h4><a href="telecharger.html">Télécharger</a><a href="faq.html">FAQ</a><a href="https://github.com/Vlocky1/Reboxed/releases">Versions</a></div>
      <div><h4>Contact</h4><a href="https://www.instagram.com/rebox.ed/" target="_blank" rel="noopener">Instagram @rebox.ed</a><a href="https://github.com/Vlocky1/Reboxed">GitHub</a><a href="https://github.com/Vlocky1/Reboxed/issues">Signaler un bug</a><a href="https://github.com/Vlocky1/Reboxed/blob/master/LICENSE">Licence MIT</a></div>
      <p class="legal">Reboxed ${VERSION} · Non affilié à AlphaTheta / Pioneer DJ ; rekordbox et CDJ sont leurs marques. Démo audio : « Hot Core », Alex Beroza ft. Snowflake, CC BY 3.0 (ccMixter).</p>
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

  // ---- side rail replacing the native scrollbar: lights up while scrolling, draggable ----
  const rail = document.createElement('div'); rail.className = 'rail idle'; rail.innerHTML = '<span class="thumb"></span>';
  document.body.append(rail);
  const thumb = $('.thumb', rail); let sleep;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const placeRail = () => {
    const H = rail.clientHeight; const th = Math.max(36, H * (innerHeight / document.documentElement.scrollHeight));
    thumb.style.height = `${th}px`; thumb.style.transform = `translateY(${(H - th) * (scrollY / maxScroll())}px)`;
    rail.style.display = maxScroll() > 2 ? '' : 'none';
  };
  const placeTicks = () => {
    $$('.tick', rail).forEach((t) => t.remove());
    $$('section, header.hero').forEach((s) => { const t = document.createElement('i'); t.className = 'tick'; t.style.top = `${(s.offsetTop / document.documentElement.scrollHeight) * 100}%`; rail.append(t); });
  };
  addEventListener('scroll', () => {
    placeRail(); rail.classList.add('live'); rail.classList.remove('idle');
    clearTimeout(sleep); sleep = setTimeout(() => { rail.classList.remove('live'); rail.classList.add('idle'); }, 900);
  }, { passive: true });
  addEventListener('resize', () => { placeRail(); placeTicks(); });
  addEventListener('load', () => { placeRail(); placeTicks(); });
  placeRail();
  const seek = (e) => { const r = rail.getBoundingClientRect(); const th = thumb.offsetHeight; window.scrollTo({ top: ((e.clientY - r.top - th / 2) / (r.height - th)) * maxScroll(), behavior: 'instant' }); };
  rail.addEventListener('pointerdown', (e) => { rail.setPointerCapture(e.pointerId); rail.classList.add('drag'); seek(e); });
  rail.addEventListener('pointermove', (e) => { if (rail.classList.contains('drag')) seek(e); });
  rail.addEventListener('pointerup', () => rail.classList.remove('drag'));
  addEventListener('pointermove', (e) => { spot.style.left = `${e.clientX}px`; spot.style.top = `${e.clientY}px`; spot.style.opacity = 1; });

  // ---- split section titles into words (each one rises on reveal) ----
  $$('section h2').forEach((h) => {
    let i = 0;
    const wrap = (node) => { const w = document.createElement('span'); w.className = 'w'; const inner = document.createElement('span'); inner.style.setProperty('--i', i++); w.append(inner); inner.append(node); return w; };
    [...h.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => { if (!part) return; frag.append(/\s/.test(part) ? document.createTextNode(part) : wrap(document.createTextNode(part))); });
        n.replaceWith(frag);
      } else if (n.nodeName !== 'BR') n.replaceWith(wrap(n.cloneNode(true)));
    });
    h.classList.add('split');
  });

  // ---- scramble: labels decode from random glyphs ----
  const GLYPHS = '01#%&*+=<>/\\ABCDEFXYZ';
  const scramble = (el) => {
    if (reduce || el.dataset.done) return; el.dataset.done = 1;
    const final = el.textContent; const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      el.textContent = [...final].map((ch, j) => (ch === ' ' || j / final.length < k ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (k < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };

  // ---- reveal + counters ----
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('in'); io.unobserve(el);
    setTimeout(() => el.classList.add('settled'), 1300);
    $$('.eyebrow', el).concat(el.matches('.eyebrow') ? [el] : []).forEach(scramble);
    $$('[data-count]', el).forEach((c) => {
      const to = Number(c.dataset.count); const suf = c.dataset.suffix || ''; const t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1400); c.textContent = Math.round(to * (1 - (1 - k) ** 3)) + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: 0.12 });
  $$('section h2.split').forEach((h) => io.observe(h));
  window.observeReveal = (el) => io.observe(el);
  $$('.reveal').forEach((el) => io.observe(el));

  // ---- marquee ----
  const mq = $('#marquee');
  if (mq) {
    const words = ['Jogs 33⅓','Stems FAST & HQ', 'Export CDJ / XDJ', 'Import rekordbox', 'YouTube & SoundCloud', 'Deezer & Spotify', 'Auto-tag', 'Nettoyeur de noms', '16 Beat FX', 'Color FX', 'Sampler', 'Automix', 'REC', 'Contrôleurs MIDI','Open source', 'Intelligent Playlists', 'Camelot', 'Phrases', '8 thèmes', 'Licence MIT'];
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
  if (!reduce) {
    $$('.tile').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height; el.style.transform = `perspective(1200px) rotateY(${(x - 0.5) * 5}deg) rotateX(${(0.5 - y) * 5}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    // click ripple
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.btn, .p-play, .stem-btn, .themes-ui button'); if (!b) return;
      const r = b.getBoundingClientRect(); const d = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement('span'); s.className = 'ripple';
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.append(s); setTimeout(() => s.remove(), 700);
    });
    // glowing cursor ring (mouse only)
    if (matchMedia('(pointer: fine)').matches) {
      const ring = document.createElement('div'); ring.className = 'cursor'; document.body.append(ring);
      let cx = innerWidth / 2; let cy = innerHeight / 2; let tx = cx; let ty = cy;
      addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; ring.classList.add('on'); ring.classList.toggle('big', !!e.target.closest('a, button, summary, [data-full], .stem-btn, .p-wave')); });
      document.addEventListener('pointerleave', () => ring.classList.remove('on'));
      const follow = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; ring.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(follow); };
      requestAnimationFrame(follow);
    }
  }

  // ---- text that lights up word by word while scrolling ----
  const st = $('.scrolltext');
  if (st) {
    st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span>${w}</span>`).join(' ');
    const words = $$('span', st);
    const light = () => {
      const r = st.getBoundingClientRect(); const k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(k * words.length); words.forEach((w, j) => w.classList.toggle('lit', j < n));
    };
    addEventListener('scroll', light, { passive: true }); light();
  }

  // ---- parallax on screenshots inside tiles and features ----
  if (!reduce) {
    const par = $$('.tile .t-img img, .feature .shot img');
    const onPar = () => par.forEach((img) => { const r = img.getBoundingClientRect(); const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; img.style.translate = `0 ${(k * -12).toFixed(1)}px`; });
    addEventListener('scroll', onPar, { passive: true }); onPar();
  }

  // ---- the page breathes with the demo: orbs follow the stem levels ----
  if (!reduce) {
    const root = document.documentElement; let lv = 0;
    const breathe = () => {
      const L = window.stemLevels; const target = L ? Math.max(...L) : 0;
      lv += (target - lv) * 0.25; root.style.setProperty('--lv', lv.toFixed(3));
      requestAnimationFrame(breathe);
    };
    requestAnimationFrame(breathe);
  }

  // ---- rising stem-coloured particles behind the final call to action ----
  $$('section.final').forEach((sec) => {
    if (reduce) return;
    const cv = document.createElement('canvas'); cv.className = 'fx'; sec.prepend(cv);
    const g = cv.getContext('2d'); const COLS = ['#ffa91f', '#3d8dff', '#3ddc84', '#ff4fa3'];
    let parts = []; let visible = false;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(sec);
    function loop() {
      if (!visible) return;
      const dpr = Math.min(2, devicePixelRatio || 1); const w = cv.clientWidth * dpr; const h = cv.clientHeight * dpr;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      if (parts.length < 90) parts.push({ x: Math.random() * w, y: h + 10, v: (0.4 + Math.random() * 1.2) * dpr, r: (1 + Math.random() * 2.5) * dpr, c: COLS[(Math.random() * 4) | 0], ph: Math.random() * 6 });
      g.clearRect(0, 0, w, h);
      parts = parts.filter((p) => p.y > -10);
      parts.forEach((p) => {
        p.y -= p.v * (1 + (window.stemLevels ? Math.max(...window.stemLevels) * 2 : 0)); p.ph += 0.02; p.x += Math.sin(p.ph) * 0.4 * dpr;
        g.globalAlpha = Math.min(1, p.y / h) * 0.8; g.fillStyle = p.c; g.shadowColor = p.c; g.shadowBlur = 12 * dpr;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
      });
      requestAnimationFrame(loop);
    }
  });

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
