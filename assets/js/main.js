/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
const projectsData = [
  { id: 'p1', title: 'Performance 1', year: 2025, meta: 'Performance', category: 'performance', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'p2', title: 'Performance 2', year: 2025, meta: 'Performance', category: 'performance', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'p3', title: 'Performance 3', year: 2025, meta: 'Performance', category: 'performance', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'e1', title: 'Exhibition 1', year: 2024, meta: 'Exhibition', category: 'exhibition', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'e2', title: 'Exhibition 2', year: 2024, meta: 'Exhibition', category: 'exhibition', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'e3', title: 'Exhibition 3', year: 2024, meta: 'Exhibition', category: 'exhibition', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'c1', title: 'Case Study 1', year: 2023, meta: 'Case', category: 'case', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'c2', title: 'Case Study 2', year: 2023, meta: 'Case', category: 'case', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'c3', title: 'Case Study 3', year: 2023, meta: 'Case', category: 'case', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'co1', title: 'Collaboration 1', year: 2022, meta: 'Collaboration', category: 'collaboration', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'co2', title: 'Collaboration 2', year: 2022, meta: 'Collaboration', category: 'collaboration', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'co3', title: 'Collaboration 3', year: 2022, meta: 'Collaboration', category: 'collaboration', thumb: 'https://placehold.co/1920x1080/1f1f42/d9ff82?text=1920x1080', youtubeId: 'dQw4w9WgXcQ' },
];

/* ────────────────────────────────────────
   CORE FUNCTIONS
──────────────────────────────────────── */
const VIEWS = ['home', 'projects', 'about', 'project-detail'];
const menuContainer = document.getElementById('menu_mobile');

function closeMenu() {
  if (menuContainer) menuContainer.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateTo(id, pushState = true) {
  if (!VIEWS.includes(id)) id = 'home';

  VIEWS.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.remove('active');
  });

  const target = document.getElementById('view-' + id);
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

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();
}

function openProjectDetail(projectId, pushState = true) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  const detailView = document.getElementById('view-project-detail');

  // Title & meta
  detailView.querySelector('.detail-title').textContent = project.title;
  detailView.querySelector('.detail-meta').textContent = `${project.year} · ${project.meta}`;

  // Thumbnail — use project.thumb directly, hide if empty
  const thumbImg = detailView.querySelector('.detail-thumb');
  if (project.thumb) {
    thumbImg.src = project.thumb;
    thumbImg.alt = project.title;
    thumbImg.style.display = '';
  } else {
    thumbImg.src = '';
    thumbImg.alt = '';
    thumbImg.style.display = 'none';
  }

  // YouTube video — only load if youtubeId exists
  const videoContainer = detailView.querySelector('.detail-video');
  const iframe = videoContainer.querySelector('iframe');
  if (project.youtubeId) {
    iframe.src = `https://www.youtube.com/embed/${project.youtubeId}`;
    videoContainer.style.display = '';
  } else {
    iframe.src = '';
    videoContainer.style.display = 'none';
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
  });
});

// Language switchers
document.querySelectorAll('[data-bio-lang], [data-cv-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    const isBio = btn.hasAttribute('data-bio-lang');
    const lang = isBio ? btn.dataset.bioLang : btn.dataset.cvLang;
    const container = btn.closest(isBio ? '#tab-bio' : '#tab-cv');

    container.querySelectorAll(isBio ? '[data-bio-lang]' : '[data-cv-lang]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    container.querySelectorAll(isBio ? '.bio-text' : '.cv-content').forEach(t => t.classList.remove('active'));
    container.querySelector(isBio ? `.bio-text.${lang}` : `.cv-content.${lang}`).classList.add('active');
  });
});

// Project filter buttons
document.querySelectorAll('.proj-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll('.proj-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.work').forEach(item => {
      item.classList.toggle('hidden', !(filter === 'all' || item.dataset.category === filter));
    });
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
  document.querySelector('#view-project-detail .detail-video iframe').src = '';
  navigateTo('projects');
});

