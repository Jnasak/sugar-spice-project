(function(){
  const c = window.SUGAR_SPICE_REDESIGN || {};
  const toast = document.querySelector('.toast');
  let toastTimer;

  function showToast(message){
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  document.querySelectorAll('[data-link-key]').forEach((el) => {
    const key = el.getAttribute('data-link-key');
    const url = c.links && c.links[key];
    if(url){
      el.href = url;
      if(/^https?:/.test(url)) el.target = '_blank';
    }else{
      el.href = '#';
      el.classList.add('is-pending');
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const label = el.getAttribute('data-pending-label') || 'This destination';
        showToast(label + ' will be available once the launch destination is live.');
      });
    }
  });

  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = document.querySelector(el.getAttribute('href'));
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  function campaignDateParts(date, timeZone){
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(date);
    return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type, Number(p.value)]));
  }

  function updateCountdown(){
    const ribbon = document.getElementById('launch-countdown');
    if(!ribbon) return;
    const tz = c.launchTimeZone || 'Africa/Lagos';
    const [y,m,d] = (c.launchDateISO || '2026-10-11').split('-').map(Number);
    const now = campaignDateParts(new Date(), tz);
    const days = Math.round((Date.UTC(y,m-1,d) - Date.UTC(now.year,now.month-1,now.day))/86400000);
    const mobile = window.matchMedia('(max-width: 680px)').matches;
    let full, short;
    if(days > 1){
      full = days + ' DAYS TO GO • FOR GIRLS ONLY LAUNCHES 11 OCTOBER 2026 • HELP A GIRL BECOME •';
      short = days + ' DAYS TO GO • LAUNCHING 11 OCTOBER •';
    }else if(days === 1){
      full = '1 DAY TO GO • FOR GIRLS ONLY LAUNCHES TOMORROW • HELP A GIRL BECOME •';
      short = '1 DAY TO GO • LAUNCHING TOMORROW •';
    }else if(days === 0){
      full = 'LAUNCH DAY • FOR GIRLS ONLY LAUNCHES TODAY • HELP A GIRL BECOME •';
      short = 'LAUNCH DAY • FOR GIRLS ONLY •';
    }else{
      full = 'NOW LAUNCHED • GET FOR GIRLS ONLY • JOIN THE SUGAR & SPICE PROJECT •';
      short = 'NOW LAUNCHED • GET FOR GIRLS ONLY •';
    }
    const msg = mobile ? short : full;
    ribbon.setAttribute('aria-label', msg.replaceAll('•',''));
    ribbon.querySelectorAll('[data-countdown-message]').forEach(n => n.textContent = msg);
  }

  document.querySelectorAll('.faq-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.mobile-nav');
  if(menu && nav){
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  updateCountdown();
  const mq = window.matchMedia('(max-width: 680px)');
  if(mq.addEventListener) mq.addEventListener('change', updateCountdown);
  setInterval(updateCountdown, 60000);
})();