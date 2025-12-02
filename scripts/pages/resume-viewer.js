// Resume viewer page - PDF viewer logic
// Copyright (c) 2025 Dhanesh B.B. All Rights Reserved.
// PDF.js viewer with zoom, navigation, and protection
// https://dhaneshbb.github.io

/* global pdfjsLib */

import { getResumeDataURL } from '../data/resume.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
const viewer = document.getElementById('viewer');
const canvasContainer = document.getElementById('canvasContainer');
const zoomInfo = document.getElementById('zoomInfo');

let pdfDoc = null;
let pageNum = 1;
let scale = 2.0;
let renderTask = null;
let baseScale = 2.0;

function renderPage(num) {
  // Cancel previous render if still running
  if (renderTask) {
    renderTask.cancel();
  }

  baseScale = scale;
  canvasContainer.style.transform = 'scale(1)';

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: baseScale });

    // Account for device pixel ratio for sharp rendering on high-DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = viewport.width * devicePixelRatio;
    const canvasHeight = viewport.height * devicePixelRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';

    // Scale the context to account for device pixel ratio
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    renderTask = page.render({
      canvasContext: ctx,
      viewport: viewport,
    });

    renderTask.promise
      .then(() => {
        renderTask = null;
        updateButtons();
        updateZoomInfo();
      })
      .catch(err => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
        renderTask = null;
      });

    document.getElementById('pageNum').textContent = num;
  });
}

function updateButtons() {
  document.getElementById('prevBtn').disabled = pageNum <= 1;
  document.getElementById('nextBtn').disabled = pageNum >= pdfDoc.numPages;
}

function updateZoomInfo() {
  zoomInfo.textContent = Math.round(scale * 100) + '%';
}

function fitToWidth() {
  if (!pdfDoc) return;
  pdfDoc.getPage(pageNum).then(page => {
    const containerWidth = viewer.clientWidth - 40;
    const viewport = page.getViewport({ scale: 1 });
    scale = containerWidth / viewport.width;
    renderPage(pageNum);
  });
}

function fitToPage() {
  if (!pdfDoc) return;
  pdfDoc.getPage(pageNum).then(page => {
    const containerWidth = viewer.clientWidth - 40;
    const containerHeight = viewer.clientHeight - 40;
    const viewport = page.getViewport({ scale: 1 });
    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    scale = Math.min(scaleX, scaleY);
    renderPage(pageNum);
  });
}

let zoomTimeout = null;

function zoomIn() {
  scale = Math.min(scale + 0.25, 4);
  updateZoomInfo();

  if (zoomTimeout) clearTimeout(zoomTimeout);
  zoomTimeout = setTimeout(() => {
    renderPage(pageNum);
  }, 50);
}

function zoomOut() {
  scale = Math.max(scale - 0.25, 0.8);
  updateZoomInfo();

  if (zoomTimeout) clearTimeout(zoomTimeout);
  zoomTimeout = setTimeout(() => {
    renderPage(pageNum);
  }, 50);
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
});

document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
document.getElementById('fitWidthBtn').addEventListener('click', fitToWidth);
document.getElementById('fitPageBtn').addEventListener('click', fitToPage);

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

// Load PDF
pdfjsLib.getDocument(getResumeDataURL()).promise.then(pdf => {
  pdfDoc = pdf;
  document.getElementById('pageCount').textContent = pdf.numPages;
  fitToPage();
});

// Protection
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
  if (e.key === 'ArrowRight' && pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    zoomIn();
  }
  if (e.key === '-') {
    e.preventDefault();
    zoomOut();
  }
});

// Theme sync
window.addEventListener('storage', e => {
  if (e.key === 'theme') {
    document.documentElement.setAttribute('data-theme', e.newValue);
  }
});
