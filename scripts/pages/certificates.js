// Certificates page functions

import { getCertificateDataURL, CERTIFICATES } from '../data/certificates.js';
import { createObserver } from '../core/utils.js';
import { INTERSECTION_OBSERVER } from '../core/constants.js';

function initCertificates() {
  // Certificate ID mapping
  const certMapping = {
    'iabac-certified-ds': {
      selector: '.cert-card:nth-child(1)',
      data: CERTIFICATES.main.iabacCertifiedDataScientist,
    },
    'nasscom-certified-ds': {
      selector: '.cert-card:nth-child(2)',
      data: CERTIFICATES.main.nasscomCertifiedDataScientist,
    },
    'datamites-certified-ds': {
      selector: '.cert-card:nth-child(3)',
      data: CERTIFICATES.main.datamitesCertifiedDataScientist,
    },
    '365careers-complete-ds': {
      selector: '.cert-card:nth-child(4)',
      data: CERTIFICATES.main.careers365CompleteDataScience,
    },
    'iabac-ds-foundation': {
      selector: '.cert-card:nth-child(5)',
      data: CERTIFICATES.main.iabacDataScienceFoundation,
    },
  };

  // Update main certificate cards and prepare for lazy loading
  const imagesToLazyLoad = [];

  for (const [certId, info] of Object.entries(certMapping)) {
    const card = document.querySelector(`#certifications .cert-grid ${info.selector}`);
    if (!card) continue;

    // Set up lazy loading for preview image
    const img = card.querySelector('.cert-image-preview img');
    if (img) {
      img.dataset.certId = certId;
      imagesToLazyLoad.push(img);
    }

    // Update view button
    const viewBtn = card.querySelector('.cert-view-btn');
    if (viewBtn) {
      viewBtn.href = `cert-viewer.html?id=${certId}`;
      viewBtn.target = '_blank';
      viewBtn.rel = 'noopener';
    }
  }

  // Lazy load Kaggle certificate carousel and duplicate for seamless loop
  const kaggleScroll = document.querySelector('.kaggle-cert-scroll');
  const kaggleImages = document.querySelectorAll('.kaggle-cert-scroll img');

  if (kaggleImages.length > 0 && kaggleScroll) {
    // Duplicate images for seamless infinite scroll
    kaggleImages.forEach(img => {
      const clone = img.cloneNode(true);
      kaggleScroll.appendChild(clone);
    });

    // Now get all images (original + clones)
    const allKaggleImages = document.querySelectorAll('.kaggle-cert-scroll img');

    CERTIFICATES.kaggle.forEach((cert, index) => {
      // Set up lazy loading for both original and duplicate
      if (allKaggleImages[index]) {
        allKaggleImages[index].dataset.certId = cert.id;
        allKaggleImages[index].onclick = () =>
          window.open(`cert-viewer.html?id=${cert.id}`, '_blank');
        allKaggleImages[index].style.cursor = 'pointer';
        imagesToLazyLoad.push(allKaggleImages[index]);
      }
      const duplicateIndex = index + CERTIFICATES.kaggle.length;
      if (allKaggleImages[duplicateIndex]) {
        allKaggleImages[duplicateIndex].dataset.certId = cert.id;
        allKaggleImages[duplicateIndex].onclick = () =>
          window.open(`cert-viewer.html?id=${cert.id}`, '_blank');
        allKaggleImages[duplicateIndex].style.cursor = 'pointer';
        imagesToLazyLoad.push(allKaggleImages[duplicateIndex]);
      }
    });
  }

  imagesToLazyLoad.forEach(img => {
    createObserver({
      selector: `img[data-cert-id="${img.dataset.certId}"]`,
      threshold: INTERSECTION_OBSERVER.THRESHOLD_LAZY_LOAD,
      rootMargin: INTERSECTION_OBSERVER.ROOT_MARGIN_LAZY_LOAD,
      onIntersect: element => {
        const certId = element.dataset.certId;
        if (certId) {
          element.src = getCertificateDataURL(certId);
        }
      },
    });
  });
}

export { initCertificates };
