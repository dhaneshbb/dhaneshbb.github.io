// Page detection and initialization

import { loadComponents } from './core/component-loader.js';
import {
  initNavbarScrollEffect,
  initFadeInAnimations,
  initSmoothReveal,
  initKeyboardNavigation,
  initExternalLinks,
  initSmoothScrolling,
  initLoadingScreen,
  initImageErrorHandling,
} from './core/utils.js';
import { initTheme, initThemeToggle } from './core/theme.js';
import { ANIMATION } from './core/constants.js';

initTheme();

document.addEventListener('DOMContentLoaded', async () => {
  initLoadingScreen();
  await loadComponents();
  initThemeToggle();

  initNavbarScrollEffect();
  initFadeInAnimations();
  initKeyboardNavigation();
  initExternalLinks();
  initSmoothScrolling();
  initImageErrorHandling();

  const page = window.location.pathname.split('/').pop();

  if (!page || page === '' || page === 'index.html' || page === '/') {
    const { initIndexPage } = await import('./pages/index.js');
    initIndexPage();
    initSmoothReveal(300);
  } else if (page === 'about.html') {
    const { initAboutPage } = await import('./pages/about.js');
    initAboutPage();
    initSmoothReveal(300);
  } else if (page === 'projects.html') {
    const { initProjectsPage } = await import('./pages/projects.js');
    initProjectsPage();
  } else if (page === 'experience.html') {
    const { initExperiencePage } = await import('./pages/experience.js');
    initExperiencePage();
    window.addEventListener('load', () => {
      document.querySelectorAll('.fade-in').forEach((element, index) => {
        setTimeout(() => element.classList.add('visible'), index * ANIMATION.FADE_IN_STAGGER);
      });
    });
  } else if (page === 'contact.html') {
    const { initContactPage } = await import('./pages/contact.js');
    initContactPage();
    initSmoothReveal(300);
  }
});
