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
import { initIndexPage } from './pages/index.js';
import { initAboutPage } from './pages/about.js';
import { initProjectsPage } from './pages/projects.js';
import { initExperiencePage } from './pages/experience.js';
import { initContactPage } from './pages/contact.js';

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
    initIndexPage();
    initSmoothReveal(300);
  } else if (page === 'about.html') {
    initAboutPage();
    initSmoothReveal(300);
  } else if (page === 'projects.html') {
    initProjectsPage();
  } else if (page === 'experience.html') {
    initExperiencePage();
    window.addEventListener('load', () => {
      document.querySelectorAll('.fade-in').forEach((element, index) => {
        setTimeout(() => element.classList.add('visible'), index * ANIMATION.FADE_IN_STAGGER);
      });
    });
  } else if (page === 'contact.html') {
    initContactPage();
    initSmoothReveal(300);
  }
});
