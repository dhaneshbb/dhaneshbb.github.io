import { createObserver } from '../core/utils.js';
import { ANIMATION, BREAKPOINTS } from '../core/constants.js';

function initContactPage() {
  if (window.location.hash === '#resume') {
    setTimeout(() => {
      if (typeof window.showResume === 'function') {
        window.showResume();
      }
    }, ANIMATION.RESUME_HASH_DELAY);
  }

  const cardSelectors = ['.specialization-card[data-animation]', '.contact-method[data-animation]'];

  cardSelectors.forEach(selector => {
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

  if (window.innerWidth > BREAKPOINTS.TABLET_MAX) {
    document
      .querySelectorAll('.contact-method, .specialization-card, .social-link')
      .forEach(card => {
        card.addEventListener('mouseenter', function () {
          this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function () {
          this.style.transform = 'translateY(0)';
        });
      });
  }

  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.addEventListener('click', () => {
      navigator.clipboard
        ?.writeText('dhaneshbb5@gmail.com')
        .then(() => showNotification('Email copied to clipboard!'))
        .catch(() => {});
    });
  }

  const phoneLink = document.querySelector('a[href^="tel:"]');
  phoneLink?.addEventListener('click', () => showNotification('Initiating call...'));

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 1050;
            font-weight: 600;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, ANIMATION.NOTIFICATION_SHOW_DELAY);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, ANIMATION.NOTIFICATION_REMOVE_DELAY);
    }, ANIMATION.NOTIFICATION_HIDE_DELAY);
  }

  document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-5px) scale(1.05)';
    });

    btn.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Social link tracking handled by Google Analytics auto-tracking
}

export { initContactPage };
