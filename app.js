(function(){
  const c = window.SUGAR_SPICE_REDESIGN || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toast = document.querySelector('.toast');
  const countdown = document.getElementById('launch-countdown');
  const countdownClose = document.querySelector('.countdown-close');
  const stickyBook = document.querySelector('.sticky-book-action');
  const hero = document.querySelector('.hero');
  const finalSection = document.querySelector('.final-section');
  const footer = document.querySelector('.site-footer');
  const buyUrl = c.links && c.links.buy;
  let toastTimer;
  let countdownProgressed = false;
  let endMatterVisible = false;

  function showToast(message){
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function hasSessionDismissal(){
    try { return sessionStorage.getItem('sugarSpiceCountdownDismissed') === '1'; }
    catch (_) { return false; }
  }

  function persistCountdownDismissal(){
    try { sessionStorage.setItem('sugarSpiceCountdownDismissed','1'); }
    catch (_) {}
  }

  function closeCountdown(persist){
    if(!countdown) return;
    countdown.hidden = true;
    countdown.classList.remove('is-visible');
    if(persist) persistCountdownDismissal();
    syncStickyBook();
  }

  function openCountdownIfEligible(){
    if(!countdown || hasSessionDismissal() || countdownProgressed) return;
    countdown.hidden = false;
    requestAnimationFrame(() => countdown.classList.add('is-visible'));
  }

  function prepareActionLinks(){
    document.querySelectorAll('[data-link-key]').forEach((el) => {
      const key = el.getAttribute('data-link-key');
      const url = c.links && c.links[key];
      if(url){
        el.href = url;
        el.classList.remove('is-unresolved');
        el.removeAttribute('aria-disabled');
        if(/^https?:/i.test(url)){
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
      }else{
        el.removeAttribute('href');
        el.removeAttribute('target');
        el.removeAttribute('rel');
        el.classList.add('is-unresolved');
        el.setAttribute('aria-disabled','true');
        el.addEventListener('click', (event) => event.preventDefault());
      }
    });
  }

  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = document.querySelector(el.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block:'start'});
      }
    });
  });

  function campaignDateParts(date, timeZone){
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(date);
    return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type, Number(p.value)]));
  }

  function updateCountdown(){
    if(!countdown) return;
    const tz = c.launchTimeZone || 'Africa/Lagos';
    const [y,m,d] = (c.launchDateISO || '2026-10-11').split('-').map(Number);
    const now = campaignDateParts(new Date(), tz);
    const days = Math.round((Date.UTC(y,m-1,d) - Date.UTC(now.year,now.month-1,now.day))/86400000);
    const primary = countdown.querySelector('[data-countdown-primary]');
    const secondary = countdown.querySelector('[data-countdown-secondary]');

    if(days > 1){
      primary.textContent = days + ' Days Remaining';
      secondary.textContent = 'Launching 11 October 2026';
    }else if(days === 1){
      primary.textContent = '1 Day Remaining';
      secondary.textContent = 'Launching tomorrow';
    }else if(days === 0){
      primary.textContent = 'Launch Day';
      secondary.textContent = 'For Girls Only launches today';
    }else{
      primary.textContent = 'Now Available';
      secondary.textContent = 'For Girls Only';
    }
  }

  if(countdownClose){
    countdownClose.addEventListener('click', () => closeCountdown(true));
  }

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && countdown && !countdown.hidden){
      closeCountdown(true);
      countdownClose?.focus({preventScroll:true});
    }
  });

  function syncStickyBook(){
    if(!stickyBook) return;
    const countdownActive = countdown && !countdown.hidden && !countdownProgressed;
    const shouldShow = countdownProgressed && !countdownActive && !endMatterVisible;
    stickyBook.hidden = !shouldShow;
    stickyBook.classList.toggle('is-visible', shouldShow);
  }

  function updateProgressState(){
    if(!hero) return;
    const header = document.querySelector('.site-header');
    const threshold = (header?.getBoundingClientRect().height || 0) + 8;
    const progressed = hero.getBoundingClientRect().bottom <= threshold;
    if(progressed !== countdownProgressed){
      countdownProgressed = progressed;
      if(progressed && countdown && !countdown.hidden){
        countdown.hidden = true;
        countdown.classList.remove('is-visible');
      }else if(!progressed && countdown && !hasSessionDismissal()){
        openCountdownIfEligible();
      }
      syncStickyBook();
    }
  }

  function observeEndMatter(){
    if(!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      endMatterVisible = entries.some(entry => entry.isIntersecting);
      syncStickyBook();
    }, {threshold:0.08});
    if(finalSection) observer.observe(finalSection);
    if(footer) observer.observe(footer);
  }

  document.querySelectorAll('.faq-item button').forEach((button) => {
    const answerId = button.getAttribute('aria-controls');
    const answer = answerId ? document.getElementById(answerId) : button.closest('.faq-item')?.querySelector('.faq-answer');
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      if(answer) answer.hidden = !open;
    });
  });

  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.mobile-nav');
  if(menu && nav){
    nav.id = nav.id || 'mobile-navigation';
    menu.setAttribute('aria-controls',nav.id);
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      if(open) nav.querySelector('a')?.focus();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
        menu.focus();
      }
    });
  }

  function hydrateAsset(node){
    const src = node.getAttribute('data-asset-src');
    const alt = node.getAttribute('data-asset-alt') || '';
    if(!src) return;
    const img = new Image();
    img.decoding = 'async';
    img.loading = node.closest('.hero') ? 'eager' : 'lazy';
    img.alt = alt;
    img.addEventListener('load', () => {
      node.replaceChildren(img);
      node.classList.remove('asset-placeholder');
      node.classList.add('asset-loaded');
      if(node.classList.contains('campaign-board-frame')){
        document.querySelector('.media-full-view')?.removeAttribute('hidden');
      }
    }, {once:true});
    img.addEventListener('error', () => {
      node.classList.add('asset-unavailable');
    }, {once:true});
    img.src = src;
  }

  document.querySelectorAll('[data-asset-src]').forEach(hydrateAsset);

  const mediaOpen = document.querySelector('.media-full-view');
  const mediaDialog = document.querySelector('.media-dialog');
  const mediaDialogClose = document.querySelector('.media-dialog-close');
  if(mediaOpen && mediaDialog){
    mediaOpen.addEventListener('click', () => {
      if(typeof mediaDialog.showModal === 'function') mediaDialog.showModal();
    });
    mediaDialogClose?.addEventListener('click', () => mediaDialog.close());
    mediaDialog.addEventListener('click', (e) => {
      if(e.target === mediaDialog) mediaDialog.close();
    });
  }

  prepareActionLinks();
  updateCountdown();
  observeEndMatter();
  openCountdownIfEligible();
  updateProgressState();
  syncStickyBook();

  window.addEventListener('scroll', updateProgressState, {passive:true});
  window.addEventListener('resize', updateProgressState, {passive:true});
  setInterval(updateCountdown, 60000);
})();