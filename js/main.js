/* ============================================================
   Glow Theme — Main interactions
   - Sticky nav scroll-state
   - Dropdown open/close (hover on desktop, click on mobile)
   - Mobile menu toggle
   - Hero blur-up background loading
   - Scroll-reveal animations (IntersectionObserver)
   - Smooth anchor scrolling
   - Contact form front-end validation
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Nav: scroll state ---------- */
  const nav = $('.site-nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 16) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Nav: dropdowns
     - 桌面（hover-capable）：鼠标悬浮展开，离开收起（CSS :hover 控制可见性）
     - 移动端（触屏）：点击展开/收起（.open 类控制）
  ---------- */
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const dropdownItems = $$('.site-nav__item.has-dropdown');

  if (supportsHover) {
    // 桌面：仅用 CSS :hover 即可，不需要 JS 切换 class
    // （这里什么都不做，CSS 已经处理）
  } else {
    // 触屏：点击切换
    dropdownItems.forEach((item) => {
      const trigger = item.querySelector(':scope > .site-nav__link');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const wasOpen = item.classList.contains('open');
        dropdownItems.forEach((el) => el.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // Close dropdowns when clicking outside（仅针对触屏 .open 状态）
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-nav__item.has-dropdown')) {
      dropdownItems.forEach((el) => el.classList.remove('open'));
    }
  });
  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownItems.forEach((el) => el.classList.remove('open'));
      if (nav) nav.classList.remove('menu-open');
    }
  });

  /* ---------- Mobile menu toggle ---------- */
  const toggle = $('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('menu-open');
    });
  }

  /* ---------- Hero blur-up ---------- */
  $$('.hero[data-bg]').forEach((hero) => {
    const bgUrl = hero.dataset.bg;
    const bgLayer = $('.hero__bg', hero);
    const blurred = $('.hero__bg-blurred', hero);
    const extend = $('.hero__bg-extend', hero);
    if (!bgUrl || !bgLayer) return;
    // 左侧羽化延展层用同一张图，模糊后作为主层右移后的补白
    if (extend) extend.style.backgroundImage = `url(${bgUrl})`;
    // Set blurred preview immediately (uses same url, blurred via CSS)
    if (blurred) blurred.style.backgroundImage = `url(${bgUrl})`;
    // Load real image, swap when ready
    const img = new Image();
    img.onload = () => {
      bgLayer.style.backgroundImage = `url(${bgUrl})`;
      hero.classList.add('loaded');
    };
    img.onerror = () => {
      hero.classList.add('loaded'); // show whatever
    };
    img.src = bgUrl;
  });

  /* ---------- Subpage banner bg ---------- */
  $$('.subpage-banner[data-bg]').forEach((banner) => {
    const url = banner.dataset.bg;
    if (!url) return;
    const bg = $('.subpage-banner__bg', banner);
    if (!bg) return;
    // 关键：--banner-img 是在 /css/theme.css 里被伪元素消费的，CSS 中的相对 URL
    // 会相对"样式表所在目录"解析（会变成 /css/assets/...），所以这里必须传绝对 URL。
    const abs = new URL(url, document.baseURI).href;
    bg.style.setProperty('--banner-img', `url("${abs}")`);
  });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Smooth anchor scrolling ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile menu after nav
      if (nav) nav.classList.remove('menu-open');
      $$('.site-nav__item.has-dropdown.open').forEach((el) => el.classList.remove('open'));
    });
  });

  /* ---------- Contact form (front-end only) ---------- */
  const form = $('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const msg = form.querySelector('[name="message"]').value.trim();
      if (!name || !email || !msg) {
        alert('请填写所有字段 / Please fill in all fields');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = '已发送 / Sent ✓';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; form.reset(); }, 2200);
    });
  }
})();