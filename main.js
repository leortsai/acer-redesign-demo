/* Acer Redesign — 產品詳細頁 main.js */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isTouch = window.matchMedia('(hover: none)');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ============ §2.2 機型提示：?model= 非 swift-go-14-ai 或缺省 ============ */
  const model = new URLSearchParams(location.search).get('model');
  if (model !== 'swift-go-14-ai') $('#modelNotice').hidden = false;

  /* ============ Toast ============ */
  const toastEl = $('#toast');
  let toastTimer = null;
  function showToast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3000);
  }
  const TOASTS = {
    checkout: '概念性 demo，未實作結帳流程',
    compare: '比較功能請見<a href="laptops-list.html">列表頁</a>'
  };
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-toast]');
    if (btn) showToast(TOASTS[btn.dataset.toast]);
  });

  /* ============ 保固方案（僅 UI 狀態，無表單提交） ============ */
  $$('.warranty-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      $$('.warranty-opt').forEach(o => o.setAttribute('aria-checked', o === opt));
    });
  });

  /* ============ Zone 6 FAQ accordion ============ */
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      q.setAttribute('aria-expanded', q.getAttribute('aria-expanded') !== 'true');
    });
  });

  /* ============ §6.3 Sticky Buy Bar：Hero 底部離開視窗後滑入，全頁跟隨 ============ */
  const stickyBuy = $('#stickyBuy');
  const heroEl = $('#hero');
  let sbTicking = false;
  function updateStickyBuy() {
    sbTicking = false;
    const show = heroEl.getBoundingClientRect().bottom <= 0;
    stickyBuy.classList.toggle('is-visible', show);
  }
  window.addEventListener('scroll', () => {
    if (!sbTicking) { sbTicking = true; requestAnimationFrame(updateStickyBuy); }
  }, { passive: true });
  updateStickyBuy();

  /* ============ §6.1 Zone 1 進場（IO + CSS transition，單次播放） ============ */
  if (!reducedMotion.matches) {
    document.documentElement.classList.add('js-anim');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -25% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
    // 已在首屏的元素立即顯示
    requestAnimationFrame(() => {
      $$('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight * 0.75) el.classList.add('is-in');
      });
    });
  }

  /* ============ §7.1 Zone 3 規格表數值 count-up（僅純數值） ============ */
  function countUp(el, target, dec, dur) {
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3); /* 對應 --ease-out 的近似 */
    function frame(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = (target * ease(p)).toFixed(dec);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(frame);
  }
  if (!reducedMotion.matches) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        $$('.cnt', en.target).forEach(span => {
          countUp(span, parseFloat(span.dataset.val), +span.dataset.dec, 800);
        });
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    $$('.spec-row').forEach(row => { if ($('.cnt', row)) cio.observe(row); });
  }

  /* ============ §7.2 連接埠互動 ============ */
  $$('.port-svg').forEach(svg => {
    const card = svg.closest('.port-card');
    const caption = $('[data-port-caption]', card);
    const ports = $$('.port', svg);
    function setActive(port) {
      ports.forEach(p => p.classList.toggle('is-active', p === port));
      svg.classList.toggle('has-active', !!port);
      if (caption) caption.textContent = port ? port.dataset.portLabel : '';
    }
    ports.forEach(port => {
      if (isTouch.matches) {
        /* 觸控：點擊切換，標籤顯示在圖下方固定位置 */
        port.addEventListener('click', () => {
          setActive(port.classList.contains('is-active') ? null : port);
        });
      } else {
        port.addEventListener('mouseenter', () => setActive(port));
        port.addEventListener('mouseleave', () => setActive(null));
        port.addEventListener('click', () => setActive(port));
      }
      port.addEventListener('focus', () => setActive(port));
      port.addEventListener('blur', () => setActive(null));
      port.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(port); }
      });
    });
  });

  /* ============ §6.2 Zone 2 Spec Viz：pin + scrub ============ */
  /* 資料常數 — 刻度與觸發進度由數值算出，換機型只改這裡 */
  const WEIGHT = {
    axisMax: 1.6,
    items: [
      { sel: '#wbar-0', v: 1.39 },
      { sel: '#wbar-1', v: 1.42 },
      { sel: '#wbar-2', v: 1.58 }
    ]
  };
  const BATTERY = { axisMax: 18, value: 16, marker: 8 };

  /* 以資料驅動寫入 bar 寬度與刻度位置（no-JS fallback 已寫在 markup） */
  WEIGHT.items.forEach(it => {
    const fill = $(it.sel + ' .wbar-fill');
    if (fill) fill.style.width = (it.v / WEIGHT.axisMax * 100).toFixed(1) + '%';
  });
  $('#batteryFill').style.width = (BATTERY.value / BATTERY.axisMax * 100).toFixed(1) + '%';
  $('.battery-marker').style.left = (BATTERY.marker / BATTERY.axisMax * 100).toFixed(1) + '%';

  const specViz = $('#spec-viz');
  const vizSkip = $('#vizSkip');
  let pinST = null;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    /* 防呆：768px 以下與 prefers-reduced-motion 完全不註冊 pin */
    mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      specViz.classList.add('viz-pinned');

      const mods = { w: '#mod-weight', b: '#mod-battery', p: '#mod-ports' };
      const descs = { w: '#desc-weight', b: '#desc-battery', p: '#desc-ports' };
      const counters = [];

      /* 初始狀態 */
      gsap.set([mods.b, mods.p, descs.b, descs.p], { autoAlpha: 0 });
      gsap.set('#batteryFlag', { autoAlpha: 0 });
      WEIGHT.items.forEach(it => { $(it.sel + ' .wbar-val').textContent = '0.00 kg'; });
      $('#batteryNum').textContent = '0';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#spec-viz', pin: true,
          start: 'top top', end: '+=250%',
          scrub: 1, anticipatePin: 1
        },
        defaults: { ease: 'none' }
      });
      pinST = tl.scrollTrigger;

      /* 0–30%：三條重量 bar 依序長出，數字同步滾動 */
      WEIGHT.items.forEach((it, i) => {
        const at = i * 0.04;
        tl.fromTo(it.sel + ' .wbar-fill', { scaleX: 0 }, { scaleX: 1, duration: 0.22 }, at);
        const valEl = $(it.sel + ' .wbar-val');
        const proxy = { v: 0 };
        counters.push({ el: valEl, final: it.v.toFixed(2) + ' kg' });
        tl.to(proxy, {
          v: it.v, duration: 0.22,
          onUpdate: () => { valEl.textContent = proxy.v.toFixed(2) + ' kg'; }
        }, at);
      });
      tl.fromTo('#wbarDiff', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.26);

      /* 30–40%：重量退為背景，續航浮現 */
      tl.to(mods.w, { y: -40, autoAlpha: 0.3, duration: 0.10 }, 0.30);
      tl.to(descs.w, { autoAlpha: 0, duration: 0.08 }, 0.30);
      tl.to(mods.w, { autoAlpha: 0, duration: 0.08 }, 0.40);
      tl.fromTo(mods.b, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.08 }, 0.40);
      tl.fromTo(descs.b, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.40);

      /* 40–65%：續航填充 bar 隨捲動推進 */
      const bFillDur = 0.25;
      tl.fromTo('#batteryFill', { scaleX: 0 }, { scaleX: 1, duration: bFillDur }, 0.40);
      const bProxy = { v: 0 };
      const bNum = $('#batteryNum');
      counters.push({ el: bNum, final: String(BATTERY.value) });
      tl.to(bProxy, {
        v: BATTERY.value, duration: bFillDur,
        onUpdate: () => { bNum.textContent = Math.round(bProxy.v); }
      }, 0.40);
      /* 高潮點：bar 越過 8hr 刻度時 label 淡入（進度由數值算出：0.40 + 0.25×(8/16) ≈ 52.5%） */
      const flagAt = 0.40 + bFillDur * (BATTERY.marker / BATTERY.value);
      tl.fromTo('#batteryFlag', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.05 }, flagAt);

      /* 65–75%：轉場，連接埠淡入 */
      tl.to(mods.b, { y: -40, autoAlpha: 0.3, duration: 0.10 }, 0.65);
      tl.to(descs.b, { autoAlpha: 0, duration: 0.08 }, 0.65);
      tl.to(mods.b, { autoAlpha: 0, duration: 0.08 }, 0.75);
      tl.fromTo(mods.p, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.08 }, 0.75);
      tl.fromTo(descs.p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.75);

      /* 75–100%：各埠 label 依序亮起 */
      tl.fromTo('.port-svg .port', { opacity: 0.15 }, { opacity: 1, duration: 0.05, stagger: 0.02 }, 0.80);

      return () => {
        /* 媒體條件不再符合時：還原靜態最終狀態 */
        specViz.classList.remove('viz-pinned');
        counters.forEach(c => { c.el.textContent = c.final; });
        pinST = null;
      };
    });

    /* 視窗 resize 後重新計算 pin 位置 */
    let rzTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  }

  /* 逃生梯：跳到 Zone 3，pin 不殘留 */
  vizSkip.addEventListener('click', e => {
    if (pinST) {
      e.preventDefault();
      window.scrollTo({ top: pinST.end + 2, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  });

  /* ============ 手機／reduced-motion 的 Zone 2 降級 ============ */
  /* 三個模組各自用 IO 獨立播放一次（reduced-motion 時不播，直接呈現最終狀態） */
  const isMobileMQ = window.matchMedia('(max-width: 768px)');
  if (isMobileMQ.matches && !reducedMotion.matches) {
    const modules = [$('#mod-weight'), $('#mod-battery'), $('#mod-ports')];
    /* 預備狀態 */
    $$('#mod-weight .wbar-fill, #batteryFill').forEach(el => {
      el.style.transformOrigin = 'left center';
      el.style.transform = 'scaleX(0)';
    });
    $('#batteryFlag').style.opacity = '0';
    $('#wbarDiff').style.opacity = '0';
    const mio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        mio.unobserve(en.target);
        const fills = $$('.wbar-fill, .battery-fill', en.target);
        fills.forEach((el, i) => {
          el.style.transition = 'transform 800ms cubic-bezier(.22,.61,.36,1) ' + (i * 120) + 'ms';
          requestAnimationFrame(() => { el.style.transform = 'scaleX(1)'; });
        });
        $$('.wbar-val', en.target).forEach(valEl => {
          const v = parseFloat(valEl.dataset.wval);
          const t0 = performance.now();
          (function fr(now) {
            const p = Math.min((now - t0) / 800, 1);
            valEl.textContent = (v * (1 - Math.pow(1 - p, 3))).toFixed(2) + ' kg';
            if (p < 1) requestAnimationFrame(fr);
          })(t0);
        });
        if (en.target.id === 'mod-weight') {
          const d = $('#wbarDiff');
          d.style.transition = 'opacity 240ms ease-out 700ms';
          requestAnimationFrame(() => { d.style.opacity = '1'; });
        }
        if (en.target.id === 'mod-battery') {
          const bNum = $('#batteryNum');
          const t0 = performance.now();
          (function fr(now) {
            const p = Math.min((now - t0) / 800, 1);
            bNum.textContent = Math.round(BATTERY.value * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(fr);
          })(t0);
          const flag = $('#batteryFlag');
          flag.style.transition = 'opacity 240ms ease-out ' + (800 * BATTERY.marker / BATTERY.value) + 'ms';
          requestAnimationFrame(() => { flag.style.opacity = '1'; });
        }
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    modules.forEach(m => mio.observe(m));
  }
})();
