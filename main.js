/**
 * Dhanesh B.B. Portfolio - Main JavaScript
 * Professional Data Science Portfolio Website
 * Version: 1.0.0
 */

'use strict';

// Main Portfolio object - contains all functionality
const Portfolio = {
  // Configuration
  config: {
    scrollOffset: 80,
    animationDelay: 100,
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseTime: 2000,
    counterSpeed: 20,
    observerOptions: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  },

  // State management
  state: {
    isLoaded: false,
    currentPage: '',
    isScrolling: false,
    animationsEnabled: true,
    keyboardNavigation: false,
  },

  // Initialize the portfolio
  init() {
    console.log('Portfolio initialized');
    this.detectPage();
    this.setupEventListeners();
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupAnimations();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();

    // Page-specific initializations
    this.initializePageSpecific();

    // Mark as loaded
    this.state.isLoaded = true;
    this.hideLoadingScreen();
  },

  // Detect current page
  detectPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    this.state.currentPage = filename.replace('.html', '') || 'index';
    console.log('Current page:', this.state.currentPage);
  },

  // Setup all event listeners
  setupEventListeners() {
    // Window events
    window.addEventListener('load', this.handleWindowLoad.bind(this));
    window.addEventListener(
      'scroll',
      this.throttle(this.handleScroll.bind(this), 16)
    );
    window.addEventListener(
      'resize',
      this.throttle(this.handleResize.bind(this), 250)
    );

    // Navigation events
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Form events (if any)
    this.setupFormHandlers();

    // Performance monitoring
    this.setupPerformanceMonitoring();
  },

  // Setup navigation functionality
  setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (!navbar) return;

    // Active link highlighting
    this.updateActiveNavLink();

    // Mobile menu handling
    if (navbarToggler && navbarCollapse) {
      navbarToggler.addEventListener('click', () => {
        const isExpanded =
          navbarToggler.getAttribute('aria-expanded') === 'true';
        navbarToggler.setAttribute('aria-expanded', !isExpanded);
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (
          !navbar.contains(e.target) &&
          navbarCollapse.classList.contains('show')
        ) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false,
          });
          bsCollapse.hide();
        }
      });
    }

    // Smooth scrolling for anchor links
    navLinks.forEach((link) => {
      if (link.getAttribute('href').startsWith('#')) {
        link.addEventListener('click', this.handleAnchorClick.bind(this));
      }
    });
  },

  // Setup scroll effects
  setupScrollEffects() {
    // Navbar scroll effect
    this.setupNavbarScroll();

    // Scroll animations
    this.setupScrollAnimations();

    // Progress indicator (if needed)
    this.setupScrollProgress();
  },

  // Setup navbar scroll effects
  setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Add/remove scrolled class
      if (scrollTop > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll (mobile)
      if (window.innerWidth <= 768) {
        if (scrollTop > lastScrollTop && scrollTop > 200) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      }

      lastScrollTop = scrollTop;
    });
  },

  // Setup scroll animations
  setupScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      this.state.animationsEnabled = false;
      return;
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');

            // Trigger counters for stat cards
            if (
              entry.target.classList.contains('stat-card') &&
              !entry.target.classList.contains('animated')
            ) {
              entry.target.classList.add('animated');
              this.animateCounters();
            }
          }, index * this.config.animationDelay);
        }
      });
    }, this.config.observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in, .stat-card').forEach((element) => {
      observer.observe(element);
    });
  },

  // Setup animations
  setupAnimations() {
    // Typing animation (homepage)
    if (this.state.currentPage === 'index') {
      this.initTypingAnimation();
    }

    // Counter animations
    this.setupCounterAnimations();

    // Hover effects
    this.setupHoverEffects();

    // Loading animations
    this.setupLoadingAnimations();
  },

  // Initialize typing animation
  initTypingAnimation() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;

    const texts = [
      'ML Engineer',
      'Data Analyst',
      'AI Specialist',
      'ML Engineer',
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentText = texts[textIndex];

      if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => (isDeleting = true), this.config.pauseTime);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }

      const speed = isDeleting
        ? this.config.deletingSpeed
        : this.config.typingSpeed;
      setTimeout(type, speed);
    };

    // Start typing animation after a delay
    setTimeout(type, 2000);
  },

  // Setup counter animations
  setupCounterAnimations() {
    this.countersAnimated = false;
  },

  // Animate counters
  animateCounters() {
    if (this.countersAnimated) return;
    this.countersAnimated = true;

    const counters = document.querySelectorAll('.stat-number[data-count]');

    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-count'));
      const increment = target / 100;
      let current = 0;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          if (target === 92.5) {
            counter.textContent = current.toFixed(1);
          } else {
            counter.textContent = Math.ceil(current);
          }
          setTimeout(updateCounter, this.config.counterSpeed);
        } else {
          if (target === 92.5) {
            counter.textContent = target.toFixed(1);
          } else {
            counter.textContent = target;
          }
        }
      };

      updateCounter();
    });
  },

  // Setup hover effects
  setupHoverEffects() {
    // Enhanced card hover effects
    document
      .querySelectorAll('.project-card, .skill-category, .achievement-item')
      .forEach((card, index) => {
        card.addEventListener('mouseenter', function () {
          if (Portfolio.state.animationsEnabled) {
            this.style.transform = 'translateY(-10px)';
          }
        });

        card.addEventListener('mouseleave', function () {
          this.style.transform = 'translateY(0)';
        });

        // Add ripple effect on click
        card.addEventListener(
          'click',
          Portfolio.createRippleEffect.bind(Portfolio)
        );
      });

    // Social link hover effects
    document.querySelectorAll('.social-link').forEach((link) => {
      link.addEventListener('mouseenter', function () {
        if (Portfolio.state.animationsEnabled) {
          this.style.transform = 'translateY(-5px) scale(1.1)';
        }
      });

      link.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  },

  // Create ripple effect
  createRippleEffect(e) {
    if (!this.state.animationsEnabled) return;

    const ripple = document.createElement('div');
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(0, 97, 242, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;

    e.currentTarget.style.position = 'relative';
    e.currentTarget.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  },

  // Setup loading animations
  setupLoadingAnimations() {
    // Remove loading class from elements
    document.querySelectorAll('.loading').forEach((element) => {
      element.classList.remove('loading');
    });
  },

  // Setup accessibility features
  setupAccessibility() {
    // Keyboard navigation detection
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.state.keyboardNavigation = true;
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('click', () => {
      this.state.keyboardNavigation = false;
      document.body.classList.remove('keyboard-nav');
    });

    // Ensure all external links have proper attributes
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Skip to main content link
    this.addSkipToMainContent();
  },

  // Add skip to main content link
  addSkipToMainContent() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-to-main';
    skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.2s;
        `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  // Setup performance optimizations
  setupPerformanceOptimizations() {
    // Lazy loading for images
    this.setupLazyLoading();

    // Preload critical resources
    this.preloadCriticalResources();

    // Setup service worker (if available)
    this.setupServiceWorker();
  },

  // Setup lazy loading
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            lazyImageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        lazyImageObserver.observe(img);
      });
    }
  },

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      '/assets/images/dhanesh_profile.jpg',
      '/assets/files/Dhanesh_BB_Resume.pdf',
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('.jpg') ? 'image' : 'document';
      document.head.appendChild(link);
    });
  },

  // Setup service worker
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  },

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library if included
      console.log('Web Vitals monitoring available');
    }

    // Basic performance monitoring
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log(
        'Page load time:',
        perfData.loadEventEnd - perfData.loadEventStart,
        'ms'
      );
    });
  },

  // Setup form handlers
  setupFormHandlers() {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    });

    // Contact form specific handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      this.setupContactForm(contactForm);
    }
  },

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Basic form validation
    if (!this.validateForm(form)) {
      return;
    }

    // Show loading state
    this.showFormLoading(form);

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      this.showFormSuccess(form);
    }, 2000);
  },

  // Validate form
  validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach((field) => {
      if (field.value && !this.isValidEmail(field.value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      }
    });

    return isValid;
  },

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Show field error
  showFieldError(field, message) {
    this.clearFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            color: var(--danger-color);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;

    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
  },

  // Clear field error
  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    field.classList.remove('error');
  },

  // Show form loading
  showFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    }
  },

  // Show form success
  showFormSuccess(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
      submitBtn.style.background = 'var(--success-color)';
    }

    // Reset form after delay
    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.innerHTML =
          '<i class="fas fa-paper-plane me-2"></i>Send Message';
        submitBtn.style.background = '';
      }
    }, 3000);

    // Show success message
    this.showNotification('Message sent successfully!', 'success');
  },

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : 'info'}-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--border-radius-lg);
            z-index: 1050;
            font-weight: 600;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  },

  // Initialize page-specific functionality
  initializePageSpecific() {
    switch (this.state.currentPage) {
      case 'index':
        this.initHomepage();
        break;
      case 'about':
        this.initAboutPage();
        break;
      case 'projects':
        this.initProjectsPage();
        break;
      case 'experience':
        this.initExperiencePage();
        break;
      case 'contact':
        this.initContactPage();
        break;
    }
  },

  // Initialize homepage
  initHomepage() {
    console.log('Initializing homepage');
    // Homepage-specific functionality
  },

  // Initialize about page
  initAboutPage() {
    console.log('Initializing about page');
    // About page-specific functionality
  },

  // Initialize projects page
  initProjectsPage() {
    console.log('Initializing projects page');
    // Projects page-specific functionality
    this.setupProjectFilters();
  },

  // Initialize experience page
  initExperiencePage() {
    console.log('Initializing experience page');
    // Experience page-specific functionality
  },

  // Initialize contact page
  initContactPage() {
    console.log('Initializing contact page');
    // Contact page-specific functionality
  },

  // Setup project filters
  setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter projects
        projectCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            card.classList.add('fade-in');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  },

  // Event handlers
  handleWindowLoad() {
    console.log('Window loaded');
    this.state.isLoaded = true;
  },

  handleScroll() {
    if (this.state.isScrolling) return;

    this.state.isScrolling = true;

    // Update active nav link
    this.updateActiveNavLink();

    // Reset scrolling flag
    setTimeout(() => {
      this.state.isScrolling = false;
    }, 100);
  },

  handleResize() {
    console.log('Window resized');
    // Handle responsive adjustments
  },

  handleClick(e) {
    // Global click handler
    const target = e.target;

    // Handle external links
    if (
      target.tagName === 'A' &&
      target.href &&
      target.href.startsWith('http')
    ) {
      e.preventDefault();
      window.open(target.href, '_blank', 'noopener,noreferrer');
    }
  },

  handleKeyDown(e) {
    // Global keyboard handler
    if (e.key === 'Escape') {
      // Close any open modals or menus
      this.closeAllModals();
    }
  },

  handleAnchorClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const offsetTop = targetElement.offsetTop - this.config.scrollOffset;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  },

  // Update active navigation link
  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  },

  // Setup scroll progress indicator
  setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            z-index: 1031;
            transition: width 0.1s ease;
        `;

    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const scrolled =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      progressBar.style.width = Math.min(scrolled, 100) + '%';
    });
  },

  // Hide loading screen
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hide');
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 1000);
    }
  },

  // Close all modals
  closeAllModals() {
    // Close any open modals or overlays
    document.querySelectorAll('.modal.show').forEach((modal) => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    });
  },

  // Utility functions
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
};

// Add CSS for ripple animation
const rippleCSS = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize portfolio when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Portfolio.init.bind(Portfolio));
} else {
  Portfolio.init();
}

// Export for potential use in other files
window.Portfolio = Portfolio;
