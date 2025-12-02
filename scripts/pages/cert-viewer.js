// Certificate viewer page - image viewer logic
// Copyright (c) 2025 Dhanesh B.B. All Rights Reserved.
// Certificate image viewer with zoom, protection, and watermarking
// https://dhaneshbb.github.io

import { getCertificateDataURL, getCertificateMetadata } from '../data/certificates.js';

const urlParams = new URLSearchParams(window.location.search);
const certId = urlParams.get('id');
const certImage = document.getElementById('certImage');
const certTitle = document.getElementById('certTitle');
const viewer = document.getElementById('viewer');
const zoomInfo = document.getElementById('zoomInfo');

let scale = 1;
let naturalWidth = 0;

if (certId) {
  const dataURL = getCertificateDataURL(certId);
  const metadata = getCertificateMetadata(certId);

  if (dataURL) {
    certImage.src = dataURL;
    if (metadata?.title) {
      certTitle.textContent = metadata.title;
    }

    certImage.onload = () => {
      naturalWidth = certImage.naturalWidth;
      fitToPage();
    };
  }
}

function updateZoom() {
  const width = naturalWidth * scale;
  certImage.style.width = width + 'px';
  certImage.style.maxWidth = 'none';
  zoomInfo.textContent = Math.round(scale * 100) + '%';
}

function fitToWidth() {
  const containerWidth = viewer.clientWidth - 40;
  scale = containerWidth / naturalWidth;
  scale = Math.min(scale, 1); // Don't enlarge beyond 100%
  updateZoom();
}

function fitToPage() {
  const containerWidth = viewer.clientWidth - 40;
  const containerHeight = viewer.clientHeight - 40;
  const naturalHeight = certImage.naturalHeight;
  const scaleX = containerWidth / naturalWidth;
  const scaleY = containerHeight / naturalHeight;
  scale = Math.min(scaleX, scaleY, 1); // Don't enlarge beyond 100%
  updateZoom();
}

function resetZoom() {
  scale = 1;
  certImage.style.width = '';
  certImage.style.maxWidth = '';
  zoomInfo.textContent = '100%';
}

function zoomIn() {
  scale = Math.min(scale + 0.25, 3);
  updateZoom();
}

function zoomOut() {
  scale = Math.max(scale - 0.25, 0.5);
  updateZoom();
}

document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
document.getElementById('fitWidthBtn').addEventListener('click', fitToWidth);
document.getElementById('fitPageBtn').addEventListener('click', fitToPage);
document.getElementById('resetBtn').addEventListener('click', resetZoom);

document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
  setTimeout(() => window.history.back(), 100);
});

// Mouse wheel zoom
viewer.addEventListener(
  'wheel',
  e => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  },
  { passive: false }
);

// Protection: disable copy, select, right-click, drag, and save

// Disable right-click context menu
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  return false;
});

// Disable text selection
document.addEventListener('selectstart', function (e) {
  e.preventDefault();
  return false;
});

// Disable copy/cut
document.addEventListener('copy', function (e) {
  e.preventDefault();
  return false;
});

document.addEventListener('cut', function (e) {
  e.preventDefault();
  return false;
});

// Disable drag and drop
document.addEventListener('dragstart', function (e) {
  e.preventDefault();
  return false;
});

// Keyboard shortcuts and protection
document.addEventListener('keydown', function (e) {
  // Handle zoom controls first
  if (!e.ctrlKey && !e.metaKey) {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomIn();
      return;
    }
    if (e.key === '-') {
      e.preventDefault();
      zoomOut();
      return;
    }
  }

  // Handle Ctrl+0 for fit to width
  if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    fitToWidth();
    return;
  }

  // Disable Ctrl+S (Save), Ctrl+C (Copy), Ctrl+P (Print), Ctrl+A (Select All)
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 's' || e.key === 'c' || e.key === 'p' || e.key === 'a') {
      e.preventDefault();
      return false;
    }
  }

  // Disable F12, Ctrl+Shift+I (DevTools)
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))
  ) {
    e.preventDefault();
    return false;
  }

  // Disable PrintScreen
  if (e.key === 'PrintScreen') {
    e.preventDefault();
    return false;
  }
});

// Prevent image extraction
certImage.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  return false;
});

// Add dynamic watermark overlay
const imageWrapper = document.getElementById('imageWrapper');
const watermark = document.createElement('div');
watermark.id = 'watermark-layer';

// Generate user fingerprint for watermark
const fingerprint = btoa(navigator.userAgent + Date.now()).substring(0, 10);
const viewDate = new Date().toLocaleString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// Responsive font size based on viewport
const isMobile = window.innerWidth < 768;
const fontSize = isMobile ? '24px' : '48px';
const lineCount = isMobile ? 7 : 5;

watermark.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  opacity: 0.03;
  font-size: ${fontSize};
  color: #000;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  transform: rotate(-45deg);
  font-family: monospace;
  font-weight: bold;
  user-select: none;
  -webkit-user-select: none;
`;

// Add repeating watermark text
const watermarkText = `© Dhanesh B.B. • Viewed: ${viewDate} • ID: ${fingerprint}`;
for (let i = 0; i < lineCount; i++) {
  const line = document.createElement('div');
  line.textContent = watermarkText;
  line.style.cssText = 'width: 100%; text-align: center; line-height: 2;';
  watermark.appendChild(line);
}

imageWrapper.appendChild(watermark);

// Random movement to prevent clean screenshots
let angle = -45;
setInterval(() => {
  angle += 0.1;
  watermark.style.transform = `rotate(${angle}deg)`;
}, 100);

// Update watermark on orientation change
window.addEventListener('resize', () => {
  const newIsMobile = window.innerWidth < 768;
  const newFontSize = newIsMobile ? '24px' : '48px';
  watermark.style.fontSize = newFontSize;
});

// Track viewing duration
let viewTime = 0;
setInterval(() => {
  viewTime++;
  if (viewTime % 30 === 0 && window.gtag) {
    gtag('event', 'certificate_viewing', {
      event_category: 'document',
      event_label: 'duration_seconds',
      value: viewTime,
    });
  }
}, 1000);

// Theme sync
window.addEventListener('storage', e => {
  if (e.key === 'theme') {
    document.documentElement.setAttribute('data-theme', e.newValue);
  }
});
