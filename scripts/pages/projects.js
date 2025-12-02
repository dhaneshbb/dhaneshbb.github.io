import { createObserver } from '../core/utils.js';
import { ANIMATION, INTERSECTION_OBSERVER, TRANSFORM_3D } from '../core/constants.js';

function initProjectsPage() {
  initFilterTabs();
  initCardAnimations();
  initCardInteractions();
  initScrollEffects();
  initLinkTracking();
  initKeyboardNavigation();
  addRippleStyles();
  initThemeAwareImages();
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
    let tiltTimeout;
    card.style.willChange = 'transform, box-shadow';

    card.addEventListener('mousemove', function (e) {
      if (tiltTimeout) return;

      tiltTimeout = setTimeout(() => {
        tiltTimeout = null;
      }, ANIMATION.MOUSEMOVE_THROTTLE);

      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * TRANSFORM_3D.ROTATION_MULTIPLIER_NEGATIVE;
      const rotateY = ((x - centerX) / centerX) * TRANSFORM_3D.ROTATION_MULTIPLIER;
      const translateZ = TRANSFORM_3D.TRANSLATE_Z;

      this.style.transition = 'none';
      this.style.transform = `
        translateY(-20px)
        translateZ(${translateZ}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.03)
      `;

      const shine = this.querySelector('.card-shine') || document.createElement('div');
      if (!shine.classList.contains('card-shine')) {
        shine.className = 'card-shine';
        this.appendChild(shine);
      }
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.08) 0%, transparent 80%)`;
    });

    card.addEventListener('mouseleave', function () {
      this.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      this.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';

      const shine = this.querySelector('.card-shine');
      if (shine) {
        shine.style.opacity = '0';
        setTimeout(() => shine.remove(), ANIMATION.SHINE_REMOVE_DELAY);
      }
    });

    card.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A' && !e.target.closest('a') && !e.target.closest('button')) {
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
