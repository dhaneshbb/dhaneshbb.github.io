/**
 * Utility Functions
 * Reusable helper functions for common tasks
 */

'use strict';

// ===== UTILITY NAMESPACE =====
const Utils = {
  // ===== DOM UTILITIES =====

  /**
   * Select element(s) with enhanced functionality
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (optional)
   * @returns {Element|NodeList|null}
   */
  $(selector, context = document) {
    const elements = context.querySelectorAll(selector);
    return elements.length === 1
      ? elements[0]
      : elements.length > 1
        ? elements
        : null;
  },

  /**
   * Create element with attributes and content
   * @param {string} tagName - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string|Element} content - Element content
   * @returns {Element}
   */
  createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    }

    return element;
  },

  /**
   * Add multiple event listeners to an element
   * @param {Element} element - Target element
   * @param {Object} events - Events object {event: handler}
   */
  addEvents(element, events) {
    Object.entries(events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  },

  /**
   * Remove element with optional animation
   * @param {Element} element - Element to remove
   * @param {boolean} animate - Whether to animate removal
   */
  removeElement(element, animate = true) {
    if (!element) return;

    if (animate) {
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';

      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    } else {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  },

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @param {number} offset - Offset in pixels
   * @returns {boolean}
   */
  isInViewport(element, offset = 0) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) +
          offset &&
      rect.right <=
        (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },

  /**
   * Smooth scroll to element
   * @param {Element|string} target - Target element or selector
   * @param {number} offset - Offset in pixels
   * @param {number} duration - Animation duration in ms
   */
  scrollTo(target, offset = 0, duration = 800) {
    const element = typeof target === 'string' ? this.$(target) : target;
    if (!element) return;

    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (ease-in-out)
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  },

  // ===== STRING UTILITIES =====

  /**
   * Capitalize first letter of string
   * @param {string} str - Input string
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert string to title case
   * @param {string} str - Input string
   * @returns {string}
   */
  titleCase(str) {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * Convert string to kebab-case
   * @param {string} str - Input string
   * @returns {string}
   */
  kebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * Convert string to camelCase
   * @param {string} str - Input string
   * @returns {string}
   */
  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * Truncate string with ellipsis
   * @param {string} str - Input string
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add
   * @returns {string}
   */
  truncate(str, length = 100, suffix = '...') {
    return str.length <= length ? str : str.substr(0, length) + suffix;
  },

  /**
   * Generate random string
   * @param {number} length - String length
   * @param {string} chars - Character set
   * @returns {string}
   */
  randomString(
    length = 10,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // ===== ARRAY UTILITIES =====

  /**
   * Remove duplicates from array
   * @param {Array} arr - Input array
   * @returns {Array}
   */
  unique(arr) {
    return [...new Set(arr)];
  },

  /**
   * Shuffle array
   * @param {Array} arr - Input array
   * @returns {Array}
   */
  shuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Chunk array into smaller arrays
   * @param {Array} arr - Input array
   * @param {number} size - Chunk size
   * @returns {Array}
   */
  chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Get random item from array
   * @param {Array} arr - Input array
   * @returns {*}
   */
  randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ===== OBJECT UTILITIES =====

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object}
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach((key) => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * Merge objects deeply
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object}
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  /**
   * Check if value is an object
   * @param {*} item - Value to check
   * @returns {boolean}
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // ===== VALIDATION UTILITIES =====

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate phone number (basic)
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  isValidPhone(phone) {
    const regex = /^[\+]?[1-9][\d]{0,15}$/;
    return regex.test(phone.replace(/\D/g, ''));
  },

  // ===== FORMATTING UTILITIES =====

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string}
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @param {string} locale - Locale string
   * @returns {string}
   */
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string}
   */
  formatDate(
    date,
    options = { year: 'numeric', month: 'long', day: 'numeric' }
  ) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', options);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {Date|string} date - Date to compare
   * @returns {string}
   */
  getRelativeTime(date) {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now - past) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  },

  // ===== PERFORMANCE UTILITIES =====

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function}
   */
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

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @param {boolean} immediate - Execute immediately
   * @returns {Function}
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
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

  /**
   * Memoize function results
   * @param {Function} func - Function to memoize
   * @returns {Function}
   */
  memoize(func) {
    const cache = new Map();
    return function (...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
  },

  // ===== STORAGE UTILITIES =====

  /**
   * Local storage wrapper with JSON support
   */
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('LocalStorage not available:', e);
        return false;
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('Error parsing localStorage item:', e);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn('Error removing localStorage item:', e);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
        return false;
      }
    },
  },

  // ===== URL UTILITIES =====

  /**
   * Get URL parameters as object
   * @param {string} url - URL to parse (optional)
   * @returns {Object}
   */
  getUrlParams(url = window.location.href) {
    const params = {};
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  /**
   * Update URL parameters without page reload
   * @param {Object} params - Parameters to update
   * @param {boolean} replace - Replace current history entry
   */
  updateUrlParams(params, replace = false) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', url);
  },

  // ===== DEVICE UTILITIES =====

  /**
   * Detect device type
   * @returns {string}
   */
  getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  },

  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Check if device supports touch
   * @returns {boolean}
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // ===== ASYNC UTILITIES =====

  /**
   * Sleep function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Retry async function
   * @param {Function} fn - Async function to retry
   * @param {number} retries - Number of retries
   * @param {number} delay - Delay between retries
   * @returns {Promise}
   */
  async retry(fn, retries = 3, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await this.sleep(delay);
      return this.retry(fn, retries - 1, delay);
    }
  },

  /**
   * Timeout promise
   * @param {Promise} promise - Promise to timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise}
   */
  timeout(promise, ms) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Promise timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]);
  },

  // ===== IMAGE UTILITIES =====

  /**
   * Preload image
   * @param {string} src - Image source
   * @returns {Promise}
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Load multiple images
   * @param {Array} sources - Array of image sources
   * @returns {Promise}
   */
  loadImages(sources) {
    return Promise.all(sources.map((src) => this.preloadImage(src)));
  },

  // ===== ACCESSIBILITY UTILITIES =====

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Focus trap for modals
   * @param {Element} element - Container element
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    firstElement.focus();
  },
};

// Freeze the Utils object to prevent modification
Object.freeze(Utils);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else {
  window.Utils = Utils;
}
