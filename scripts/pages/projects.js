import { createObserver } from '../core/utils.js';
import { ANIMATION, INTERSECTION_OBSERVER } from '../core/constants.js';
import { PROJECT_DATA } from '../data/projects.js';

const PROJECT_SOURCES = PROJECT_DATA.map(project => ({
  ...project,
  matches: project.matches || [project.displayName, project.title],
}));

const projectDetailsCache = new Map();
const previewIntervals = new Map();
const detailCardMap = new Map();
let projectModalElement = null;
let activeModalState = { key: null, images: [], index: 0 };
let modalGalleryTimer = null;

async function initProjectsPage() {
  await initProjectDetailsFeature();
  initFilterTabs();
  initCardAnimations();
  initCardInteractions();
  initScrollEffects();
  initLinkTracking();
  initKeyboardNavigation();
  addRippleStyles();
  initThemeAwareImages();
  initRepoCardImages();
}

async function initProjectDetailsFeature() {
  const projectCards = Array.from(document.querySelectorAll('.project-card-new'));
  if (!projectCards.length) return;

  const cardLookup = new Map();
  projectCards.forEach(card => {
    const titleText =
      card.querySelector('.project-title-new, .project-title')?.textContent?.trim() || '';
    const normalized = normalizeTitle(titleText);
    if (normalized) {
      cardLookup.set(normalized, card);
    }
  });

  const sortedSources = [...PROJECT_SOURCES].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  ensureProjectModal();

  for (const source of sortedSources) {
    const card = findMatchingCard(cardLookup, source.matches);
    if (!card) continue;

    detailCardMap.set(source.key, card);

    const imageUrls = buildImageUrls(source);
    if (imageUrls.length) {
      attachPreviewBackdrop(card, source.key, imageUrls);
    }

    card.dataset.detailKey = source.key;

    // Preload JSON so modal opens instantly; errors are logged but non-blocking.
    fetchProjectDetails(source).catch(error =>
      console.warn(`Failed to preload project details for ${source.displayName}:`, error)
    );
  }
}

function initRepoCardImages() {
  document.querySelectorAll('.repo-card').forEach(img => {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => {
      const link = img.closest('a');
      const container = img.closest('.repo-card-container');
      if (!container) return;

      const href = link?.href || '';
      const repoName = href.split('/').filter(Boolean).slice(-2).join('/') || 'Repository';

      container.innerHTML = `
        <a href="${href}" target="_blank" rel="noopener" class="repo-card-fallback">
          <i class="fab fa-github"></i>
          <span>${repoName}</span>
        </a>
      `;
    });
    if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
  });
}

function normalizeTitle(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function findMatchingCard(cardLookup, matches = []) {
  for (const match of matches) {
    const normalized = normalizeTitle(match);
    if (cardLookup.has(normalized)) return cardLookup.get(normalized);
  }

  for (const [normalizedCard, card] of cardLookup.entries()) {
    for (const match of matches) {
      const normalizedMatch = normalizeTitle(match);
      if (normalizedCard.includes(normalizedMatch)) return card;
    }
  }

  return null;
}

function extractNumber(filename) {
  const match = filename.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function buildImageUrls(source) {
  const imgs = [...(source.images || [])];
  if (imgs.length && typeof imgs[0] === 'string' && imgs[0].startsWith('data:image')) {
    return imgs; // already ordered data URIs
  }
  return imgs.sort((a, b) => extractNumber(a) - extractNumber(b));
}

async function fetchProjectDetails(source) {
  if (projectDetailsCache.has(source.key)) {
    return projectDetailsCache.get(source.key);
  }

  const payload = {
    displayName: source.displayName,
    key: source.key,
    images: buildImageUrls(source),
    title: source.title,
    overview: source.overview,
    category: source.category,
    service_type: source.service_type,
    duration: source.duration,
    cost: source.cost,
    started_at_month: source.started_at_month,
    started_at_year: source.started_at_year,
    industries: source.industries || [],
  };

  projectDetailsCache.set(source.key, payload);
  return payload;
}

function attachPreviewBackdrop(card, key, imageUrls) {
  const repoContainer = card.querySelector('.repo-card-container');
  if (!repoContainer || repoContainer.querySelector('.project-preview-repo')) return;

  const slider = document.createElement('div');
  slider.className = 'project-preview-repo';
  slider.innerHTML = `
    <div class="project-preview-frame">
      <img class="project-preview-image" alt="Project preview" loading="lazy" />
      <div class="project-preview-dots-inline"></div>
    </div>
  `;

  const repoLink = repoContainer.querySelector('a');
  if (repoLink) {
    repoLink.innerHTML = '';
    repoLink.appendChild(slider);
  } else {
    repoContainer.innerHTML = '';
    repoContainer.appendChild(slider);
  }

  const sliderImg = slider.querySelector('.project-preview-image');
  const sliderDots = slider.querySelector('.project-preview-dots-inline');

  startPreviewRotation(card, key, null, null, imageUrls, sliderImg, sliderDots);
}

function startPreviewRotation(card, key, canvas, dots, images, sliderImg, sliderDotsContainer) {
  if (!images.length) return;

  const clearExisting = () => {
    if (previewIntervals.has(key)) {
      clearInterval(previewIntervals.get(key));
      previewIntervals.delete(key);
    }
  };

  let index = 0;
  const ensureSliderDots = () => {
    if (!sliderDotsContainer) return [];
    sliderDotsContainer.innerHTML = '';
    return images.map((_, idx) => {
      const dot = document.createElement('span');
      if (idx === 0) dot.classList.add('active');
      sliderDotsContainer.appendChild(dot);
      return dot;
    });
  };

  const sliderDots = ensureSliderDots();

  const updateFrame = nextIndex => {
    index = nextIndex;
    if (canvas) {
      canvas.style.backgroundImage = `url(${images[index]})`;
    }
    if (dots && dots.length) {
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    }
    if (sliderImg) {
      sliderImg.style.opacity = '0';
      sliderImg.style.transform = 'translateX(10px)';
      sliderImg.onload = () => {
        sliderImg.style.opacity = '1';
        sliderImg.style.transform = 'translateX(0)';
      };
      sliderImg.src = images[index];
      sliderImg.alt = `Preview ${index + 1} of ${images.length}`;
    }
    if (sliderDots && sliderDots.length) {
      sliderDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    }
  };

  const startInterval = () => {
    clearExisting();
    if (images.length <= 1) return;
    const id = setInterval(() => {
      const next = (index + 1) % images.length;
      updateFrame(next);
    }, 3400);
    previewIntervals.set(key, id);
  };

  startInterval();
  updateFrame(0);

  card.addEventListener('mouseenter', clearExisting);
  card.addEventListener('mouseleave', startInterval);
}

function ensureProjectModal() {
  if (projectModalElement) return projectModalElement;

  const wrapper = document.createElement('div');
  wrapper.id = 'project-detail-modal';
  wrapper.className = 'project-detail-modal';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.setAttribute('role', 'dialog');
  wrapper.setAttribute('aria-modal', 'true');
  wrapper.innerHTML = `
    <div class="project-detail-overlay"></div>
    <div class="project-detail-window">
      <button class="project-detail-close" aria-label="Close project details">
        <i class="fas fa-times"></i>
      </button>
      <div class="project-detail-gallery">
        <button class="gallery-nav prev" aria-label="Previous image">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="gallery-frame">
          <img class="gallery-image" alt="Project preview" src="" />
        </div>
        <button class="gallery-nav next" aria-label="Next image">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="project-detail-body">
        <div class="project-detail-head">
          <div class="project-detail-labels"></div>
          <h3 class="project-detail-title"></h3>
        </div>
        <div class="project-detail-overview"></div>
        <div class="project-detail-tags"></div>
        <div class="project-detail-actions"></div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);
  projectModalElement = wrapper;

  wrapper.querySelector('.project-detail-close')?.addEventListener('click', closeProjectModal);
  wrapper.querySelector('.project-detail-overlay')?.addEventListener('click', closeProjectModal);
  wrapper.querySelector('.gallery-nav.prev')?.addEventListener('click', () => shiftModalImage(-1));
  wrapper.querySelector('.gallery-nav.next')?.addEventListener('click', () => shiftModalImage(1));

  document.addEventListener('keydown', event => {
    if (!projectModalElement?.classList.contains('visible')) return;
    if (event.key === 'Escape') closeProjectModal();
    if (event.key === 'ArrowLeft') shiftModalImage(-1);
    if (event.key === 'ArrowRight') shiftModalImage(1);
  });

  return projectModalElement;
}

async function openProjectModal(detailKey) {
  ensureProjectModal();
  const source = PROJECT_SOURCES.find(item => item.key === detailKey);
  if (!source) return;

  try {
    const data = await fetchProjectDetails(source);
    renderModalContent(data);
    projectModalElement?.classList.add('visible');
    projectModalElement?.setAttribute('aria-hidden', 'false');
    toggleBodyScrollLock(true);
  } catch (error) {
    console.error(`Unable to open modal for ${detailKey}`, error);
  }
}

function closeProjectModal() {
  if (!projectModalElement) return;
  if (modalGalleryTimer) {
    clearInterval(modalGalleryTimer);
    modalGalleryTimer = null;
  }
  projectModalElement.classList.remove('visible');
  projectModalElement.setAttribute('aria-hidden', 'true');
  toggleBodyScrollLock(false);
}

function shiftModalImage(direction) {
  if (!activeModalState.images.length) return;
  const nextIndex =
    (activeModalState.index + direction + activeModalState.images.length) %
    activeModalState.images.length;
  activeModalState.index = nextIndex;
  updateModalGallery(activeModalState.images, nextIndex);
}

function renderModalContent(project) {
  if (!projectModalElement) return;

  const titleEl = projectModalElement.querySelector('.project-detail-title');
  const overviewEl = projectModalElement.querySelector('.project-detail-overview');
  const labelsEl = projectModalElement.querySelector('.project-detail-labels');
  const tagsEl = projectModalElement.querySelector('.project-detail-tags');
  const actionsEl = projectModalElement.querySelector('.project-detail-actions');

  if (titleEl) titleEl.textContent = project.title || project.displayName;

  if (overviewEl) {
    overviewEl.innerHTML = '';
    const overviewText = project.overview || '';
    const paragraphs = overviewText.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
    paragraphs.forEach(block => {
      const paragraph = document.createElement('p');
      paragraph.textContent = block.replace(/\n/g, ' ');
      overviewEl.appendChild(paragraph);
    });
  }

  if (labelsEl) {
    labelsEl.innerHTML = '';
    const folderLabel = document.createElement('span');
    folderLabel.className = 'label-pill';
    folderLabel.textContent = project.displayName || project.folder || 'Project';
    labelsEl.appendChild(folderLabel);

    const imageCountLabel = document.createElement('span');
    imageCountLabel.className = 'label-pill subtle';
    imageCountLabel.textContent = `${project.images?.length || 0} preview images`;
    labelsEl.appendChild(imageCountLabel);
  }

  if (tagsEl) {
    tagsEl.innerHTML = '';
    (project.industries || []).forEach(industry => {
      const tag = document.createElement('span');
      tag.className = 'industry-tag';
      tag.textContent = industry;
      tagsEl.appendChild(tag);
    });
  }

  renderProjectActions(project.key, actionsEl);

  activeModalState = {
    key: project.key,
    images: project.images || [],
    index: 0,
  };

  updateModalGallery(activeModalState.images, 0);

  if (modalGalleryTimer) {
    clearInterval(modalGalleryTimer);
  }
  if (activeModalState.images.length > 1) {
    modalGalleryTimer = setInterval(() => {
      shiftModalImage(1);
    }, 3500);
  }
}

function renderProjectActions(detailKey, host) {
  if (!host) return;
  host.innerHTML = '';

  const card = detailCardMap.get(detailKey);
  if (!card) return;

  const links = card.querySelector('.project-links-new')?.cloneNode(true);
  if (links) {
    links.classList.add('project-links-inline');
    links.querySelectorAll('a').forEach(anchor => anchor.setAttribute('target', '_blank'));
    host.appendChild(links);
  }
}

function updateModalGallery(images, index) {
  if (!projectModalElement) return;
  const imageEl = projectModalElement.querySelector('.gallery-image');
  const navButtons = projectModalElement.querySelectorAll('.gallery-nav');
  const indicatorsHost = projectModalElement.querySelector('.gallery-frame');

  if (imageEl && images.length) {
    imageEl.src = images[index];
    imageEl.alt = `Preview ${index + 1} of ${images.length}`;
  }

  navButtons.forEach(button => {
    button.disabled = images.length <= 1;
  });

  // Simple indicator dots layered on frame corner
  if (indicatorsHost) {
    let dots = indicatorsHost.querySelector('.gallery-dots');
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'gallery-dots';
      indicatorsHost.appendChild(dots);
    }

    dots.innerHTML = '';
    images.forEach((_, dotIndex) => {
      const dot = document.createElement('span');
      if (dotIndex === index) dot.classList.add('active');
      dots.appendChild(dot);
    });
  }
}

function toggleBodyScrollLock(lock) {
  document.documentElement.classList.toggle('modal-open', lock);
  document.body.classList.toggle('modal-open', lock);
}

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  } catch (error) {
    return `$${value}`;
  }
}

function initFilterTabs() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card-new, .project-card');

  if (filterTabs.length === 0) return;

  for (const tab of filterTabs) {
    tab.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');

      for (const t of filterTabs) t.classList.remove('active');
      this.classList.add('active');

      let visibleIndex = 0;
      for (const card of projectCards) {
        const categories = card.getAttribute('data-category');

        if (filter === 'all' || (categories && categories.split(' ').includes(filter))) {
          card.style.display = 'flex';
          card.style.visibility = 'visible';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, visibleIndex * ANIMATION.STAGGER_DELAY_FILTER);
          visibleIndex++;
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
            card.style.visibility = 'hidden';
          }, ANIMATION.FILTER_HIDE_DELAY);
        }
      }

      toggleSections(filter);
      updateFilterCounts();
    });
  }

  updateFilterCounts();
}

function toggleSections(filter) {
  const headers = document.querySelectorAll('.section-header');
  const grids = document.querySelectorAll('.featured-grid, .projects-grid-new');

  if (filter === 'all') {
    for (const h of headers) h.style.display = 'block';
    for (const g of grids) g.style.marginBottom = '';
    return;
  }

  for (const h of headers) h.style.display = 'none';

  for (const grid of grids) {
    const cards = grid.querySelectorAll('.project-card-new, .project-card');
    let hasVisibleCards = false;

    for (const card of cards) {
      const categories = card.getAttribute('data-category');
      if (categories && categories.split(' ').includes(filter)) {
        hasVisibleCards = true;
      }
    }

    grid.style.marginBottom = hasVisibleCards ? '' : '0';
  }
}

function updateFilterCounts() {
  const projectCards = document.querySelectorAll('.project-card-new, .project-card');
  const filterTabs = document.querySelectorAll('.filter-tab');

  for (const tab of filterTabs) {
    const filter = tab.getAttribute('data-filter');
    const countEl = tab.querySelector('.tab-count');

    if (!countEl) continue;

    let count = 0;

    if (filter === 'all') {
      count = projectCards.length;
    } else {
      for (const card of projectCards) {
        const categories = card.getAttribute('data-category');
        if (categories && categories.split(' ').includes(filter)) {
          count++;
        }
      }
    }

    countEl.textContent = count;
  }
}

function initCardAnimations() {
  createObserver({
    selector: '.project-card-new, .project-card, .fade-in',
    threshold: INTERSECTION_OBSERVER.THRESHOLD_DEFAULT,
    rootMargin: INTERSECTION_OBSERVER.ROOT_MARGIN_CARDS,
    onIntersect: element => {
      requestAnimationFrame(() => {
        element.classList.add('visible');
      });
    },
  });

  createObserver({
    selector: '.section-header',
    threshold: INTERSECTION_OBSERVER.THRESHOLD_HEADER,
    rootMargin: INTERSECTION_OBSERVER.ROOT_MARGIN_HEADER,
    onIntersect: element => {
      element.classList.add('visible');
    },
  });

  createObserver({
    selector: '.explore-section .contact-method[data-animation]',
    onIntersect: element => {
      const animationType = element.getAttribute('data-animation');
      if (animationType) {
        element.classList.add(`animate-${animationType}`);
      }
    },
  });
}

function initCardInteractions() {
  const projectCards = document.querySelectorAll('.project-card-new, .project-card');

  for (const card of projectCards) {
    card.addEventListener('click', function (e) {
      const hasLinkTarget = e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('button');

      if (!hasLinkTarget && this.dataset.detailKey) {
        e.preventDefault();
        openProjectModal(this.dataset.detailKey);
        return;
      }

      if (!hasLinkTarget) {
        const githubLink = this.querySelector('.btn-link.github, .btn-link');
        if (githubLink) {
          createRipple(e, this);
          setTimeout(() => {
            window.open(githubLink.href, '_blank', 'noopener');
          }, 150);
        }
      }
    });

    card.style.cursor = 'pointer';

    const techBadges = card.querySelectorAll('.tech-badge, .tech-icon');
    techBadges.forEach(badge => {
      badge.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-3px) scale(1.1) rotate(5deg)';
      });

      badge.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      });
    });

    const icon = card.querySelector('.project-icon-new, .project-icon');
    if (icon) {
      card.addEventListener('mouseenter', function () {
        icon.style.transform = 'scale(1.1) rotate(-5deg)';
      });

      card.addEventListener('mouseleave', function () {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    }
  }

  const jupyterLogo = document.querySelector('.jupyter-logo');
  if (jupyterLogo) {
    jupyterLogo.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.15) rotate(10deg)';

      const dots = this.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        setTimeout(() => {
          dot.style.transform = 'scale(1.3) translateY(-5px)';
        }, index * 100);
      });
    });

    jupyterLogo.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1) rotate(0deg)';

      const dots = this.querySelectorAll('.dot');
      dots.forEach(dot => {
        dot.style.transform = 'scale(1) translateY(0)';
      });
    });
  }
}

function createRipple(event, element) {
  const ripple = document.createElement('div');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(0, 97, 242, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;

  element.style.position = 'relative';
  element.appendChild(ripple);

  setTimeout(() => ripple.remove(), ANIMATION.RIPPLE_REMOVE_DELAY);
}

function initScrollEffects() {
  const statsSection = document.querySelector('.stats-badge-section');
  let ticking = false;

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  function handleScroll() {
    const scrolled = window.pageYOffset;

    document
      .querySelector('.header-background-pattern')
      ?.style.setProperty('transform', `translateY(${scrolled * 0.5}px)`);

    document.querySelectorAll('.parallax-bg').forEach(el => {
      el.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    statsSection?.classList.toggle('scrolled', scrolled > 200);
  }

  handleScroll();
}

function initLinkTracking() {
  document.querySelectorAll('.btn-link, .btn-cta').forEach(link => {
    link.addEventListener('click', function () {
      const linkType = this.classList.contains('github')
        ? 'GitHub'
        : this.classList.contains('pypi')
          ? 'PyPI'
          : this.classList.contains('kaggle')
            ? 'Kaggle'
            : this.classList.contains('live')
              ? 'Live Site'
              : 'Other';

      const projectTitle =
        this.closest('.project-card-new, .project-card')?.querySelector(
          '.project-title-new, .project-title'
        )?.textContent || 'Unknown';

      window.gtag?.('event', 'project_link_click', {
        event_category: 'Projects',
        event_label: `${linkType} - ${projectTitle}`,
        value: 1,
      });
    });
  });
}

function initKeyboardNavigation() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') {
      if (!e.target.matches('input, textarea')) {
        e.preventDefault();
        document.querySelector('.filter-tab')?.focus();
      }
    }

    if (document.activeElement?.classList.contains('filter-tab')) {
      const tabs = Array.from(document.querySelectorAll('.filter-tab'));
      const currentIndex = tabs.indexOf(document.activeElement);

      if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
        e.preventDefault();
        tabs[currentIndex + 1].focus();
        tabs[currentIndex + 1].click();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        tabs[currentIndex - 1].focus();
        tabs[currentIndex - 1].click();
      }
    }
  });
}

function addRippleStyles() {
  if (!document.getElementById('ripple-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation-styles';
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }

      .card-shine {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        border-radius: inherit;
        opacity: 1;
        transition: opacity 0.6s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
}

function initThemeAwareImages() {
  const themeAwareImages = document.querySelectorAll('.theme-aware-image');

  function updateImageTheme() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    themeAwareImages.forEach(img => {
      const lightSrc = img.getAttribute('data-light-src');
      const darkSrc = img.getAttribute('data-dark-src');

      if (lightSrc && darkSrc) {
        img.src = isDarkMode ? darkSrc : lightSrc;
      }
    });
  }

  updateImageTheme();

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-theme') {
        updateImageTheme();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export { initProjectsPage };
