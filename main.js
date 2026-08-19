(() => {
  const q = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => [...c.querySelectorAll(s)];
  const progress = q('.scroll-progress span');
  const setProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? scrollY / max : 0;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  };
  addEventListener('scroll', setProgress, { passive: true });
  addEventListener('resize', setProgress);
  setProgress();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
  qa('.reveal').forEach((el) => observer.observe(el));

  const canvas = q('#electricCanvas');
  const ctx = canvas?.getContext('2d');
  const probe = q('.probe');
  const finePointer = matchMedia('(pointer:fine)').matches;
  if (!canvas || !ctx || !probe || !finePointer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let dpr = Math.min(devicePixelRatio || 1, 2);
  let w = innerWidth, h = innerHeight;
  let pointer = { x: w / 2, y: h / 2, px: w / 2, py: h / 2, active: false };
  const bolts = [];
  const palette = ['#00d7e9', '#eaff00', '#ffffff', '#ff3b30'];

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  const addBolt = (x1, y1, x2, y2, strength = 1) => {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    if (distance < 2) return;
    const steps = Math.max(2, Math.min(8, Math.ceil(distance / 11)));
    const pts = [{ x: x1, y: y1 }];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const nx = x1 + (x2 - x1) * t;
      const ny = y1 + (y2 - y1) * t;
      const jitter = Math.min(8, distance * .18) * strength;
      pts.push({ x: nx + (Math.random() - .5) * jitter, y: ny + (Math.random() - .5) * jitter });
    }
    pts.push({ x: x2, y: y2 });
    bolts.push({ pts, life: 1, decay: .065 + Math.random() * .035, color: palette[(Math.random() * palette.length) | 0], width: .7 + Math.random() * 1.1 });
    if (bolts.length > 48) bolts.splice(0, bolts.length - 48);
  };

  const burst = (x, y) => {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const len = 12 + Math.random() * 34;
      addBolt(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, 1.3);
    }
  };

  addEventListener('pointermove', (e) => {
    probe.classList.add('is-visible');
    probe.style.left = `${e.clientX}px`;
    probe.style.top = `${e.clientY}px`;
    pointer.px = pointer.x; pointer.py = pointer.y;
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (pointer.active) addBolt(pointer.px, pointer.py, pointer.x, pointer.y, probe.classList.contains('is-hot') ? 1.35 : .9);
    pointer.active = true;
  }, { passive: true });
  addEventListener('pointerdown', (e) => burst(e.clientX, e.clientY));
  document.addEventListener('mouseleave', () => probe.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => probe.classList.add('is-visible'));

  qa('a,button,[data-hot]').forEach((el) => {
    el.addEventListener('pointerenter', () => { probe.classList.add('is-hot'); burst(pointer.x, pointer.y); });
    el.addEventListener('pointerleave', () => probe.classList.remove('is-hot'));
  });

  const hotTargets = () => qa('a,button,[data-hot]');
  let proximityTick = 0;
  const arcToNearbyTarget = () => {
    if (!pointer.active || (++proximityTick % 3)) return;
    let best = null, bestD = 150;
    for (const el of hotTargets()) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) continue;
      const tx = Math.max(r.left, Math.min(pointer.x, r.right));
      const ty = Math.max(r.top, Math.min(pointer.y, r.bottom));
      const d = Math.hypot(pointer.x - tx, pointer.y - ty);
      if (d < bestD && d > 7) { bestD = d; best = {x:tx,y:ty}; }
    }
    if (best) addBolt(pointer.x, pointer.y, best.x, best.y, 1.15);
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    arcToNearbyTarget();
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    for (let i = bolts.length - 1; i >= 0; i--) {
      const bolt = bolts[i];
      bolt.life -= bolt.decay;
      if (bolt.life <= 0) { bolts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, bolt.life);
      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = bolt.width;
      ctx.beginPath();
      bolt.pts.forEach((p, idx) => idx ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.stroke();
      if (bolt.life > .55) {
        ctx.globalAlpha = bolt.life * .28;
        ctx.lineWidth = bolt.width + 2.5;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  draw();
})();
