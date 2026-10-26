(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const nav = $('#nav');
  const onNav = () => nav.classList.toggle('solid', scrollY > innerHeight * 0.72);

  const st = $('#statement');
  st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', st);
  const onStatement = () => {
    const r = st.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (innerHeight * 0.62 + r.height * 0.4)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  };

  const load = v => { if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); } };
  const lazy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) load(e.target); }), { rootMargin: '120% 0px' });
  const watch = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (v.classList.contains('clip')) return;
    if (e.isIntersecting) { load(v); v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.35 });
  $$('video').forEach(v => {
    if (v.classList.contains('clip')) { if (v.dataset.src) lazy.observe(v); return; }
    if (v.dataset.src) lazy.observe(v);
    watch.observe(v);
  });

  const play = $('#play'), clips = $$('.clip'), verbs = $$('#verbs button'), line = $('#line'), bar = $('#bar');
  const lines = [
    'Take the driver’s seat of main battle tanks, fighting vehicles and more.',
    'Look through the gunner’s sight. Range it, lead it, fire.',
    'Or step back and run the whole company from the map.',
    'Call in rockets and artillery on what you spot.',
    'Send a drone up to see what is behind the next ridge.'
  ];
  let cur = -1;
  const set = i => {
    if (i === cur) return;
    cur = i;
    clips.forEach((c, k) => {
      const on = k === i;
      c.classList.toggle('on', on);
      if (on) { load(c); c.currentTime = 0; c.play().catch(() => {}); }
      else setTimeout(() => { if (k !== cur) c.pause(); }, 950);
    });
    verbs.forEach((b, k) => b.classList.toggle('on', k === i));
    line.classList.add('out');
    setTimeout(() => { line.textContent = lines[i]; line.classList.remove('out'); }, 260);
  };
  const onPlay = () => {
    const r = play.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = Math.min(0.9999, Math.max(0, -r.top / span));
    const n = clips.length;
    set(Math.floor(p * n));
    bar.style.width = ((p * n) % 1 * 100) + '%';
  };
  verbs.forEach((b, i) => b.addEventListener('click', () => {
    const span = play.offsetHeight - innerHeight;
    scrollTo({ top: play.offsetTop + span * ((i + 0.5) / clips.length) });
  }));
  load(clips[0]); clips[0].play().catch(() => {});
  new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) clips.forEach(c => c.pause());
    else if (cur >= 0) clips[cur].play().catch(() => {});
  })).observe(play);

  const reel = $('#reel');
  const step = () => (reel.querySelector('figure').offsetWidth + 16);
  $('#prev').addEventListener('click', () => reel.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#next').addEventListener('click', () => reel.scrollBy({ left: step(), behavior: 'smooth' }));
  
  let down = false, sx = 0, sl = 0;
  reel.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = reel.scrollLeft; reel.style.scrollSnapType = 'none'; });
  addEventListener('pointerup', () => { if (!down) return; down = false; reel.style.scrollSnapType = ''; });
  addEventListener('pointermove', e => { if (down) reel.scrollLeft = sl - (e.clientX - sx); });

  const msg = $('#msg'), openB = $('#msgOpen'), letter = $('#letter');
  const setMsg = o => { msg.classList.toggle('open', o); openB.setAttribute('aria-expanded', o); letter.setAttribute('aria-hidden', !o); };
  openB.addEventListener('click', () => setMsg(true));
  $('#msgClose').addEventListener('click', () => setMsg(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMsg(false); });
  addEventListener('pointerdown', e => { if (msg.classList.contains('open') && !msg.contains(e.target)) setMsg(false); });

  const tick = () => { onNav(); onStatement(); onPlay(); };
  addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
  addEventListener('resize', tick);
  tick();
})();
