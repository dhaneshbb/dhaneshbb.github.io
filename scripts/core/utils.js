import { ANIMATION, INTERSECTION_OBSERVER, SCROLL } from './constants.js';

function initNavbarScrollEffect() {
  let ticking = false;

  function updateOnScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > SCROLL.NAVBAR_SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
}

function initFadeInAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: INTERSECTION_OBSERVER.THRESHOLD_DEFAULT,
      rootMargin: INTERSECTION_OBSERVER.ROOT_MARGIN_DEFAULT,
    }
  );

  const elements = document.querySelectorAll('.fade-in');
  for (const el of elements) {
    observer.observe(el);
  }
}

function initSmoothReveal(delay = ANIMATION.SMOOTH_REVEAL_DELAY) {
  window.addEventListener('load', function () {
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, i * ANIMATION.FADE_IN_STAGGER);
      });
    }, delay);
  });
}

function initKeyboardNavigation() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('click', function () {
    document.body.classList.remove('keyboard-nav');
  });
}

function initExternalLinks() {
  const blankLinks = document.querySelectorAll('a[target="_blank"]');
  for (const link of blankLinks) {
    link.setAttribute('rel', 'noopener noreferrer');
  }

  const httpLinks = document.querySelectorAll('a[href^="http"]');
  for (const link of httpLinks) {
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
    }
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

function initSmoothScrolling() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  for (const anchor of anchors) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - SCROLL.SMOOTH_SCROLL_OFFSET;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  }
}

function initLoadingScreen() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loading')?.classList.add('hide');
    }, ANIMATION.LOADING_SCREEN_HIDE_DELAY);
  });
}

function createObserver({
  selector,
  onIntersect,
  threshold = INTERSECTION_OBSERVER.THRESHOLD_DEFAULT,
  rootMargin = INTERSECTION_OBSERVER.ROOT_MARGIN_DEFAULT,
  once = true,
}) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect(entry.target, observer);
          if (once) observer.unobserve(entry.target);
        }
      });
    },
    { threshold, rootMargin }
  );

  const elements = document.querySelectorAll(selector);
  for (const el of elements) observer.observe(el);
  return observer;
}

async function fetchHTMLElements(url, selector) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.querySelectorAll(selector);
}

function initImageErrorHandling() {
  const images = document.querySelectorAll('img[data-fallback]');
  for (const img of images) {
    img.addEventListener('error', function () {
      const fallback = this.getAttribute('data-fallback');
      if (fallback && this.src !== fallback) {
        this.src = fallback;
      }
    });
  }
}

export {
  initNavbarScrollEffect,
  initFadeInAnimations,
  initSmoothReveal,
  initKeyboardNavigation,
  initExternalLinks,
  initSmoothScrolling,
  initLoadingScreen,
  createObserver,
  fetchHTMLElements,
  initImageErrorHandling,
};
