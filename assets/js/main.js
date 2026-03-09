/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
const projectsData = [
  {
    id: 'p1',
    title: 'Perspectives: AV Art',
    year: 2025,
    meta: 'Performance',
    category: 'performance',
    thumb: 'assets/images/projects/p1/pic_15.webp',
    gallery: [
      'assets/images/projects/p1/pic_01.webp',
      'assets/images/projects/p1/pic_02.webp',
      'assets/images/projects/p1/pic_03.webp',
      'assets/images/projects/p1/pic_04.webp',
      'assets/images/projects/p1/pic_05.webp',
      'assets/images/projects/p1/pic_07.webp',
      'assets/images/projects/p1/pic_08.webp',
      'assets/images/projects/p1/pic_09.webp',
      'assets/images/projects/p1/pic_11.webp',
      'assets/images/projects/p1/pic_12.webp',
      'assets/images/projects/p1/pic_15.webp',
      'assets/images/projects/p1/pic_17.webp',
      'assets/images/projects/p1/pic_18.webp',
      'assets/images/projects/p1/pic_19.webp',
      'assets/images/projects/p1/pic_20.webp'
    ],
    youtubeId: 'zfsF6ZuGfx0'
  },
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
    const panel = document.getElementById(isBio ? 'tab-bio' : 'tab-cv');
    const langSwitch = document.getElementById(isBio ? 'lang-switch-bio' : 'lang-switch-cv');

    langSwitch.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    panel.querySelectorAll(isBio ? '.bio-text' : '.cv-content').forEach(t => t.classList.remove('active'));
    panel.querySelector(isBio ? `.bio-text.${lang}` : `.cv-content.${lang}`).classList.add('active');
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
  // Clear generic iframe if it exists to stop audio
  const iframes = document.querySelectorAll('#view-project-detail iframe');
  iframes.forEach(iframe => iframe.src = '');
  navigateTo('projects');
});

