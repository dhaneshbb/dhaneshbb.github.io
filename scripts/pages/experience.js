import { createObserver } from '../core/utils.js';
import { ANIMATION, STAGGER } from '../core/constants.js';

function alignTimeline() {
  document.querySelectorAll('.experience-item').forEach(item => {
    const content = item.querySelector('.experience-content');
    const title = item.querySelector('.job-title, .title-row, h3, h4');
    const marker = item.querySelector('.experience-marker');

    if (!content || !title) return;

    const contentRect = content.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const relativeTop = titleRect.top - contentRect.top + titleRect.height / 2;

    const markerTop = Math.max(10, Math.min(relativeTop - 6, contentRect.height - 10));
    const badgeTop = Math.max(-36, Math.min(relativeTop - 28, contentRect.height - 8));

    item.style.setProperty('--badge-top', `${badgeTop}px`);
    if (marker) marker.style.top = `${markerTop}px`;
  });
}

function initExperiencePage() {
  window.addEventListener('load', alignTimeline);
  window.addEventListener('resize', () =>
    setTimeout(alignTimeline, ANIMATION.TIMELINE_MARKER_RESIZE_DEBOUNCE)
  );
  setTimeout(alignTimeline, ANIMATION.TIMELINE_MARKER_ALIGNMENT_DELAY);

  createObserver({
    selector: '.fade-in',
    onIntersect: element => {
      element.classList.add('visible');
    },
  });

  const timelineSelectors = ['.experience-item[data-animation]', '.career-card[data-animation]'];

  timelineSelectors.forEach(selector => {
    createObserver({
      selector,
      onIntersect: element => {
        const animationType = element.getAttribute('data-animation');
        if (animationType) {
          element.classList.add(`animate-${animationType}`);
        }
      },
    });
  });

  createObserver({
    selector: '.skills-development .skill-category',
    onIntersect: element => {
      const parentColumn = element.closest('.skillset-column');
      if (parentColumn) {
        const animationType = parentColumn.getAttribute('data-animation');
        if (animationType) {
          const categoriesInColumn = Array.from(parentColumn.querySelectorAll('.skill-category'));
          const index = categoriesInColumn.indexOf(element);
          const delay = index * STAGGER.SKILL_CATEGORY_DELAY;

          element.style.animationDelay = `${delay}s`;
          element.classList.add(`animate-${animationType}`);
        }
      }
    },
  });

  document.querySelectorAll('.journey-card, .highlight-item').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `all 0.5s ease-out ${index * STAGGER.CARD_DELAY}s`;
  });

  createObserver({
    selector: '.journey-card, .highlight-item',
    onIntersect: element => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    },
  });

  document.querySelectorAll('.skill-tag, .highlight-item').forEach(element => {
    element.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
    });

    element.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });
}

export { initExperiencePage };
