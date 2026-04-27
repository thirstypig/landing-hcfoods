// Landing page JS — HC Foods referral
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  // Theme toggle
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    const saved = localStorage.getItem('aleph-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('aleph-theme', next);
    });
  }

  // Track CTA clicks
  document.querySelectorAll('a[data-track]').forEach(a => {
    a.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'cta_click', {
          landing_page: 'hcfoods_referral',
          cta_label: a.getAttribute('data-track'),
          cta_url: a.href
        });
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.classList.toggle('open');
    });
  });

  // Localhost detection
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.querySelectorAll('a[href*="app.alephco.io"]').forEach(a => {
      a.href = a.href.replace('https://app.alephco.io', 'http://localhost:4060');
    });
  }
});
