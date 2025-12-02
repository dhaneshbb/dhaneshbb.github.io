import { createObserver, fetchHTMLElements } from '../core/utils.js';
import { ANIMATION, SCROLL, PROJECT_CARD } from '../core/constants.js';

async function initIndexPage() {
  await loadSkills();
  await loadCertifications();
  cloneCarouselItems();

  const typingElement = document.getElementById('typingText');
  if (typingElement) {
    const typingTexts = [
      'by DataMites, IABAC, NASSCOM',
      '& Data Science Consultant',
      '& Coordinator',
      '& Data Analyst',
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeAnimation = () => {
      const currentText = typingTexts[textIndex];

      if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => (isDeleting = true), ANIMATION.TYPING_PAUSE_AFTER_COMPLETE);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typingTexts.length;
      }

      setTimeout(
        typeAnimation,
        isDeleting ? ANIMATION.TYPING_SPEED_FAST : ANIMATION.TYPING_SPEED_NORMAL
      );
    };

    setTimeout(typeAnimation, ANIMATION.TYPING_PAUSE_AFTER_COMPLETE);
  }

  const subtitleElement = document.getElementById('subtitleTypingText');
  const descriptionElement = document.getElementById('descriptionTypingText');
  const subtitleCursor = document.querySelector('.hero-subtitle-typing .typing-cursor');
  const descriptionCursor = document.querySelector('.hero-description-typing .typing-cursor');

  if (subtitleElement && descriptionElement && subtitleCursor && descriptionCursor) {
    const subtitleText = 'Transforming Data into Actionable Business Insights'.trim();
    const descriptionText =
      "Certified Data Scientist with Master's in Economics. Specialized in Python, Machine Learning, and Big Data Analytics. Creator of InsightfulPy with 25+ automated EDA functions.".trim();

    let subtitleIndex = 0;
    let descriptionIndex = 0;

    const typeSubtitle = () => {
      if (subtitleIndex < subtitleText.length) {
        subtitleElement.textContent = subtitleText.substring(0, subtitleIndex + 1);
        subtitleIndex++;
        setTimeout(typeSubtitle, ANIMATION.TYPING_SPEED_NORMAL);
      }
    };

    const typeDescription = () => {
      if (descriptionIndex < descriptionText.length) {
        descriptionElement.textContent = descriptionText.substring(0, descriptionIndex + 1);
        descriptionIndex++;
        setTimeout(typeDescription, ANIMATION.TYPING_SPEED_SLOW);
      }
    };

    setTimeout(() => {
      typeSubtitle();
      typeDescription();
    }, ANIMATION.PROJECT_LOAD_DELAY);
  }

  const scrollIndicator = document.querySelector('.scroll-indicator');
  let ticking = false;

  function updateOnScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollIndicator) {
      if (scrollY > SCROLL.SCROLL_INDICATOR_HIDE_THRESHOLD) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.visibility = 'hidden';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.visibility = 'visible';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - SCROLL.SECTION_SCROLL_OFFSET;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

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

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-count'));
      const increment = target / ANIMATION.COUNTER_INCREMENT_DIVISOR;
      let current = 0;
      const hasDecimal = target % 1 !== 0;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = hasDecimal ? current.toFixed(1) : Math.ceil(current);
          setTimeout(updateCounter, ANIMATION.COUNTER_UPDATE_INTERVAL);
        } else {
          counter.textContent = hasDecimal ? target.toFixed(1) : target;
        }
      };

      updateCounter();
    });
  }

  createObserver({
    selector: '.stat-card',
    onIntersect: element => {
      if (!element.classList.contains('animated')) {
        element.classList.add('animated');
        animateCounters();
      }
    },
  });

  document.querySelectorAll('.btn, .project-link').forEach(button => {
    button.addEventListener('click', function (e) {
      if (this.href && this.href !== '#') {
        if (this.target === '_blank') {
          e.preventDefault();
          window.open(this.href, '_blank', 'noopener,noreferrer');
        } else if (!this.href.startsWith('#')) {
          window.location.href = this.href;
        }
      }
    });
  });

  // Make skill tags clickable (placeholder for future functionality)
  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('click', () => {});
  });

  loadProjects();
  loadCertificateImages();
}

async function loadProjects() {
  const container = document.getElementById('projects-scroll-wrapper');

  try {
    const projectCards = await fetchHTMLElements('projects.html', '.project-card-new');

    if (!container) return;

    if (!projectCards.length) {
      container.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #dc3545;">No projects found</p>';
      return;
    }

    container.innerHTML = '';

    const addCard = card => {
      const clone = card.cloneNode(true);
      clone.classList.remove('featured');
      clone.classList.add('compact');
      clone.style.cssText = `
        min-width: ${PROJECT_CARD.WIDTH}px;
        max-width: ${PROJECT_CARD.WIDTH}px;
        width: ${PROJECT_CARD.WIDTH}px;
        height: ${PROJECT_CARD.HEIGHT}px;
        flex-shrink: 0;
        flex-grow: 0;
      `;
      container.appendChild(clone);
    };

    projectCards.forEach(addCard);
    projectCards.forEach(addCard);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

async function loadSkills() {
  const skillItems = await fetchHTMLElements('about.html', '#skillset .skill-tag-logo');
  const [row1, row2] = document.querySelectorAll('.skills-logo-grid');

  if (!row1 || !row2 || !skillItems.length) return;

  row1.innerHTML = '';
  row2.innerHTML = '';
  const halfPoint = Math.ceil(skillItems.length / 2);

  skillItems.forEach((item, index) => {
    const clone = item.cloneNode(true);
    const target = index < halfPoint ? row1 : row2;

    if (clone.tagName === 'DIV') {
      const span = document.createElement('span');
      span.className = clone.className;
      span.innerHTML = clone.innerHTML;
      target.appendChild(span);
    } else {
      target.appendChild(clone);
    }
  });
}

async function loadCertifications() {
  const certCards = await fetchHTMLElements('about.html', '#certifications .cert-grid .cert-card');
  const container = document.querySelector('.certifications-scroll-grid');

  if (!container || !certCards.length) return;

  container.innerHTML = '';

  certCards.forEach(card => {
    const certId = card.getAttribute('data-cert-id');
    const title = card.querySelector('.cert-title')?.textContent || '';
    const org = card.querySelector('.cert-org')?.textContent || '';
    const date = card.querySelector('.cert-date')?.textContent || '';
    const isKaggleCard = card.classList.contains('cert-card-kaggle');

    const simplifiedCard = document.createElement('div');
    simplifiedCard.className = isKaggleCard ? 'cert-card-new cert-card-kaggle' : 'cert-card-new';

    if (isKaggleCard) {
      simplifiedCard.innerHTML = card.innerHTML;
    } else {
      simplifiedCard.innerHTML = `
            <div class="cert-image-wrapper">
              <img
                data-cert-id="${certId}"
                alt="${title}"
                class="cert-image cert-image-lazy"
                loading="lazy"
              />
            </div>
            <div class="cert-content">
              <h4 class="cert-title">${title}</h4>
              <p class="cert-org">${org}</p>
              <span class="cert-date">${date}</span>
            </div>
          `;
    }

    container.appendChild(simplifiedCard);
  });

  await loadCertImages();
}

async function loadCertImages() {
  const { getCertificateDataURL } = await import('../data/certificates.js');

  document.querySelectorAll('.certifications-scroll-grid .cert-image-lazy').forEach(img => {
    const dataURL = getCertificateDataURL(img.getAttribute('data-cert-id'));
    if (dataURL) img.src = dataURL;
  });

  const kaggleCertIds = [
    'advanced-sql',
    'computer-vision',
    'data-cleaning',
    'data-visualization',
    'feature-engineering',
    'geospatial-analysis',
    'intermediate-ml',
    'intro-ai-ethics',
    'intro-deep-learning',
    'intro-game-ai',
    'intro-ml',
    'intro-programming',
    'intro-sql',
    'ml-explainability',
    'pandas',
    'time-series',
  ];

  document
    .querySelectorAll('.certifications-scroll-grid .kaggle-cert-scroll img')
    .forEach((img, i) => {
      const dataURL = getCertificateDataURL(kaggleCertIds[i]);
      if (dataURL) img.src = dataURL;
    });
}

function cloneCarouselItems() {
  const journeyScroll = document.querySelector('.journey-timeline-scroll');
  if (journeyScroll) {
    const journeyItems = journeyScroll.querySelectorAll('.journey-item');
    journeyItems.forEach(item => {
      const clone = item.cloneNode(true);
      journeyScroll.appendChild(clone);
    });
  }

  const skillsRow1 = document.querySelector('.skills-logo-grid');
  if (skillsRow1) {
    const skillItems1 = skillsRow1.querySelectorAll('.skill-tag-logo');
    skillItems1.forEach(item => {
      const clone = item.cloneNode(true);
      skillsRow1.appendChild(clone);
    });
  }

  const skillsRow2 = document.querySelectorAll('.skills-logo-grid')[1];
  if (skillsRow2) {
    const skillItems2 = skillsRow2.querySelectorAll('.skill-tag-logo');
    skillItems2.forEach(item => {
      const clone = item.cloneNode(true);
      skillsRow2.appendChild(clone);
    });
  }

  const certsScroll = document.querySelector('.certifications-scroll-grid');
  if (certsScroll) {
    const certCards = certsScroll.querySelectorAll('.cert-card-new');
    certCards.forEach(card => {
      const clone = card.cloneNode(true);
      certsScroll.appendChild(clone);
    });
  }

  const projectsScroll = document.querySelector('.projects-scroll');
  if (projectsScroll) {
    const projectCards = projectsScroll.querySelectorAll('.project-card-wrapper');
    projectCards.forEach(card => {
      const clone = card.cloneNode(true);
      projectsScroll.appendChild(clone);
    });
  }
}

async function loadCertificateImages() {
  const { getCertificateDataURL } = await import('../data/certificates.js');

  document.querySelectorAll('.cert-image-lazy').forEach(img => {
    const dataURL = getCertificateDataURL(img.getAttribute('data-cert-id'));
    if (dataURL) img.src = dataURL;
  });
}

export { initIndexPage };
