/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
const projectsData = [
  {
    id: 'p1',
    title: '視感認知 Mind Fluid',
    year: 2025,
    meta: 'Performance',
    category: 'performance',
    thumb: 'assets/images/projects/p1/banner.webp',
    youtubeId: 'MoqFfofD9oY'
  },
  {
    id: 'p2',
    title: '認夢 Dream Percept',
    year: 2024,
    meta: 'Performance',
    category: 'performance',
    thumb: 'assets/images/projects/p2/thumb.webp',
    youtubeId: 'VWdl_gF3HBw'
  },
  {
    id: 'p3',
    title: 'FUTURE VISION LAB 2023 《未來視覺派對》',
    year: 2023,
    meta: 'Performance',
    category: 'performance',
    thumb: 'assets/images/projects/p3/thumb.webp',
    youtubeId: ''
  },
  {
    id: 'p4',
    title: '光之曲幕 X DJ Friday Night《聲．光．域》',
    year: 2026,
    meta: 'Performance',
    category: 'performance',
    thumb: 'assets/images/projects/p4/thumb.webp',
    youtubeId: 'TazR2qhRegI'
  },
  {
    id: 'e1',
    title: '《 聽 說 Whisper 》',
    year: 2024,
    meta: 'Exhibition',
    category: 'exhibition',
    thumb: 'assets/images/projects/e1/thumb.webp',
    youtubeId: '3zMIU6YjPEk'
  },
  {
    id: 'e2',
    title: '繫 Sync',
    year: 2026,
    meta: 'Exhibition',
    category: 'exhibition',
    thumb: 'assets/images/projects/e2/thumb.webp',
    youtubeId: 'j6Q909i4HB0'
  },
  {
    id: 'e3',
    title: '鹹淡適中 Glub Glub',
    year: 2025,
    meta: 'Exhibition',
    category: 'exhibition',
    thumb: 'assets/images/projects/e3/thumb.webp',
    youtubeId: ''
  },
  {
    id: 'c1',
    title: '101 手錶發表會商演',
    year: 2026,
    meta: 'Case',
    category: 'case',
    thumb: 'assets/images/projects/c1/thumb.webp',
    youtubeId: ''
  },
  {
    id: 'c2',
    title: 'Live VJ Lab 即時影像演出工作營',
    year: 2025,
    meta: 'Case',
    category: 'case',
    thumb: 'assets/images/projects/c2/thumb.webp',
    youtubeId: ''
  },
  {
    id: 'c3',
    title: '離水山：再臨 Shuishan: Returnings',
    year: 2025,
    meta: 'Case',
    category: 'case',
    thumb: 'assets/images/projects/c3/work_01.webp',
    youtubeId: 'EtbHRLqTuyA'
  },
  {
    id: 'co1',
    title: '翼手龍摩天劇院 The Archaeology of Wonderland',
    year: 2024,
    meta: 'Collaboration',
    category: 'collaboration',
    thumb: 'assets/images/projects/co1/thumb.webp',
    youtubeId: '1NetdkQiMT4'
  },
  {
    id: 'co2',
    title: 'VIVIDO: re-Action',
    year: 2024,
    meta: 'Collaboration',
    category: 'collaboration',
    thumb: 'assets/images/projects/co2/banner.webp',
    youtubeId: 'K276uwK-u5A'
  },
  {
    id: 'co3',
    title: '樓頂《自動販賣機》',
    year: 2026,
    meta: 'Collaboration',
    category: 'collaboration',
    thumb: 'assets/images/projects/co3/thumb.webp',
    youtubeId: ''
  }
];

/* ────────────────────────────────────────
   CORE FUNCTIONS
──────────────────────────────────────── */
const VIEWS = ['home', 'projects', 'music', 'about', 'project-detail'];
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

function openProjectDetail(projectId, pushState = true) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  const detailView = document.getElementById('view-project-detail');
  const contentContainer = document.getElementById('project-detail-content');
  if (!contentContainer) return;

  // Clear previous content
  contentContainer.innerHTML = '';

  // Check if a specific template exists for this project
  const template = document.getElementById(`template-${projectId}`);

  if (template) {
    // === CUSTOM LAYOUT MODE ===
    // Clone the template content and append it
    const clone = template.content.cloneNode(true);
    contentContainer.appendChild(clone);
  } else {
    // === GENERIC LAYOUT MODE ===
    // Build the generic HTML structure
    const titleEl = document.createElement('h1');
    titleEl.className = 'detail-title';
    titleEl.textContent = project.title;

    const thumbImg = document.createElement('img');
    thumbImg.className = 'detail-thumb';
    if (project.thumb) {
      thumbImg.src = project.thumb;
      thumbImg.alt = project.title;
    } else {
      thumbImg.style.display = 'none';
    }

    const metaEl = document.createElement('div');
    metaEl.className = 'detail-meta';
    metaEl.textContent = `${project.year} · ${project.meta}`;

    contentContainer.appendChild(titleEl);
    contentContainer.appendChild(thumbImg);
    contentContainer.appendChild(metaEl);

    // YouTube video
    if (project.youtubeId) {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'detail-video';
      const iframe = document.createElement('iframe');
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      iframe.src = `https://www.youtube.com/embed/${project.youtubeId}`;
      videoContainer.appendChild(iframe);
      contentContainer.appendChild(videoContainer);
    }

    // Gallery
    if (project.gallery && project.gallery.length > 0) {
      const galleryContainer = document.createElement('div');
      galleryContainer.className = 'detail-gallery';
      project.gallery.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `${project.title} gallery image`;
        img.loading = 'lazy';
        galleryContainer.appendChild(img);
      });
      contentContainer.appendChild(galleryContainer);
    }
  }

  // Push state for browser back support
  if (pushState) {
    history.pushState({ view: 'project-detail', projectId }, '', '#project/' + projectId);
  }

  navigateTo('project-detail', false);
}

/* ────────────────────────────────────────
   INITIALIZATION & LISTENERS
──────────────────────────────────────── */

// Handle browser back/forward buttons
window.addEventListener('popstate', e => {
  const state = e.state;
  if (state?.view === 'project-detail' && state.projectId) {
    openProjectDetail(state.projectId, false);
  } else {
    const id = state?.view || location.hash.replace('#', '') || 'home';
    navigateTo(id, false);
  }
});

// Set initial view on page load
(function initRouter() {
  const hash = location.hash.replace('#', '');
  // Handle #project/xxx deep links
  if (hash.startsWith('project/')) {
    const projectId = hash.replace('project/', '');
    openProjectDetail(projectId, false);
  } else {
    navigateTo(hash || 'home', false);
  }
  // Restore scrolling after JS resolves the initial view
  // (body overflow-y: hidden prevents the flash of scrollbar on page load)
  document.body.style.overflowY = '';
})();

// Main navigation buttons
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.view));
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

// Project detail view triggers
document.querySelectorAll('.work').forEach(card => {
  card.addEventListener('click', () => {
    openProjectDetail(card.dataset.project);
  });
});

// Project detail back button
document.querySelector('.btn-back').addEventListener('click', () => {
  // Clear generic iframe if it exists to stop audio
  const iframes = document.querySelectorAll('#view-project-detail iframe');
  iframes.forEach(iframe => iframe.src = '');
  navigateTo('projects');
});

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

    const syncIframe = document.getElementById('sc-iframe-sync');
    const whisperIframe = document.getElementById('sc-iframe-whisper');
    const electricIframe = document.getElementById('sc-iframe-electric');
    const generateIframe = document.getElementById('sc-iframe-generate');

    if (!syncIframe || !whisperIframe || !electricIframe || !generateIframe) return;

    const widgets = {
      sync: SC.Widget(syncIframe),
      whisper: SC.Widget(whisperIframe),
      electric: SC.Widget(electricIframe),
      generate: SC.Widget(generateIframe)
    };

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
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
});
