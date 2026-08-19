(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.progress span');
  const cursor = document.querySelector('.cursor');
  const cursorLabel = cursor?.querySelector('span');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let scrollY = window.scrollY;
  let ticking = false;

  function renderScroll(){
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    const p = clamp(scrollY / max, 0, 1);
    progress.style.transform = `scaleX(${p})`;
    if(!reduced){
      parallaxEls.forEach(el => {
        const speed = Number(el.dataset.parallax || 0);
        const r = el.getBoundingClientRect();
        const center = r.top + r.height/2 - innerHeight/2;
        el.style.transform = `translate3d(0, ${center * -speed}px, 0)`;
      });
    }
    ticking = false;
  }
  addEventListener('scroll', () => { scrollY = window.scrollY; if(!ticking){ requestAnimationFrame(renderScroll); ticking=true; } }, {passive:true});
  renderScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-in');
        observer.unobserve(e.target);
      }
    });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  if(cursor && matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.classList.add('is-visible');
    });
    document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => {
        cursor.classList.add('is-active');
        if(cursorLabel) cursorLabel.textContent = el.dataset.cursor || (el.matches('button') ? 'PLAY' : '↗');
      });
      el.addEventListener('pointerleave', () => {
        cursor.classList.remove('is-active');
        if(cursorLabel) cursorLabel.textContent = 'VER';
      });
    });
  }

  const mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      const v = target.querySelector('video');
      if(!v) return;
      if(isIntersecting && !reduced) v.play().catch(()=>{}); else v.pause();
    });
  }, {threshold:.45});
  document.querySelectorAll('.motion-card').forEach(el => mediaObserver.observe(el));

  const dialog = document.querySelector('#mediaDialog');
  const dialogVideo = document.querySelector('#dialogVideo');
  const dialogTitle = document.querySelector('#dialogTitle');
  const closeBtn = document.querySelector('.dialog-close');
  function openMedia(src,title){
    if(!dialog || !dialogVideo) return;
    dialogVideo.src = src;
    dialogTitle.textContent = title || 'Arquivo em vídeo';
    dialog.showModal();
    document.body.classList.add('is-modal');
    dialogVideo.play().catch(()=>{});
  }
  function closeMedia(){
    if(!dialog || !dialogVideo) return;
    dialogVideo.pause();
    dialogVideo.removeAttribute('src');
    dialogVideo.load();
    dialog.close();
    document.body.classList.remove('is-modal');
  }
  document.querySelectorAll('.js-open-media').forEach(btn => btn.addEventListener('click', () => openMedia(btn.dataset.src, btn.dataset.title)));
  closeBtn?.addEventListener('click', closeMedia);
  dialog?.addEventListener('click', e => { if(e.target === dialog) closeMedia(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && dialog?.open) closeMedia(); });

  const canvas = document.querySelector('#signalCanvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let w=0,h=0,dpr=1, mx=.5,my=.5, frame=0;
    function resize(){
      dpr=Math.min(devicePixelRatio||1,2); w=canvas.clientWidth; h=canvas.clientHeight;
      canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); addEventListener('resize',resize,{passive:true});
    addEventListener('pointermove',e=>{mx=e.clientX/innerWidth;my=e.clientY/innerHeight;},{passive:true});
    function draw(){
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle='rgba(244,243,239,.38)'; ctx.lineWidth=.7;
      const rows=7;
      for(let j=0;j<rows;j++){
        ctx.beginPath();
        const yy=(j+1)*h/(rows+1);
        for(let x=0;x<=w;x+=12){
          const amp=12+38*Math.abs(mx-.5)+j*2;
          const y=yy+Math.sin(x*.012+j*1.7+frame*.015)*(amp*(.35+my));
          if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      frame++;
      if(!reduced) requestAnimationFrame(draw);
    }
    draw();
  }
})();
