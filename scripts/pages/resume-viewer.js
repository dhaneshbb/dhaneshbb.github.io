// Resume viewer page - PDF viewer logic
// Copyright (c) 2025 Dhanesh B.B. All Rights Reserved.
// PDF.js viewer with zoom, navigation, and protection
// https://dhaneshbb.github.io

/* global pdfjsLib */

const RESUME_PATH = 'media/doc/Dhanesh_BB_Data_Scientist.pdf';
const VIEW_PADDING = 40;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const viewer = document.getElementById('viewer');
const canvasContainer = document.getElementById('canvasContainer');
const zoomInfo = document.getElementById('zoomInfo');
const nativeViewer = document.getElementById('nativeViewer');

// Respect ?mode=canvas to force PDF.js, otherwise prefer native embed for crisp, selectable text
const urlParams = new URLSearchParams(window.location.search);
const forceCanvas = urlParams.get('mode') === 'canvas';
const useCanvasViewer = forceCanvas || !nativeViewer;

// Keep theme in sync even in native mode
window.addEventListener('storage', e => {
  if (e.key === 'theme') {
    document.documentElement.setAttribute('data-theme', e.newValue);
  }
});

if (!useCanvasViewer) {
  document.body.classList.add('native-mode');
  // Nothing else to initialize; browser handles paging/zoom/download natively.
} else {
  let pdfDoc = null;
  let pageNum = 1;
  let scale = 1;
  let zoomTimeout = null;
  let pageCanvases = [];
  const renderTasks = new Map();

  const pageObserver = new IntersectionObserver(
    entries => {
      let topEntry = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!topEntry || entry.intersectionRatio > topEntry.intersectionRatio) {
            topEntry = entry;
          }
        }
      });
      if (topEntry) {
        const current = Number(topEntry.target.dataset.pageNumber);
        setCurrentPage(current);
      }
    },
    {
      root: viewer,
      threshold: [0.25, 0.55, 0.85],
    }
  );

  const updateButtons = () => {
    const total = pdfDoc?.numPages ?? 1;
    document.getElementById('prevBtn').disabled = pageNum <= 1;
    document.getElementById('nextBtn').disabled = pageNum >= total;
  };

  const updateZoomInfo = () => {
    zoomInfo.textContent = Math.round(scale * 100) + '%';
  };

  const setCurrentPage = (num, scrollIntoView = false) => {
    pageNum = num;
    document.getElementById('pageNum').textContent = num;
    updateButtons();

    if (scrollIntoView) {
      const target = pageCanvases[num - 1]?.wrapper;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    }
  };

  const buildPageWrapper = pageNumber => {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.pageNumber = pageNumber;

    const badge = document.createElement('div');
    badge.className = 'page-badge';
    badge.textContent = `Page ${pageNumber}`;

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';

    wrapper.appendChild(badge);
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);
    pageObserver.observe(wrapper);

    pageCanvases.push({ pageNumber, canvas, wrapper });
  };

  const renderPage = async pageNumber => {
    if (!pdfDoc) return;
    const pageRef = pageCanvases[pageNumber - 1];
    if (!pageRef) return;

    if (renderTasks.has(pageNumber)) {
      renderTasks.get(pageNumber).cancel();
    }

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;
    const canvas = pageRef.canvas;
    const ctx = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const task = page.render({
      canvasContext: ctx,
      viewport,
      transform,
    });

    renderTasks.set(pageNumber, task);

    try {
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Render error:', err);
      }
    } finally {
      renderTasks.delete(pageNumber);
    }
  };

  const renderAllPages = async () => {
    if (!pdfDoc) return;

    pageObserver.disconnect();
    canvasContainer.innerHTML = '';
    renderTasks.forEach(task => task.cancel());
    renderTasks.clear();
    pageCanvases = [];

    for (let i = 1; i <= pdfDoc.numPages; i += 1) {
      buildPageWrapper(i);
    }

    setCurrentPage(1);
    updateZoomInfo();

    await Promise.all(pageCanvases.map(ref => renderPage(ref.pageNumber)));
  };

  const rerenderAllPages = () => {
    if (!pdfDoc) return;
    pageCanvases.forEach(ref => {
      renderPage(ref.pageNumber);
    });
    updateZoomInfo();
  };

  const computeFitToWidthScale = async () => {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = Math.max(viewer.clientWidth - VIEW_PADDING, 320);
    return containerWidth / viewport.width;
  };

  const computeFitToPageScale = async () => {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = Math.max(viewer.clientWidth - VIEW_PADDING, 320);
    const containerHeight = Math.max(viewer.clientHeight - VIEW_PADDING, 320);
    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    return Math.min(scaleX, scaleY);
  };

  const fitToWidth = async () => {
    if (!pdfDoc) return;
    scale = await computeFitToWidthScale();
    rerenderAllPages();
  };

  const fitToPage = async () => {
    if (!pdfDoc) return;
    scale = await computeFitToPageScale();
    rerenderAllPages();
  };

  const scheduleZoomRender = () => {
    updateZoomInfo();
    if (zoomTimeout) clearTimeout(zoomTimeout);
    zoomTimeout = setTimeout(() => rerenderAllPages(), 80);
  };

  const zoomIn = () => {
    scale = Math.min(scale + 0.25, 4);
    scheduleZoomRender();
  };

  const zoomOut = () => {
    scale = Math.max(scale - 0.25, 0.5);
    scheduleZoomRender();
  };

  const goToPage = targetPage => {
    if (!pdfDoc) return;
    const clamped = Math.max(1, Math.min(targetPage, pdfDoc.numPages));
    setCurrentPage(clamped, true);
  };

  document.getElementById('prevBtn').addEventListener('click', () => {
    goToPage(pageNum - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    goToPage(pageNum + 1);
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

  // Load PDF and render all pages (continuous scroll)
  pdfjsLib
    .getDocument(RESUME_PATH)
    .promise.then(async pdf => {
      pdfDoc = pdf;
      document.getElementById('pageCount').textContent = pdf.numPages;
      scale = await computeFitToWidthScale();
      updateZoomInfo();
      await renderAllPages();
    })
    .catch(err => {
      console.error('Failed to load PDF:', err);
    });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      goToPage(pageNum - 1);
    }
    if (e.key === 'ArrowRight') {
      goToPage(pageNum + 1);
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
}
