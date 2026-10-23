// Interactive stems demo: the four stems Reboxed separated (HQ model) from a CC BY song, played in
// sync with Web Audio. Click = mute / unmute, double click = solo, presets, drag to scrub.
(() => {
  const host = document.querySelector('[data-stems-player]');
  if (!host) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  host.className = 'player reveal d1';
  host.innerHTML = `
    <div class="p-head">
      <button class="p-play" aria-label="Lecture"><svg class="p-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
      <div class="p-title"><b>Hot Core</b><span>Alex Beroza ft. Snowflake</span></div>
      <div class="p-meta"><span class="chip mono">135 BPM</span><span class="chip mono">8A</span><span class="chip hq mono">STEMS HQ</span><span class="chip mono p-time">0:00</span></div>
    </div>
    <div class="p-wave"><canvas class="p-canvas"></canvas><div class="loading">▶ pour charger les 4 stems (4,5 Mo)</div></div>
    <div class="p-over"><canvas class="p-ocanvas"></canvas></div>
    <div class="p-stems"></div>
    <div class="p-presets">
      <button data-preset="all" class="on">Tout</button><button data-preset="acapella">Acapella</button><button data-preset="instrumental">Instrumental</button><button data-preset="drums">Batterie seule</button><button data-preset="nobass">Sans basse</button>
    </div>
    <p class="p-note">Clic = couper · double-clic = solo · glisse sur l'onde pour te déplacer. Musique : <a href="https://ccmixter.org/files/AlexBeroza/31990" target="_blank" rel="noopener">« Hot Core »</a> d'Alex Beroza, voix <a href="https://ccmixter.org/files/snowflake/29878" target="_blank" rel="noopener">Snowflake</a>, <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. Extrait de 32 mesures.</p>`;
  window.observeReveal?.(host);

  const STEMS = [
    { id: 'vocals', name: 'VOCAL', color: '#ff4fa3', hint: 'la voix' },
    { id: 'other', name: 'INST', color: '#3ddc84', hint: 'synthés, mélodies' },
    { id: 'bass', name: 'BASS', color: '#3d8dff', hint: 'la basse' },
    { id: 'drums', name: 'DRUMS', color: '#ffa91f', hint: 'la batterie' },
  ];
  const DRAW = ['drums', 'bass', 'other', 'vocals']; // loud parts first, like Reboxed
  const canvas = $('.p-canvas', host); const g = canvas.getContext('2d');
  const over = $('.p-ocanvas', host); const og = over.getContext('2d');
  const PPS = 150;
  let ctx = null; let buffers = null; let env = null; let overBase = null;
  const gains = {}; const analysers = {}; let sources = []; let startedAt = 0; let offset = 0; let playing = false; let loading = false;
  const on = Object.fromEntries(STEMS.map((s) => [s.id, true]));
  let solo = null;
  $('.p-stems', host).innerHTML = STEMS.map((s) => `<button class="stem-btn" data-stem="${s.id}" style="--c:${s.color}"><b>${s.name}</b><small>${s.hint}</small><span class="meter"></span></button>`).join('');
  const btns = Object.fromEntries($$('.stem-btn', host).map((b) => [b.dataset.stem, b]));
  const duration = () => buffers?.drums.duration ?? 56.9;
  const position = () => (playing ? (ctx.currentTime - startedAt + offset) % duration() : offset);
  const audible = (id) => (solo ? solo === id : on[id]);
  const applyGains = () => STEMS.forEach((s) => {
    if (gains[s.id]) gains[s.id].gain.setTargetAtTime(audible(s.id) ? 1 : 0, ctx.currentTime, 0.03);
    btns[s.id].classList.toggle('off', !audible(s.id));
    btns[s.id].classList.toggle('solo', solo === s.id);
  });

  async function load() {
    loading = true;
    $('.loading', host).textContent = 'Chargement des 4 stems…';
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.connect(ctx.destination);
    buffers = Object.fromEntries(await Promise.all(STEMS.map(async (s) => [s.id, await ctx.decodeAudioData(await (await fetch(`assets/stems/${s.id}.mp3`)).arrayBuffer())])));
    env = {};
    for (const s of STEMS) {
      const b = buffers[s.id]; const n = Math.ceil(b.duration * PPS); const out = new Float32Array(n);
      const L = b.getChannelData(0); const R = b.numberOfChannels > 1 ? b.getChannelData(1) : L; const step = b.sampleRate / PPS;
      for (let i = 0; i < n; i++) { let m = 0; const a = Math.floor(i * step); const z = Math.min(L.length, Math.floor((i + 1) * step)); for (let j = a; j < z; j++) { const v = Math.abs(L[j] + R[j]) / 2; if (v > m) m = v; } out[i] = m; }
      let peak = 0; for (const v of out) if (v > peak) peak = v;
      for (let i = 0; i < n; i++) out[i] /= peak || 1;
      env[s.id] = out;
      gains[s.id] = ctx.createGain(); analysers[s.id] = ctx.createAnalyser(); analysers[s.id].fftSize = 512;
      gains[s.id].connect(analysers[s.id]); analysers[s.id].connect(master);
    }
    $('.loading', host)?.remove();
    drawOverview();
    loading = false;
  }
  function start(at) {
    sources.forEach((src) => { try { src.stop(); } catch { /* already stopped */ } });
    const when = ctx.currentTime + 0.05;
    const from = ((at % duration()) + duration()) % duration();
    sources = STEMS.map((s) => { const src = ctx.createBufferSource(); src.buffer = buffers[s.id]; src.loop = true; src.connect(gains[s.id]); src.start(when, from); return src; });
    startedAt = when; offset = from; playing = true;
    host.classList.add('playing'); $('.p-icon', host).innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
    applyGains();
  }
  function stop() {
    offset = position();
    sources.forEach((src) => { try { src.stop(); } catch { /* already stopped */ } }); sources = [];
    playing = false; host.classList.remove('playing'); $('.p-icon', host).innerHTML = '<path d="M8 5v14l11-7z"/>';
    window.stemLevels = null;
  }
  const play = async () => {
    if (loading) return;
    try {
      if (!buffers) await load();
      if (ctx.state === 'suspended') await ctx.resume();
      if (playing) stop(); else start(offset);
    } catch (err) {
      loading = false;
      const l = $('.loading', host); if (l) l.textContent = 'Impossible de charger les stems.';
      console.error(err);
    }
  };
  $('.p-play', host).addEventListener('click', play);
  const PRESETS = { all: ['vocals', 'other', 'bass', 'drums'], acapella: ['vocals'], instrumental: ['other', 'bass', 'drums'], drums: ['drums'], nobass: ['vocals', 'other', 'drums'] };
  const setPreset = (p) => $$('.p-presets button', host).forEach((b) => b.classList.toggle('on', b.dataset.preset === p));
  STEMS.forEach((s) => {
    let timer = null;
    btns[s.id].addEventListener('click', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (solo) solo = null; else on[s.id] = !on[s.id]; setPreset(null); if (ctx) applyGains(); else btns[s.id].classList.toggle('off', !on[s.id]); }, 220);
    });
    btns[s.id].addEventListener('dblclick', () => { clearTimeout(timer); solo = solo === s.id ? null : s.id; setPreset(null); if (ctx) applyGains(); });
  });
  $$('.p-presets button', host).forEach((b) => b.addEventListener('click', async () => {
    solo = null; STEMS.forEach((s) => { on[s.id] = PRESETS[b.dataset.preset].includes(s.id); });
    setPreset(b.dataset.preset);
    if (!buffers) { await play(); return; }
    applyGains();
    if (!playing) start(offset);
  }));
  // "▶ Écouter la démo" (top of the page): scroll here and play at once, then after a few seconds go
  // to Acapella, so the before / after of the separation is heard without touching anything.
  document.querySelectorAll('[data-demo-play]').forEach((a) => a.addEventListener('click', async (e) => {
    e.preventDefault();
    host.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (playing) return;
    let touched = false;
    host.addEventListener('pointerdown', () => { touched = true; }, { once: true });
    await play();
    setTimeout(() => { if (playing && !touched) $('.p-presets [data-preset="acapella"]', host)?.click(); }, 7000);
  }));
  let drag = null;
  const wave = $('.p-wave', host);
  wave.addEventListener('pointerdown', (e) => { if (!buffers) return; drag = { x: e.clientX, pos: position(), was: playing }; if (playing) stop(); wave.setPointerCapture(e.pointerId); });
  wave.addEventListener('pointermove', (e) => { if (!drag) return; offset = ((drag.pos - ((e.clientX - drag.x) / canvas.clientWidth) * 8) % duration() + duration()) % duration(); });
  wave.addEventListener('pointerup', () => { if (drag?.was) start(offset); drag = null; });
  $('.p-over', host).addEventListener('click', (e) => { if (!buffers) return; const r = e.currentTarget.getBoundingClientRect(); const at = ((e.clientX - r.left) / r.width) * duration(); if (playing) start(at); else offset = at; });

  const lerp = (a, x) => { const i = Math.floor(x); const f = x - i; return (a[i] ?? 0) + ((a[i + 1] ?? 0) - (a[i] ?? 0)) * f; };
  function drawOverview() {
    const dpr = Math.min(2, devicePixelRatio || 1); const w = Math.round(over.clientWidth * dpr); const h = Math.round(over.clientHeight * dpr);
    over.width = w; over.height = h; og.clearRect(0, 0, w, h);
    for (const id of DRAW) {
      const s = STEMS.find((x) => x.id === id); const a = env[id];
      og.fillStyle = s.color; og.globalAlpha = 0.7;
      for (let x = 0; x < w; x++) { const v = a[Math.floor((x / w) * a.length)] ?? 0; const hh = Math.min(1, v * 1.3) * h * 0.9; og.fillRect(x, h - hh, 1, hh); }
    }
    og.globalAlpha = 1;
    overBase = og.getImageData(0, 0, w, h);
  }
  const td = new Float32Array(512);
  function frame() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr); const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    g.fillStyle = '#07070a'; g.fillRect(0, 0, w, h);
    const cx = w / 2; const cy = h / 2;
    if (env) {
      const span = 8; const pos = position(); const secPx = span / w; const t0 = pos - cx * secPx;
      const beat = 60 / 135;
      for (let b = Math.ceil(t0 / beat); b * beat < t0 + span; b++) {
        const x = (b * beat - t0) / secPx; const bar = ((b % 4) + 4) % 4 === 0;
        g.fillStyle = bar ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)'; g.fillRect(x, 0, dpr, h);
        g.fillStyle = bar ? 'rgba(255,70,70,1)' : 'rgba(255,255,255,.7)';
        g.fillRect(x, 0, bar ? 2 * dpr : dpr, (bar ? 10 : 6) * dpr); g.fillRect(x, h - (bar ? 10 : 6) * dpr, bar ? 2 * dpr : dpr, (bar ? 10 : 6) * dpr);
      }
      const stepPx = Math.max(1, Math.round(dpr));
      for (const id of DRAW) {
        const s = STEMS.find((x) => x.id === id); const a = env[id]; const live = audible(id);
        g.fillStyle = live ? s.color : 'rgba(90,90,96,.55)'; g.globalAlpha = live ? 0.85 : 1;
        for (let x = 0; x < w; x += stepPx) {
          const tt = (((t0 + x * secPx) % duration()) + duration()) % duration();
          const hh = Math.min(1, lerp(a, tt * PPS) * 1.5) * (h / 2 - 14 * dpr);
          if (hh > 0.5) g.fillRect(x, cy - hh, stepPx, hh * 2);
        }
      }
      g.globalAlpha = 1;
      g.fillStyle = '#fff'; g.fillRect(cx - dpr, 0, 2 * dpr, h);
      if (overBase) {
        og.putImageData(overBase, 0, 0);
        const x = (pos / duration()) * over.width;
        og.fillStyle = 'rgba(0,0,0,.45)'; og.fillRect(0, 0, x, over.height);
        og.fillStyle = '#fff'; og.fillRect(x - 1, 0, 2, over.height);
      }
      $('.p-time', host).textContent = `${Math.floor(pos / 60)}:${String(Math.floor(pos % 60)).padStart(2, '0')}`;
    } else {
      const t = performance.now();
      DRAW.forEach((id, s) => {
        g.fillStyle = STEMS.find((x) => x.id === id).color; g.globalAlpha = 0.22;
        for (let x = 0; x < w; x += 3 * dpr) { const v = (0.35 + 0.25 * Math.sin(x / (40 * dpr) + t / 700 + s)) * Math.abs(Math.sin(x / ((14 + s * 5) * dpr) + t / 500)); g.fillRect(x, cy - v * h * 0.35, 2 * dpr, v * h * 0.7); }
      });
      g.globalAlpha = 1;
    }
    if (playing) {
      window.stemLevels = STEMS.map((s) => {
        const an = analysers[s.id]; an.getFloatTimeDomainData(td);
        let rms = 0; for (let i = 0; i < an.fftSize; i++) rms += td[i] * td[i];
        rms = Math.sqrt(rms / an.fftSize);
        btns[s.id].querySelector('.meter').style.width = `${Math.min(100, Math.sqrt(rms) * 210)}%`;
        return Math.min(1, Math.sqrt(rms) * 1.8);
      });
    } else STEMS.forEach((s) => { btns[s.id].querySelector('.meter').style.width = '0'; });
    requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { if (env) drawOverview(); });
  requestAnimationFrame(frame);
})();
