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

  // ── ROI Calculator ─────────────────────────────────────
  const calcSkus = document.getElementById('calc-skus');
  const calcSpend = document.getElementById('calc-spend');
  const calcHours = document.getElementById('calc-hours');

  if (calcSkus && calcSpend && calcHours) {
    const calcSkusVal = document.getElementById('calc-skus-val');
    const calcSpendVal = document.getElementById('calc-spend-val');
    const calcHoursVal = document.getElementById('calc-hours-val');
    const resultSavings = document.getElementById('calc-savings');
    const resultHoursSaved = document.getElementById('calc-hours-saved');
    const resultCostPerSku = document.getElementById('calc-cost-per-sku');
    const resultPayback = document.getElementById('calc-payback');

    function getCostPerSku(skus) {
      // Volume-based pricing: more SKUs = lower per-SKU cost
      if (skus <= 10) return 9;
      if (skus <= 50) return 7;
      if (skus <= 100) return 6;
      if (skus <= 200) return 5;
      if (skus <= 350) return 4;
      return 3;
    }

    function formatDollars(n) {
      return '$' + Math.round(n).toLocaleString();
    }

    // Animate a result number element
    let activeAnimations = {};
    function animateResult(el, newText) {
      // Cancel any running animation on this element
      if (activeAnimations[el.id]) {
        cancelAnimationFrame(activeAnimations[el.id]);
      }

      const oldText = el.textContent;
      // Try to parse numeric values for smooth animation
      const oldMatch = oldText.match(/^\$?([\d,]+)/);
      const newMatch = newText.match(/^\$?([\d,]+)/);

      if (oldMatch && newMatch) {
        const oldNum = parseInt(oldMatch[1].replace(/,/g, ''), 10);
        const newNum = parseInt(newMatch[1].replace(/,/g, ''), 10);
        const prefix = newText.startsWith('$') ? '$' : '';
        const suffix = newText.replace(/^\$?[\d,]+/, '');
        const duration = 400;
        const start = performance.now();

        el.classList.add('animating');

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.round(oldNum + (newNum - oldNum) * eased);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) {
            activeAnimations[el.id] = requestAnimationFrame(step);
          } else {
            el.textContent = newText;
            el.classList.remove('animating');
            delete activeAnimations[el.id];
          }
        }
        activeAnimations[el.id] = requestAnimationFrame(step);
      } else {
        el.textContent = newText;
      }
    }

    function updateCalculator() {
      const skus = parseInt(calcSkus.value, 10);
      const spend = parseInt(calcSpend.value, 10);
      const hours = parseInt(calcHours.value, 10);

      // Update slider labels
      calcSkusVal.textContent = skus;
      calcSpendVal.textContent = formatDollars(spend);
      calcHoursVal.textContent = hours + ' hrs';

      // Calculations
      const savingsRate = 0.73;
      const hourReductionRate = 0.70;
      const costPerSku = getCostPerSku(skus);
      const annualAlephCost = skus * costPerSku * 12;
      const annualSavings = Math.max(0, (spend * savingsRate) - annualAlephCost);
      const hoursSavedPerWeek = hours * hourReductionRate;
      const hoursSavedPerYear = Math.round(hoursSavedPerWeek * 52);

      // Payback period: months until Aleph cost is recouped by savings
      const monthlySavings = (spend * savingsRate) / 12;
      const monthlyAlephCost = skus * costPerSku;
      let paybackText;
      if (monthlySavings <= 0 || monthlySavings <= monthlyAlephCost) {
        paybackText = 'N/A';
      } else {
        const paybackMonths = monthlyAlephCost / (monthlySavings - monthlyAlephCost);
        if (paybackMonths < 1) {
          paybackText = '< 1 mo';
        } else {
          paybackText = Math.ceil(paybackMonths) + ' mo';
        }
      }

      // Animate results
      animateResult(resultSavings, formatDollars(annualSavings));
      animateResult(resultHoursSaved, hoursSavedPerYear.toLocaleString() + ' hrs');
      animateResult(resultCostPerSku, '$' + costPerSku + '/mo');
      resultPayback.textContent = paybackText;

      // Track calculator engagement (debounced via the input event)
      if (typeof gtag === 'function') {
        clearTimeout(window._calcTrackTimeout);
        window._calcTrackTimeout = setTimeout(() => {
          gtag('event', 'calculator_interact', {
            landing_page: 'hcfoods_referral',
            calc_skus: skus,
            calc_spend: spend,
            calc_hours: hours
          });
        }, 1500);
      }
    }

    // Bind events
    [calcSkus, calcSpend, calcHours].forEach(slider => {
      slider.addEventListener('input', updateCalculator);
    });

    // Initial calculation
    updateCalculator();
  }

  // Localhost detection
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.querySelectorAll('a[href*="app.alephco.io"]').forEach(a => {
      a.href = a.href.replace('https://app.alephco.io', 'http://localhost:4060');
    });
  }
});
