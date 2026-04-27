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
      if (typeof gtag === 'function') {
        gtag('event', 'faq_toggle', {
          landing_page: 'hcfoods_referral',
          question: btn.textContent.trim().substring(0, 80)
        });
      }
    });
  });

  // Sticky CTA — show after scrolling past hero
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    const hero = document.querySelector('.hero');
    const observer = new IntersectionObserver(([entry]) => {
      stickyCta.classList.toggle('visible', !entry.isIntersecting);
    }, { threshold: 0 });
    if (hero) observer.observe(hero);
  }

  // Counter animations — animate numbers on scroll
  const counters = document.querySelectorAll('.stat-number');
  const animated = new Set();
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated.has(entry.target)) {
        animated.add(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const text = el.textContent.trim();
    const match = text.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
    if (!match) return;
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      }
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Scroll depth tracking
  const scrollThresholds = [25, 50, 75, 90];
  const firedThresholds = new Set();
  window.addEventListener('scroll', () => {
    const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    scrollThresholds.forEach(t => {
      if (scrollPct >= t && !firedThresholds.has(t)) {
        firedThresholds.add(t);
        if (typeof gtag === 'function') {
          gtag('event', 'scroll_depth', {
            landing_page: 'hcfoods_referral',
            percent_scrolled: t
          });
        }
      }
    });
  }, { passive: true });

  // Localhost detection
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.querySelectorAll('a[href*="app.alephco.io"]').forEach(a => {
      a.href = a.href.replace('https://app.alephco.io', 'http://localhost:4060');
    });
  }
});
