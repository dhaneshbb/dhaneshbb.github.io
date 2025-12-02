import { initCertificates } from './certificates.js';
import { createObserver } from '../core/utils.js';
import { ANIMATION, STAGGER } from '../core/constants.js';

function initAboutPage() {
  initCertificates();

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    for (const counter of counters) {
      const target = parseFloat(counter.getAttribute('data-count'));
      const increment = target / ANIMATION.COUNTER_INCREMENT_DIVISOR;
      let current = 0;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = Math.ceil(current);
          setTimeout(updateCounter, ANIMATION.COUNTER_UPDATE_INTERVAL);
        } else {
          counter.textContent = target;
        }
      };

      updateCounter();
    }
  }

  const achievementSelectors = [
    '.achievement-item[data-animation]',
    '.experience-item[data-animation]',
    '.career-card[data-animation]',
    '.cert-card[data-animation]',
  ];

  for (const selector of achievementSelectors) {
    createObserver({
      selector,
      onIntersect: element => {
        const animationType = element.getAttribute('data-animation');
        if (animationType) {
          element.classList.add(`animate-${animationType}`);
        }
      },
    });
  }

  createObserver({
    selector: '#skillset .skill-category',
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

  createObserver({
    selector: '.fade-in',
    onIntersect: (element, observer) => {
      if (!element.closest('#skillset')) {
        element.classList.add('visible');

        if (
          element.querySelector('.stat-number[data-count]') &&
          !element.classList.contains('animated')
        ) {
          element.classList.add('animated');
          setTimeout(animateCounters, ANIMATION.COUNTER_TRIGGER_DELAY);
        }
      } else {
        observer.observe(element);
      }
    },
  });

  document.querySelectorAll('.achievement-item, .cert-card, .sidebar-card').forEach(card => {
    if (!card.closest('#skillset')) {
      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
      });
    }
  });
}

export { initAboutPage };
