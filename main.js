(() => {
  const OLD = 'https://supergambiarra-eletronica-bboavc5ib-labyrts-projects.vercel.app/main.js';
  const media = [
    ['.hero-animated-logo','1KcezxCvA__Im8ytMaETh_ZJCtRYrYgh-','https://drive.google.com/thumbnail?id=1KcezxCvA__Im8ytMaETh_ZJCtRYrYgh-&sz=w1800'],
    ['.stage-main iframe','1XptZejpY3dkCRRJu6stgiKtmWno60dNc','https://drive.google.com/thumbnail?id=1KiKiJ96_MfHETMW7nxieYnocGGz1eecY&sz=w1800'],
    ['.video-card.v-acid iframe','1riBEIot8w-QJ5tmhfrKBJc1BWRZWPE-r','https://drive.google.com/thumbnail?id=1riBEIot8w-QJ5tmhfrKBJc1BWRZWPE-r&sz=w1800'],
    ['.video-card.v-cyan iframe','1VuXMRqbeJXrA7GWNKZMBBzB45GejSKtD','https://drive.google.com/thumbnail?id=1VuXMRqbeJXrA7GWNKZMBBzB45GejSKtD&sz=w1800'],
    ['.video-card.v-red iframe','1h4R6qcdQ-OozdHZS8L86oEw6yJueI-rb','https://drive.google.com/thumbnail?id=1h4R6qcdQ-OozdHZS8L86oEw6yJueI-rb&sz=w1800'],
    ['.video-card.v-blue iframe','1Zjs6W2YwNJFFg0eT2fdWUzLOnxk7vRYr','https://drive.google.com/thumbnail?id=1Zjs6W2YwNJFFg0eT2fdWUzLOnxk7vRYr&sz=w1800']
  ];

  const makeVideo = (node,id,poster,hero=false) => {
    if (!node) return null;
    const v = document.createElement('video');
    v.className = (hero ? 'hero-animated-logo ' : '') + 'js-autoplay-video';
    v.src = '/api/video?id=' + encodeURIComponent(id);
    v.poster = poster;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.loop = true;
    v.autoplay = hero;
    v.playsInline = true;
    v.preload = hero ? 'auto' : 'metadata';
    v.setAttribute('muted','');
    v.setAttribute('loop','');
    v.setAttribute('playsinline','');
    if (hero) v.setAttribute('autoplay','');
    node.replaceWith(v);
    return v;
  };

  const start = () => {
    const vids = media.map((item,i)=>makeVideo(document.querySelector(item[0]),item[1],item[2],i===0)).filter(Boolean);
    const cap = document.querySelector('.stage-main figcaption');
    if (cap) cap.textContent = 'REGISTRO DA INSTALAÇÃO / LOOP AUTOMÁTICO';

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= .18) {
          v.muted = true;
          v.volume = 0;
          const p = v.play();
          if (p && p.catch) p.catch(()=>{});
        } else {
          v.pause();
        }
      });
    }, { threshold:[0,.18,.55], rootMargin:'8% 0px 8% 0px' });
    vids.forEach(v=>io.observe(v));

    const old = document.createElement('script');
    old.src = OLD;
    old.defer = true;
    document.head.appendChild(old);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
