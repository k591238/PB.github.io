/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
// 作品資料在 data/projects.json，作品頁由 scripts/build_site.mjs 產生成 projects/{id}/index.html
// 作品頁（body.page-project）也載入這支 main.js，SPA 切換相關的程式只在首頁執行
const IS_PROJECT_PAGE = document.body.classList.contains('page-project');

// 舊網址 #project/{id} → 新網址 projects/{id}/
function redirectLegacyProjectHash() {
  const m = location.hash.match(/^#project\/([a-z0-9-]+)$/);
  if (!m) return false;
  location.replace(`projects/${m[1]}/`);
  return true;
}

/* ────────────────────────────────────────
   CORE FUNCTIONS
──────────────────────────────────────── */
const VIEWS = ['home', 'projects', 'music', 'about'];
const menuContainer = document.getElementById('menu_mobile');

function closeMenu() {
  if (menuContainer) menuContainer.classList.remove('open');
  document.body.style.overflow = '';
}

/* ────────────────────────────────────────
   SCROLL-TRIGGERED REVEAL (IntersectionObserver)
   — must be defined before navigateTo
──────────────────────────────────────── */
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

// 作品頁影片只在接近畫面時才下載播放，離開畫面就暫停（避免一打開就同時下載所有影片）
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) target.play().catch(() => {});
    else target.pause();
  });
}, { rootMargin: '200px 0px' });

function navigateTo(id, pushState = true) {
  if (!VIEWS.includes(id)) id = 'home';

  // Pause music if leaving music page
  if (id !== 'music' && window.musicWidgets) {
    Object.values(window.musicWidgets).forEach(widget => {
      try { widget.pause(); } catch(e) {}
    });
  }

  // Find current active view for exit animation
  const currentView = document.querySelector('.view.active');
  const target = document.getElementById('view-' + id);

  function activate() {
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) { el.classList.remove('active'); el.classList.remove('exiting'); }
    });

    if (target) target.classList.add('active');

    if (id === 'home') {
      target.classList.remove('entered');
      void target.offsetWidth;
      target.classList.add('entered');
      if (window.ParticleField) window.ParticleField.start();
    } else {
      if (window.ParticleField) window.ParticleField.stop();
    }

    document.querySelectorAll('[data-view]').forEach(el => {
      el.classList.toggle('active', el.dataset.view === id);
    });

    if (pushState) {
      history.pushState({ view: id }, '', '#' + id);
    }

    window.scrollTo(0, 0);
    closeMenu();

    // Re-observe scroll-reveal elements in the new view
    if (target) {
      target.querySelectorAll('.work, .reveal').forEach(el => {
        el.classList.remove('in-view');
        scrollObserver.observe(el);
      });
    }
  }

  // Play exit animation if there's a current view and it differs
  if (currentView && currentView !== target) {
    currentView.classList.add('exiting');
    setTimeout(activate, 300);
  } else {
    activate();
  }
}

/* ────────────────────────────────────────
   INITIALIZATION & LISTENERS
──────────────────────────────────────── */

// Handle browser back/forward buttons
window.addEventListener('popstate', e => {
  if (IS_PROJECT_PAGE || redirectLegacyProjectHash()) return;
  navigateTo(e.state?.view || location.hash.replace('#', '') || 'home', false);
});

// Set initial view on page load
(function initRouter() {
  if (IS_PROJECT_PAGE) {
    document.querySelectorAll('[data-view]').forEach(el => {
      el.classList.toggle('active', el.dataset.view === 'projects');
    });
    document.querySelectorAll('#project-detail-content video[data-autoplay]').forEach(v => videoObserver.observe(v));
    // 照片讀完才淡入（CSS .img-loading）；讀取失敗也要拿掉，避免永遠透明
    document.querySelectorAll('#project-detail-content img').forEach(img => {
      if (img.complete) return;
      img.classList.add('img-loading');
      const done = () => img.classList.remove('img-loading');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  } else if (redirectLegacyProjectHash()) {
    return;
  } else {
    navigateTo(location.hash.replace('#', '') || 'home', false);
  }
  // Restore scrolling after JS resolves the initial view
  // (body overflow-y: hidden prevents the flash of scrollbar on page load)
  document.body.style.overflowY = '';
})();

// Main navigation buttons
// 作品頁上的選單是一般連結（<base> 讓 #projects 指向首頁），直接換頁
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', e => {
    // Ctrl／⌘／Shift＋點擊交給瀏覽器開新分頁或新視窗
    if (IS_PROJECT_PAGE || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    navigateTo(el.dataset.view);
  });
});

// Mobile menu buttons
document.getElementById('menu_open').addEventListener('click', () => {
  if (menuContainer) menuContainer.classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('menu_close').addEventListener('click', closeMenu);

// About Page Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabGroup = btn.closest('.about-right');
    tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    tabGroup.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');

    // Toggle lang switchers
    document.querySelectorAll('.lang-switch').forEach(ls => ls.classList.remove('active'));
    const activeLangSwitch = document.getElementById('lang-switch-' + btn.dataset.tab);
    if (activeLangSwitch) activeLangSwitch.classList.add('active');
  });
});

// Language switchers
document.querySelectorAll('[data-bio-lang], [data-cv-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    const isBio = btn.hasAttribute('data-bio-lang');
    const lang = isBio ? btn.dataset.bioLang : btn.dataset.cvLang;

    document.querySelectorAll('[data-cv-pdf]').forEach(a => {
      a.href = `assets/cv/WuChengRu_CV_${lang.toUpperCase()}.pdf`;
    });

    // 1. 同步 Bio 切換按鈕與內容
    const bioSwitch = document.getElementById('lang-switch-bio');
    if (bioSwitch) {
      bioSwitch.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.bioLang === lang);
      });
    }
    const bioPanel = document.getElementById('tab-bio');
    if (bioPanel) {
      bioPanel.querySelectorAll('.bio-text').forEach(t => {
        t.classList.toggle('active', t.classList.contains(lang));
      });
    }

    // 2. 同步 CV 切換按鈕與內容
    const cvSwitch = document.getElementById('lang-switch-cv');
    if (cvSwitch) {
      cvSwitch.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cvLang === lang);
      });
    }
    const cvPanel = document.getElementById('tab-cv');
    if (cvPanel) {
      cvPanel.querySelectorAll('.cv-content').forEach(t => {
        t.classList.toggle('active', t.classList.contains(lang));
      });
    }
  });
});

// Project filter buttons
document.querySelectorAll('.proj-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll('.proj-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const allWorks = document.querySelectorAll('.work');
    
    // 1. 先讓所有卡片淡出
    allWorks.forEach(item => {
      item.classList.add('fade-out');
    });
    
    // 2. 在淡出過渡完成後，在透明狀態下完成重排
    setTimeout(() => {
      allWorks.forEach(item => {
        const isMatch = filter === 'all' || item.dataset.category === filter;
        if (isMatch) {
          item.classList.remove('hidden');
          // 3. 在下一幀中移除 fade-out 觸發 transition 淡入，並確保加上 in-view
          requestAnimationFrame(() => {
            item.classList.remove('fade-out');
            item.classList.add('in-view');
          });
        } else {
          item.classList.add('hidden');
        }
      });
    }, 150);
  });
});

// 作品卡片是一般連結（projects/{id}/），點擊直接換頁，不需要 JS 處理

// 作品頁的「Back to Projects」：從作品列表點進來的就用上一頁（保留列表捲動位置），
// 直接開作品頁的人則照連結回到首頁的作品列表
const backLink = document.querySelector('.page-project .btn-back');
if (backLink) {
  backLink.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    let fromList = false;
    try {
      const ref = new URL(document.referrer);
      fromList = ref.origin === location.origin && new URL(backLink.href).pathname === ref.pathname;
    } catch { /* 沒有 referrer */ }
    if (fromList && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}

/* ────────────────────────────────────────
   NAV SCROLL STATE (Optimized with RAF)
──────────────────────────────────────── */
const bar = document.querySelector('.bar');
const scrollToTopBtn = document.getElementById('scroll-to-top');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (bar) bar.classList.toggle('scrolled', window.scrollY > 40);
      if (scrollToTopBtn) scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

if (scrollToTopBtn) {
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ────────────────────────────────────────
   INITIAL SCROLL-REVEAL REGISTRATION
──────────────────────────────────────── */
document.querySelectorAll('.work').forEach(el => scrollObserver.observe(el));
document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));

/* ────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring) {
    // Both follow instantly in the same mousemove
    document.addEventListener('mousemove', e => {
      const x = e.clientX, y = e.clientY;
      const pos = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
      dot.style.transform = pos;
      ring.style.transform = pos;
    });

    // Hover detection
    const INTERACTIVE = 'a, button, [data-project], .proj-filter-btn, .work, .menu_link, .tab-btn, .lang-btn, .scroll-to-top';
    document.addEventListener('mouseover', e => {
      if (e.target.tagName === 'IFRAME' || e.target.closest('iframe')) {
        document.body.classList.add('hide-custom-cursor');
        dot.style.opacity = '0';
        ring.style.opacity = '0';
      } else if (e.target.closest(INTERACTIVE)) {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.tagName === 'IFRAME' || e.target.closest('iframe')) {
        document.body.classList.remove('hide-custom-cursor');
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      } else if (e.target.closest(INTERACTIVE)) {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      }
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }
}

/* ────────────────────────────────────────
   MUSIC PLAYER CONTROLLER (SoundCloud API)
   ──────────────────────────────────────── */
(function initMusicPlayer() {
  // Wait for SC to be defined (loaded via script tag in index.html)
  function setup() {
    if (typeof SC === 'undefined') {
      setTimeout(setup, 100);
      return;
    }

    // Driven by whatever .music-card elements exist in the DOM — add a new
    // card (id="music-card-{key}" containing an iframe id="sc-iframe-{key}")
    // and it's wired up automatically, no JS changes needed.
    const cards = document.querySelectorAll('.music-card[id^="music-card-"]');
    if (!cards.length) return;

    const widgets = {};
    cards.forEach(card => {
      const key = card.id.replace('music-card-', '');
      const iframe = card.querySelector('iframe[id^="sc-iframe-"]');
      if (iframe) widgets[key] = SC.Widget(iframe);
    });

    window.musicWidgets = widgets;

    // Helper to stop all other tracks
    function stopOthers(currentKey) {
      Object.keys(widgets).forEach(key => {
        if (key !== currentKey) {
          try {
            widgets[key].pause();
          } catch(e) {}
        }
      });
    }

    // Set up events for each track
    Object.keys(widgets).forEach(key => {
      const widget = widgets[key];
      const card = document.getElementById(`music-card-${key}`);
      if (!card) return;

      const playBtn = card.querySelector('.music-play-btn');
      const playIcon = playBtn ? playBtn.querySelector('.play-icon') : null;
      const pauseIcon = playBtn ? playBtn.querySelector('.pause-icon') : null;

      widget.bind(SC.Widget.Events.PLAY, () => {
        stopOthers(key);
        card.classList.add('playing');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'inline';
      });

      widget.bind(SC.Widget.Events.PAUSE, () => {
        card.classList.remove('playing');
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
      });

      widget.bind(SC.Widget.Events.FINISH, () => {
        card.classList.remove('playing');
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
      });

      // Handle custom play button click
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          widget.isPaused((paused) => {
            if (paused) {
              widget.play();
            } else {
              widget.pause();
            }
          });
        });
      }
      
      // Also make the whole sleeve clickable
      const sleeve = card.querySelector('.vinyl-sleeve');
      if (sleeve) {
        sleeve.addEventListener('click', () => {
          widget.isPaused((paused) => {
            if (paused) {
              widget.play();
            } else {
              widget.pause();
            }
          });
        });
      }
    });
  }

  // Run setup when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

/* ────────────────────────────────────────
   RIGHT-CLICK / DRAG PROTECTION
   ──────────────────────────────────────── */
// 右鍵只在連結上開放（選單、作品卡片可在新分頁開啟），圖片、影片和其他地方維持封鎖
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('img, video') || !e.target.closest('a[href]')) e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
});
