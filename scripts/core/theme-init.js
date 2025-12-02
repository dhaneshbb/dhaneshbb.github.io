// Theme initialization - must run before page render
// Copyright (c) 2025 Dhanesh B.B. All Rights Reserved.
// Theme initialization to prevent FOUC (Flash of Unstyled Content)
// https://dhaneshbb.github.io

(function () {
  const savedTheme = localStorage.getItem('theme');
  let theme = savedTheme;

  if (!theme) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }

  document.documentElement.setAttribute('data-theme', theme);
})();
